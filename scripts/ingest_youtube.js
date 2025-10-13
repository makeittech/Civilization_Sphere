#!/usr/bin/env node

// Ingest latest YouTube videos as geopolitical events and integrate into dataset.
// - Parses channels from README.md (name, channel_id, url if available)
// - If API key present, resolves channel IDs (via URL or search) and fetches latest 20 videos
// - Builds event objects, dedupes against data/events.json
// - Writes new/updated data/events.json and data/events_summary.json
// - Outputs summary JSON: added_count, added_ids, channels_processed, errors

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const README_PATH = path.join(WORKSPACE_DIR, 'README.md');
const DATA_DIR = path.join(WORKSPACE_DIR, 'data');
const EVENTS_JSON_PATH = path.join(DATA_DIR, 'events.json');
const EVENTS_SUMMARY_JSON_PATH = path.join(DATA_DIR, 'events_summary.json');
const YT_API_KEY = process.env.YT_API_KEY || process.env.YOUTUBE_API_KEY || '';

async function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return '';
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function parseChannelsFromReadme(readmeContent) {
  // Attempt to find the section under headings like "### YouTube-канали" or similar
  // Extract lines starting with '-' listing channel names. Try to parse optional URL in markdown link or plain URL.
  const channels = [];

  // Narrow to the YouTube channels section if present
  const sectionRegex = /(###\s*YouTube[\s-]*канали[\s\S]*?)(?:\n##\s|\n#\s|$)/i;
  const sectionMatch = readmeContent.match(sectionRegex);
  const section = sectionMatch ? sectionMatch[1] : readmeContent;

  const lines = section.split(/\r?\n/);
  for (const line of lines) {
    // Match patterns like: - **Name** - description
    // Or: - [Name](https://www.youtube.com/channel/UC...) - description
    const mdLinkMatch = line.match(/^-\s*\*\*([^*]+)\*\*.*?(https?:\/\/[^\s)]+)?/);
    const bulletNameOnlyMatch = line.match(/^-\s*\*\*([^*]+)\*\*/);

    // Alternative: markdown link version
    const markdownLinkVersion = line.match(/^-\s*\[(.+?)\]\((https?:\/\/[^\s)]+)\)/);

    let name = '';
    let url = '';

    if (markdownLinkVersion) {
      name = markdownLinkVersion[1].trim();
      url = markdownLinkVersion[2].trim();
    } else if (mdLinkMatch) {
      name = mdLinkMatch[1].trim();
      url = (mdLinkMatch[2] || '').trim();
    } else if (bulletNameOnlyMatch) {
      name = bulletNameOnlyMatch[1].trim();
    }

    if (name) {
      channels.push({ name, url, channel_id: extractChannelIdFromUrl(url) || '' });
    }
  }

  // Deduplicate by name
  const seen = new Set();
  const deduped = [];
  for (const ch of channels) {
    const key = ch.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(ch);
    }
  }
  return deduped;
}

function extractChannelIdFromUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    // Patterns: /channel/UCxxxx, /c/Name, /@handle
    const parts = u.pathname.split('/').filter(Boolean);
    const channelIdx = parts.indexOf('channel');
    if (channelIdx !== -1 && parts[channelIdx + 1]) {
      return parts[channelIdx + 1];
    }
    return '';
  } catch {
    return '';
  }
}

async function youtubeApi(endpoint, params) {
  const q = new URLSearchParams({ key: YT_API_KEY, ...params });
  const url = `https://www.googleapis.com/youtube/v3/${endpoint}?${q.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API ${endpoint} failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}

async function resolveChannelIdByName(name) {
  // Use search endpoint to find channel by name
  const json = await youtubeApi('search', {
    part: 'snippet',
    q: name,
    type: 'channel',
    maxResults: '1',
  });
  const item = json.items && json.items[0];
  if (item && item.snippet && item.snippet.channelId) {
    return item.snippet.channelId;
  }
  if (item && item.id && item.id.channelId) {
    return item.id.channelId;
  }
  return '';
}

async function fetchLatestVideosForChannelId(channelId, max = 20) {
  const json = await youtubeApi('search', {
    part: 'snippet',
    channelId,
    type: 'video',
    order: 'date',
    maxResults: String(Math.min(max, 50)),
  });
  const videos = (json.items || []).map((it) => ({
    videoId: it.id && it.id.videoId ? it.id.videoId : '',
    title: it.snippet?.title || '',
    publishTime: it.snippet?.publishTime || it.snippet?.publishedAt || '',
    description: it.snippet?.description || '',
    channelTitle: it.snippet?.channelTitle || '',
    channelId: it.snippet?.channelId || '',
  })).filter(v => v.videoId);

  // Enrich with recordingDetails for coordinates if possible
  if (videos.length > 0) {
    const ids = videos.map(v => v.videoId);
    const batches = [];
    for (let i = 0; i < ids.length; i += 50) {
      batches.push(ids.slice(i, i + 50));
    }
    const details = [];
    for (const batch of batches) {
      const det = await youtubeApi('videos', {
        part: 'recordingDetails,snippet',
        id: batch.join(','),
        maxResults: '50',
      });
      details.push(...(det.items || []));
    }
    const idToDetails = new Map(details.map(d => [d.id, d]));
    for (const v of videos) {
      const d = idToDetails.get(v.videoId);
      const rec = d?.recordingDetails;
      const loc = rec?.location;
      v.lat = typeof loc?.latitude === 'number' ? loc.latitude : undefined;
      v.lng = typeof loc?.longitude === 'number' ? loc.longitude : undefined;
      // if snippet tags present
      const snippet = d?.snippet;
      v.tags = Array.isArray(snippet?.tags) ? snippet.tags : [];
    }
  }

  return videos;
}

function readExistingEvents() {
  if (!fs.existsSync(EVENTS_JSON_PATH)) return [];
  try {
    const raw = fs.readFileSync(EVENTS_JSON_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.events)) return parsed.events;
    return [];
  } catch {
    return [];
  }
}

function validateEventShape(event) {
  const errors = [];
  function isString(x) { return typeof x === 'string' && x.length >= 0; }
  function isOptNum(x) { return x === undefined || typeof x === 'number'; }
  function isOptArr(x) { return x === undefined || Array.isArray(x); }

  if (!isString(event.id) || event.id.length === 0) errors.push('id: required non-empty string');
  if (!isString(event.title)) errors.push('title: string');
  if (!isString(event.date) || event.date.length === 0) errors.push('date: required');
  if (!isString(event.category)) errors.push('category: string');
  if (!isString(event.channel_name)) errors.push('channel_name: string');
  if (!isString(event.source_url)) errors.push('source_url: string');
  if (!isString(event.description)) errors.push('description: string');
  if (!isString(event.channel_id)) errors.push('channel_id: string');
  if (!isString(event.source)) errors.push('source: string');
  if (!isString(event.region)) errors.push('region: string');
  if (!isOptNum(event.lat)) errors.push('lat: number or omitted');
  if (!isOptNum(event.lng)) errors.push('lng: number or omitted');
  if (!isOptArr(event.tags)) errors.push('tags: array or omitted');
  return errors;
}

function buildEventFromVideo(video) {
  return {
    id: video.videoId,
    title: video.title,
    date: video.publishTime,
    region: 'Unspecified',
    lat: typeof video.lat === 'number' ? video.lat : undefined,
    lng: typeof video.lng === 'number' ? video.lng : undefined,
    category: 'Geopolitics/News/Analysis',
    channel_name: video.channelTitle || '',
    source_url: `https://www.youtube.com/watch?v=${video.videoId}`,
    description: video.description || '',
    channel_id: video.channelId || '',
    source: 'YouTube',
    tags: Array.isArray(video.tags) ? video.tags : [],
  };
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
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

async function main() {
  const result = {
    added_count: 0,
    added_ids: [],
    channels_processed: 0,
    errors: [],
    warnings: [],
  };

  const readme = await readFileSafe(README_PATH);
  if (!readme) {
    result.errors.push(`README not found at ${README_PATH}`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  const channels = parseChannelsFromReadme(readme);

  // Ensure channels include id or url; otherwise we cannot proceed
  const hasAnyStructured = channels.some(ch => ch.channel_id || (ch.url && ch.url.includes('youtube.com')));

  if (!hasAnyStructured) {
    result.errors.push('README.md does not contain channel_id/url for YouTube channels. Please add explicit channel links (https://www.youtube.com/channel/UC...) or channel IDs.');
    if (!YT_API_KEY) {
      result.errors.push('Missing YT_API_KEY. Provide an API key via environment variable YT_API_KEY.');
    }
    // Output also the names detected
    if (channels.length > 0) {
      result.warnings.push(`Detected channel names without ids/urls: ${channels.map(c => c.name).join(', ')}`);
    } else {
      result.errors.push('No channels detected in README.md under the YouTube channels section.');
    }
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  if (!YT_API_KEY) {
    result.errors.push('Missing YT_API_KEY. Provide an API key via environment variable YT_API_KEY.');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // Resolve channel IDs where missing
  const resolvedChannels = [];
  for (const ch of channels) {
    let channelId = ch.channel_id;
    if (!channelId && ch.url) {
      channelId = extractChannelIdFromUrl(ch.url);
    }
    if (!channelId) {
      try {
        channelId = await resolveChannelIdByName(ch.name);
      } catch (e) {
        result.errors.push(`Failed to resolve channel ID for ${ch.name}: ${e.message}`);
      }
    }
    if (channelId) {
      resolvedChannels.push({ name: ch.name, channel_id: channelId, url: ch.url || `https://www.youtube.com/channel/${channelId}` });
    }
  }

  result.channels_processed = resolvedChannels.length;
  if (resolvedChannels.length === 0) {
    result.errors.push('No channels could be resolved to channel IDs.');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // Fetch videos and build events
  const existing = readExistingEvents();
  const existingIds = new Set(existing.map(e => e.id));
  const newEvents = [];

  for (const ch of resolvedChannels) {
    try {
      const vids = await fetchLatestVideosForChannelId(ch.channel_id, 20);
      for (const v of vids) {
        const ev = buildEventFromVideo(v);
        if (!existingIds.has(ev.id)) {
          // validate shape
          const errs = validateEventShape(ev);
          if (errs.length > 0) {
            result.errors.push(`Event ${ev.id} validation errors: ${errs.join(', ')}`);
            continue;
          }
          newEvents.push(ev);
          existingIds.add(ev.id);
        }
      }
    } catch (e) {
      result.errors.push(`Failed fetching videos for channel ${ch.name} (${ch.channel_id}): ${e.message}`);
    }
  }

  if (newEvents.length === 0) {
    // Nothing to write
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // Write dataset files
  const allEvents = existing.concat(newEvents);
  writeJson(EVENTS_JSON_PATH, allEvents);
  const summary = summarizeEvents(allEvents, newEvents);
  writeJson(EVENTS_SUMMARY_JSON_PATH, summary);

  result.added_count = newEvents.length;
  result.added_ids = newEvents.map(e => e.id);
  console.log(JSON.stringify(result, null, 2));
}

// Node 18+ has global fetch; ensure it's available in case of older runtime
if (typeof fetch !== 'function') {
  global.fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
}

main().catch(err => {
  const out = { added_count: 0, added_ids: [], channels_processed: 0, errors: [String(err && err.message ? err.message : err)] };
  console.log(JSON.stringify(out, null, 2));
  process.exit(1);
});
