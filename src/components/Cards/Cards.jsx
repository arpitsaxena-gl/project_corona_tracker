import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Grid } from '@material-ui/core';
import CardComponent from './Card/Card';
import styles from './Cards.module.css';

const Info = ({ data: { confirmed, recovered, deaths, lastUpdate }, country, status }) => {
  if (status === 'error') {
    return null;
  }

  if (!confirmed) {
    return 'Loading...';
  }

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
          value={recovered && recovered.value}
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

Info.propTypes = {
  data: PropTypes.shape({
    confirmed: PropTypes.shape({ value: PropTypes.number }),
    recovered: PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]) }),
    deaths: PropTypes.shape({ value: PropTypes.number }),
    lastUpdate: PropTypes.string,
  }),
  country: PropTypes.string,
  status: PropTypes.string,
};

Info.defaultProps = {
  data: {},
  country: '',
  status: 'idle',
};

export default Info;
