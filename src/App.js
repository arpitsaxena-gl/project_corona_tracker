import React from 'react';

import { Cards, CountryPicker, Chart, ErrorBanner } from './components';
import { fetchData, fetchCountries } from './api/';
import styles from './App.module.css';

import image from './images/image.png';

class App extends React.Component {
  state = {
    data: null,
    country: '',
    countries: [],
    status: 'idle',
    error: null,
  }

  componentDidMount() {
    this.loadInitial();
  }

  loadInitial = async () => {
    this.setState({ status: 'loading', error: null });

    const countriesResult = await fetchCountries();
    const allowedCountries = countriesResult.ok ? countriesResult.data : [];
    if (countriesResult.ok) {
      this.setState({ countries: allowedCountries });
    }

    const statsResult = await fetchData('', { allowedCountries });
    if (statsResult.ok) {
      this.setState({
        data: statsResult.data,
        status: 'success',
        error: null,
      });
      return;
    }

    this.setState({
      status: 'error',
      error: statsResult.error,
    });
  }

  loadStats = async (country = this.state.country) => {
    this.setState({ status: 'loading', error: null });
    const result = await fetchData(country, {
      allowedCountries: this.state.countries,
    });

    if (result.ok) {
      this.setState({
        data: result.data,
        country,
        status: 'success',
        error: null,
      });
      return;
    }

    this.setState({
      status: 'error',
      error: result.error,
      country,
    });
  }

  handleCountryChange = async (country) => {
    await this.loadStats(country || '');
  }

  handleRetry = async () => {
    if (!this.state.countries.length) {
      await this.loadInitial();
      return;
    }
    await this.loadStats(this.state.country);
  }

  render() {
    const { data, country, countries, status, error } = this.state;

    return (
      <div className={styles.container}>
        <img className={styles.image} src={image} alt="COVID-19" />
        <ErrorBanner error={error} onRetry={this.handleRetry} />
        <Cards data={data} country={country} status={status} />
        <CountryPicker
          handleCountryChange={this.handleCountryChange}
          countries={countries}
        />
        <Chart data={data || {}} country={country} />
      </div>
    );
  }
}

export default App;
