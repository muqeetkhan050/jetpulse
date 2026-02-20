

import { useEffect, useRef, useState } from 'react';
import { Flight } from './useFlights';

export interface FlightTrail {
  icao24: string;
  path: [number, number, number][];
  isTakingOff?: boolean;
  glowUntil?: number;
}

const TAKEOFF_ALTITUDE = 30; // meters

export function useFlightTrails(flights: Flight[]) {
  const [trails, setTrails] = useState<FlightTrail[]>([]);
  const trailsRef = useRef<Map<string, FlightTrail>>(new Map());

  useEffect(() => {
    const now = Date.now();

    flights.forEach(flight => {
      const altitude = flight.altitude || 0;

      const pos: [number, number, number] = [
        flight.lon,
        flight.lat,
        altitude,
      ];

      const existing = trailsRef.current.get(flight.icao24);

      if (existing) {
        const lastPoint = existing.path[existing.path.length - 1];
        const previousAltitude = lastPoint[2];

        // Detect takeoff event
        if (
          previousAltitude <= TAKEOFF_ALTITUDE &&
          altitude > TAKEOFF_ALTITUDE
        ) {
          existing.isTakingOff = true;
          existing.glowUntil = now + 3000; // glow 3 seconds
        }

        if (
          lastPoint[0] !== pos[0] ||
          lastPoint[1] !== pos[1] ||
          lastPoint[2] !== pos[2]
        ) {
          existing.path.push(pos);
          if (existing.path.length > 50) existing.path.shift();
        }

      } else {
        trailsRef.current.set(flight.icao24, {
          icao24: flight.icao24,
          path: [pos],
        });
      }
    });

    setTrails(Array.from(trailsRef.current.values()));
  }, [flights]);

  return trails;
}
