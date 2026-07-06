// Answer normalization + fuzzy matching (ported from the original game,
// with a tightened guard so a guess that is itself a different real school
// can't fuzzy-match — e.g. "Florida" no longer counts for "Florida State").
import { PLAYERS, ALIASES } from "./players.js";

export function normalize(str) {
  let s = (str || "").toLowerCase();
  s = s.replace(/&/g, " and ");
  s = s.replace(/[().'’]/g, " ");
  s = s.replace(/\buniversity\b/g, " ");
  s = s.replace(/\bcollege\b/g, " ");
  s = s.replace(/\bof\b/g, " ");
  s = s.replace(/\bthe\b/g, " ");
  s = s.replace(/\bstate\b/g, " st ");
  s = s.replace(/\bst\.?\b/g, " st ");
  s = s.replace(/[^a-z0-9\s]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

// Every distinct real college (normalized) — used to block cross-school matches.
const KNOWN_NORMS = new Set(PLAYERS.map((p) => normalize(p.college)));

export function isCorrectGuess(guessRaw, college) {
  const guess = normalize(guessRaw);
  if (!guess) return false;
  const target = normalize(college);
  const candidates = [target];
  if (ALIASES[college]) {
    ALIASES[college].forEach((a) => candidates.push(normalize(a)));
  }
  for (const c of candidates) {
    if (guess === c) return true;
    // Don't let a guess that is itself a different real school slip through fuzzily.
    if (KNOWN_NORMS.has(guess) && guess !== target) continue;
    const threshold = c.length <= 5 ? 1 : 2;
    if (levenshtein(guess, c) <= threshold) return true;
  }
  return false;
}
