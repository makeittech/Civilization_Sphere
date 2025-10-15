#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const DATA_DIR = path.join(WORKSPACE_DIR, 'data');
const EVENTS_JSON_PATH = path.join(DATA_DIR, 'events.json');
const EVENTS_SUMMARY_JSON_PATH = path.join(DATA_DIR, 'events_summary.json');

function readJsonSafe(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

const baseTags = ['pandemic', 'epidemic', 'disease'];

const eventsToAdd = [
  {
    id: 'PANDEMIC_JUSTINIAN_541',
    title: 'Plague of Justinian begins',
    date: '0541-01-01T00:00:00.000Z',
    region: 'Europe',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Plague_of_Justinian',
    description: 'First recorded plague pandemic affecting the Byzantine Empire and Mediterranean.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'plague', 'yersinia pestis'],
    url: 'https://en.wikipedia.org/wiki/Plague_of_Justinian',
    channels: ['Historical Pandemics'],
    importance: 9,
    place: 'Byzantine Empire (Constantinople)'
  },
  {
    id: 'PANDEMIC_BLACK_DEATH_1347',
    title: 'Black Death spreads in Europe',
    date: '1347-10-01T00:00:00.000Z',
    region: 'Europe',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Black_Death',
    description: 'Bubonic plague pandemic killing tens of millions across Eurasia and North Africa.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'plague', 'yersinia pestis'],
    url: 'https://en.wikipedia.org/wiki/Black_Death',
    channels: ['Historical Pandemics'],
    importance: 10,
    place: 'Europe and North Africa'
  },
  {
    id: 'PANDEMIC_THIRD_PLAGUE_1894',
    title: 'Third Plague Pandemic begins',
    date: '1894-06-01T00:00:00.000Z',
    region: 'Asia',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Third_plague_pandemic',
    description: 'Global bubonic plague pandemic originating in Yunnan and Hong Kong.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'plague'],
    url: 'https://en.wikipedia.org/wiki/Third_plague_pandemic',
    channels: ['Historical Pandemics'],
    importance: 8,
    place: 'Hong Kong, Yunnan'
  },
  {
    id: 'PANDEMIC_GREAT_PLAGUE_LONDON_1665',
    title: 'Great Plague of London',
    date: '1665-06-01T00:00:00.000Z',
    region: 'Europe',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Great_Plague_of_London',
    description: 'Major outbreak of bubonic plague in London killing a quarter of the population.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'plague'],
    url: 'https://en.wikipedia.org/wiki/Great_Plague_of_London',
    channels: ['Historical Pandemics'],
    importance: 8,
    place: 'London, England'
  },
  {
    id: 'PANDEMIC_MARSEILLE_1720',
    title: 'Great Plague of Marseille',
    date: '1720-05-25T00:00:00.000Z',
    region: 'Europe',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Great_Plague_of_Marseille',
    description: 'One of the last significant European outbreaks of bubonic plague.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'plague'],
    url: 'https://en.wikipedia.org/wiki/Great_Plague_of_Marseille',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Marseille, France'
  },
  {
    id: 'PANDEMIC_CHOLERA_FIRST_1817',
    title: 'First Cholera Pandemic',
    date: '1817-08-01T00:00:00.000Z',
    region: 'Asia',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#First_pandemic_(1817%E2%80%931824)',
    description: 'Cholera spreads from the Ganges Delta to much of Asia.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'cholera', 'vibrio cholerae'],
    url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#First_pandemic_(1817%E2%80%931824)',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Ganges Delta, India'
  },
  {
    id: 'PANDEMIC_CHOLERA_SECOND_1829',
    title: 'Second Cholera Pandemic',
    date: '1829-01-01T00:00:00.000Z',
    region: 'Europe',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Second_pandemic_(1826%E2%80%931837)',
    description: 'Cholera reaches Europe and the Americas via trade routes.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'cholera'],
    url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Second_pandemic_(1826%E2%80%931837)',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Europe and North America'
  },
  {
    id: 'PANDEMIC_CHOLERA_THIRD_1846',
    title: 'Third Cholera Pandemic',
    date: '1846-01-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Third_pandemic_(1846%E2%80%931860)',
    description: 'The deadliest cholera pandemic, spreading worldwide.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'cholera'],
    url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Third_pandemic_(1846%E2%80%931860)',
    channels: ['Historical Pandemics'],
    importance: 8,
    place: 'Global'
  },
  {
    id: 'PANDEMIC_CHOLERA_FOURTH_1863',
    title: 'Fourth Cholera Pandemic',
    date: '1863-01-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Fourth_pandemic_(1863%E2%80%931875)',
    description: 'Cholera spreads along pilgrimage and trade routes.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'cholera'],
    url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Fourth_pandemic_(1863%E2%80%931875)',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Middle East, Europe'
  },
  {
    id: 'PANDEMIC_CHOLERA_FIFTH_1881',
    title: 'Fifth Cholera Pandemic',
    date: '1881-01-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Fifth_pandemic_(1881%E2%80%931896)',
    description: 'Severe outbreaks in Europe and South America.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'cholera'],
    url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Fifth_pandemic_(1881%E2%80%931896)',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Europe, South America'
  },
  {
    id: 'PANDEMIC_CHOLERA_SIXTH_1899',
    title: 'Sixth Cholera Pandemic',
    date: '1899-01-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Sixth_pandemic_(1899%E2%80%931923)',
    description: 'Widespread outbreaks, particularly in the Middle East and Russia.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'cholera'],
    url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_19th_century#Sixth_pandemic_(1899%E2%80%931923)',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Middle East, Russia'
  },
  {
    id: 'PANDEMIC_CHOLERA_SEVENTH_1961',
    title: 'Seventh Cholera Pandemic',
    date: '1961-01-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_20th_century#Seventh_pandemic_(1961%E2%80%93present)',
    description: 'Ongoing cholera pandemic caused by El Tor biotype.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'cholera', 'el tor'],
    url: 'https://en.wikipedia.org/wiki/Cholera_pandemics_in_the_20th_century#Seventh_pandemic_(1961%E2%80%93present)',
    channels: ['Historical Pandemics'],
    importance: 8,
    place: 'Global'
  },
  {
    id: 'PANDEMIC_SPANISH_FLU_1918',
    title: '1918 Influenza Pandemic (Spanish flu)',
    date: '1918-03-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Spanish_flu',
    description: 'H1N1 influenza pandemic causing tens of millions of deaths worldwide.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'influenza', 'H1N1'],
    url: 'https://en.wikipedia.org/wiki/Spanish_flu',
    channels: ['Historical Pandemics'],
    importance: 10,
    place: 'Global'
  },
  {
    id: 'PANDEMIC_ASIAN_FLU_1957',
    title: '1957–1958 Influenza Pandemic (Asian flu)',
    date: '1957-02-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/1957%E2%80%931958_influenza_pandemic',
    description: 'H2N2 influenza pandemic originating in East Asia.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'influenza', 'H2N2'],
    url: 'https://en.wikipedia.org/wiki/1957%E2%80%931958_influenza_pandemic',
    channels: ['Historical Pandemics'],
    importance: 9,
    place: 'Global'
  },
  {
    id: 'PANDEMIC_HONG_KONG_FLU_1968',
    title: '1968 Influenza Pandemic (Hong Kong flu)',
    date: '1968-07-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Hong_Kong_flu',
    description: 'H3N2 influenza pandemic beginning in Hong Kong.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'influenza', 'H3N2'],
    url: 'https://en.wikipedia.org/wiki/Hong_Kong_flu',
    channels: ['Historical Pandemics'],
    importance: 8,
    place: 'Global'
  },
  {
    id: 'PANDEMIC_RUSSIAN_FLU_1977',
    title: '1977 Russian flu',
    date: '1977-05-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/1977_Russian_flu',
    description: 'Reemergence of H1N1 influenza largely affecting younger populations.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'influenza', 'H1N1'],
    url: 'https://en.wikipedia.org/wiki/1977_Russian_flu',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Global'
  },
  {
    id: 'PANDEMIC_SARS_2002',
    title: 'SARS outbreak (2002–2004)',
    date: '2002-11-01T00:00:00.000Z',
    region: 'Asia',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Severe_acute_respiratory_syndrome',
    description: 'SARS coronavirus outbreak originating in Guangdong, China.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'coronavirus', 'SARS'],
    url: 'https://en.wikipedia.org/wiki/Severe_acute_respiratory_syndrome',
    channels: ['Historical Pandemics'],
    importance: 8,
    place: 'Guangdong, China'
  },
  {
    id: 'PANDEMIC_H1N1_2009',
    title: '2009 H1N1 Influenza Pandemic (Swine flu)',
    date: '2009-04-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/2009_swine_flu_pandemic',
    description: 'Global spread of novel H1N1 influenza virus.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'influenza', 'H1N1'],
    url: 'https://en.wikipedia.org/wiki/2009_swine_flu_pandemic',
    channels: ['Historical Pandemics'],
    importance: 8,
    place: 'Global'
  },
  {
    id: 'PANDEMIC_MERS_2012',
    title: 'MERS emerges in the Middle East',
    date: '2012-06-01T00:00:00.000Z',
    region: 'Middle East',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Middle_East_respiratory_syndrome',
    description: 'Middle East respiratory syndrome (MERS) first identified in Saudi Arabia.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'coronavirus', 'MERS'],
    url: 'https://en.wikipedia.org/wiki/Middle_East_respiratory_syndrome',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Saudi Arabia'
  },
  {
    id: 'PANDEMIC_EBOLA_WEST_AFRICA_2014',
    title: 'West African Ebola epidemic',
    date: '2014-03-01T00:00:00.000Z',
    region: 'Africa',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Western_African_Ebola_virus_epidemic',
    description: 'Largest Ebola virus epidemic, primarily in Guinea, Liberia, and Sierra Leone.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'ebola'],
    url: 'https://en.wikipedia.org/wiki/Western_African_Ebola_virus_epidemic',
    channels: ['Historical Pandemics'],
    importance: 9,
    place: 'Guinea, Liberia, Sierra Leone'
  },
  {
    id: 'PANDEMIC_ZIKA_2015',
    title: 'Zika virus epidemic',
    date: '2015-03-01T00:00:00.000Z',
    region: 'South America',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Zika_fever',
    description: 'Zika virus outbreak with congenital risks, centered in Brazil and the Americas.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'zika'],
    url: 'https://en.wikipedia.org/wiki/Zika_fever',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'Brazil and the Americas'
  },
  {
    id: 'PANDEMIC_EBOLA_KIVU_2018',
    title: 'Kivu Ebola epidemic (DRC)',
    date: '2018-08-01T00:00:00.000Z',
    region: 'Africa',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/Kivu_Ebola_epidemic',
    description: 'Long-running Ebola outbreak in the eastern Democratic Republic of the Congo.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'ebola'],
    url: 'https://en.wikipedia.org/wiki/Kivu_Ebola_epidemic',
    channels: ['Historical Pandemics'],
    importance: 7,
    place: 'North Kivu, DRC'
  },
  {
    id: 'PANDEMIC_COVID19_2019',
    title: 'COVID-19 pandemic begins',
    date: '2019-11-01T00:00:00.000Z',
    region: 'Global',
    category: 'Global Crises',
    channel_name: 'Historical Pandemics',
    source_url: 'https://en.wikipedia.org/wiki/COVID-19_pandemic',
    description: 'Global pandemic caused by SARS-CoV-2, with unprecedented societal and economic impacts.',
    channel_id: '',
    source: 'Historical',
    tags: [...baseTags, 'coronavirus', 'SARS-CoV-2'],
    url: 'https://en.wikipedia.org/wiki/COVID-19_pandemic',
    channels: ['Historical Pandemics'],
    importance: 10,
    place: 'Wuhan, China'
  }
];

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

(function main() {
  if (!fs.existsSync(EVENTS_JSON_PATH)) {
    console.error(`Missing ${EVENTS_JSON_PATH}`);
    process.exit(1);
  }
  const existing = readJsonSafe(EVENTS_JSON_PATH, []);
  if (!Array.isArray(existing)) {
    console.error('events.json is not an array');
    process.exit(1);
  }

  const existingIds = new Set(existing.map(e => e && e.id).filter(Boolean));
  const toInsert = eventsToAdd.filter(ev => !existingIds.has(ev.id));

  if (toInsert.length === 0) {
    console.log('No new pandemic events to insert.');
    process.exit(0);
  }

  const updated = existing.concat(toInsert);
  writeJson(EVENTS_JSON_PATH, updated);
  const summary = summarizeEvents(updated, toInsert);
  writeJson(EVENTS_SUMMARY_JSON_PATH, summary);
  console.log(JSON.stringify({ added: toInsert.length, total: updated.length }, null, 2));
})();
