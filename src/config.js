/**
 * Environment-driven configuration (CRA `REACT_APP_*` convention) with safe
 * fallbacks so current behavior is preserved when no env vars are set.
 *
 * - REACT_APP_API_BASE_URL: totals/countries API (default: mathdro).
 * - REACT_APP_DAILY_URL: optional live daily time-series source. Empty by
 *   default so the line chart degrades to a graceful empty state. The legacy
 *   api.covidtracking.com source was retired in 2021 and is intentionally gone.
 */

const DEFAULT_API_BASE_URL = 'https://covid19.mathdro.id/api';

export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL)
  .trim()
  .replace(/\/+$/, '');

export const DAILY_URL = (process.env.REACT_APP_DAILY_URL || '').trim();
