import React from 'react';
import { CircularProgress, Typography } from '@material-ui/core';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Loading COVID-19 data...' }) => (
  <div className={styles.container}>
    <CircularProgress size={60} />
    <Typography variant="h6" className={styles.message}>{message}</Typography>
  </div>
);

export default LoadingSpinner;
