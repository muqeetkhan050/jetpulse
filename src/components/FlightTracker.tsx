'use client';

import React from 'react';
import Map from './Map/Map';
import FlightLayers from './Map/FlightLayers';
import { useFlights } from '../hooks/useFlights';

export default function FlightTracker() {
  const { flights, loading, error } = useFlights();

  return (
    <div className="w-full h-full relative">
      <Map>
        <FlightLayers flights={flights} />
      </Map>
      
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg z-10 min-w-[250px]">
        <h2 className="text-lg font-bold text-yellow-400">✈ Sydney Airport Tracker</h2>
        <div className="mt-2 space-y-1 text-sm">
          <p>Active Flights: <span className="text-green-400 font-bold">{flights.length}</span></p>
          {flights.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">Waiting for real-time flight data...</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg z-10">
        <h3 className="text-sm font-bold mb-2">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
            <span>Ground / Low Altitude</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>High Altitude</span>
          </div>
        </div>
      </div>
    </div>
  );
}
