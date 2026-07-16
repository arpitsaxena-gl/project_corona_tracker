import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import CardComponent from './Card/Card';
import styles from './Cards.module.css';

const hasMetrics = (data) =>
  data
  && data.confirmed
  && typeof data.confirmed.value === 'number'
  && data.recovered
  && typeof data.recovered.value === 'number'
  && data.deaths
  && typeof data.deaths.value === 'number';

const Info = ({ data, country = '', status = 'idle' }) => {
  if (status === 'loading' || !hasMetrics(data)) {
    return 'Loading...';
  }

  const { confirmed, recovered, deaths, lastUpdate } = data;
  const title = country || 'Global';

  return (
    <div className={styles.container}>
      <Typography gutterBottom variant="h4" component="h2">{title}</Typography>
      <Grid container spacing={3} justify="center">
        <CardComponent
          className={styles.infected}
          cardTitle="Infected"
          value={confirmed.value}
          lastUpdate={lastUpdate}
          cardSubtitle="Number of active cases from COVID-19."
        />
        <CardComponent
          className={styles.recovered}
          cardTitle="Recovered"
          value={recovered.value}
          lastUpdate={lastUpdate}
          cardSubtitle="Number of recoveries from COVID-19."
        />
        <CardComponent
          className={styles.deaths}
          cardTitle="Deaths"
          value={deaths.value}
          lastUpdate={lastUpdate}
          cardSubtitle="Number of deaths caused by COVID-19."
        />
      </Grid>
    </div>
  );
};

export default Info;
