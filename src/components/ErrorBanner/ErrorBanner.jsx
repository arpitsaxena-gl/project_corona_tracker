import React from 'react';
import { Button, Typography } from '@material-ui/core';

import styles from './ErrorBanner.module.css';

const ErrorBanner = ({ error, onRetry }) => {
  if (!error || !error.message) {
    return null;
  }

  return (
    <div className={styles.banner} role="alert">
      <Typography variant="body1" component="p" className={styles.message}>
        {error.message}
      </Typography>
      {typeof onRetry === 'function' ? (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={onRetry}
          className={styles.retry}
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
};

export default ErrorBanner;
