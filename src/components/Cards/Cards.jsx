import React from 'react';
import { Grid, CircularProgress, Typography } from '@material-ui/core';
import Card from './Card/Card';
import styles from './Cards.module.css';

const Cards = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Grid container justify="center" className={styles.container}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container justify="center" className={styles.container}>
        <Typography color="error">{error}</Typography>
      </Grid>
    );
  }

  if (!data || !data.confirmed) {
    return null;
  }

  const { confirmed, recovered, deaths, lastUpdate } = data;

  return (
    <Grid container spacing={3} justify="center">
      <Card
        className={styles.infected}
        cardTitle="Infected"
        value={confirmed.value}
        lastUpdate={lastUpdate}
        cardSubtitle="Number of active cases of COVID-19"
      />
      <Card
        className={styles.recovered}
        cardTitle="Recovered"
        value={recovered.value}
        lastUpdate={lastUpdate}
        cardSubtitle="Number of recoveries from COVID-19"
      />
      <Card
        className={styles.deaths}
        cardTitle="Deaths"
        value={deaths.value}
        lastUpdate={lastUpdate}
        cardSubtitle="Number of deaths caused by COVID-19"
      />
    </Grid>
  );
};

export default Cards;
