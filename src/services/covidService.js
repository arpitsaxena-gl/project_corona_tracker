import { fetchData, fetchCountries, fetchDailyData } from '../api';
import { toTotals, toCountries, toDaily } from '../api/adapter';
import { ok } from '../api/errors';

/**
 * Orchestration point every fetch site uses: call the raw API, then pipe a
 * successful payload through the adapter. A failed raw fetch short-circuits to
 * `fail` without touching the adapter; a malformed success is normalized and
 * never throws to the caller.
 */

export const getTotals = async (country, signal) => {
  const res = await fetchData(country, signal);
  if (!res.ok) return res;
  return ok(toTotals(res.data));
};

export const getCountries = async (signal) => {
  const res = await fetchCountries(signal);
  if (!res.ok) return res;
  return ok(toCountries(res.data));
};

export const getDailyData = async (signal) => {
  const res = await fetchDailyData(signal);
  if (!res.ok) return res;
  return ok(toDaily(res.data));
};
