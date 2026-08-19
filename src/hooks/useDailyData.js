import { useState, useEffect } from 'react';
import { fetchDailyData } from '../api';

const useDailyData = () => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      const result = await fetchDailyData();
      if (cancelled) return;
      if (result === null) {
        setError('Failed to load historical data. Please try again later.');
      } else {
        setDailyData(result);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { dailyData, loading, error };
};

export default useDailyData;
