// Leonida Ledger — boot. Loads the trophy list, wires the tabs, filters,
// spoiler setting, export/import and the detail pane. Deep links for demos
// and screenshots: ?view=roadmap|missables|about, ?detail=<id>,
// ?spoilers=on|off, ?kind=<kind>, ?seed=13 (demo progress, 13 earned).
import { loadEarned, saveEarned, loadSpoilers, saveSpoilers, exportProgress, importProgressFile, DEMO_EARNED } from './js/store.js';
import { applyFilters } from './js/filters.js';
import { renderChecklist, renderRoadmap, renderMissables, renderAbout, renderDetail } from './js/views.js';

const viewEl = document.getElementById('view');
const detailEl = document.getElementById('detail');
const controlsEl = document.getElementById('checklistControls');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const statusEl = document.getElementById('status');
const spoilersEl = document.getElementById('spoilers');

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();

let earned = loadEarned();
let spoilersOn = loadSpoilers();
let view = params.get('view') ?? 'checklist';
let selectedId = Number(params.get('detail') ?? '0') || null;

// Demo progress for screenshots: ?seed=13 writes a fixed 13-trophy set.
if (params.get('seed') === '13') {
  earned = new Set(DEMO_EARNED);
  saveEarned(earned);
}
if (params.get('spoilers') === 'on') spoilersOn = true;
if (params.get('spoilers') === 'off') spoilersOn = false;
if (params.get('kind')) kindEl.value = params.get('kind');

spoilersEl.checked = spoilersOn;

function renderProgress() {
  const total = doc.trophies.length;
  const count = earned.size;
  document.getElementById('earnedCount').textContent = String(count);
  document.getElementById('progressFill').style.width = (100 * count / total).toFixed(1) + '%';
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(count));
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = doc.trophies.filter((t) => t.grade === g).length;
    const got = doc.trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    return g + ' ' + got + '/' + all;
  });
  document.getElementById('gradeCounts').textContent = parts.join(' · ');
  document.getElementById('platinumLine').textContent = earned.has('Vice Got a Price!')
    ? 'Platinum earned — you are a Leonida Legend.'
    : 'Platinum: Vice Got a Price! — earn the other 54.';
}

function selectedTrophy() {
  return doc.trophies.find((t) => t.id === selectedId) ?? null;
}

function render() {
  renderProgress();
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  controlsEl.style.display = view === 'checklist' ? '' : 'none';
  detailEl.style.display = view === 'checklist' || view === 'roadmap' || view === 'missables' ? '' : 'none';
  if (view === 'roadmap') {
    renderRoadmap(viewEl, doc, earned, spoilersOn, selectTrophy);
  } else if (view === 'missables') {
    renderMissables(viewEl, doc, earned, spoilersOn, selectTrophy);
  } else if (view === 'about') {
    renderAbout(viewEl, doc);
  } else {
    const shown = applyFilters(doc.trophies, {
      kind: kindEl.value,
      grade: gradeEl.value,
      status: statusEl.value,
      search: searchEl.value,
    }, earned);
    renderChecklist(viewEl, shown, earned, spoilersOn, selectedId, selectTrophy, toggleEarned);
  }
  renderDetail(detailEl, doc, selectedTrophy(), earned, spoilersOn, toggleEarned);
}

function selectTrophy(trophy) {
  selectedId = trophy.id;
  render();
}

function toggleEarned(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  saveEarned(earned);
  render();
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    view = tab.dataset.view;
    render();
  });
});
searchEl.addEventListener('input', render);
kindEl.addEventListener('change', render);
gradeEl.addEventListener('change', render);
statusEl.addEventListener('change', render);
spoilersEl.addEventListener('change', () => {
  spoilersOn = spoilersEl.checked;
  saveSpoilers(spoilersOn);
  render();
});
document.getElementById('export').addEventListener('click', () => exportProgress(earned));
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = await importProgressFile(file, doc.trophies.map((t) => t.name));
    saveEarned(earned);
    render();
  } catch (err) {
    alert('Could not import that file: ' + err.message);
  }
  e.target.value = '';
});

const foot = document.getElementById('footSources');
foot.textContent = 'Sources: ' + doc.sourceList.map((s) => s.name).join(' · ') + '.';

render();
