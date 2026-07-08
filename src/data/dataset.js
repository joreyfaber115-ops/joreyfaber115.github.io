// Single merged dataset: base curated list + all-time additions, plus the
// standalone curated "Active Stars" pool. Everything downstream imports here.
import { PLAYERS as BASE_PLAYERS, ALIASES as BASE_ALIASES } from "./players.js";
import { EXTRA_PLAYERS, EXTRA_ALIASES, CURRENT_PLAYERS } from "./additions.js";

const baseNames = new Set(BASE_PLAYERS.map((p) => p.name));

// All-time pool = base + extras (extras that duplicate a base name are dropped).
export const PLAYERS = [
  ...BASE_PLAYERS,
  ...EXTRA_PLAYERS.filter((p) => !baseNames.has(p.name)),
];

export const ALIASES = { ...BASE_ALIASES, ...EXTRA_ALIASES };

export { CURRENT_PLAYERS };
