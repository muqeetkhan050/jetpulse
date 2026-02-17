import { useEffect, useRef, useState } from 'react';
import { Flight } from './useFlights';

interface FlightTrail {
  icao24: string;
  path: [number, number, number][]; // [lon, lat, altitude]
}

export function useFlightTrails(flights: Flight[]) {
  const [trails, setTrails] = useState<FlightTrail[]>([]);
  const trailsRef = useRef<Map<string, FlightTrail>>(new Map());

  useEffect(() => {
    flights.forEach(flight => {
      const existing = trailsRef.current.get(flight.icao24);

      const pos: [number, number, number] = [
        flight.lon,
        flight.lat,
        flight.altitude || 0,
      ];

      if (existing) {
        // Add new position if moved
        const lastPos = existing.path[existing.path.length - 1];
        if (
          lastPos[0] !== pos[0] ||
          lastPos[1] !== pos[1] ||
          lastPos[2] !== pos[2]
        ) {
          existing.path.push(pos);
          // Limit path length to 50 for performance
          if (existing.path.length > 50) existing.path.shift();
        }
      } else {
        trailsRef.current.set(flight.icao24, { icao24: flight.icao24, path: [pos] });
      }
    });

    setTrails(Array.from(trailsRef.current.values()));
  }, [flights]);

  return trails;
}
