import React from 'react';

import { Cards, CountryPicker, Chart } from './components';
import { fetchData } from './api/';
import styles from './App.module.css';

import image from './images/image.png';

class App extends React.Component {
  state = {
    data: {},
    country: '',
    error: null,
    loading: true,
  }

  async componentDidMount() {
    const data = await fetchData();

    if (data) {
      this.setState({ data, loading: false, error: null });
    } else {
      this.setState({
        data: {},
        loading: false,
        error: 'Unable to load COVID-19 statistics. Please try again later.',
      });
    }
  }

  handleCountryChange = async (country) => {
    this.setState({ loading: true, error: null, country });

    const data = await fetchData(country || undefined);

    if (data) {
      this.setState({ data, country, loading: false, error: null });
    } else {
      this.setState({
        data: {},
        country,
        loading: false,
        error: country
          ? 'Unable to load statistics for the selected country.'
          : 'Unable to load global COVID-19 statistics.',
      });
    }
  }

  render() {
    const { data, country, error, loading } = this.state;

    return (
      <div className={styles.container}>
        <img className={styles.image} src={image} alt="COVID-19" />
        {error && <p role="alert">{error}</p>}
        {loading ? <p>Loading...</p> : <Cards data={data} />}
        <CountryPicker handleCountryChange={this.handleCountryChange} />
        <Chart data={data} country={country} />
      </div>
    );
  }
}

export default App;
