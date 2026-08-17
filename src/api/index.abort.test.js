
// index.abort.test.js
// Ticket: Redmine #8 — COVID Tracker Enhancement
// Verifies: AC-03 (AbortController cancel path re-throws without wrapping in a new Error),
//            AC-01/AC-02 (global vs country URL path selection in fetchDailyData)

import axios from 'axios';
import { fetchData, fetchDailyData, fetchCountries } from './index';

jest.mock('axios');

const mockCancelError = Object.assign(new Error('Request aborted'), { __CANCEL__: true });

afterEach(() => {
  jest.clearAllMocks();
});

describe('AbortController cancel propagation (AC-03)', () => {
  it('fetchData re-throws the cancel error without wrapping it', async () => {
    axios.isCancel = jest.fn().mockReturnValue(true);
    axios.get = jest.fn().mockRejectedValue(mockCancelError);

    await expect(fetchData('', new AbortController().signal)).rejects.toThrow('Request aborted');
    // Confirm it is NOT wrapped in "Failed to fetch COVID stats:"
    await expect(fetchData('', new AbortController().signal)).rejects.not.toThrow(
      'Failed to fetch COVID stats'
    );
  });

  it('fetchDailyData re-throws the cancel error without wrapping it', async () => {
    axios.isCancel = jest.fn().mockReturnValue(true);
    axios.get = jest.fn().mockRejectedValue(mockCancelError);

    await expect(fetchDailyData('', new AbortController().signal)).rejects.toThrow('Request aborted');
    await expect(fetchDailyData('', new AbortController().signal)).rejects.not.toThrow(
      'Failed to fetch daily data'
    );
  });

  it('fetchCountries re-throws the cancel error without wrapping it', async () => {
    axios.isCancel = jest.fn().mockReturnValue(true);
    axios.get = jest.fn().mockRejectedValue(mockCancelError);

    await expect(fetchCountries(new AbortController().signal)).rejects.toThrow('Request aborted');
    await expect(fetchCountries(new AbortController().signal)).rejects.not.toThrow(
      'Failed to fetch countries'
    );
  });
});

describe('fetchDailyData URL path selection (AC-01 / AC-02)', () => {
  const mockGlobal = {
    data: {
      cases: { '1/22/20': 100, '1/23/20': 200 },
      deaths: { '1/22/20': 1, '1/23/20': 2 },
      recovered: { '1/22/20': 10, '1/23/20': 20 },
    },
  };

  const mockCountry = {
    data: {
      country: 'India',
      timeline: {
        cases: { '3/1/20': 1, '3/2/20': 2 },
        deaths: { '3/1/20': 0, '3/2/20': 0 },
        recovered: { '3/1/20': 0, '3/2/20': 1 },
      },
    },
  };

  beforeEach(() => {
    axios.isCancel = jest.fn().mockReturnValue(false);
  });

  // AC-01: global endpoint used when no country supplied
  it('calls the global historical endpoint when country is omitted', async () => {
    axios.get = jest.fn().mockResolvedValue(mockGlobal);

    await fetchDailyData();

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/historical/all'),
      expect.any(Object)
    );
  });

  // AC-02: per-country endpoint used when country is provided
  it('calls the per-country historical endpoint when country is provided', async () => {
    axios.get = jest.fn().mockResolvedValue(mockCountry);

    await fetchDailyData('India');

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`/historical/${encodeURIComponent('India')}`),
      expect.any(Object)
    );
  });

  // AC-01/AC-02: recovered defaults to 0 when missing from response (?? 0)
  it('defaults recovered to 0 for dates where recovered key is absent', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        cases: { '1/1/22': 500 },
        deaths: { '1/1/22': 5 },
        recovered: {},  // no entry for '1/1/22'
      },
    });

    const result = await fetchDailyData();

    expect(result[0].recovered).toBe(0);
  });
});
