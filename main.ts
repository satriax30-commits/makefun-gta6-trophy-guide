// Leonida Ledger — the gta6-trophy-guide-01 entry program (Node 22, standard
// library only). The guide is this directory's app/ folder: plain static files
// a browser opens at app/index.html (ES modules, CSS, no build step), offline:
// it loads nothing over the network, and its trophy list and guides are
// app/data/trophies.json. This program hands it in: it copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads (your screenshots, the first load's files and
// bytes, and your source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be
// byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

// The guide is only valid with its trophy data: fail loudly if the output
// copy of app/data/trophies.json is missing or does not hold all 55 trophies.
import { readFileSync } from 'node:fs';
const trophiesOut = JSON.parse(readFileSync(join(out, 'app', 'data', 'trophies.json'), 'utf8'));
if (!Array.isArray(trophiesOut.trophies) || trophiesOut.trophies.length !== 55) {
  throw new Error(`expected 55 trophies in app/data/trophies.json, found ${trophiesOut.trophies?.length ?? 0}`);
}

// A deterministic summary of what was handed in (no clock, no randomness):
// the app files, the screenshots and the dossier, with their byte counts.
function listFiles(dir, prefix = '') {
  const outFiles = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    const rel = prefix ? prefix + '/' + name : name;
    if (statSync(path).isDirectory()) outFiles.push(...listFiles(path, rel));
    else outFiles.push(rel);
  }
  return outFiles;
}
const appFiles = listFiles(join(out, 'app'));
const shotFiles = listFiles(join(out, 'screenshots'));
const dossierBytes = statSync(join(out, 'dossier.json')).size;
console.log(`gta6-trophy-guide-01: ${appFiles.length} app files, ${shotFiles.length} screenshots, dossier.json ${dossierBytes} bytes`);
