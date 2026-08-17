import React, { useState, useEffect } from 'react';
import { NativeSelect, FormControl } from '@material-ui/core';
import { fetchCountries } from '../../api';
import styles from './CountryPicker.module.css';

const CountryPicker = ({ handleCountryChange }) => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchCountries()
      .then((names) => setCountries(names))
      .catch((err) => console.error('Failed to load countries:', err.message));
  }, []);

  return (
    <FormControl className={styles.formControl}>
      <NativeSelect defaultValue="" onChange={handleCountryChange}>
        <option value="">Global</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </NativeSelect>
    </FormControl>
  );
};

export default CountryPicker;
