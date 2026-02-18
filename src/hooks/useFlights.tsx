

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export interface Flight {
  icao24: string;
  callsign: string;
  lat: number;
  lon: number;
  altitude: number;
  heading: number;
  velocity: number;
}

interface UseFlightsOptions {
  bbox?: string;        // e.g. '-34.2,150.8,-33.7,151.4'
  refreshInterval?: number; // ms, default 30000
}

export function useFlights(options: UseFlightsOptions = {}) {
  const { bbox, refreshInterval = 30000 } = options;

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useFlights] Fetching flights...');

      const res = await axios.get<Flight[] | { error: string }>('/api/flights', {
        params: bbox ? { bbox } : {},
      });

      if ('error' in res.data) {
        console.error('[useFlights] API error:', res.data.error);
        setError(res.data.error);
        return;
      }

      console.log(`[useFlights] Received ${res.data.length} flights`);
      setFlights(res.data);
    } catch (err: any) {
      console.error('[useFlights] Failed to fetch flights', err.message);
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
