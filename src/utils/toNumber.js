/**
 * Shared numeric coercion used by both the API adapter and the UI.
 *
 * Returns a finite number, otherwise 0 — rejecting NaN AND non-finite values
 * such as Infinity. This is the single "safe number" rule so callers no longer
 * re-derive it (e.g. `Number(x) || 0`, which lets Infinity slip through).
 */
export const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
