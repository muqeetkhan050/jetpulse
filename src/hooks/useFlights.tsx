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
        const res = await axios.get('/api/flights');
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



// import { useEffect, useState } from 'react';
// import axios from 'axios';

// export interface Flight {
//   icao24: string;
//   callsign: string;
//   lat: number | null;
//   lon: number | null;
//   altitude: number | null;
//   heading: number | null;
//   velocity: number | null;
// }

// export function useFlights() {
//   const [flights, setFlights] = useState<Flight[]>([]);

//   useEffect(() => {
//     const fetchFlights = async () => {
//       try {
//         const res = await axios.get('/api/flights');

//         // Map OpenSky 2D array to Flight objects
//         const flightsData: Flight[] = res.data.map((state: any[]) => ({
//           icao24: state[0],
//           callsign: state[1]?.trim() || '',
//           lon: state[5],
//           lat: state[6],
//           altitude: state[7],
//           heading: state[10],
//           velocity: state[9],
//         }));

//         setFlights(flightsData);
//       } catch (err) {
//         console.error('Failed to fetch flights', err);
//       }
//     };

//     fetchFlights();
//     const interval = setInterval(fetchFlights, 30000); // refresh every 30s
//     return () => clearInterval(interval);
//   }, []);

//   return flights;
// }
