import React from 'react';
import { NativeSelect, FormControl } from '@material-ui/core';
import styles from './CountryPicker.module.css';

const Countries = ({ handleCountryChange, countries }) => (
  <FormControl className={styles.formControl}>
    <NativeSelect defaultValue="" onChange={(e) => handleCountryChange(e.target.value)}>
      <option value="">Global</option>
      {Array.isArray(countries) &&
        countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
    </NativeSelect>
  </FormControl>
);

export default Countries;
