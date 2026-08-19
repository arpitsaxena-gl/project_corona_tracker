import { useState, useEffect } from 'react';
import { fetchCountries } from '../api';

const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      const result = await fetchCountries();
      if (cancelled) return;
      if (result === null) {
        setError('Failed to load countries. Please try again later.');
      } else {
        setCountries(result);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { countries, loading, error };
};

export default useCountries;
