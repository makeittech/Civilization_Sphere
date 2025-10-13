#!/usr/bin/env node

// Update README.md YouTube-канали section by adding explicit channel URLs using channel IDs
// Resolves channel IDs via YouTube Data API v3 using YT_API_KEY

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const README_PATH = path.join(WORKSPACE_DIR, 'README.md');
const YT_API_KEY = process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY || '';

function loadReadme() {
  if (!fs.existsSync(README_PATH)) throw new Error(`README not found at ${README_PATH}`);
  return fs.readFileSync(README_PATH, 'utf8');
}

function saveReadme(content) {
  fs.writeFileSync(README_PATH, content, 'utf8');
}

function parseYouTubeSection(content) {
  const lines = content.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^###\s*YouTube[-\s]?канали/i.test(lines[i])) { start = i; break; }
  }
  if (start === -1) return { start: -1, end: -1, lines, bullets: [] };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i]) || /^#\s+/.test(lines[i])) { end = i; break; }
  }
  const sectionLines = lines.slice(start, end);
  const bullets = [];
  for (const l of sectionLines) {
    const mLink = l.match(/^-\s*\[(.+?)\]\((https?:\/\/[^\s)]+)\)/);
    const mBold = l.match(/^-\s*\*\*([^*]+)\*\*/);
    if (mLink) bullets.push({ raw: l, name: mLink[1].trim(), url: mLink[2].trim() });
    else if (mBold) bullets.push({ raw: l, name: mBold[1].trim(), url: '' });
  }
  return { start, end, lines, bullets };
}

function extractChannelIdFromUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('channel');
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    return '';
  } catch { return ''; }
}

async function youtubeApi(endpoint, params) {
  const q = new URLSearchParams({ key: YT_API_KEY, ...params });
  const url = `https://www.googleapis.com/youtube/v3/${endpoint}?${q.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${endpoint} failed ${res.status}`);
  return res.json();
}

async function resolveChannelId(nameOrUrl) {
  const urlId = extractChannelIdFromUrl(nameOrUrl);
  if (urlId) return urlId;
  const json = await youtubeApi('search', { part: 'snippet', q: nameOrUrl, type: 'channel', maxResults: '1' });
  const item = json.items && json.items[0];
  if (item?.snippet?.channelId) return item.snippet.channelId;
  if (item?.id?.channelId) return item.id.channelId;
  return '';
}

async function main() {
  const out = { updated: false, errors: [], channels: [] };
  if (!YT_API_KEY) {
    out.errors.push('Missing YT_API_KEY. Export YT_API_KEY and re-run.');
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  }
  const content = loadReadme();
  const { start, end, lines, bullets } = parseYouTubeSection(content);
  if (start === -1 || bullets.length === 0) {
    out.errors.push('YouTube-канали section not found or contains no bullets.');
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  }
  const updatedBullets = [];
  for (const b of bullets) {
    try {
      const id = await resolveChannelId(b.url || b.name);
      if (!id) {
        out.errors.push(`Could not resolve channel ID for ${b.name}`);
        updatedBullets.push(b.raw);
        continue;
      }
      const link = `- [${b.name}](https://www.youtube.com/channel/${id})`;
      updatedBullets.push(link);
      out.channels.push({ name: b.name, channel_id: id, url: `https://www.youtube.com/channel/${id}` });
    } catch (e) {
      out.errors.push(`Error resolving ${b.name}: ${e.message}`);
      updatedBullets.push(b.raw);
    }
  }
  // Re-assemble content
  const before = lines.slice(0, start + 1);
  const after = lines.slice(end);
  const mid = [];
  // keep a blank line after heading if existed
  // Insert bullets, preserving a single blank line after heading
  // Find first bullet index in section to inspect spacing
  mid.push(...updatedBullets);
  const newContent = [...before, '', ...mid, '', ...after].join('\n');
  if (newContent !== content) {
    saveReadme(newContent);
    out.updated = true;
  }
  console.log(JSON.stringify(out, null, 2));
}

if (typeof fetch !== 'function') {
  global.fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
}

main().catch(err => {
  const out = { updated: false, errors: [String(err && err.message ? err.message : err)], channels: [] };
  console.log(JSON.stringify(out, null, 2));
  process.exit(1);
});
