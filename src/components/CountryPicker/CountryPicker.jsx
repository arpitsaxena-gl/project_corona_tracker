import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { NativeSelect, FormControl, Typography, Button } from '@material-ui/core';

import useAsync from '../../hooks/useAsync';
import { getCountries } from '../../services/covidService';
import { AsyncStatus } from '../../constants/asyncStatus';
import styles from './CountryPicker.module.css';

/**
 * Country selector. Fetches the list via the service + useAsync (aborts on
 * unmount). On error or an empty list the select is disabled with a visible
 * message; on error it now also offers a Retry, so the dropdown is never
 * silently broken and has a recovery path (closes P5, adds affordance).
 *
 * This view keeps the select permanently mounted (it is not one of N exclusive
 * branches), so it shares the async status constants rather than the exclusive
 * <AsyncState> ladder used by Cards/Chart.
 */
const Countries = ({ handleCountryChange }) => {
  const { status, data: countries, run, retry } = useAsync();

  useEffect(() => {
    run((signal) => getCountries(signal));
  }, [run]);

  const list = Array.isArray(countries) ? countries : [];
  const disabled = status !== AsyncStatus.SUCCESS || list.length === 0;

  return (
    <FormControl className={styles.formControl}>
      {status === AsyncStatus.ERROR && (
        <>
          <Typography variant="caption" color="error">
            Unable to load countries.
          </Typography>
          <Button size="small" color="primary" onClick={retry}>
            Retry
          </Button>
        </>
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
      {status === AsyncStatus.SUCCESS && list.length === 0 && (
        <Typography variant="caption">No countries available.</Typography>
      )}
    </FormControl>
  );
};

Countries.propTypes = {
  handleCountryChange: PropTypes.func.isRequired,
};

export default Countries;
