

'use client';
import { useEffect, useRef, useState } from 'react';
import { Flight } from './useFlights';

export interface FlightTrail {
  icao24: string;
  path: [number, number, number][];
  isTakingOff?: boolean;
  glowUntil?: number;
}

const TAKEOFF_ALTITUDE = 100; 
const MAX_TRAIL_POINTS = 100; 

export function useFlightTrails(flights: Flight[]) {
  const [trails, setTrails] = useState<FlightTrail[]>([]);
  const trailsRef = useRef<Map<string, FlightTrail>>(new Map());
  const flightStatusRef = useRef<Map<string, boolean>>(new Map()); // Track if flight is in air

  useEffect(() => {
    const now = Date.now();
    const activePlaneIds = new Set<string>();

    flights.forEach(flight => {
      const altitude = flight.altitude || 0;
      const isFlying = altitude > TAKEOFF_ALTITUDE && !flight.onGround;

      activePlaneIds.add(flight.icao24);

      // Get previous flying status
      const wasFlying = flightStatusRef.current.get(flight.icao24) ?? false;
      flightStatusRef.current.set(flight.icao24, isFlying);

      const pos: [number, number, number] = [
        flight.lon,
        flight.lat,
        altitude,
      ];

      const existing = trailsRef.current.get(flight.icao24);

      if (isFlying) {
        // Plane is in the air - track it
        if (existing) {
          const lastPoint = existing.path[existing.path.length - 1];

          // Check if this is a new point (position changed)
          if (
            lastPoint[0] !== pos[0] ||
            lastPoint[1] !== pos[1] ||
            lastPoint[2] !== pos[2]
          ) {
            existing.path.push(pos);
            
            // Keep trail length manageable
            if (existing.path.length > MAX_TRAIL_POINTS) {
              existing.path.shift();
            }
          }

          // Detect takeoff event (transition from ground to air)
          if (!wasFlying && isFlying) {
            existing.isTakingOff = true;
            existing.glowUntil = now + 3000;
          }
        } else {
          // New flying plane - create trail
          trailsRef.current.set(flight.icao24, {
            icao24: flight.icao24,
            path: [pos],
            isTakingOff: true,
            glowUntil: now + 3000,
          });
        }
      } else {
        // Plane is on ground - delete its trail
        if (existing && wasFlying) {
          // Plane just landed, remove trail
          trailsRef.current.delete(flight.icao24);
        } else if (!existing && !wasFlying) {
          // Plane was never tracked (grounded the whole time), do nothing
        }
      }
    });

    // Remove trails for planes that are no longer in our active flights list
    for (const [planeId] of trailsRef.current) {
      if (!activePlaneIds.has(planeId)) {
        trailsRef.current.delete(planeId);
        flightStatusRef.current.delete(planeId);
      }
    }

    setTrails(Array.from(trailsRef.current.values()));
  }, [flights]);

  return trails;
}