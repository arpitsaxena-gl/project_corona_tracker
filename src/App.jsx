import React, { useState } from 'react';
import { Typography } from '@material-ui/core';

import { Cards, CountryPicker, Chart } from './components';
import useCovid19Stats from './hooks/useCovid19Stats';
import useCountries from './hooks/useCountries';
import useDailyData from './hooks/useDailyData';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import styles from './App.module.css';
import image from './images/image.png';

const App = () => {
  const [country, setCountry] = useState('');

  const { stats, loading: statsLoading, error: statsError } = useCovid19Stats(country);
  const { countries, loading: countriesLoading, error: countriesError } = useCountries();
  const { dailyData, loading: dailyLoading, error: dailyError } = useDailyData();

  const isLoading = statsLoading || countriesLoading || dailyLoading;
  const errorMessage = statsError || countriesError || dailyError;

  return (
    <div className={styles.container}>
      <img className={styles.image} src={image} alt="COVID-19" />
      {isLoading && <LoadingSpinner />}
      {!isLoading && errorMessage && (
        <Typography color="error" variant="h6" style={{ margin: '20px 0' }}>
          {errorMessage}
        </Typography>
      )}
      {!isLoading && !errorMessage && (
        <>
          <Cards data={stats} country={country} />
          <CountryPicker handleCountryChange={setCountry} countries={countries} />
          <Chart data={stats} country={country} dailyData={dailyData} />
        </>
      )}
    </div>
  );
};

export default App;
