'use client';

import React from 'react';
import Map from './Map/Map';
import FlightLayers from './Map/FlightLayers';
import { useFlights } from '../hooks/useFlights';

export default function FlightTracker() {
  const flights = useFlights();

  return (
    <div className="w-full h-full">
      <Map>
        <FlightLayers flights={flights} />
      </Map>
    </div>
  );
}
