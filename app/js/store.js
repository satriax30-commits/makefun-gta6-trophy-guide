// Progress store: earned trophy names in localStorage, with export and import as a file.
// Nothing here touches the network; the file the export writes is made in the browser.
export const PROGRESS_KEY = 'leonida-ledger-progress-v1';
export const SPOILER_KEY = 'leonida-ledger-spoilers-v1';
export const APP_NAME = 'leonida-ledger';

// The demo set used only when the page is opened with ?seed=13 (for screenshots):
// a plausible early run — story through Chapter 2 plus a few open-world trophies.
export const DEMO_EARNED = [
  'Just Like Paradise',
  'Paradise Lost',
  'T**s Ass Drug Money',
  'Trust',
  'Master of None',
  'Baited My Tackle',
  'Stick Fiddler',
  'Whip It Good',
  'The Goodtime State',
  'In The Beginning…',
  'Actions Speak Louder',
  'Treat Yo Self',
  'On the Spot',
];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
}

export function loadSpoilers() {
  try {
    const raw = localStorage.getItem(SPOILER_KEY);
    return raw === null ? true : raw === '1';
  } catch {
    return true;
  }
}

export function saveSpoilers(on) {
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
}

// Export: download a JSON file with the earned names, the app tag and a version.
export function exportProgress(earned) {
  const payload = {
    app: APP_NAME,
    version: 1,
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-ledger-progress.json';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Import: read a progress file back. Accepts our own export shape or a bare
// array of trophy names. Unknown names are dropped; the caller gets the count.
export async function importProgressFile(file, knownNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('Not a progress file: expected a list of trophy names.');
  const known = new Set(knownNames);
  const kept = names.filter((n) => typeof n === 'string' && known.has(n));
  return new Set(kept);
}
