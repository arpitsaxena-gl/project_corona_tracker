import React, { useState, useEffect } from 'react';
import { NativeSelect, FormControl } from '@material-ui/core';

import { fetchCountries } from '../../api';

import styles from './CountryPicker.module.css';

const Countries = ({ handleCountryChange }) => {
  const [countries, setCountries] = useState([]);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const fetchAPI = async () => {
      const result = await fetchCountries();

      if (result) {
        setCountries(result);
        setLoadError(null);
      } else {
        setCountries([]);
        setLoadError('Unable to load country list.');
      }
    };

    fetchAPI();
  }, []);

  return (
    <FormControl className={styles.formControl}>
      {loadError && <p role="alert">{loadError}</p>}
      <NativeSelect defaultValue="" onChange={(e) => handleCountryChange(e.target.value)}>
        <option value="">Global</option>
        <option value="US">United States</option>
        {countries.map((country) => (
          <option key={country.iso2} value={country.iso2}>
            {country.name}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  );
};

export default Countries;
