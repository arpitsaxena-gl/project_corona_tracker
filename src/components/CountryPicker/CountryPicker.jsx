import React, { useState, useEffect } from 'react';
import { NativeSelect, FormControl } from '@material-ui/core';

import { fetchCountries } from '../../api';

import styles from './CountryPicker.module.css';

const Countries = ({ handleCountryChange, countries: countriesProp }) => {
  const [countries, setCountries] = useState(
    Array.isArray(countriesProp) ? countriesProp : [],
  );

  useEffect(() => {
    if (Array.isArray(countriesProp) && countriesProp.length) {
      setCountries(countriesProp);
      return undefined;
    }

    let cancelled = false;
    const fetchAPI = async () => {
      const result = await fetchCountries();
      if (!cancelled && result.ok) {
        setCountries(result.data);
      }
    };

    fetchAPI();
    return () => {
      cancelled = true;
    };
  }, [countriesProp]);

  return (
    <FormControl className={styles.formControl}>
      <NativeSelect defaultValue="" onChange={(e) => handleCountryChange(e.target.value)}>
        <option value="">Global</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </NativeSelect>
    </FormControl>
  );
};

export default Countries;
