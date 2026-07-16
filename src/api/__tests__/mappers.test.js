import {
  mapCountries,
  mapSummaryMetrics,
  mapTimeline,
  toIsoLastUpdate,
} from '../mappers';
import { ApiError, fetchSummary, getApiBase } from '../index';
import axios from 'axios';

jest.mock('axios');

describe('mappers', () => {
  test('mapSummaryMetrics maps cases/deaths and allows null recovered', () => {
    const dto = mapSummaryMetrics({
      cases: 100,
      deaths: 5,
      recovered: null,
      updated: 1609459200000,
    });
    expect(dto.confirmed.value).toBe(100);
    expect(dto.deaths.value).toBe(5);
    expect(dto.recovered.value).toBeNull();
    expect(dto.lastUpdate).toBe(toIsoLastUpdate(1609459200000));
  });

  test('mapSummaryMetrics defaults missing cases/deaths to 0', () => {
    const dto = mapSummaryMetrics({});
    expect(dto.confirmed.value).toBe(0);
    expect(dto.deaths.value).toBe(0);
  });

  test('mapCountries extracts country names', () => {
    expect(mapCountries([{ country: 'India' }, { country: 'Brazil' }, {}])).toEqual([
      'India',
      'Brazil',
    ]);
  });

  test('mapTimeline sorts dates into daily points', () => {
    const points = mapTimeline({
      cases: { '1/2/20': 2, '1/1/20': 1 },
      deaths: { '1/1/20': 0, '1/2/20': 1 },
      recovered: { '1/1/20': 0, '1/2/20': 0 },
    });
    expect(points).toHaveLength(2);
    expect(points[0].date).toBe('1/1/20');
    expect(points[0].confirmed).toBe(1);
    expect(points[1].deaths).toBe(1);
  });
});

describe('api fetchSummary', () => {
  const originalEnv = process.env.REACT_APP_COVID_API_BASE;

  afterEach(() => {
    process.env.REACT_APP_COVID_API_BASE = originalEnv;
    jest.clearAllMocks();
  });

  test('getApiBase falls back to disease.sh', () => {
    delete process.env.REACT_APP_COVID_API_BASE;
    expect(getApiBase()).toBe('https://disease.sh');
  });

  test('fetchSummary uses global path and maps DTO', async () => {
    axios.get.mockResolvedValue({
      data: { cases: 10, deaths: 1, recovered: 2, updated: 1609459200000 },
    });
    const result = await fetchSummary();
    expect(axios.get).toHaveBeenCalledWith(
      'https://disease.sh/v3/covid-19/all',
      expect.objectContaining({ signal: undefined }),
    );
    expect(result.confirmed.value).toBe(10);
  });

  test('fetchSummary encodes country path', async () => {
    axios.get.mockResolvedValue({
      data: { cases: 1, deaths: 0, recovered: 0, updated: 1609459200000 },
    });
    await fetchSummary('United States');
    expect(axios.get.mock.calls[0][0]).toBe(
      'https://disease.sh/v3/covid-19/countries/United%20States',
    );
  });

  test('fetchSummary throws ApiError on HTTP failure (does not return error)', async () => {
    axios.get.mockRejectedValue({ response: { status: 500 }, message: 'boom' });
    await expect(fetchSummary()).rejects.toBeInstanceOf(ApiError);
  });

  test('fetchSummary rethrows abort without wrapping as ApiError', async () => {
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    axios.get.mockRejectedValue(abort);
    await expect(fetchSummary()).rejects.toMatchObject({ name: 'AbortError' });
  });
});
