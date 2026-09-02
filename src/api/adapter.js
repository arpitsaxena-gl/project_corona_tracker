import { toNumber } from '../utils/toNumber';

/**
 * Anti-corruption layer: the ONLY module aware of upstream API field names.
 * Normalizes raw JSON into internal DTOs with null-safe reads and numeric
 * defaults, so the UI never touches the external shape and never throws a
 * TypeError on a missing/renamed field (closes analysis P2).
 *
 * Numeric coercion is delegated to the shared `toNumber` helper so the UI and
 * the adapter share one definition of a "safe number".
 */

const toEpochMs = (value) => {
  if (value == null) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
};

/**
 * @returns {{confirmed:number, recovered:number, deaths:number, lastUpdate:(number|null)}}
 */
export const toTotals = (raw) => {
  const d = raw || {};
  return {
    confirmed: toNumber(d.confirmed && d.confirmed.value),
    recovered: toNumber(d.recovered && d.recovered.value),
    deaths: toNumber(d.deaths && d.deaths.value),
    lastUpdate: toEpochMs(d.lastUpdate),
  };
};

/**
 * @returns {{name:string}[]} rows missing a string `name` are dropped.
 */
export const toCountries = (raw) => {
  const list = raw && Array.isArray(raw.countries) ? raw.countries : [];
  return list
    .map((c) => (c && typeof c.name === 'string' && c.name ? { name: c.name } : null))
    .filter(Boolean);
};

/**
 * @returns {{date:(string|number), confirmed:number, deaths:number, recovered:number}[]}
 * Accepts either a bare array or `{ data: [...] }`. Maps upstream field aliases
 * (positive→confirmed, death→deaths, dateChecked→date) and preserves the
 * `recovered` trend so the line chart keeps its third dataset. Rows without a
 * date are dropped; an empty/removed source yields `[]`.
 */
export const toDaily = (raw) => {
  const list = Array.isArray(raw) ? raw : raw && Array.isArray(raw.data) ? raw.data : [];
  return list
    .map((row) => {
      if (!row) return null;
      const rawDate = row.date != null ? row.date : row.dateChecked;
      if (rawDate == null) return null;
      // Preserve numeric epoch timestamps as numbers: `new Date(1788353639741)`
      // parses, but `new Date(String(1788353639741))` is an Invalid Date. Only
      // non-numeric values (ISO / date-only strings) are stringified.
      const date = typeof rawDate === 'number' ? rawDate : String(rawDate);
      const confirmed = toNumber(row.positive != null ? row.positive : row.confirmed);
      const deaths = toNumber(row.death != null ? row.death : row.deaths);
      const recovered = toNumber(row.recovered);
      return { date, confirmed, deaths, recovered };
    })
    .filter(Boolean);
};
