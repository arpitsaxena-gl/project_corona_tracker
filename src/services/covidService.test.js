import { getTotals, getCountries, getDailyData } from './covidService';
import { fetchData, fetchCountries, fetchDailyData } from '../api';
import { AppError, ErrorCode, ok, fail } from '../api/errors';

jest.mock('../api');

afterEach(() => jest.resetAllMocks());

describe('covidService.getTotals', () => {
  it('normalizes a successful raw payload through the adapter', async () => {
    fetchData.mockResolvedValue(ok({ confirmed: { value: 100 }, deaths: { value: 5 } }));
    const res = await getTotals('India');
    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ confirmed: 100, recovered: 0, deaths: 5, lastUpdate: null });
    expect(fetchData).toHaveBeenCalledWith('India', undefined);
  });

  it('short-circuits to fail without touching the adapter on a failed raw fetch', async () => {
    fetchData.mockResolvedValue(fail(new AppError(ErrorCode.NETWORK, 'down')));
    const res = await getTotals();
    expect(res.ok).toBe(false);
    expect(res.error.code).toBe(ErrorCode.NETWORK);
  });
});

describe('covidService.getCountries', () => {
  it('returns adapted Country[] on success', async () => {
    fetchCountries.mockResolvedValue(ok({ countries: [{ name: 'India' }, {}] }));
    const res = await getCountries();
    expect(res).toEqual(ok([{ name: 'India' }]));
  });

  it('propagates failure', async () => {
    fetchCountries.mockResolvedValue(fail(new AppError(ErrorCode.HTTP, '500')));
    const res = await getCountries();
    expect(res.ok).toBe(false);
  });
});

describe('covidService.getDailyData', () => {
  it('returns adapted DailyPoint[] on success', async () => {
    fetchDailyData.mockResolvedValue(ok([{ positive: 3, death: 1, dateChecked: '2026-08-03' }]));
    const res = await getDailyData();
    expect(res).toEqual(ok([{ date: '2026-08-03', confirmed: 3, deaths: 1, recovered: 0 }]));
  });

  it('propagates failure', async () => {
    fetchDailyData.mockResolvedValue(fail(new AppError(ErrorCode.UNKNOWN, 'x')));
    const res = await getDailyData();
    expect(res.ok).toBe(false);
  });
});
