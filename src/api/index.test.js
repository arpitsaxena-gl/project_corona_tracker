import axios from 'axios';
import { fetchData, fetchDailyData, fetchCountries } from './index';

jest.mock('axios');

beforeEach(() => {
  axios.isCancel = jest.fn().mockReturnValue(false);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('fetchData', () => {
  it('returns normalised stats on success (global)', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        confirmed: { value: 100000 },
        recovered: { value: 80000 },
        deaths: { value: 5000 },
        lastUpdate: '2021-01-01T00:00:00.000Z',
      },
    });

    const result = await fetchData();

    expect(result).toEqual({
      confirmed: { value: 100000 },
      recovered: { value: 80000 },
      deaths: { value: 5000 },
      lastUpdate: '2021-01-01T00:00:00.000Z',
    });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api'),
      expect.any(Object)
    );
  });

  it('encodes country name in URL when country is provided', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        confirmed: { value: 1000 },
        recovered: { value: 800 },
        deaths: { value: 50 },
        lastUpdate: '2021-01-01T00:00:00.000Z',
      },
    });

    await fetchData('United States');

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('United States')),
      expect.any(Object)
    );
  });

  it('throws an Error on network failure (does not return error)', async () => {
    axios.get = jest.fn().mockRejectedValue(new Error('Network Error'));

    await expect(fetchData()).rejects.toThrow('Failed to fetch COVID stats: Network Error');
  });
});

describe('fetchDailyData', () => {
  const mockGlobalResponse = {
    data: {
      cases: { '1/22/20': 555, '1/23/20': 654 },
      deaths: { '1/22/20': 17, '1/23/20': 18 },
      recovered: { '1/22/20': 28, '1/23/20': 30 },
    },
  };

  const mockCountryResponse = {
    data: {
      country: 'Brazil',
      timeline: {
        cases: { '1/22/20': 0, '2/26/20': 1 },
        deaths: { '1/22/20': 0, '2/26/20': 0 },
        recovered: { '1/22/20': 0, '2/26/20': 0 },
      },
    },
  };

  it('returns sorted DailyRecord array from global endpoint', async () => {
    axios.get = jest.fn().mockResolvedValue(mockGlobalResponse);

    const result = await fetchDailyData();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ date: '1/22/20', confirmed: 555, deaths: 17, recovered: 28 });
    expect(result[1]).toEqual({ date: '1/23/20', confirmed: 654, deaths: 18, recovered: 30 });
  });

  it('returns normalised DailyRecord array from country endpoint using timeline', async () => {
    axios.get = jest.fn().mockResolvedValue(mockCountryResponse);

    const result = await fetchDailyData('Brazil');

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('confirmed');
    expect(result[0]).toHaveProperty('deaths');
    expect(result[0]).toHaveProperty('recovered');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('Brazil')),
      expect.any(Object)
    );
  });

  it('throws an Error on failure (does not return error)', async () => {
    axios.get = jest.fn().mockRejectedValue(new Error('500 Server Error'));

    await expect(fetchDailyData()).rejects.toThrow('Failed to fetch daily data: 500 Server Error');
  });
});

describe('fetchCountries', () => {
  it('returns sorted country name array', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        countries: [{ name: 'France' }, { name: 'Brazil' }, { name: 'Australia' }],
      },
    });

    const result = await fetchCountries();

    expect(result).toEqual(['Australia', 'Brazil', 'France']);
  });

  it('throws an Error on failure', async () => {
    axios.get = jest.fn().mockRejectedValue(new Error('Network timeout'));

    await expect(fetchCountries()).rejects.toThrow('Failed to fetch countries: Network timeout');
  });
});
