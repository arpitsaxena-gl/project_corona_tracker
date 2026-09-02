import { toTotals, toCountries, toDaily } from './adapter';

describe('adapter.toTotals', () => {
  it('maps a well-formed payload to numeric totals and epoch lastUpdate', () => {
    const out = toTotals({
      confirmed: { value: 100 },
      recovered: { value: 60 },
      deaths: { value: 5 },
      lastUpdate: '2026-09-01T10:00:00.000Z',
    });
    expect(out).toEqual({
      confirmed: 100,
      recovered: 60,
      deaths: 5,
      lastUpdate: Date.parse('2026-09-01T10:00:00.000Z'),
    });
  });

  it('defaults missing recovered/deaths to 0 instead of throwing', () => {
    const out = toTotals({ confirmed: { value: 100 } });
    expect(out).toEqual({ confirmed: 100, recovered: 0, deaths: 0, lastUpdate: null });
  });

  it('returns lastUpdate=null for a missing or malformed date', () => {
    expect(toTotals({}).lastUpdate).toBeNull();
    expect(toTotals({ lastUpdate: 'not-a-date' }).lastUpdate).toBeNull();
  });

  it('is safe on null/undefined input', () => {
    expect(toTotals(null)).toEqual({ confirmed: 0, recovered: 0, deaths: 0, lastUpdate: null });
    expect(toTotals(undefined)).toEqual({ confirmed: 0, recovered: 0, deaths: 0, lastUpdate: null });
  });
});

describe('adapter.toCountries', () => {
  it('extracts names and drops rows missing a name', () => {
    const out = toCountries({ countries: [{ name: 'India' }, {}, { name: '' }, { name: 'USA' }] });
    expect(out).toEqual([{ name: 'India' }, { name: 'USA' }]);
  });

  it('returns [] on missing/empty/invalid shape', () => {
    expect(toCountries(null)).toEqual([]);
    expect(toCountries({})).toEqual([]);
    expect(toCountries({ countries: 'nope' })).toEqual([]);
  });
});

describe('adapter.toDaily', () => {
  it('maps upstream aliases (positive->confirmed, death->deaths, dateChecked->date)', () => {
    const out = toDaily([{ positive: 10, death: 2, dateChecked: '2026-08-01' }]);
    expect(out).toEqual([{ date: '2026-08-01', confirmed: 10, deaths: 2, recovered: 0 }]);
  });

  it('accepts already-normalized field names', () => {
    const out = toDaily([{ confirmed: 7, deaths: 1, date: '2026-08-02' }]);
    expect(out).toEqual([{ date: '2026-08-02', confirmed: 7, deaths: 1, recovered: 0 }]);
  });

  it('preserves the recovered trend so the line chart keeps its third dataset', () => {
    const out = toDaily([{ positive: 10, death: 2, recovered: 5, dateChecked: '2026-08-01' }]);
    expect(out).toEqual([{ date: '2026-08-01', confirmed: 10, deaths: 2, recovered: 5 }]);
  });

  it('keeps a numeric epoch date as a number so `new Date(date)` stays valid', () => {
    const epoch = 1788353639741;
    const out = toDaily([{ date: epoch, positive: 1 }]);
    expect(out).toEqual([{ date: epoch, confirmed: 1, deaths: 0, recovered: 0 }]);
    expect(typeof out[0].date).toBe('number');
    // Guards the regression the review flagged: stringifying the epoch broke parsing.
    expect(Number.isNaN(new Date(out[0].date).getTime())).toBe(false);
  });

  it('accepts { data: [...] } wrappers and drops rows without a date', () => {
    const out = toDaily({ data: [{ positive: 3, dateChecked: '2026-08-03' }, { positive: 9 }] });
    expect(out).toEqual([{ date: '2026-08-03', confirmed: 3, deaths: 0, recovered: 0 }]);
  });

  it('returns [] for an empty/removed source', () => {
    expect(toDaily([])).toEqual([]);
    expect(toDaily(null)).toEqual([]);
    expect(toDaily({})).toEqual([]);
  });
});
