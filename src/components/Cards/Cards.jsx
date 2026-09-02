import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Grid } from '@material-ui/core';

import CardComponent from './Card/Card';
import AsyncState from '../AsyncState/AsyncState';
import { ASYNC_STATUS_VALUES } from '../../constants/asyncStatus';
import styles from './Cards.module.css';

/**
 * Renders the four explicit async states — loading / error / empty / ready —
 * through the shared <AsyncState> ladder. A failed fetch shows a distinct error
 * message with a working Retry, never a permanent "Loading…" (closes analysis
 * P1 UX). Values come from the adapter DTO (guaranteed non-null numbers), so
 * there is no unguarded `.value` (P2).
 */
const Info = ({ data, status, error, onRetry }) => (
  <AsyncState
    status={status}
    error={error}
    onRetry={onRetry}
    isEmpty={!data}
    loadingText="Loading…"
    emptyText="No data available."
    variant="h6"
    align="center"
    containerClassName={styles.container}
  >
    <div className={styles.container}>
      <Typography gutterBottom variant="h4" component="h2">
        Global
      </Typography>
      <Grid container spacing={3} justify="center">
        <CardComponent
          className={styles.infected}
          cardTitle="Infected"
          value={data ? data.confirmed : 0}
          lastUpdate={data ? data.lastUpdate : null}
          cardSubtitle="Number of active cases from COVID-19."
        />
        <CardComponent
          className={styles.recovered}
          cardTitle="Recovered"
          value={data ? data.recovered : 0}
          lastUpdate={data ? data.lastUpdate : null}
          cardSubtitle="Number of recoveries from COVID-19."
        />
        <CardComponent
          className={styles.deaths}
          cardTitle="Deaths"
          value={data ? data.deaths : 0}
          lastUpdate={data ? data.lastUpdate : null}
          cardSubtitle="Number of deaths caused by COVID-19."
        />
      </Grid>
    </div>
  </AsyncState>
);

Info.propTypes = {
  data: PropTypes.shape({
    confirmed: PropTypes.number,
    recovered: PropTypes.number,
    deaths: PropTypes.number,
    lastUpdate: PropTypes.number,
  }),
  status: PropTypes.oneOf(ASYNC_STATUS_VALUES),
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
