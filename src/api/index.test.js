// Unit tests for the raw HTTP layer — Redmine #16.
// Verifies: never returns a raw error as data (P1/S3); encodes the user-influenced
// country into the URL (S2); forwards the abort signal (P5); and degrades to an
// empty daily payload when no live source is configured (P3).
import axios from 'axios';
import { fetchData, fetchCountries, fetchDailyData } from './index';
import { ErrorCode } from './errors';

// babel-plugin-jest-hoist lifts these above the imports.
jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('../config', () => ({ API_BASE_URL: 'https://api.example', DAILY_URL: '' }));

afterEach(() => jest.resetAllMocks());

describe('fetchData', () => {
  it('hits the global endpoint and returns ok(data) when no country is given', async () => {
    axios.get.mockResolvedValue({ data: { confirmed: { value: 1 } } });
    const res = await fetchData();
    expect(res).toEqual({ ok: true, data: { confirmed: { value: 1 } } });
    expect(axios.get).toHaveBeenCalledWith('https://api.example', { signal: undefined });
  });

  it('encodes the country into the per-country URL (S2) and forwards the abort signal (P5)', async () => {
    axios.get.mockResolvedValue({ data: {} });
    const signal = { aborted: false };
    const country = 'Côte d’Ivoire';
    await fetchData(country, signal);
    expect(axios.get).toHaveBeenCalledWith(
      `https://api.example/countries/${encodeURIComponent(country)}`,
      { signal },
    );
  });

  it('returns fail(AppError) instead of the raw error when the request throws (P1/S3)', async () => {
    axios.get.mockRejectedValue({ response: { status: 500 } });
    const res = await fetchData('India');
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe(ErrorCode.HTTP);
  });
});

describe('fetchCountries', () => {
  it('returns ok(data) from the /countries endpoint', async () => {
    axios.get.mockResolvedValue({ data: { countries: [{ name: 'India' }] } });
    const res = await fetchCountries();
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ countries: [{ name: 'India' }] });
    expect(axios.get).toHaveBeenCalledWith('https://api.example/countries', { signal: undefined });
  });

  it('returns a NETWORK fail on a request-without-response error', async () => {
    axios.get.mockRejectedValue({ request: {} });
    const res = await fetchCountries();
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe(ErrorCode.NETWORK);
  });
});

describe('fetchDailyData', () => {
  it('returns ok([]) WITHOUT a network call when no daily source is configured (P3)', async () => {
    const res = await fetchDailyData();
    expect(res).toEqual({ ok: true, data: [] });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('fetches the configured daily URL and returns ok(data) when a source is set (P3)', async () => {
    jest.resetModules();
    jest.doMock('../config', () => ({
      API_BASE_URL: 'https://api.example',
      DAILY_URL: 'https://daily.example/data.json',
    }));
    jest.doMock('axios', () => ({ get: jest.fn() }));

    // eslint-disable-next-line global-require
    const axiosLive = require('axios');
    axiosLive.get.mockResolvedValue({ data: [{ date: '2026-08-01', positive: 3, death: 1 }] });
    // eslint-disable-next-line global-require
    const { fetchDailyData: fetchDailyLive } = require('./index');

    const res = await fetchDailyLive();
    expect(res.ok).toBe(true);
    expect(res.data).toEqual([{ date: '2026-08-01', positive: 3, death: 1 }]);
    expect(axiosLive.get).toHaveBeenCalledWith('https://daily.example/data.json', {
      signal: undefined,
    });

    jest.dontMock('../config');
    jest.dontMock('axios');
  });
});
