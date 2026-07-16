import axios from 'axios';

const DEFAULT_COVID_API_BASE = 'https://disease.sh/v3/covid-19';
const DEFAULT_US_DAILY_URL = 'https://api.covidtracking.com/v1/us/daily.json';

const getCovidApiBase = () =>
  (process.env.REACT_APP_COVID_API_BASE || DEFAULT_COVID_API_BASE).replace(/\/$/, '');

const getUsDailyUrl = () =>
  process.env.REACT_APP_US_DAILY_URL || DEFAULT_US_DAILY_URL;

const MSG = {
  NETWORK: 'Unable to load COVID statistics. Please try again.',
  COUNTRY_NOT_ALLOWED: 'Selected country is not available.',
  INVALID_SHAPE: 'Received unexpected data from the statistics service.',
};

const fail = (code, message, cause) => {
  // eslint-disable-next-line no-console
  console.error('[covid-api]', code, message, cause || '');
  return { ok: false, error: { code, message, cause } };
};

const httpFail = (error, endpoint) => {
  const status = error && error.response && error.response.status;
  if (!status) {
    return fail('NETWORK', MSG.NETWORK, { endpoint, cause: error });
  }
  if (status >= 500) {
    return fail('HTTP_5XX', MSG.NETWORK, { endpoint, status });
  }
  return fail('HTTP_4XX', MSG.NETWORK, { endpoint, status });
};

export const mapDiseaseStats = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const { cases, recovered, deaths, updated } = raw;
  if (
    typeof cases !== 'number'
    || typeof recovered !== 'number'
    || typeof deaths !== 'number'
  ) {
    return null;
  }
  const lastUpdate = updated != null
    ? new Date(updated).toISOString()
    : new Date().toISOString();
  return {
    confirmed: { value: cases },
    recovered: { value: recovered },
    deaths: { value: deaths },
    lastUpdate,
  };
};

export const mapCountries = (raw) => {
  if (!Array.isArray(raw)) return null;
  const names = raw
    .map((row) => (row && typeof row.country === 'string' ? row.country : null))
    .filter(Boolean);
  return names;
};

export const mapDailyPoints = (raw) => {
  if (!Array.isArray(raw)) return null;
  return raw.map((row) => ({
    confirmed: row.positive == null ? 0 : Number(row.positive) || 0,
    recovered: row.recovered == null ? 0 : Number(row.recovered) || 0,
    deaths: row.death == null ? 0 : Number(row.death) || 0,
    date: row.dateChecked || row.date || '',
  }));
};

/**
 * @param {string} [country]
 * @param {{ allowedCountries?: string[] }} [options]
 * @returns {Promise<{ ok: boolean, data?: object, error?: { code: string, message: string } }>}
 */
export const fetchData = async (country, options = {}) => {
  const base = getCovidApiBase();
  const trimmed = country == null ? '' : String(country).trim();

  if (trimmed) {
    const allowed = options.allowedCountries;
    if (Array.isArray(allowed) && !allowed.includes(trimmed)) {
      return fail('COUNTRY_NOT_ALLOWED', MSG.COUNTRY_NOT_ALLOWED, { country: trimmed });
    }
  }

  const endpoint = trimmed
    ? `${base}/countries/${encodeURIComponent(trimmed)}`
    : `${base}/all`;

  try {
    const { data } = await axios.get(endpoint);
    const mapped = mapDiseaseStats(data);
    if (!mapped) {
      return fail('INVALID_SHAPE', MSG.INVALID_SHAPE, { endpoint });
    }
    return { ok: true, data: mapped };
  } catch (error) {
    return httpFail(error, endpoint);
  }
};

/**
 * US historical daily series (archive) for the global line chart.
 * @returns {Promise<{ ok: boolean, data?: Array, error?: object }>}
 */
export const fetchDailyData = async () => {
  const endpoint = getUsDailyUrl();
  try {
    const { data } = await axios.get(endpoint);
    const mapped = mapDailyPoints(data);
    if (!mapped) {
      return fail('INVALID_SHAPE', MSG.INVALID_SHAPE, { endpoint });
    }
    return { ok: true, data: mapped };
  } catch (error) {
    return httpFail(error, endpoint);
  }
};

/**
 * @returns {Promise<{ ok: boolean, data?: string[], error?: object }>}
 */
export const fetchCountries = async () => {
  const endpoint = `${getCovidApiBase()}/countries`;
  try {
    const { data } = await axios.get(endpoint);
    const mapped = mapCountries(data);
    if (!mapped) {
      return fail('INVALID_SHAPE', MSG.INVALID_SHAPE, { endpoint });
    }
    return { ok: true, data: mapped };
  } catch (error) {
    return httpFail(error, endpoint);
  }
};
