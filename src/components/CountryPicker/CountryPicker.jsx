import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NativeSelect, FormControl, InputLabel } from '@material-ui/core';

import { fetchCountries } from '../../api';

import styles from './CountryPicker.module.css';

const Countries = ({ handleCountryChange }) => {
  const [countries, setCountries] = useState([]);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const list = await fetchCountries();
        setCountries(Array.isArray(list) ? list : []);
        setLoadError(null);
      } catch (error) {
        setCountries([]);
        setLoadError((error && error.message) || 'Failed to load countries');
      }
    };

    fetchAPI();
  }, []);

  const disabled = countries.length === 0;

  return (
    <FormControl className={styles.formControl}>
      <InputLabel shrink htmlFor="country-native-select" id="country-select-label">
        Country
      </InputLabel>
      <NativeSelect
        defaultValue=""
        inputProps={{
          name: 'country',
          id: 'country-native-select',
          'aria-labelledby': 'country-select-label',
        }}
        disabled={disabled}
        onChange={(e) => handleCountryChange(e.target.value)}
      >
        <option value="">Global</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </NativeSelect>
      {loadError && <p role="status">{loadError}</p>}
      {!loadError && disabled && <p role="status">Loading countries…</p>}
    </FormControl>
  );
};

Countries.propTypes = {
  handleCountryChange: PropTypes.func.isRequired,
};

export default Countries;
