// COVID-19 Tracker — API unit tests | Ticket: COVID-19
// Verifies: AC-P1 (dead API fix, null-on-error, disease.sh endpoints, encodeURIComponent)
import axios from 'axios';
import { fetchData, fetchDailyData, fetchCountries } from './index';

jest.mock('axios');

// ---------------------------------------------------------------------------
// fetchData
// ---------------------------------------------------------------------------
describe('fetchData', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns StatsSnapshot shape on success (global, no country)', async () => {
    // AC-P1 / analysis_output.json validation_classifications.input[1]
    axios.get.mockResolvedValue({
      data: { cases: 1000, recovered: 800, deaths: 50, updated: 1609459200000 },
    });
    const result = await fetchData();
    expect(result).toEqual({
      confirmed: { value: 1000 },
      recovered: { value: 800 },
      deaths: { value: 50 },
      lastUpdate: expect.any(String),
    });
  });

  test('calls /all endpoint when no country provided', async () => {
    // AC-P1 business-rule: empty country → global fetch
    axios.get.mockResolvedValue({
      data: { cases: 1, recovered: 0, deaths: 0, updated: 0 },
    });
    await fetchData();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/all'));
  });

  test('calls /countries/{country} endpoint when country is provided', async () => {
    // AC-P1 / validation_classifications.business[1]
    axios.get.mockResolvedValue({
      data: { cases: 500, recovered: 400, deaths: 20, updated: 1609459200000 },
    });
    await fetchData('Germany');
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/countries/Germany'));
  });

  test('encodes special characters in country name (A03 injection guard)', async () => {
    // AC-P1 security finding A03 — encodeURIComponent applied
    axios.get.mockResolvedValue({
      data: { cases: 10, recovered: 8, deaths: 1, updated: 0 },
    });
    const country = "Côte d'Ivoire";
    await fetchData(country);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(country))
    );
  });

  test('returns null on network error — not an Error object', async () => {
    // AC-P1 critical fix: catch blocks must return null, not the Error instance
    axios.get.mockRejectedValue(new Error('Network error'));
    const result = await fetchData();
    expect(result).toBeNull();
  });

  test('result of null is NOT an Error instance', async () => {
    // Regression: prior bug returned `error` from catch; verify fix
    axios.get.mockRejectedValue(new Error('fail'));
    const result = await fetchData();
    expect(result instanceof Error).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fetchDailyData
// ---------------------------------------------------------------------------
describe('fetchDailyData', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns DailyEntry[] array on success', async () => {
    // AC-P1 — disease.sh historical endpoint + DailyEntry shape
    axios.get.mockResolvedValue({
      data: {
        cases:     { '1/1/21': 1000, '1/2/21': 2000 },
        recovered: { '1/1/21': 800,  '1/2/21': 1600 },
        deaths:    { '1/1/21': 50,   '1/2/21': 100  },
      },
    });
    const result = await fetchDailyData();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      confirmed: 1000,
      recovered: 800,
      deaths: 50,
      date: '1/1/21',
    });
  });

  test('calls disease.sh /historical/all endpoint', async () => {
    // AC-P1 — dead covidtracking.com replaced with disease.sh
    axios.get.mockResolvedValue({
      data: { cases: {}, recovered: {}, deaths: {} },
    });
    await fetchDailyData();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/historical/all'));
  });

  test('returns null on error — not an Error object', async () => {
    // AC-P1 critical fix: catch must return null
    axios.get.mockRejectedValue(new Error('API failure'));
    const result = await fetchDailyData();
    expect(result).toBeNull();
  });

  test('returns an array, never an object, on success', async () => {
    // Regression: prior bug: dailyData initialized as {} caused Chart errors
    axios.get.mockResolvedValue({
      data: { cases: { '1/1/21': 100 }, recovered: { '1/1/21': 80 }, deaths: { '1/1/21': 5 } },
    });
    const result = await fetchDailyData();
    expect(Array.isArray(result)).toBe(true);
    expect(typeof result).not.toBe('object' && !Array.isArray(result));
  });
});

// ---------------------------------------------------------------------------
// fetchCountries
// ---------------------------------------------------------------------------
describe('fetchCountries', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns sorted array of country name strings on success', async () => {
    // AC-P1 — countries endpoint + alphabetical sort
    axios.get.mockResolvedValue({
      data: [
        { country: 'Germany' },
        { country: 'Australia' },
        { country: 'Brazil' },
      ],
    });
    const result = await fetchCountries();
    expect(result).toEqual(['Australia', 'Brazil', 'Germany']);
  });

  test('returns null on error — not an Error object', async () => {
    // AC-P1 critical fix: catch must return null (not Error that breaks countries.map())
    axios.get.mockRejectedValue(new Error('Network failure'));
    const result = await fetchCountries();
    expect(result).toBeNull();
  });

  test('result of null does not have .map method (regression guard)', async () => {
    // AC-P1 — prior bug: returning Error object caused countries.map() TypeError at runtime
    axios.get.mockRejectedValue(new Error('fail'));
    const result = await fetchCountries();
    expect(typeof result?.map).toBe('undefined');
  });
});
