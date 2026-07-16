import axios from 'axios';
import { mapCountries, mapSummaryMetrics, mapTimeline } from './mappers';

const DEFAULT_BASE = 'https://disease.sh';

export function getApiBase() {
  const fromEnv = typeof process !== 'undefined'
    && process.env
    && process.env.REACT_APP_COVID_API_BASE;
  const base = (fromEnv || DEFAULT_BASE).replace(/\/$/, '');
  return base || DEFAULT_BASE;
}

export class ApiError extends Error {
  constructor(message, { code = 'API_ERROR', cause = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.cause = cause;
  }
}

function isAbortError(error) {
  return (
    error
    && (error.name === 'AbortError'
      || error.code === 'ERR_CANCELED'
      || error.__CANCEL__ === true)
  );
}

function throwHttpError(error, op) {
  if (isAbortError(error)) {
    throw error;
  }
  const status = error && error.response && error.response.status;
  const message = (error && error.message) || `Failed to ${op}`;
  throw new ApiError(message, {
    code: status ? `HTTP_${status}` : 'NETWORK_ERROR',
    cause: error,
  });
}

/**
 * Global or country summary → UI DTO.
 * @param {string} [country]
 * @param {AbortSignal} [signal]
 */
export const fetchSummary = async (country, signal) => {
  const base = getApiBase();
  const path = country
    ? `${base}/v3/covid-19/countries/${encodeURIComponent(country)}`
    : `${base}/v3/covid-19/all`;

  try {
    const { data } = await axios.get(path, { signal });
    return mapSummaryMetrics(data);
  } catch (error) {
    throwHttpError(error, 'fetch summary');
  }
};

/**
 * @param {AbortSignal} [signal]
 * @returns {Promise<string[]>}
 */
export const fetchCountries = async (signal) => {
  const base = getApiBase();
  try {
    const { data } = await axios.get(`${base}/v3/covid-19/countries`, { signal });
    return mapCountries(data);
  } catch (error) {
    throwHttpError(error, 'fetch countries');
  }
};

/**
 * Global historical timeline.
 * @param {AbortSignal} [signal]
 * @param {number} [lastdays=120]
 */
export const fetchTimeline = async (signal, lastdays = 120) => {
  const base = getApiBase();
  const days = Number.isFinite(Number(lastdays)) ? Number(lastdays) : 120;
  try {
    const { data } = await axios.get(
      `${base}/v3/covid-19/historical/all`,
      { params: { lastdays: days }, signal },
    );
    return mapTimeline(data);
  } catch (error) {
    throwHttpError(error, 'fetch timeline');
  }
};

/** @deprecated Use fetchSummary */
export const fetchData = fetchSummary;
/** @deprecated Use fetchTimeline */
export const fetchDailyData = fetchTimeline;
