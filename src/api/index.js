import axios from 'axios';

const url = 'https://disease.sh/v3/covid-19';

const mapStats = ({ cases, recovered, deaths, updated }) => ({
  confirmed: { value: cases ?? 0 },
  recovered: { value: recovered ?? 0 },
  deaths: { value: deaths ?? 0 },
  lastUpdate: updated ? new Date(updated).toISOString() : null,
});

export const fetchData = async (country) => {
  const endpoint = country
    ? `${url}/countries/${encodeURIComponent(country)}`
    : `${url}/all`;

  try {
    const { data } = await axios.get(endpoint);
    return mapStats(data);
  } catch (error) {
    console.error('fetchData failed:', error);
    return null;
  }
};

export const fetchDailyData = async (country = 'US') => {
  const code = country || 'US';

  try {
    const { data } = await axios.get(`${url}/historical/${encodeURIComponent(code)}?lastdays=30`);
    const timeline = data?.timeline;

    if (!timeline?.cases) {
      return null;
    }

    return Object.keys(timeline.cases).map((date) => ({
      date,
      confirmed: timeline.cases[date],
      deaths: timeline.deaths[date],
      recovered: timeline.recovered[date],
    }));
  } catch (error) {
    console.error('fetchDailyData failed:', error);
    return null;
  }
};

export const fetchCountries = async () => {
  try {
    const { data } = await axios.get(`${url}/countries`);

    return data
      .map(({ country, countryInfo }) => ({
        name: country,
        iso2: countryInfo?.iso2 || '',
      }))
      .filter((entry) => entry.iso2);
  } catch (error) {
    console.error('fetchCountries failed:', error);
    return null;
  }
};
