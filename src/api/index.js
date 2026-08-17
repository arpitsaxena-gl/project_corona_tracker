import axios from 'axios';

const covidApiUrl = process.env.REACT_APP_COVID_API_URL ?? 'https://covid19.mathdro.id';
const dailyApiUrl = process.env.REACT_APP_DAILY_API_URL ?? 'https://disease.sh';

export const fetchData = async (country, signal) => {
  const url = country
    ? `${covidApiUrl}/api/countries/${encodeURIComponent(country)}`
    : `${covidApiUrl}/api`;
  try {
    const { data } = await axios.get(url, { signal });
    return {
      confirmed: { value: data.confirmed.value },
      recovered: { value: data.recovered.value },
      deaths: { value: data.deaths.value },
      lastUpdate: data.lastUpdate,
    };
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    throw new Error(`Failed to fetch COVID stats: ${error.message}`);
  }
};

export const fetchDailyData = async (country, signal) => {
  const url = country
    ? `${dailyApiUrl}/v3/covid-19/historical/${encodeURIComponent(country)}?lastdays=all`
    : `${dailyApiUrl}/v3/covid-19/historical/all?lastdays=all`;
  try {
    const { data } = await axios.get(url, { signal });
    const timeline = country ? data.timeline : data;
    const { cases, deaths, recovered } = timeline;
    return Object.keys(cases).map((date) => ({
      date,
      confirmed: cases[date] ?? 0,
      deaths: deaths[date] ?? 0,
      recovered: recovered[date] ?? 0,
    }));
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    throw new Error(`Failed to fetch daily data: ${error.message}`);
  }
};

export const fetchCountries = async (signal) => {
  const url = `${covidApiUrl}/api/countries`;
  try {
    const { data } = await axios.get(url, { signal });
    return data.countries.map(({ name }) => name).sort();
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    throw new Error(`Failed to fetch countries: ${error.message}`);
  }
};
