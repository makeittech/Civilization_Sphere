#!/usr/bin/env node

// Scrape latest videos from YouTube channel pages without API.
// Input: channels from README.md (markdown links)
// Output: Append new events to data/events.json and update data/events_summary.json
// Notes: Uses yt initial data JSON embedded in HTML. Avoids API.

const fs = require('fs');
const path = require('path');
const { setTimeout: sleep } = require('timers/promises');

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const README_PATH = path.join(WORKSPACE_DIR, 'README.md');
const DATA_DIR = path.join(WORKSPACE_DIR, 'data');
const EVENTS_JSON_PATH = path.join(DATA_DIR, 'events.json');
const EVENTS_SUMMARY_JSON_PATH = path.join(DATA_DIR, 'events_summary.json');

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } }

function parseChannelsFromReadme(readme) {
  const sectionRegex = /(###\s*YouTube[\s-]*канали[\s\S]*?)(?:\n##\s|\n#\s|$)/i;
  const sectionMatch = readme.match(sectionRegex);
  const section = sectionMatch ? sectionMatch[1] : readme;
  const lines = section.split(/\r?\n/);
  const channels = [];
  for (const line of lines) {
    const m = line.match(/^-\s*\[(.+?)\]\((https?:\/\/[^\s)]+)\)/);
    if (m) channels.push({ name: m[1].trim(), url: m[2].trim() });
  }
  return channels;
}

function readExistingEvents() {
  if (!fs.existsSync(EVENTS_JSON_PATH)) return [];
  try {
    const raw = fs.readFileSync(EVENTS_JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.events)) return parsed.events;
    return [];
  } catch { return []; }
}

function sanitizeText(s) {
  return (s || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
}

function buildEventFromScraped(item, channel) {
  const videoId = item?.videoId || item?.navigationEndpoint?.watchEndpoint?.videoId || '';
  const title = sanitizeText(item?.title?.runs?.[0]?.text || item?.headline?.simpleText || item?.title?.simpleText || '');
  const publishedTimeText = sanitizeText(item?.publishedTimeText?.simpleText || item?.publishedTimeText?.runs?.[0]?.text || '');
  const descriptionSnippet = sanitizeText(item?.descriptionSnippet?.runs?.map(r => r.text).join(' ') || '');
  const thumbnails = item?.thumbnail?.thumbnails || item?.thumbnail?.richThumbnail?.thumbnails || [];
  const dateIso = inferIsoDateFromPublishedText(publishedTimeText);
  return {
    id: videoId,
    title,
    date: dateIso || new Date().toISOString(),
    region: 'Unspecified',
    category: 'Geopolitics/News/Analysis',
    channel_name: channel.name,
    source_url: `https://www.youtube.com/watch?v=${videoId}`,
    description: descriptionSnippet,
    channel_id: '',
    source: 'YouTube',
    tags: [],
  };
}

function inferIsoDateFromPublishedText(text) {
  // Handle relative times like "1 hour ago", "3 days ago" in English and Ukrainian
  if (!text) return '';
  const now = Date.now();
  const lower = text.toLowerCase();
  const rels = [
    { re: /(\d+)\s*(seconds|second|секунд[аи]?|с)\s*ago|тому/, ms: 1000 },
    { re: /(\d+)\s*(minutes|minute|хвилин[аи]?|хв)\s*ago|тому/, ms: 60 * 1000 },
    { re: /(\d+)\s*(hours|hour|годин[аи]?|год)\s*ago|тому/, ms: 60 * 60 * 1000 },
    { re: /(\d+)\s*(days|day|дн(і|ів)|день)\s*ago|тому/, ms: 24 * 60 * 60 * 1000 },
    { re: /(\d+)\s*(weeks|week|тижн(і|ів)|тиждень)\s*ago|тому/, ms: 7 * 24 * 60 * 60 * 1000 },
    { re: /(\d+)\s*(months|month|місяц(і|ів)|місяць)\s*ago|тому/, ms: 30 * 24 * 60 * 60 * 1000 },
    { re: /(\d+)\s*(years|year|рок(и|ів)|рік)\s*ago|тому/, ms: 365 * 24 * 60 * 60 * 1000 }
  ];
  for (const r of rels) {
    const m = lower.match(r.re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n)) return new Date(now - n * r.ms).toISOString();
    }
  }
  // Fallback: return empty
  return '';
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9,uk;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

function extractInitialData(html) {
  // Try multiple patterns for yt initial data
  const markers = [
    'var ytInitialData =',
    'window["ytInitialData"] =',
    'window["ytInitialData"]=',
    'ytInitialData =',
  ];
  for (const marker of markers) {
    const idx = html.indexOf(marker);
    if (idx !== -1) {
      const start = idx + marker.length;
      // Find the matching closing script tag or semicolon; greedily parse JSON braces
      const slice = html.slice(start);
      const json = extractJsonObject(slice);
      if (json) return json;
    }
  }
  return null;
}

function extractChannelIdFromHtml(html) {
  // Look for channelId patterns (e.g., \"channelId\":\"UCxxxxxxxxxxxxxxxxxxxxxx\")
  const m = html.match(/\"channelId\"\s*:\s*\"(UC[0-9A-Za-z_-]{10,})\"/);
  if (m) return m[1];
  // Alternate pattern in single quotes
  const m2 = html.match(/['\"]externalId['\"]\s*:\s*['\"](UC[0-9A-Za-z_-]{10,})['\"]/);
  if (m2) return m2[1];
  return '';
}

function extractJsonObject(text) {
  // Extract the first top-level JSON object using brace matching
  let depth = 0;
  let started = false;
  let startIdx = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!started) {
      if (ch === '{') { started = true; depth = 1; startIdx = i; }
      continue;
    } else {
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const jsonStr = text.slice(startIdx, i + 1);
          try { return JSON.parse(jsonStr); } catch { return null; }
        }
      }
    }
  }
  return null;
}

function findVideoItems(initialData) {
  // Recursively scan for any objects with a videoRenderer having videoId
  const found = [];
  const seen = new Set();
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (node.videoRenderer && node.videoRenderer.videoId) {
      const vd = node.videoRenderer;
      if (!seen.has(vd.videoId)) {
        seen.add(vd.videoId);
        found.push(vd);
      }
    }
    for (const key in node) {
      if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
      const val = node[key];
      if (val && typeof val === 'object') walk(val);
      if (Array.isArray(val)) {
        for (const v of val) walk(v);
      }
    }
  }
  walk(initialData);
  return found.slice(0, 20);
}

async function scrapeChannel(channel) {
  // Try multiple URL variants and strategies
  const base = channel.url.replace(/\/$/, '');
  const urls = [
    base,
    `${base}/videos`,
    base.replace('://www.', '://m.'),
    `${base.replace('://www.', '://m.')}/videos`,
    `${base}/about`,
  ];
  let lastHtml = '';
  for (const u of urls) {
    try {
      const html = await fetchHtml(u);
      lastHtml = html;
      const data = extractInitialData(html);
      if (data) {
        const items = findVideoItems(data);
        if (items.length > 0) return items;
      }
    } catch (e) {
      await sleep(250);
    }
  }
  // Fallback: try RSS feed if we can extract channelId from HTML
  const channelId = extractChannelIdFromHtml(lastHtml);
  if (channelId) {
    const rssItems = await fetchRssFeedItems(channelId);
    if (rssItems.length > 0) return rssItems;
  }
  return [];
}

async function fetchRssFeedItems(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118 Safari/537.36',
      'Accept': 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRssEntries(xml).slice(0, 20).map(entryToVideoRendererLike);
}

function parseRssEntries(xml) {
  // Very small XML extraction tailored to YouTube video feed
  const entries = [];
  const entryRegex = /<entry>[\s\S]*?<\/entry>/g;
  const vidIdRegex = /<yt:videoId>([^<]+)<\/yt:videoId>/;
  const titleRegex = /<title>([^<]+)<\/title>/;
  const publishedRegex = /<published>([^<]+)<\/published>/;
  const descRegex = /<media:description>([\s\S]*?)<\/media:description>/;
  const channelTitleRegex = /<name>([^<]+)<\/name>/;
  let m;
  while ((m = entryRegex.exec(xml)) !== null) {
    const block = m[0];
    const id = (block.match(vidIdRegex) || [,''])[1];
    const title = (block.match(titleRegex) || [,''])[1];
    const published = (block.match(publishedRegex) || [,''])[1];
    const desc = (block.match(descRegex) || [,''])[1];
    const channelTitle = (block.match(channelTitleRegex) || [,''])[1];
    if (id) entries.push({ id, title, published, desc, channelTitle });
  }
  return entries;
}

function entryToVideoRendererLike(entry) {
  // Create a minimal shape compatible with buildEventFromScraped
  return {
    videoId: entry.id,
    title: { runs: [{ text: entry.title }] },
    publishedTimeText: { simpleText: new Date(entry.published).toISOString() },
    descriptionSnippet: { runs: [{ text: entry.desc }] },
    channelTitle: entry.channelTitle,
  };
}

function summarizeEvents(allEvents, newlyAdded) {
  const countsPerChannel = {};
  for (const ev of allEvents) {
    const key = ev.channel_name || 'Unknown';
    countsPerChannel[key] = (countsPerChannel[key] || 0) + 1;
  }
  return {
    total_events: allEvents.length,
    new_events_added: newlyAdded.length,
    counts_per_channel: countsPerChannel,
    sample_new_events: newlyAdded.slice(0, 5),
  };
}

function validateEventShape(event) {
  const errors = [];
  function isString(x) { return typeof x === 'string' && x.length >= 0; }
  if (!isString(event.id) || !event.id) errors.push('id required');
  if (!isString(event.title)) errors.push('title string');
  if (!isString(event.date) || !event.date) errors.push('date required');
  if (!isString(event.category)) errors.push('category string');
  if (!isString(event.channel_name)) errors.push('channel_name string');
  if (!isString(event.source_url)) errors.push('source_url string');
  if (!isString(event.description)) errors.push('description string');
  if (!isString(event.source)) errors.push('source string');
  if (!isString(event.region)) errors.push('region string');
  return errors;
}

async function main() {
  const result = { added_count: 0, added_ids: [], channels_processed: 0, errors: [] };
  const readme = readFileSafe(README_PATH);
  const channels = parseChannelsFromReadme(readme);
  if (channels.length === 0) {
    result.errors.push('README YouTube-канали section has no links.');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
  const existing = readExistingEvents();
  const existingIds = new Set(existing.map(e => e.id));
  const newEvents = [];

  for (const ch of channels) {
    const items = await scrapeChannel(ch);
    if (items.length === 0) continue;
    for (const item of items) {
      const ev = buildEventFromScraped(item, ch);
      if (!existingIds.has(ev.id)) {
        const errs = validateEventShape(ev);
        if (errs.length === 0) {
          newEvents.push(ev);
          existingIds.add(ev.id);
        }
      }
    }
  }

  if (newEvents.length > 0) {
    const allEvents = existing.concat(newEvents);
    writeJson(EVENTS_JSON_PATH, allEvents);
    const summary = summarizeEvents(allEvents, newEvents);
    writeJson(EVENTS_SUMMARY_JSON_PATH, summary);
  }

  result.added_count = newEvents.length;
  result.added_ids = newEvents.map(e => e.id);
  result.channels_processed = channels.length;
  console.log(JSON.stringify(result, null, 2));
}

if (typeof fetch !== 'function') {
  global.fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
}

main().catch(err => {
  const out = { added_count: 0, added_ids: [], channels_processed: 0, errors: [String(err && err.message ? err.message : err)] };
  console.log(JSON.stringify(out, null, 2));
  process.exit(1);
});
