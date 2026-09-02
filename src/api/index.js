import axios from 'axios';

import { API_BASE_URL, DAILY_URL } from '../config';
import { ok, fail, toAppError } from './errors';

/**
 * Raw HTTP layer. Knows URLs and transport only — never the upstream JSON shape
 * (that lives in api/adapter.js). Every function returns a `Result<rawJson>`:
 * it never returns a raw Error as data (closes analysis P1/S3).
 *
 * @param {string} [country] optional country name; when present, per-country endpoint
 * @param {AbortSignal} [signal] optional AbortController signal for cancellation
 */
export const fetchData = async (country, signal) => {
  try {
    // Build the URL inside the try so a synchronous throw from encodeURIComponent
    // (e.g. an unpaired UTF-16 surrogate in `country`) is captured as a Result
    // rather than escaping as an unhandled rejection — honouring this module's
    // promise to never return/throw a raw error (P1/S3).
    const changeableUrl = country
      ? `${API_BASE_URL}/countries/${encodeURIComponent(country)}` // encode user-influenced value (S2)
      : API_BASE_URL;
    const { data } = await axios.get(changeableUrl, { signal });
    return ok(data);
  } catch (error) {
    return fail(toAppError(error));
  }
};

export const fetchCountries = async (signal) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/countries`, { signal });
    return ok(data);
  } catch (error) {
    return fail(toAppError(error));
  }
};

/**
 * Daily time-series. Reads the configured live source (REACT_APP_DAILY_URL).
 * When no source is configured, returns an empty payload so the line chart
 * renders a graceful empty state instead of the old perpetual blank (P3).
 */
export const fetchDailyData = async (signal) => {
  if (!DAILY_URL) {
    return ok([]);
  }

  try {
    const { data } = await axios.get(DAILY_URL, { signal });
    return ok(data);
  } catch (error) {
    return fail(toAppError(error));
  }
};
