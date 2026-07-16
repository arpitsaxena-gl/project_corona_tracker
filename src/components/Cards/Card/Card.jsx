import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Grid } from '@material-ui/core';
import CountUp from 'react-countup';
import cx from 'classnames';

import styles from './Card.module.css';

const formatLastUpdate = (lastUpdate) => {
  if (lastUpdate == null || lastUpdate === '') return 'Unknown';
  const d = new Date(lastUpdate);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toDateString();
};

const CardComponent = ({ className, cardTitle, value, lastUpdate, cardSubtitle }) => {
  const isMissing = value === null || value === undefined;

  return (
    <Grid item xs={12} md={3} component={Card} className={cx(styles.card, className)}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {cardTitle}
        </Typography>
        <Typography variant="h5" component="h2">
          {isMissing ? (
            'N/A'
          ) : (
            <CountUp start={0} end={value} duration={2.75} separator="," />
          )}
        </Typography>
        <Typography color="textSecondary">
          {formatLastUpdate(lastUpdate)}
        </Typography>
        <Typography variant="body2" component="p">
          {cardSubtitle}
        </Typography>
      </CardContent>
    </Grid>
  );
};

CardComponent.propTypes = {
  className: PropTypes.string,
  cardTitle: PropTypes.string.isRequired,
  value: PropTypes.number,
  lastUpdate: PropTypes.string,
  cardSubtitle: PropTypes.string,
};

CardComponent.defaultProps = {
  className: '',
  value: undefined,
  lastUpdate: null,
  cardSubtitle: '',
};

export default CardComponent;
