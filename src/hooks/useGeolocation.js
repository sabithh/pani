import { useState } from 'react';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation is not supported by this browser.');
        setError(err.message);
        reject(err);
        return;
      }
      setLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          setLoading(false);
          setError(err.message);
          reject(err);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });

  return { getPosition, loading, error };
}
