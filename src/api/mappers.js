/**
 * Maps disease.sh (or compatible) provider payloads into the UI DTO
 * historically used by mathdroid: { confirmed, recovered, deaths, lastUpdate }.
 */

export function toIsoLastUpdate(updated) {
  if (updated == null || updated === '') return null;
  const d = typeof updated === 'number' ? new Date(updated) : new Date(String(updated));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/**
 * @param {object} raw - disease.sh /all or /countries/:name body
 * @returns {{ confirmed: { value: number }, recovered: { value: number|null }, deaths: { value: number }, lastUpdate: string|null }}
 */
export function mapSummaryMetrics(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const cases = Number(source.cases);
  const deaths = Number(source.deaths);
  const recoveredRaw = source.recovered;

  let recoveredValue = null;
  if (recoveredRaw !== null && recoveredRaw !== undefined) {
    const n = Number(recoveredRaw);
    recoveredValue = Number.isFinite(n) ? n : null;
  }

  return {
    confirmed: { value: Number.isFinite(cases) ? cases : 0 },
    recovered: { value: recoveredValue },
    deaths: { value: Number.isFinite(deaths) ? deaths : 0 },
    lastUpdate: toIsoLastUpdate(source.updated),
  };
}

/**
 * @param {Array<{ country?: string }>} list
 * @returns {string[]}
 */
export function mapCountries(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => (item && typeof item.country === 'string' ? item.country : null))
    .filter(Boolean);
}

/**
 * @param {{ cases?: object, deaths?: object, recovered?: object }} historical
 * @returns {Array<{ confirmed: number|null, recovered: number|null, deaths: number|null, date: string }>}
 */
export function mapTimeline(historical) {
  const cases = (historical && historical.cases) || {};
  const deaths = (historical && historical.deaths) || {};
  const recovered = (historical && historical.recovered) || {};
  const dates = Object.keys(cases).sort((a, b) => new Date(a) - new Date(b));

  return dates.map((date) => {
    const c = Number(cases[date]);
    const d = Number(deaths[date]);
    const r = recovered[date] == null ? null : Number(recovered[date]);
    return {
      confirmed: Number.isFinite(c) ? c : null,
      deaths: Number.isFinite(d) ? d : null,
      recovered: r != null && Number.isFinite(r) ? r : null,
      date,
    };
  });
}
