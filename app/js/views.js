// Views: the checklist, the roadmap, the missables page, the about page and the
// trophy detail pane. All rendering is plain DOM, no framework.
import { KIND_LABELS, isMasked, maskedName, maskedDescription } from './filters.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeChip(grade) {
  return el('span', 'chip ' + grade, grade);
}

function kindChip(kind) {
  // The platinum trophy's kind is its grade; the grade chip already says it,
  // so this returns a comment node that appends nothing visible.
  if (kind === 'platinum') return document.createComment('platinum kind omitted');
  return el('span', 'chip kind', KIND_LABELS[kind] ?? kind);
}

function stageChip(stage) {
  return el('span', 'chip stage', 'Roadmap step ' + stage);
}

function sourceLink(source) {
  const li = document.createElement('li');
  if (source.url) {
    const a = document.createElement('a');
    a.href = source.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = source.name;
    li.append(a);
  } else {
    li.textContent = source.name + ' (named source)';
  }
  return li;
}

// The detail pane: official name and description as PlayStation publishes them,
// the guide in our own words, and the sources it cites.
export function renderDetail(container, doc, trophy, earned, spoilersOn, onToggle) {
  container.replaceChildren();
  if (!trophy) {
    const card = el('div', 'detail-card');
    card.append(el('h2', null, 'Pick a trophy'));
    card.append(el('p', null, 'Select any trophy in the list to read its guide and sources here.'));
    container.append(card);
    return;
  }
  const masked = isMasked(trophy, earned, spoilersOn);
  const card = el('div', 'detail-card');
  const tags = el('div', 'trophy-tags');
  tags.append(gradeChip(trophy.grade), kindChip(trophy.kind), stageChip(trophy.stage));
  if (trophy.missable) tags.append(el('span', 'chip missable', 'Potentially missable'));
  card.append(tags);
  card.append(el('h2', null, masked ? maskedName() : trophy.name));
  card.append(el('p', 'official', masked ? maskedDescription() : '“' + trophy.description + '”'));
  if (trophy.missable) {
    const warn = el('div', 'missable-banner',
      'Potentially missable — the first meditation at Jason’s house in Chapter 1 may be the only one you cannot go back for. Do it in Chapter 1; everything else in this guide can wait.');
    card.append(warn);
  }
  card.append(el('p', 'guide-label', 'Guide'));
  card.append(el('p', 'guide', masked
    ? 'This is a story trophy. Earn it in the game to reveal the guide — no spoilers here until then.'
    : trophy.guide));
  card.append(el('p', 'sources-label', 'Sources'));
  const list = el('ul', 'sources');
  for (const id of trophy.sources) {
    const source = doc.sourceList.find((s) => s.id === id);
    if (source) list.append(sourceLink(source));
  }
  card.append(list);
  const btn = el('button', 'earn-btn' + (earned.has(trophy.name) ? ' earned' : ''), earned.has(trophy.name) ? '✓ Earned — click to untick' : 'Mark as earned');
  btn.type = 'button';
  btn.addEventListener('click', () => onToggle(trophy));
  card.append(btn);
  container.append(card);
}

// The checklist: one row a trophy, with its checkbox, name, official description
// and tags. Story trophies stay masked while spoilers are on and unearned.
export function renderChecklist(container, trophies, earned, spoilersOn, selectedId, onSelect, onToggle) {
  container.replaceChildren();
  if (trophies.length === 0) {
    const empty = el('div', 'empty',
      'No trophies match these filters. There are no online trophies in this list — all 55 are single-player, so the Online filter is empty by design.');
    container.append(empty);
    return;
  }
  const list = el('ul', 'trophy-list');
  for (const t of trophies) {
    const masked = isMasked(t, earned, spoilersOn);
    const li = el('li', 'trophy-row' + (earned.has(t.name) ? ' earned' : '') + (t.id === selectedId ? ' selected' : ''));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('change', () => onToggle(t));
    box.addEventListener('click', (e) => e.stopPropagation());
    const body = el('div');
    body.append(el('div', 'trophy-name', masked ? maskedName() : t.name));
    body.append(el('div', 'trophy-desc', masked ? maskedDescription() : t.description));
    const tags = el('div', 'trophy-tags');
    tags.append(gradeChip(t.grade), kindChip(t.kind));
    if (t.missable) tags.append(el('span', 'chip missable', 'Potentially missable'));
    body.append(tags);
    const right = el('div');
    right.append(el('span', 'chip stage', 'Step ' + t.stage));
    li.append(box, body, right);
    li.addEventListener('click', () => onSelect(t));
    list.append(li);
  }
  container.append(list);
}

// The roadmap: four steps, each with its trophies as chips. Built from the
// official descriptions — which chapters and missions, which collectibles and
// counts, in what order.
export function renderRoadmap(container, doc, earned, spoilersOn, onSelect) {
  container.replaceChildren();
  for (const step of doc.roadmap) {
    const card = el('div', 'stage-card');
    card.append(el('p', 'hours', step.hours));
    card.append(el('h2', null, step.title));
    card.append(el('p', null, step.text));
    const chips = el('div', 'stage-chips');
    for (const t of doc.trophies.filter((x) => x.stage === step.stage)) {
      const masked = isMasked(t, earned, spoilersOn);
      const chip = el('button', 'stage-chip' + (earned.has(t.name) ? ' earned' : ''),
        (masked ? maskedName() : t.name) + (t.missable ? ' ⚠' : ''));
      chip.type = 'button';
      chip.addEventListener('click', () => onSelect(t));
      chips.append(chip);
    }
    card.append(chips);
    container.append(card);
  }
}

// The missables page: the one trophy that may be missable, and why the rest
// cannot be missed.
export function renderMissables(container, doc, earned, spoilersOn, onSelect) {
  container.replaceChildren();
  const missable = doc.trophies.filter((t) => t.missable);
  const card = el('div', 'about-card');
  card.append(el('h2', null, '1 potentially missable trophy'));
  card.append(el('p', null,
    'PowerPyx and GTABase both flag exactly one trophy as potentially missable. Every other trophy is either automatic story progress, which cannot be missed, or open-world content that stays available in free-roam after the story. There is no mission replay, so keep a save at the start and end of each chapter.'));
  const chips = el('div', 'stage-chips');
  for (const t of missable) {
    const chip = el('button', 'stage-chip', t.name + ' — meditate at every spot');
    chip.type = 'button';
    chip.addEventListener('click', () => onSelect(t));
    chips.append(chip);
  }
  card.append(chips);
  const warn = el('div', 'missable-banner',
    'The Chapter 1 meditation: after the mission Down to Earth, talk to Lucia in the kitchen in the morning, follow her to the balcony and accept. It is not yet confirmed whether it is required for the trophy — do it while you can.');
  card.append(warn);
  container.append(card);

  const safe = el('div', 'about-card');
  safe.append(el('h2', null, 'Everything else cannot be missed'));
  safe.append(el('p', null,
    'All 12 story trophies unlock by playing the chapters. Side quest givers who go quiet during the story — Kenton, for example — come back in later chapters or in free-roam. Optional missions that disappear do not matter for trophies, and the 100% checklist is fully doable after the story. Cheats are the one way to lock yourself out: using a cheat disables trophies and saving, per PowerPyx.'));
  safe.append(el('p', null,
    'Count: 12 story trophies (automatic) · 1 potentially missable · 42 open-world trophies (always available).'));
  container.append(safe);
}

// The about page: the list's facts, the sources, and an honest note on what
// is not yet confirmed.
export function renderAbout(container, doc) {
  container.replaceChildren();
  const facts = el('div', 'about-card');
  facts.append(el('h2', null, 'The list at a glance'));
  const grid = el('div', 'facts');
  const cells = [
    ['55', 'trophies on PlayStation 5'],
    ['1 · 2 · 6 · 46', 'platinum · gold · silver · bronze'],
    ['28', 'hidden until earned'],
    ['0', 'online trophies — all single-player'],
    ['5', 'story chapters'],
    ['60–80 h', 'story, per PowerPyx'],
    ['~200 h', 'to the platinum, per PowerPyx'],
    ['4/10', 'difficulty, per PowerPyx'],
  ];
  for (const [value, label] of cells) {
    const cell = el('div', 'fact');
    cell.append(el('b', null, value), el('span', null, label));
    grid.append(cell);
  }
  facts.append(grid);
  facts.append(el('p', null,
    'No mission replay, no New Game+, 15 manual save slots plus 1 autosave. Cheats disable trophies and saving. One playthrough is enough.'));
  container.append(facts);

  const sources = el('div', 'about-card');
  sources.append(el('h2', null, 'Sources'));
  sources.append(el('p', null,
    'The names, descriptions and grades are the official PlayStation list as published by Exophase and PSNProfiles. The guides are written for this page, in our own words, and each trophy’s guide names its sources beside it — a source is cited, never copied.'));
  const list = el('ul', 'sources');
  for (const s of doc.sourceList) list.append(sourceLink(s));
  sources.append(list);
  container.append(sources);

  const honest = el('div', 'about-card');
  honest.append(el('h2', null, 'What is not yet confirmed'));
  honest.append(el('p', null,
    'The game released on 19 November 2026, a day before this guide was written. Two trophies — Bad Luck, I Guess and Ten Pin — are listed as currently unknown by PowerPyx, and this guide says so on their pages instead of inventing a method. Where a specific step could not be verified against a source, the guide says what the official description establishes and cites the official list.'));
  honest.append(el('p', null,
    'Your progress is saved in this browser (localStorage) and never leaves it. Export writes a file you own; import reads it back. The guide loads nothing over the network.'));
  container.append(honest);
}
