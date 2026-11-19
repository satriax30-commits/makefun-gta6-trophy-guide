// Filters and the spoiler rule: which trophies a view shows, and what a story
// trophy looks like while spoilers are hidden.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  robbery: 'Robberies',
  side: 'Side quests',
  challenge: 'Challenges',
  platinum: 'Platinum',
  online: 'Online',
};

// A story trophy is hidden by the spoiler setting until it is earned.
export function isMasked(trophy, earned, spoilersOn) {
  return spoilersOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

export function maskedName() {
  return 'Hidden story trophy';
}

export function maskedDescription() {
  return 'Hidden until earned — finish the story to reveal this trophy.';
}

// kind: all | story | missable | collectible | activity | robbery | side |
// challenge | platinum | online. There are no online trophies in this list.
export function filterByKind(trophies, kind) {
  if (kind === 'all') return trophies;
  if (kind === 'missable') return trophies.filter((t) => t.missable);
  if (kind === 'online') return [];
  return trophies.filter((t) => t.kind === kind);
}

export function filterByGrade(trophies, grade) {
  if (grade === 'all') return trophies;
  return trophies.filter((t) => t.grade === grade);
}

export function filterByStatus(trophies, status, earned) {
  if (status === 'earned') return trophies.filter((t) => earned.has(t.name));
  if (status === 'remaining') return trophies.filter((t) => !earned.has(t.name));
  return trophies;
}

export function filterBySearch(trophies, query) {
  const q = query.trim().toLowerCase();
  if (!q) return trophies;
  return trophies.filter((t) =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.guide.toLowerCase().includes(q),
  );
}

export function applyFilters(trophies, { kind, grade, status, search }, earned) {
  let out = filterByKind(trophies, kind);
  out = filterByGrade(out, grade);
  out = filterByStatus(out, status, earned);
  out = filterBySearch(out, search);
  return out;
}
