import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { CircularProgress, Typography } from '@material-ui/core';
import { fetchDailyData } from '../../api';
import styles from './Chart.module.css';

const Chart = ({ country }) => {
  const [dailyData, setDailyData] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setDailyLoading(true);
    setDailyError(null);

    fetchDailyData(country, controller.signal)
      .then((records) => {
        setDailyData(records);
        setDailyLoading(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setDailyError(err.message);
          setDailyLoading(false);
        }
      });

    return () => controller.abort();
  }, [country]);

  if (dailyLoading) {
    return (
      <div className={styles.container}>
        <CircularProgress />
      </div>
    );
  }

  if (dailyError) {
    return (
      <div className={styles.container}>
        <Typography color="error">{dailyError}</Typography>
      </div>
    );
  }

  if (!dailyData.length) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Line
        data={{
          labels: dailyData.map(({ date }) => date),
          datasets: [
            {
              data: dailyData.map(({ confirmed }) => confirmed),
              label: 'Infected',
              borderColor: '#3333ff',
              fill: true,
            },
            {
              data: dailyData.map(({ deaths }) => deaths),
              label: 'Deaths',
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.5)',
              fill: true,
            },
            {
              data: dailyData.map(({ recovered }) => recovered),
              label: 'Recovered',
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.5)',
              fill: true,
            },
          ],
        }}
      />
    </div>
  );
};

export default Chart;
