import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Line, Bar } from 'react-chartjs-2';

import useAsync from '../../hooks/useAsync';
import { getDailyData } from '../../services/covidService';
import AsyncState from '../AsyncState/AsyncState';
import { AsyncStatus, ASYNC_STATUS_VALUES } from '../../constants/asyncStatus';
import styles from './Chart.module.css';

/**
 * Per-country bar chart (from `data`) and global daily line chart (self-fetched
 * via the service + useAsync). The daily fetch aborts on unmount and renders an
 * explicit empty/error state (with Retry) instead of a perpetual blank (closes
 * P3, P5). All numeric reads come from the adapter DTO (no unguarded `.value`,
 * P2). The line chart keeps its Infected / Recovered / Deaths datasets.
 */
const Chart = ({ data, country, status }) => {
  const { status: dailyStatus, data: dailyData, run, retry } = useAsync();

  useEffect(() => {
    run((signal) => getDailyData(signal));
  }, [run]);

  const hasTotals = status === AsyncStatus.SUCCESS && data;

  const barChart = hasTotals ? (
    <Bar
      data={{
        labels: ['Infected', 'Recovered', 'Deaths'],
        datasets: [
          {
            label: 'People',
            backgroundColor: [
              'rgba(0, 0, 255, 0.5)',
              'rgba(0, 255, 0, 0.5)',
              'rgba(255, 0, 0, 0.5)',
            ],
            data: [data.confirmed, data.recovered, data.deaths],
          },
        ],
      }}
      options={{
        legend: { display: false },
        title: { display: true, text: `Current state in ${country}` },
      }}
    />
  ) : null;

  const hasDailyRows = Array.isArray(dailyData) && dailyData.length > 0;

  const lineChart = (
    <AsyncState
      status={dailyStatus}
      isEmpty={!hasDailyRows}
      onRetry={retry}
      loadingText="Loading daily data…"
      errorText="Daily data is currently unavailable."
      emptyText="No daily data available."
      variant="body1"
      align="center"
    >
      {hasDailyRows && (
        <Line
          data={{
            labels: dailyData.map(({ date }) => new Date(date).toLocaleDateString()),
            datasets: [
              {
                data: dailyData.map((point) => point.confirmed),
                label: 'Infected',
                borderColor: '#3333ff',
                fill: true,
              },
              {
                data: dailyData.map((point) => point.recovered),
                label: 'Recovered',
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                fill: true,
              },
              {
                data: dailyData.map((point) => point.deaths),
                label: 'Deaths',
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                fill: true,
              },
            ],
          }}
        />
      )}
    </AsyncState>
  );

  return <div className={styles.container}>{country ? barChart : lineChart}</div>;
};

Chart.propTypes = {
  data: PropTypes.shape({
    confirmed: PropTypes.number,
    recovered: PropTypes.number,
    deaths: PropTypes.number,
  }),
  country: PropTypes.string,
  status: PropTypes.oneOf(ASYNC_STATUS_VALUES),
};

Chart.defaultProps = {
  data: null,
  country: '',
  status: 'idle',
};

export default Chart;
