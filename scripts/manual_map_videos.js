#!/usr/bin/env node
/**
 * Manual mapping helper for video_to_event_map.csv
 * - Lists unmapped rows (missing video_url and video_id)
 * - Allows passing --set row_id=... video_url=... [video_id=...] to append/update mapping
 * - Prints tips for finding video by title (YouTube search URL)
 */
const fs = require('fs');
const path = require('path');

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const cols = [];
    let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else { inQ = !inQ; } }
      else if (ch === ',' && !inQ) { cols.push(cur); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur);
    const o = {}; for (let i = 0; i < header.length; i++) o[header[i]] = (cols[i] || '').trim();
    return o;
  });
  return { header, rows };
}

function toCsvRow(values) {
  return values.map(v => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }).join(',');
}

function loadCsv(p) { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; }
function saveCsv(p, c) { fs.writeFileSync(p, c, 'utf8'); }

async function main() {
  const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
  const cfgPath = path.join(WORKSPACE_DIR, 'config', 'video_event_pipeline.config.json');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const mapPath = path.isAbsolute(cfg.mapping.path) ? cfg.mapping.path : path.join(WORKSPACE_DIR, cfg.mapping.path);

  const content = loadCsv(mapPath);
  if (!content) {
    console.log('Mapping CSV is empty or missing at', mapPath);
    process.exit(0);
  }
  const { header, rows } = parseCsv(content);
  const unmapped = rows.filter(r => (!r.video_url && !r.video_id));

  const args = process.argv.slice(2);
  const setIdx = args.indexOf('--set');
  if (setIdx !== -1) {
    const kv = {}; for (let i = setIdx + 1; i < args.length; i++) { const [k, v] = String(args[i]).split('='); if (k && v !== undefined) kv[k] = v; }
    if (!kv.row_id) { console.error('Provide row_id=...'); process.exit(1); }
    let found = false;
    for (const r of rows) {
      if (r.row_id === kv.row_id) {
        if (kv.video_url) r.video_url = kv.video_url;
        if (kv.video_id) r.video_id = kv.video_id;
        found = true; break;
      }
    }
    if (!found) {
      rows.push({ row_id: kv.row_id, video_url: kv.video_url || '', video_id: kv.video_id || '' });
    }
    const out = [header.join(',')].concat(rows.map(r => toCsvRow([r.row_id, r.video_url || '', r.video_id || '']))).join('\n') + '\n';
    saveCsv(mapPath, out);
    console.log('Updated mapping for', kv.row_id);
    process.exit(0);
  }

  console.log('Unmapped rows:', unmapped.length);
  for (const r of unmapped) {
    const query = encodeURIComponent(r.row_id);
    console.log(`- ${r.row_id}: title likely in CSV; search: https://www.youtube.com/results?search_query=${query}`);
  }
  console.log('\nTo set mapping:');
  console.log('node scripts/manual_map_videos.js --set row_id=nea_001 video_url=https://www.youtube.com/watch?v=XXXX');
}

main().catch(e => { console.error(e); process.exit(1); });
