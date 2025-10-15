#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

function fileContains(file, substrings) {
  const content = fs.readFileSync(file, 'utf8');
  return substrings.every(s => content.includes(s));
}

const root = process.cwd();
const indexHtml = path.join(root, 'index.html');
const appJs = path.join(root, 'app.js');
const styleCss = path.join(root, 'style.css');

assert(fs.existsSync(indexHtml), 'index.html should exist');
assert(fs.existsSync(appJs), 'app.js should exist');
assert(fs.existsSync(styleCss), 'style.css should exist');

assert(fileContains(indexHtml, ['timelineReadyOverlay', 'timelineReadyPlayBtn']), 'index.html should include ready overlay elements');
assert(fileContains(indexHtml, ['tabDataImport', 'panelDataImport', 'importFile', 'scanSourcesBtn', 'importBtn']), 'index.html should include Data Import tab and controls');
assert(fileContains(styleCss, ['timeline-ready-overlay', 'visible', '.tabs', '.tab', '.tabpanel']), 'style.css should include tab styles');
assert(fileContains(appJs, ['showTimelineReadyOverlay', 'hideTimelineReadyOverlay', 'isReady', 'setupImportUi', 'handleImportFile', 'importBufferedEvents']), 'app.js should include import UI logic');

console.log('OK: smoke test passed');
