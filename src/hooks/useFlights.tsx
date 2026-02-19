


import { useEffect, useState, useCallback } from 'react';

export interface Flight {
  icao24: string;
  callsign: string;
  originCountry: string;
  lat: number;
  lon: number;
  altitude: number | null;
  onGround: boolean;
  velocity: number;
  heading: number;
  verticalRate: number | null;
  lastContact: number;
}

interface UseFlightsOptions {
  bbox?: string;
  refreshInterval?: number;
}

export function useFlights(options: UseFlightsOptions = {}) {
  const { bbox, refreshInterval = 10000 } = options;

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (bbox) params.set('bbox', bbox);
      
      const url = `/api/flights?${params.toString()}`;
      console.log('[useFlights] Fetching:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      
      console.log('[useFlights] Received:', data.length, 'flights');
      setFlights(data);
      setError(null);
    } catch (err: any) {
      console.error('[useFlights] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bbox]);

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchFlights, refreshInterval]);

  return { flights, loading, error, refetch: fetchFlights };
}