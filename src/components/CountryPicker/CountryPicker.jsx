import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { NativeSelect, FormControl, Typography } from '@material-ui/core';

import useAsync from '../../hooks/useAsync';
import { getCountries } from '../../services/covidService';
import styles from './CountryPicker.module.css';

/**
 * Country selector. Fetches the list via the service + useAsync (aborts on
 * unmount). On error or an empty list the select is disabled with a visible
 * message, so the dropdown is never silently broken (closes P5, adds affordance).
 */
const Countries = ({ handleCountryChange }) => {
  const { status, data: countries, run } = useAsync();

  useEffect(() => {
    run((signal) => getCountries(signal));
  }, [run]);

  const list = Array.isArray(countries) ? countries : [];
  const disabled = status !== 'success' || list.length === 0;

  return (
    <FormControl className={styles.formControl}>
      {status === 'error' && (
        <Typography variant="caption" color="error">
          Unable to load countries.
        </Typography>
      )}
      <NativeSelect
        defaultValue=""
        disabled={disabled}
        onChange={(e) => handleCountryChange(e.target.value)}
      >
        <option value="">United States</option>
        {list.map((country) => (
          <option key={country.name} value={country.name}>
            {country.name}
          </option>
        ))}
      </NativeSelect>
      {status === 'success' && list.length === 0 && (
        <Typography variant="caption">No countries available.</Typography>
      )}
    </FormControl>
  );
};

Countries.propTypes = {
  handleCountryChange: PropTypes.func.isRequired,
};

export default Countries;
