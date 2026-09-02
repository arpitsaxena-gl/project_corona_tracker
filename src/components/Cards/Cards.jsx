import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Grid, Button } from '@material-ui/core';

import CardComponent from './Card/Card';
import styles from './Cards.module.css';

/**
 * Renders the four explicit async states — loading / error / empty / ready.
 * A failed fetch shows a distinct error message with a working Retry, never a
 * permanent "Loading…" (closes analysis P1 UX). Values come from the adapter
 * DTO (guaranteed non-null numbers), so there is no unguarded `.value` (P2).
 */
const Info = ({ data, status, error, onRetry }) => {
  if (status === 'idle' || status === 'loading') {
    return (
      <Typography variant="h6" align="center">
        Loading…
      </Typography>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.container}>
        <Typography variant="h6" color="error" align="center">
          {(error && error.message) || 'Unable to load data.'}
        </Typography>
        <Grid container justify="center">
          <Button variant="outlined" color="primary" onClick={onRetry}>
            Retry
          </Button>
        </Grid>
      </div>
    );
  }

  if (!data) {
    return (
      <Typography variant="h6" align="center">
        No data available.
      </Typography>
    );
  }

  const { confirmed, recovered, deaths, lastUpdate } = data;

  return (
    <div className={styles.container}>
      <Typography gutterBottom variant="h4" component="h2">
        Global
      </Typography>
      <Grid container spacing={3} justify="center">
        <CardComponent
          className={styles.infected}
          cardTitle="Infected"
          value={confirmed}
          lastUpdate={lastUpdate}
          cardSubtitle="Number of active cases from COVID-19."
        />
        <CardComponent
          className={styles.recovered}
          cardTitle="Recovered"
          value={recovered}
          lastUpdate={lastUpdate}
          cardSubtitle="Number of recoveries from COVID-19."
        />
        <CardComponent
          className={styles.deaths}
          cardTitle="Deaths"
          value={deaths}
          lastUpdate={lastUpdate}
          cardSubtitle="Number of deaths caused by COVID-19."
        />
      </Grid>
    </div>
  );
};

Info.propTypes = {
  data: PropTypes.shape({
    confirmed: PropTypes.number,
    recovered: PropTypes.number,
    deaths: PropTypes.number,
    lastUpdate: PropTypes.number,
  }),
  status: PropTypes.oneOf(['idle', 'loading', 'success', 'error']),
  error: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
  }),
  onRetry: PropTypes.func,
};

Info.defaultProps = {
  data: null,
  status: 'idle',
  error: null,
  onRetry: () => {},
};

export default Info;
