import { useState, useEffect } from 'react';
import { fetchData } from '../api';

const useCovid19Stats = (country) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      const result = await fetchData(country);
      if (cancelled) return;
      if (result === null) {
        setError('Failed to load statistics. Please try again later.');
      } else {
        setStats(result);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [country]);

  return { stats, loading, error };
};

export default useCovid19Stats;
