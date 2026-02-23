'use client';

import { useState } from 'react';
import { useFlights, type Flight } from '@/hooks/useFlights';
import Map from './Map/Map';
import FlightLayers from './Map/FlightLayers';
import { useFlightTrails } from '@/hooks/useFlightTrails';
import AgentModal from './AgentModal';

const SYDNEY_AIRPORT_BBOX = '-34.04,150.9,-33.88,151.3';

export default function FlightTracker() {
  const { flights, loading, error, refetch } = useFlights({
    bbox: SYDNEY_AIRPORT_BBOX,
    refreshInterval: 10000,
  });

  const trails = useFlightTrails(flights);
  
  const [selectedPlane, setSelectedPlane] = useState<{
    icao24: string;
    callsign?: string;
    altitude?: number;
    originCountry?: string;
  } | null>(null);
  
  const [showModal, setShowModal] = useState(false);

  const handlePlaneClick = (flight: Flight) => {
    setSelectedPlane({
      icao24: flight.icao24,
      callsign: flight.callsign,
      altitude: flight.altitude ?? undefined,
      originCountry: flight.originCountry,
    });
    setShowModal(true);
  };

  return (
    <div className="relative w-full h-full">
      <Map>
        <FlightLayers 
          flights={flights} 
          trails={trails} 
          onPlaneClick={handlePlaneClick}
        />
      </Map>
      
      {/* Debug Overlay */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded z-50 font-mono text-sm">
        <div>Status: {loading ? '🔄 Loading...' : '✅ Active'}</div>
        <div>Flights: {flights.length}</div>
        <div>Trails: {trails.length}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
        <button 
          onClick={refetch}
          className="mt-2 px-2 py-1 bg-blue-600 rounded hover:bg-blue-500"
        >
          Refresh
        </button>
      </div>

      {/* Flight List with click handler */}
      {flights.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded z-50 max-h-64 overflow-auto">
          <h3 className="font-bold mb-2">Active Flights (click to add agent)</h3>
          {flights.map(f => (
            <button
              key={f.icao24}
              onClick={() => handlePlaneClick(f)}
              className="w-full text-left text-xs mb-1 hover:text-blue-400 transition-colors"
            >
              {f.callsign || 'Unknown'} | {f.altitude ? `${Math.round(f.altitude)}m` : 'GND'} | {Math.round(f.velocity)}m/s
            </button>
          ))}
        </div>
      )}

      {/* Agent Modal */}
      <AgentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        planeId={selectedPlane?.icao24 || ''}
        planeInfo={selectedPlane ? {
          callsign: selectedPlane.callsign,
          altitude: selectedPlane.altitude,
          originCountry: selectedPlane.originCountry,
        } : undefined}
      />
    </div>
  );
}
