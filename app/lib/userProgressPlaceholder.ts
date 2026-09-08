// Placeholder per-user training progress (chapters completed, avg. score).
// There is no admin endpoint yet that joins a user to their module/chapter
// progress or practice-session scores, so this derives a stable-looking
// (but fake) number from the user's id — same user always shows the same
// placeholder value instead of reshuffling on every render.
const TOTAL_CHAPTERS = 12;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function placeholderProgress(userId: string) {
  const hash = hashString(userId);
  return {
    chaptersCompleted: hash % (TOTAL_CHAPTERS + 1),
    totalChapters: TOTAL_CHAPTERS,
    avgScore: 55 + (hash % 45),
  };
}
