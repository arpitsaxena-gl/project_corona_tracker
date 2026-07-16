import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';

import { fetchDailyData } from '../../api';

import styles from './Chart.module.css';

const Chart = ({ data: { confirmed, recovered, deaths } = {}, country }) => {
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    const fetchMyAPI = async () => {
      const result = await fetchDailyData();
      if (result.ok && Array.isArray(result.data)) {
        setDailyData(result.data);
      } else {
        setDailyData([]);
      }
    };

    fetchMyAPI();
  }, []);

  const barChart = (
    confirmed ? (
      <Bar
        data={{
          labels: ['Infected', 'Recovered', 'Deaths'],
          datasets: [
            {
              label: 'People',
              backgroundColor: ['rgba(0, 0, 255, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(255, 0, 0, 0.5)'],
              data: [confirmed.value, recovered.value, deaths.value],
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

  const hasDailySeries = Array.isArray(dailyData) && dailyData.length > 0 && dailyData[0];

  const lineChart = (
    hasDailySeries ? (
      <>
        <p className={styles.subtitle}>
          US historical daily (archive) — line series uses COVID Tracking Project US daily data.
        </p>
        <Line
          data={{
            labels: dailyData.map(({ date }) => new Date(date).toLocaleDateString()),
            datasets: [{
              data: dailyData.map((point) => (point.confirmed == null ? 0 : point.confirmed)),
              label: 'Infected',
              borderColor: '#3333ff',
              fill: true,
            }, {
              data: dailyData.map((point) => (point.deaths == null ? 0 : point.deaths)),
              label: 'Deaths',
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.5)',
              fill: true,
            }, {
              data: dailyData.map((point) => (point.recovered == null ? 0 : point.recovered)),
              label: 'Recovered',
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.5)',
              fill: true,
            }],
          }}
        />
      </>
    ) : null
  );

  return (
    <div className={styles.container}>
      {country ? barChart : lineChart}
    </div>
  );
};

export default Chart;
