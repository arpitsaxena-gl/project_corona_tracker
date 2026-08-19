import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://disease.sh/v3/covid-19';

export const fetchData = async (country) => {
  const url = country
    ? `${BASE_URL}/countries/${encodeURIComponent(country)}`
    : `${BASE_URL}/all`;

  try {
    const { data } = await axios.get(url);
    return {
      confirmed: { value: data.cases },
      recovered: { value: data.recovered },
      deaths: { value: data.deaths },
      lastUpdate: new Date(data.updated).toISOString(),
    };
  } catch (error) {
    console.error('[api] fetchData failed:', error.message);
    return null;
  }
};

export const fetchDailyData = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/historical/all?lastdays=all`);
    const dates = Object.keys(data.cases);
    return dates.map((date) => ({
      confirmed: data.cases[date],
      recovered: data.recovered[date],
      deaths: data.deaths[date],
      date,
    }));
  } catch (error) {
    console.error('[api] fetchDailyData failed:', error.message);
    return null;
  }
};

export const fetchCountries = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/countries`);
    return data
      .map((c) => c.country)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('[api] fetchCountries failed:', error.message);
    return null;
  }
};
