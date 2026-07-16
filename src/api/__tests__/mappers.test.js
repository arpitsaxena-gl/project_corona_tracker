import {
  mapDiseaseStats,
  mapCountries,
  mapDailyPoints,
  fetchData,
} from '../index';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const axios = require('axios').default;

describe('mapDiseaseStats', () => {
  it('maps disease.sh payload to StatsDTO', () => {
    const mapped = mapDiseaseStats({
      cases: 10,
      recovered: 7,
      deaths: 2,
      updated: 1609459200000,
    });
    expect(mapped).toEqual({
      confirmed: { value: 10 },
      recovered: { value: 7 },
      deaths: { value: 2 },
      lastUpdate: new Date(1609459200000).toISOString(),
    });
  });

  it('returns null for invalid shape', () => {
    expect(mapDiseaseStats({ cases: 'x' })).toBeNull();
    expect(mapDiseaseStats(null)).toBeNull();
  });
});

describe('mapCountries', () => {
  it('extracts country name strings', () => {
    expect(mapCountries([{ country: 'India' }, { country: 'Brazil' }])).toEqual([
      'India',
      'Brazil',
    ]);
  });

  it('returns null when not an array', () => {
    expect(mapCountries({ countries: [] })).toBeNull();
  });
});

describe('mapDailyPoints', () => {
  it('coalesces null metrics to 0', () => {
    expect(mapDailyPoints([
      { positive: null, recovered: null, death: 3, dateChecked: '2020-01-01' },
    ])).toEqual([
      {
        confirmed: 0,
        recovered: 0,
        deaths: 3,
        date: '2020-01-01',
      },
    ]);
  });
});

describe('fetchData', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it('returns failure COUNTRY_NOT_ALLOWED without calling provider', async () => {
    const result = await fetchData('Atlantis', {
      allowedCountries: ['India', 'Brazil'],
    });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('COUNTRY_NOT_ALLOWED');
    expect(result.error.message).toBe('Selected country is not available.');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('requests encoded country path for allow-listed country', async () => {
    axios.get.mockResolvedValue({
      data: {
        cases: 1,
        recovered: 1,
        deaths: 0,
        updated: 1609459200000,
      },
    });
    const result = await fetchData('United Kingdom', {
      allowedCountries: ['United Kingdom'],
    });
    expect(result.ok).toBe(true);
    expect(axios.get).toHaveBeenCalledWith(
      'https://disease.sh/v3/covid-19/countries/United%20Kingdom',
    );
  });

  it('uses global /all endpoint when country is empty', async () => {
    axios.get.mockResolvedValue({
      data: {
        cases: 5,
        recovered: 4,
        deaths: 1,
        updated: 1609459200000,
      },
    });
    const result = await fetchData('');
    expect(result.ok).toBe(true);
    expect(axios.get).toHaveBeenCalledWith('https://disease.sh/v3/covid-19/all');
  });

  it('returns NETWORK failure on axios error without response', async () => {
    axios.get.mockRejectedValue(new Error('network down'));
    const result = await fetchData('');
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('NETWORK');
    expect(result.data).toBeUndefined();
  });
});
