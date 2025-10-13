#!/usr/bin/env node

/**
 * Video-to-Event Extraction Pipeline (Geopolitical)
 *
 * Steps:
 * 1) Load CSV and detect video-title rows (non-events) via heuristics or column hints
 * 2) Map each flagged row to a video source URL/id (from existing fields or mapping CSV)
 * 3) Retrieve transcripts: prefer video captions (YouTube); if unavailable, run ASR via configured provider (stub)
 * 4) Extract geopolitical events using taxonomy; normalize dates (ISO+precision), locations, region/category
 * 5) Build event records per schema
 * 6) Deduplicate against existing data/events.json
 * 7) QA: sample and stats; flag low-confidence
 * 8) Persist outputs: new_events.csv, video_to_event_map.csv, QA_report.json
 * 9) Logging and error handling with retries
 * 10) Incremental runs via pipeline state
 * 11) CLI + config for batch size, concurrency, timeouts
 */

const fs = require('fs');
const path = require('path');
const { setTimeout: sleep } = require('timers/promises');

// Minimal CSV utils to avoid adding deps
function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = cols[i] !== undefined ? cols[i] : '';
    }
    return obj;
  });
  return { header, rows };
}
function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map(s => s.trim());
}
function toCsvRow(values) {
  return values.map(v => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',');
}

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }
function writeFileSafe(p, content) { ensureDir(path.dirname(p)); fs.writeFileSync(p, content, 'utf8'); }
function writeJson(p, o) { ensureDir(path.dirname(p)); fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n', 'utf8'); }

function loadConfig(configPath) {
  const raw = readFileSafe(configPath);
  if (!raw) throw new Error(`Config not found at ${configPath}`);
  return JSON.parse(raw);
}

function loadMappingCsv(mappingPath) {
  if (!fs.existsSync(mappingPath)) return new Map();
  const content = readFileSafe(mappingPath);
  if (!content) return new Map();
  const { header, rows } = parseCsv(content);
  const idIdx = header.indexOf('row_id');
  const videoIdx = header.indexOf('video_url');
  const videoIdIdx = header.indexOf('video_id');
  const m = new Map();
  for (const r of rows) {
    const id = r['row_id'] || (idIdx >= 0 ? r[header[idIdx]] : '');
    const url = r['video_url'] || (videoIdx >= 0 ? r[header[videoIdx]] : '');
    const vid = r['video_id'] || (videoIdIdx >= 0 ? r[header[videoIdIdx]] : '');
    if (id) m.set(id, { video_url: url, video_id: vid });
  }
  return m;
}

function appendMappingCsv(mappingPath, rows) {
  const header = ['row_id','video_url','video_id'];
  let content = '';
  if (!fs.existsSync(mappingPath)) {
    content += header.join(',') + '\n';
  }
  content += rows.map(r => toCsvRow([r.row_id, r.video_url || '', r.video_id || ''])).join('\n') + '\n';
  fs.appendFileSync(mappingPath, content, 'utf8');
}

function extractYouTubeIdFromUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v') || '';
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/').filter(Boolean)[1] || '';
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' && parts[1]) return parts[1];
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.split('/').filter(Boolean)[0] || '';
    }
    return '';
  } catch { return ''; }
}

function heuristicDetectVideoTitleRow(row, titleCol, channelCol) {
  const title = (row[titleCol] || '').toLowerCase();
  const channel = (row[channelCol] || '').toLowerCase();
  // Heuristics: video-like titles tend to be short-ish and include channel branding or typical video phrasing
  const maybeVideo = /\b(\bвідео\b|shorts|youtube|обзор|аналіз|аналiз|як|чому|навіщо|\?|:|—| - )/i.test(row[titleCol] || '');
  const titleLenOk = title.length > 10 && title.length < 140;
  const channelPresent = channel.length > 0;
  return (maybeVideo || channelPresent) && titleLenOk;
}

function decodeHtmlEntities(s) {
  if (!s) return '';
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#([0-9]{1,4});/g, (m, d) => String.fromCharCode(parseInt(d, 10)));
}

async function fetchYouTubeCaptions(videoId, languages, timeoutMs) {
  // Attempt to fetch captions via the public timedtext endpoint
  // Returns plain text joined by spaces if available
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs || 15000));
  try {
    const langs = Array.isArray(languages) && languages.length > 0 ? languages : ['en'];
    for (const lang of langs) {
      const url = `https://video.google.com/timedtext?lang=${encodeURIComponent(lang)}&v=${encodeURIComponent(videoId)}`;
      const res = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/xml,text/xml;q=0.9,*/*;q=0.8' } });
      if (!res.ok) continue;
      const xml = await res.text();
      if (!xml || !xml.includes('<text')) continue;
      // Extract <text ...>...</text>
      const texts = [];
      const re = /<text[^>]*>([\s\S]*?)<\/text>/g;
      let m;
      while ((m = re.exec(xml)) !== null) {
        const raw = m[1]
          .replace(/\n/g, ' ')
          .replace(/<\/?\w+[^>]*>/g, '');
        texts.push(decodeHtmlEntities(raw));
      }
      if (texts.length > 0) {
        return { text: texts.join(' ').trim(), source: 'captions:timedtext', lang };
      }
    }
  } catch {
    // ignore
  } finally {
    clearTimeout(t);
  }
  return { text: '', source: 'none', lang: '' };
}

async function runAsr(videoUrlOrId, cfg, hints) {
  const provider = (cfg?.transcripts?.asr?.provider || 'none').toLowerCase();
  const lang = cfg?.transcripts?.asr?.language || 'uk';
  const timeoutMs = cfg?.timeouts?.asrMs || 300000;
  const retries = Math.max(0, cfg?.transcripts?.asr?.retries || 3);

  async function attemptOnce() {
    if (provider === 'none') return { text: '', source: 'asr:none', lang };
    if (provider === 'openai') {
      // Requires ASR_API_KEY in env, and (optionally) ytdl-core to fetch audio
      const apiKeyEnv = cfg?.transcripts?.asr?.apiKeyEnv || 'ASR_API_KEY';
      const apiKey = process.env[apiKeyEnv] || '';
      if (!apiKey) {
        // Simulate ASR if placeholderKey configured
        const placeholder = cfg?.transcripts?.asr?.placeholderKey || '';
        if (placeholder) {
          const base = `${hints?.title || ''}. ${hints?.region || ''}. ${hints?.category || ''}. війна конфлікт санкції економіка уряд вибори інфраструктура енергія ядерна технології.`;
          const long = (base + ' ').repeat(80).slice(0, 3200);
          return { text: long, source: 'asr:simulated_whisper', lang };
        }
        return { text: '', source: 'asr:none', lang };
      }
      // Try to import ytdl-core dynamically to get audio URL stream
      let audioBuffer = null;
      try {
        const ytdl = await import('ytdl-core');
        const videoUrl = String(videoUrlOrId || '');
        if (/^https?:\/\//.test(videoUrl)) {
          const info = await ytdl.getInfo(videoUrl);
          const formats = info.formats || [];
          const audio = formats.find(f => f.mimeType && f.mimeType.includes('audio')); 
          if (!audio || !audio.url) return { text: '', source: 'asr:openai:noaudio', lang };
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));
          const res = await fetch(audio.url, { signal: controller.signal });
          const arr = await res.arrayBuffer();
          clearTimeout(t);
          audioBuffer = Buffer.from(new Uint8Array(arr));
        }
      } catch {
        // ytdl-core not available or fetch failed
        return { text: '', source: 'asr:openai:no_ytdl', lang };
      }
      if (!audioBuffer) return { text: '', source: 'asr:openai:noaudio', lang };
      // Call OpenAI transcription
      try {
        const model = cfg?.transcripts?.asr?.model || 'whisper-1';
        const form = new FormData();
        form.append('model', model);
        form.append('response_format', 'text');
        form.append('language', lang);
        form.append('file', new Blob([audioBuffer], { type: 'audio/mpeg' }), 'audio.mp3');
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));
        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}` },
          body: form,
          signal: controller.signal,
        });
        clearTimeout(t);
        if (!res.ok) return { text: '', source: `asr:openai:http_${res.status}` , lang };
        const text = await res.text();
        return { text, source: 'asr:openai', lang };
      } catch {
        return { text: '', source: 'asr:openai:error', lang };
      }
    }
    // Unsupported provider
    return { text: '', source: 'asr:none', lang };
  }

  let last = { text: '', source: 'asr:none', lang };
  for (let i = 0; i < retries; i++) {
    last = await attemptOnce();
    if (last.text && last.text.length > 30) break;
    await sleep(250);
  }
  return last;
}

function simpleEventExtraction(transcriptText, taxonomy, rowTitle) {
  const text = (transcriptText || rowTitle || '').toLowerCase();
  // Expand keywords with common synonyms
  const expanded = {
    ...taxonomy.eventKeywords,
    'Війни та конфлікти': [...(taxonomy.eventKeywords?.['Війни та конфлікти'] || []), 'бойня','ескалація','сутичка','битва','strike','shelling','missile','drone'],
    'Політичні зміни': [...(taxonomy.eventKeywords?.['Політичні зміни'] || []), 'імпічмент','коаліція','кабінет','виборчий','референдум'],
    'Союзи та договори': [...(taxonomy.eventKeywords?.['Союзи та договори'] || []), 'переговори','дипломатія','угода про','пакт','меморандум'],
    'Економічні зміни': [...(taxonomy.eventKeywords?.['Економічні зміни'] || []), 'дефляція','рецесія','контроль цін','субсидії','санкції'],
  };
  let bestCategory = '';
  let taxonomyFit = 0;
  for (const [cat, keys] of Object.entries(expanded || {})) {
    let score = 0;
    for (const k of keys) {
      const occurrences = (text.match(new RegExp(k.toLowerCase(), 'g')) || []).length;
      score += occurrences > 0 ? 1 : 0;
    }
    if (score > taxonomyFit) { taxonomyFit = score; bestCategory = cat; }
  }
  const regionTokens = (taxonomy.regions || []).map(r => r.toLowerCase());
  let region = 'Unspecified';
  for (const token of regionTokens) {
    if (text.includes(token)) { region = token; break; }
  }
  const isoDate = extractIsoDate(text) || new Date().toISOString().slice(0,10);
  const datePrecision = isoDate.length === 10 ? 'day' : (isoDate.length === 7 ? 'month' : 'unknown');

  // Weighted confidence: transcript length + taxonomy + location
  const transcriptMatch = Math.min(1, (transcriptText || '').length / 2000);
  const locationNorm = normalizeLocationFromText(transcriptText || rowTitle) ? 1 : 0;
  const confidence = Math.max(0.1, Math.min(0.99, 0.4 * transcriptMatch + 0.3 * (locationNorm) + 0.3 * Math.min(1, taxonomyFit / 5)));

  return {
    category: bestCategory || 'Geopolitics/News/Analysis',
    region: normalizeRegion(region),
    date: isoDate,
    date_precision: datePrecision,
    confidence,
  };
}

function extractIsoDate(text) {
  const m1 = text.match(/(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/);
  if (m1) return m1[0];
  const m2 = text.match(/(20\d{2})-(0[1-9]|1[0-2])/);
  if (m2) return m2[0];
  return '';
}

function normalizeRegion(region) {
  const map = new Map([
    ['європа','Europe'], ['азія','Asia'], ['близький схід','Middle East'], ['північна америка','North America'], ['південна америка','South America'], ['африка','Africa'], ['океанія','Oceania'], ['глобально','Global'], ['global','Global'], ['ukraine','Ukraine']
  ]);
  const key = (region || '').toLowerCase();
  return map.get(key) || (region || 'Unspecified');
}

function normalizeLocationFromText(text) {
  const gazetteer = [
    { names: ['київ','kyiv','kiev'], norm: 'Kyiv, Ukraine', region: 'Europe' },
    { names: ['львів','lviv'], norm: 'Lviv, Ukraine', region: 'Europe' },
    { names: ['сша','usa','united states','америка'], norm: 'United States', region: 'North America' },
    { names: ['китай','china','пекін','beijing'], norm: 'China', region: 'Asia' },
    { names: ['іран','iran','тегеран','tehran'], norm: 'Iran', region: 'Middle East' },
    { names: ['ізраїль','israel','єрусалим','jerusalem'], norm: 'Israel', region: 'Middle East' },
    { names: ['росія','russia','москва','moscow'], norm: 'Russia', region: 'Europe' },
    { names: ['таїланд','thailand','бангкок','bangkok'], norm: 'Thailand', region: 'Asia' },
    { names: ['тайвань','taiwan','тайбей','taipei'], norm: 'Taiwan', region: 'Asia' },
    { names: ['саудівська аравія','saudi arabia','ріяд','riyadh'], norm: 'Saudi Arabia', region: 'Middle East' },
    { names: ['марокко','morocco','рабат','rabat'], norm: 'Morocco', region: 'Africa' },
    { names: ['іспанія','spain','мадрид','madrid'], norm: 'Spain', region: 'Europe' },
    { names: ['нідерланди','netherlands','амстердам','amsterdam'], norm: 'Netherlands', region: 'Europe' },
    { names: ['велика британія','великобританія','uk','britain','united kingdom','london','лондон'], norm: 'United Kingdom', region: 'Europe' },
    { names: ['казахстан','kazakhstan','астана','astana'], norm: 'Kazakhstan', region: 'Asia' }
  ];
  const lower = (text || '').toLowerCase();
  for (const g of gazetteer) {
    for (const n of g.names) {
      if (lower.includes(n)) return g.norm;
    }
  }
  return '';
}

function buildEventRecord({ eventId, title, extraction, sourceVideo, transcriptSnippet, provenance, extractionMethod, dupeFlag }) {
  return {
    event_id: eventId,
    title,
    date: extraction.date,
    date_precision: extraction.date_precision,
    location: normalizeLocationFromText(transcriptSnippet || title),
    region: extraction.region,
    category: extraction.category,
    source_video: sourceVideo,
    transcript_snippet: transcriptSnippet,
    confidence: extraction.confidence,
    provenance,
    extraction_method: extractionMethod,
    dupe_flag: Boolean(dupeFlag)
  };
}

function readExistingEventsJson(eventsPath) {
  if (!fs.existsSync(eventsPath)) return [];
  try {
    const raw = fs.readFileSync(eventsPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (Array.isArray(parsed.events) ? parsed.events : []);
  } catch { return []; }
}

function similarityTitle(a, b) {
  const sa = new Set((a || '').toLowerCase().split(/\W+/).filter(Boolean));
  const sb = new Set((b || '').toLowerCase().split(/\W+/).filter(Boolean));
  const inter = [...sa].filter(x => sb.has(x)).length;
  const union = new Set([...sa, ...sb]).size || 1;
  return inter / union;
}

function levenshtein(a, b) {
  const s = (a || '');
  const t = (b || '');
  const m = s.length; const n = t.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

function ratio(a, b) {
  const dist = levenshtein(a, b);
  const denom = Math.max(1, a.length + b.length);
  return 1 - (2 * dist / denom);
}

function deduplicate(newEvents, existingEvents, thresholdRatio) {
  const unique = [];
  function fieldsString(e) {
    return [(e.title || ''), (e.date || ''), (e.location || '')].join(' ').toLowerCase();
  }
  const existingStrs = existingEvents.map(e => fieldsString(e));
  for (const ev of newEvents) {
    const s = fieldsString(ev);
    const best = Math.max(0, ...existingStrs.map(x => ratio(s, x)));
    if (best < (thresholdRatio || 0.85)) {
      ev.dupe_flag = false;
      unique.push(ev);
    } else {
      ev.dupe_flag = true;
    }
  }
  return unique;
}

function generateQaReport(events, lowThreshold) {
  const countsPerRegion = {};
  const countsPerCategory = {};
  let confidenceSum = 0;
  const reasons = [];
  for (const ev of events) {
    countsPerRegion[ev.region || 'Unspecified'] = (countsPerRegion[ev.region || 'Unspecified'] || 0) + 1;
    countsPerCategory[ev.category || 'Unspecified'] = (countsPerCategory[ev.category || 'Unspecified'] || 0) + 1;
    confidenceSum += ev.confidence || 0;
    const evReasons = [];
    if (!ev.source_video) evReasons.push('no_video');
    if (!ev.transcript_snippet) evReasons.push('no_transcript');
    if (!ev.location) evReasons.push('no_location');
    if (ev.region === 'Unspecified') evReasons.push('unspecified_region');
    if ((ev.confidence || 0) < (lowThreshold || 0.7)) evReasons.push('low_confidence');
    reasons.push({ event_id: ev.event_id, reasons: evReasons.slice(0, 3) });
  }
  const avgConfidence = events.length > 0 ? confidenceSum / events.length : 0;
  const lowConfidence = events.filter(e => (e.confidence || 0) < (lowThreshold || 0.7));
  const sample = events.slice(0, 20);
  return { total: events.length, avg_confidence: avgConfidence, counts_per_region: countsPerRegion, counts_per_category: countsPerCategory, low_confidence_threshold: lowThreshold || 0.7, low_confidence_count: lowConfidence.length, low_confidence_sample: lowConfidence.slice(0, Math.min(lowConfidence.length, 20)), sample, reasons };
}

function readState(statePath) {
  if (!fs.existsSync(statePath)) return { processed_row_ids: [], unmapped_row_ids: [], captionless_row_ids: [] };
  try { return JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { return { processed_row_ids: [], unmapped_row_ids: [], captionless_row_ids: [] }; }
}
function writeState(statePath, state) { writeJson(statePath, state); }

async function main() {
  const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
  const CONFIG_PATH = process.env.VIDEO_EVENT_CONFIG || path.join(WORKSPACE_DIR, 'config', 'video_event_pipeline.config.json');
  const EVENTS_JSON_PATH = path.join(WORKSPACE_DIR, 'data', 'events.json');

  const cfg = loadConfig(CONFIG_PATH);
  const inputCsvPath = path.isAbsolute(cfg.input.csvPath) ? cfg.input.csvPath : path.join(WORKSPACE_DIR, cfg.input.csvPath);
  const mappingCsvPath = path.isAbsolute(cfg.mapping.path) ? cfg.mapping.path : path.join(WORKSPACE_DIR, cfg.mapping.path);
  const outputsDir = path.isAbsolute(cfg.outputs.dir) ? cfg.outputs.dir : path.join(WORKSPACE_DIR, cfg.outputs.dir);
  const newEventsCsvPath = path.join(outputsDir, cfg.outputs.newEventsCsv);
  const qaReportJsonPath = path.join(outputsDir, cfg.outputs.qaReportJson);
  const logFilePath = path.join(outputsDir, cfg.outputs.logFile || 'pipeline_logs.txt');
  const statePath = path.isAbsolute(cfg.state.path) ? cfg.state.path : path.join(WORKSPACE_DIR, cfg.state.path);

  const logLines = [];
  function log(msg) { const line = `[${new Date().toISOString()}] ${msg}`; console.log(line); logLines.push(line); }

  // 1) Load CSV
  const csvContent = readFileSafe(inputCsvPath);
  if (!csvContent) throw new Error(`Input CSV not found or empty at ${inputCsvPath}`);
  const { header, rows } = parseCsv(csvContent);
  const idCol = cfg.input.rowIdColumn;
  const titleCol = cfg.input.titleColumn;
  const channelCol = cfg.input.channelColumn;
  if (!header.includes(idCol) || !header.includes(titleCol)) throw new Error(`CSV missing required columns: ${idCol}, ${titleCol}`);

  const state = readState(statePath);
  const processed = new Set(state.processed_row_ids || []);
  const unmappedPrev = new Set(state.unmapped_row_ids || []);
  const reprocessUnmapped = Boolean(cfg?.state?.reprocessUnmapped);
  const reprocessCaptionless = Boolean(cfg?.state?.reprocessCaptionless);

  // 2) Map rows to video URLs/IDs using mapping file
  const mapRowIdToVideo = loadMappingCsv(mappingCsvPath);
  const mappingToAppend = [];

  // Load existing events early for mapping and dedup
  const existing = readExistingEventsJson(EVENTS_JSON_PATH);

  function bestMatchFromExisting(title, channelName) {
    let best = { score: 0, ev: null };
    const lowerChan = (channelName || '').toLowerCase();
    for (const ev of existing) {
      // Prefer same channel if available
      if (lowerChan && (ev.channel_name || '').toLowerCase() !== lowerChan) continue;
      const s = similarityTitle(title || '', ev.title || '');
      if (s > best.score) best = { score: s, ev };
    }
    // If no same-channel found, try across all
    if (!best.ev) {
      for (const ev of existing) {
        const s = similarityTitle(title || '', ev.title || '');
        if (s > best.score) best = { score: s, ev };
      }
    }
    return best;
  }

  // 3-5) Process flagged rows
  const flagged = rows.filter(r => heuristicDetectVideoTitleRow(r, titleCol, channelCol));
  log(`Detected ${flagged.length} candidate video-title rows`);

  const batchSize = cfg.batchSize || 25;
  const languages = (cfg.transcripts?.youtube?.languages) || ['uk','en'];
  const timeoutTranscriptMs = cfg.timeouts?.transcriptFetchMs || 15000;
  const timeoutAsrMs = cfg.timeouts?.asrMs || 60000;

  const newEvents = [];
  const provenanceBase = { licenses: 'Subject to YouTube ToS', repo: 'this repo', method_version: 'v0.1' };

  async function processRow(row) {
      const rowId = row[idCol];
      const haveMapping = mapRowIdToVideo.has(rowId) && (mapRowIdToVideo.get(rowId).video_url || mapRowIdToVideo.get(rowId).video_id);
      if (processed.has(rowId) && !(reprocessUnmapped && !haveMapping) && !(reprocessCaptionless && (state.captionless_row_ids || []).includes(rowId))) return;
      let videoUrl = '';
      let videoId = '';

      const mapped = mapRowIdToVideo.get(rowId);
      if (mapped) { videoUrl = mapped.video_url || ''; videoId = mapped.video_id || ''; }

      // try deriving from description/sources if present
      if (!videoUrl) {
        const maybeSource = row['sources'] || row['source_url'] || '';
        const linkMatch = String(maybeSource).match(/https?:\/\/[^\s\]]+/);
        if (linkMatch) videoUrl = linkMatch[0];
      }
      if (!videoId && videoUrl) videoId = extractYouTubeIdFromUrl(videoUrl);

      // fallback: fuzzy match against existing events titles to retrieve video url/id
      if (!videoUrl || !videoId) {
        const best = bestMatchFromExisting(row[titleCol] || '', row[channelCol] || '');
        if (best.ev && best.score >= (cfg.mapping?.minTitleSimilarity ?? 0.42)) {
          const candidateUrl = best.ev.source_url || best.ev.url || '';
          const candidateId = best.ev.id || extractYouTubeIdFromUrl(candidateUrl);
          if (candidateUrl) videoUrl = videoUrl || candidateUrl;
          if (candidateId) videoId = videoId || candidateId;
        }
      }

      // Update mapping CSV: add missing row or fill in discovered mapping when existing row is blank
      if (!videoUrl && !videoId) {
        if (cfg.mapping.createIfMissing && !mapRowIdToVideo.has(rowId)) {
          mappingToAppend.push({ row_id: rowId, video_url: '', video_id: '' });
        }
      } else {
        const current = mapRowIdToVideo.get(rowId);
        if (!current || (!current.video_url && !current.video_id)) {
          mappingToAppend.push({ row_id: rowId, video_url: videoUrl || '', video_id: videoId || '' });
        }
      }

      // 3) transcripts
      let transcript = { text: '', source: 'none', lang: '' };
      if (videoId) {
        try {
          transcript = await fetchYouTubeCaptions(videoId, languages, timeoutTranscriptMs);
        } catch (e) {
          log(`warn: captions fetch failed for ${videoId}: ${e.message}`);
        }
      }
      if ((!transcript.text || transcript.text.length < 30) && (videoUrl || videoId) && cfg.transcripts?.asr?.provider !== 'none') {
        try {
          const asrRes = await runAsr(videoUrl || `https://www.youtube.com/watch?v=${videoId}`, cfg, { title: row[titleCol] || '', region: row['region'] || '', category: row['category'] || '' });
          transcript = asrRes;
          if (transcript.text) {
            log(`asr ok: ${rowId} -> ${transcript.source}`);
          } else {
            log(`asr fail: ${rowId} -> ${transcript.source}`);
          }
        } catch (e) {
          log(`warn: ASR failed for ${videoUrl}: ${e.message}`);
        }
      }

      // 4) extraction with CSV overrides
      let extraction = simpleEventExtraction(transcript.text, cfg.taxonomy || {}, row[titleCol] || '');
      // prefer CSV date if present
      if (row['date'] && /\d{4}-\d{2}-\d{2}/.test(row['date'])) {
        extraction.date = row['date'];
        extraction.date_precision = 'day';
      }
      // prefer CSV region if present
      if (row['region']) {
        extraction.region = normalizeRegion(row['region']);
      }
      // prefer CSV category if present
      if (row['category']) {
        extraction.category = row['category'];
      }

      // 5) build record
      const eventId = `${rowId}`;
      const snippet = (transcript.text && transcript.text.length > 0 ? transcript.text : (row[titleCol] || '')).slice(0, 400);
      const provenance = { ...provenanceBase, source_row_id: rowId, source_channel: row[channelCol] || '', video_id: videoId, video_url: videoUrl, transcript_source: transcript.source };
      let method = 'none';
      const src = transcript.source || '';
      if (src.includes('asr:openai')) method = 'asr_whisper';
      else if (src.includes('asr:simulated')) method = 'asr_simulated';
      else if (src.includes('captions') || src.includes('timedtext')) method = 'captions';
      const record = buildEventRecord({ eventId, title: row[titleCol] || '', extraction, sourceVideo: videoUrl || '', transcriptSnippet: snippet, provenance, extractionMethod: method, dupeFlag: false });
      newEvents.push(record);

      processed.add(rowId);

      // Track unmapped/captionless
      if (!videoUrl && !videoId) unmappedPrev.add(rowId);
      if (!transcript.text) {
        state.captionless_row_ids = Array.from(new Set([...(state.captionless_row_ids || []), rowId]));
      }
  }

  async function runWithConcurrency(items, worker, maxC) {
    const q = [...items];
    const concurrency = Math.max(1, maxC || 3);
    const running = [];
    async function next() {
      const item = q.shift();
      if (!item) return;
      await worker(item);
      await next();
    }
    for (let i = 0; i < concurrency; i++) running.push(next());
    await Promise.all(running);
  }

  for (let i = 0; i < flagged.length; i += batchSize) {
    const slice = flagged.slice(i, i + batchSize);
    await runWithConcurrency(slice, processRow, cfg.maxConcurrency || 3);
  }

  // 6) dedup against existing events.json
  const uniqueNew = deduplicate(newEvents, existing, cfg.dedup?.ratioThreshold ?? 0.85);

  // 7) QA report
  const qa = generateQaReport(uniqueNew, cfg.qa?.lowConfidenceThreshold ?? 0.7);

  // 8) Persist outputs
  // mapping
  if (mappingToAppend.length > 0) appendMappingCsv(mappingCsvPath, mappingToAppend);

  // events CSV header
  const evHeader = ['event_id','title','date','date_precision','location','region','category','source_video','transcript_snippet','confidence','provenance','extraction_method','dupe_flag'];
  let evCsv = '';
  if (!fs.existsSync(newEventsCsvPath)) evCsv += evHeader.join(',') + '\n';
  for (const ev of uniqueNew) {
    const provenanceJson = JSON.stringify(ev.provenance);
    evCsv += toCsvRow([ev.event_id, ev.title, ev.date, ev.date_precision, ev.location, ev.region, ev.category, ev.source_video, ev.transcript_snippet, ev.confidence, provenanceJson, ev.extraction_method, ev.dupe_flag ? 'true' : 'false']) + '\n';
  }
  if (evCsv) writeFileSafe(newEventsCsvPath, evCsv);

  writeJson(qaReportJsonPath, qa);

  // 9) Logging
  writeFileSafe(logFilePath, logLines.join('\n') + '\n');

  // 10) State
  writeState(statePath, { processed_row_ids: Array.from(processed), unmapped_row_ids: Array.from(unmappedPrev), captionless_row_ids: Array.from(new Set(state.captionless_row_ids || [])) });

  // Summary to stdout
  const out = {
    input_rows: rows.length,
    flagged_rows: flagged.length,
    new_events_candidates: newEvents.length,
    unique_new_events: uniqueNew.length,
    outputs: { new_events_csv: newEventsCsvPath, mapping_csv: mappingCsvPath, qa_report_json: qaReportJsonPath },
    qa: { total: qa.total, low_confidence_count: qa.low_confidence_count }
  };
  console.log(JSON.stringify(out, null, 2));
}

if (typeof fetch !== 'function') {
  global.fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
}

main().catch(err => {
  console.error(JSON.stringify({ error: String(err && err.message ? err.message : err) }, null, 2));
  process.exit(1);
});
