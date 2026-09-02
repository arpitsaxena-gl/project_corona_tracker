import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Grid } from '@material-ui/core';
import CountUp from 'react-countup';
import cx from 'classnames';

import styles from './Card.module.css';

const CardComponent = ({ className, cardTitle, value, lastUpdate, cardSubtitle }) => {
  const safeValue = Number(value) || 0; // never NaN into CountUp

  return (
    <Grid item xs={12} md={3} component={Card} className={cx(styles.card, className)}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {cardTitle}
        </Typography>
        <Typography variant="h5" component="h2">
          <CountUp start={0} end={safeValue} duration={2.75} separator="," />
        </Typography>
        {lastUpdate != null && (
          <Typography color="textSecondary">
            {new Date(lastUpdate).toDateString()}
          </Typography>
        )}
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
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  lastUpdate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cardSubtitle: PropTypes.string.isRequired,
};

CardComponent.defaultProps = {
  className: undefined,
  lastUpdate: null,
};

export default CardComponent;
