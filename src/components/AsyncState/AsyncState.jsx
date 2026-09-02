import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Grid, Button } from '@material-ui/core';

import { AsyncStatus, ASYNC_STATUS_VALUES } from '../../constants/asyncStatus';

/**
 * One shared loading / error / empty branch for the status-driven views.
 *
 * Cards, Chart and (previously) CountryPicker each hand-rolled the same
 * "idle/loading → message, error → message (+ optional retry), empty → message,
 * else → content" ladder with slightly different wording and no shared recovery
 * affordance. This centralises that ladder so a change to "how we show loading
 * or offer retry" happens once. Callers pass their own copy and content.
 *
 * - `errorText` overrides the reviewer-facing error copy; when omitted the
 *   AppError's own message is shown (falling back to a generic line).
 * - `onRetry`, when provided, renders a Retry button in the error branch.
 */
const AsyncState = ({
  status,
  error,
  isEmpty,
  loadingText,
  emptyText,
  errorText,
  onRetry,
  variant,
  align,
  containerClassName,
  children,
}) => {
  if (status === AsyncStatus.IDLE || status === AsyncStatus.LOADING) {
    return (
      <Typography variant={variant} align={align}>
        {loadingText}
      </Typography>
    );
  }

  if (status === AsyncStatus.ERROR) {
    return (
      <div className={containerClassName}>
        <Typography variant={variant} color="error" align={align}>
          {errorText || (error && error.message) || 'Unable to load data.'}
        </Typography>
        {onRetry && (
          <Grid container justify="center">
            <Button variant="outlined" color="primary" onClick={onRetry}>
              Retry
            </Button>
          </Grid>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <Typography variant={variant} align={align}>
        {emptyText}
      </Typography>
    );
  }

  return children;
};

AsyncState.propTypes = {
  status: PropTypes.oneOf(ASYNC_STATUS_VALUES),
  error: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
  }),
  isEmpty: PropTypes.bool,
  loadingText: PropTypes.node,
  emptyText: PropTypes.node,
  errorText: PropTypes.node,
  onRetry: PropTypes.func,
  variant: PropTypes.string,
  align: PropTypes.string,
  containerClassName: PropTypes.string,
  children: PropTypes.node,
};

AsyncState.defaultProps = {
  status: AsyncStatus.IDLE,
  error: null,
  isEmpty: false,
  loadingText: 'Loading…',
  emptyText: 'No data available.',
  errorText: null,
  onRetry: null,
  variant: 'h6',
  align: 'center',
  containerClassName: undefined,
  children: null,
};

export default AsyncState;
