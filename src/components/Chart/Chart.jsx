import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Line, Bar } from 'react-chartjs-2';

import { fetchTimeline } from '../../api';

import styles from './Chart.module.css';

const Chart = ({ data: { confirmed, recovered, deaths }, country }) => {
  const [dailyData, setDailyData] = useState([]);
  const [timelineError, setTimelineError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchMyAPI = async () => {
      if (country) {
        setDailyData([]);
        setTimelineError(null);
        return;
      }

      try {
        const initialDailyData = await fetchTimeline(controller.signal);
        if (!cancelled) {
          setDailyData(Array.isArray(initialDailyData) ? initialDailyData : []);
          setTimelineError(null);
        }
      } catch (error) {
        if (error && (error.name === 'AbortError' || error.code === 'ERR_CANCELED')) {
          return;
        }
        if (!cancelled) {
          setDailyData([]);
          setTimelineError((error && error.message) || 'Failed to load timeline');
        }
      }
    };

    fetchMyAPI();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [country]);

  const recoveredValue = recovered && recovered.value != null ? recovered.value : 0;

  const barChart = (
    confirmed ? (
      <Bar
        data={{
          labels: ['Infected', 'Recovered', 'Deaths'],
          datasets: [
            {
              label: 'People',
              backgroundColor: ['rgba(0, 0, 255, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)'],
              data: [confirmed.value, recoveredValue, deaths.value],
            },
          ],
        }}
        options={{
          legend: { display: false },
          title: { display: true, text: `Current state in ${country}` },
        }}
      />
    ) : null
  );

  const lineChart = dailyData.length > 0 ? (
    <Line
      data={{
        labels: dailyData.map(({ date }) => new Date(date).toLocaleDateString()),
        datasets: [{
          data: dailyData.map((point) => point.confirmed),
          label: 'Infected',
          borderColor: '#3333ff',
          fill: true,
        }, {
          data: dailyData.map((point) => point.deaths),
          label: 'Deaths',
          borderColor: 'red',
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          fill: true,
        }, {
          data: dailyData.map((point) => point.recovered),
          label: 'Recovered',
          borderColor: 'green',
          backgroundColor: 'rgba(0, 255, 0, 0.5)',
          fill: true,
        }],
      }}
    />
  ) : (
    <p>{timelineError || 'No timeline data'}</p>
  );

  return (
    <div className={styles.container}>
      {country ? barChart : lineChart}
    </div>
  );
};

Chart.propTypes = {
  data: PropTypes.shape({
    confirmed: PropTypes.shape({ value: PropTypes.number }),
    recovered: PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]) }),
    deaths: PropTypes.shape({ value: PropTypes.number }),
  }),
  country: PropTypes.string,
};

Chart.defaultProps = {
  data: {},
  country: '',
};

export default Chart;
