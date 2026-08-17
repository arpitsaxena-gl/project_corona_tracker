import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchData } from './api';
import { Cards, Chart, CountryPicker } from './components';
import styles from './App.module.css';

const App = () => {
  const [data, setData] = useState(null);
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchData(country, controller.signal)
      .then((stats) => {
        setData(stats);
        setLoading(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [country]);

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  return (
    <div className={styles.container}>
      <Cards data={data} loading={loading} error={error} />
      <CountryPicker handleCountryChange={handleCountryChange} />
      <Chart data={data} country={country} />
    </div>
  );
};

export default App;
