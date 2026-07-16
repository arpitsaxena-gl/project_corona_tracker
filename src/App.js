import React from 'react';
import { Button, Typography } from '@material-ui/core';

import { Cards, CountryPicker, Chart } from './components';
import { fetchSummary } from './api/';
import styles from './App.module.css';

import image from './images/image.png';

class App extends React.Component {
  state = {
    data: null,
    country: '',
    status: 'idle',
    errorMessage: null,
  };

  abortController = null;

  componentDidMount() {
    this.loadSummary('');
  }

  componentWillUnmount() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  loadSummary = async (country) => {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    this.setState({
      status: 'loading',
      errorMessage: null,
      country: country || '',
    });

    try {
      const data = await fetchSummary(country || undefined, signal);
      this.setState({
        data,
        status: 'success',
        errorMessage: null,
      });
    } catch (error) {
      if (error && (error.name === 'AbortError' || error.code === 'ERR_CANCELED')) {
        return;
      }
      // Never assign Error into data — clear metrics and surface banner.
      this.setState({
        data: null,
        status: 'error',
        errorMessage: (error && error.message) || 'Failed to load COVID data. Please try again.',
      });
    }
  };

  handleCountryChange = async (country) => {
    await this.loadSummary(country);
  };

  handleRetry = () => {
    this.loadSummary(this.state.country);
  };

  render() {
    const { data, country, status, errorMessage } = this.state;
    const chartData = data || {};

    return (
      <div className={styles.container}>
        <img className={styles.image} src={image} alt="COVID-19" />
        {status === 'error' && (
          <div className={styles.errorBanner} role="alert">
            <Typography color="error" gutterBottom>
              {errorMessage || 'Something went wrong loading metrics.'}
            </Typography>
            <Button variant="contained" color="primary" onClick={this.handleRetry}>
              Retry
            </Button>
          </div>
        )}
        <Cards data={data || {}} country={country} status={status} />
        <CountryPicker handleCountryChange={this.handleCountryChange} />
        <Chart data={chartData} country={country} />
      </div>
    );
  }
}

export default App;
