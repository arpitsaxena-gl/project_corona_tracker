import React from 'react';

import { Cards, CountryPicker, Chart } from './components';
import { getTotals } from './services/covidService';
import { AsyncStatus } from './constants/asyncStatus';
import { asyncReducer, resultToAction } from './state/asyncMachine';
import styles from './App.module.css';

import image from './images/image.png';

/**
 * Stateful container. Intentionally kept as a class (design §VIII decision) to
 * minimize churn; it keeps a class-friendly async-state field (an AbortController
 * plus explicit {status, data, error}) rather than the useAsync hook. A caught
 * error is never assigned to render data — `status` drives the children.
 *
 * The abort/mounted-guard sequence stays here (class lifecycle), but the state
 * transitions are delegated to the shared ../state/asyncMachine reducer so this
 * container and the hook cannot drift apart.
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      status: AsyncStatus.IDLE,
      error: null,
      country: '',
    };
    this._controller = null;
  }

  componentDidMount() {
    this.loadTotals('');
  }

  componentWillUnmount() {
    if (this._controller) this._controller.abort();
  }

  loadTotals = async (country) => {
    // Supersede any in-flight request.
    if (this._controller) this._controller.abort();
    const controller = new AbortController();
    this._controller = controller;

    this.setState((prev) => asyncReducer(prev, { type: 'loading' }));

    const result = await getTotals(country || undefined, controller.signal);
    if (controller.signal.aborted) return;

    // Same state machine the hook uses: ok→success, ABORTED→reset(idle), else error.
    this.setState((prev) => asyncReducer(prev, resultToAction(result)));
  };

  handleCountryChange = (country) => {
    this.setState({ country });
    this.loadTotals(country);
  };

  handleRetry = () => {
    this.loadTotals(this.state.country);
  };

  render() {
    const { data, status, error, country } = this.state;

    return (
      <div className={styles.container}>
        <img className={styles.image} src={image} alt="COVID-19" />
        <Cards data={data} status={status} error={error} onRetry={this.handleRetry} />
        <CountryPicker handleCountryChange={this.handleCountryChange} />
        <Chart data={data} country={country} status={status} />
      </div>
    );
  }
}

export default App;
