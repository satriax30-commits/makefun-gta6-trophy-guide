# makefun-gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/satriax30-commits/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/satriax30-commits/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Ledger — an offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5: all 55 trophies with their official names, descriptions and grades, a guide to each in our own words with its sources cited, a four-step roadmap to the platinum, the one potentially missable trophy flagged, and a checklist saved in the browser with export and import, kind and grade filters, and a spoiler setting that hides story trophies until they are earned. Static files, no build step — it works with the network off.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. To hand the entry in instead:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Deep links for trying the views: `?view=roadmap`, `?view=missables`, `?view=about`, `?detail=<trophy id>`, `?spoilers=on|off`, `?kind=<kind>`, and `?seed=13` for a demo run with 13 trophies earned.

---

<sub>Entered on [make.fun](https://make.fun/?ref=kssgyf66&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
