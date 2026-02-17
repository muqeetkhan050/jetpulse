import { useEffect, useState } from 'react';
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

export function useFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        // Replace with your own API route or OpenSky credentials
        const res = await axios.get('/api/flights?bbox=-34.1, -33.5, 150.5, 151.5');
        setFlights(res.data);
      } catch (err) {
        console.error('Failed to fetch flights', err);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return flights;
}
