import { useState, useEffect } from 'react';

interface GeolocationState {
  location: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocation is not supported by this browser.',
        loading: false
      });
      return;
    }

    const successCallback = (position: GeolocationPosition) => {
      setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        error: null,
        loading: false
      });
    };

    const errorCallback = (error: GeolocationPositionError) => {
      setState({
        location: null,
        error: error.message,
        loading: false
      });
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    });
  }, []);

  return state;
};