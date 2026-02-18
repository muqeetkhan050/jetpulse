// 'use client';

// import React from 'react';
// import Map from './Map/Map';
// import FlightLayers from './Map/FlightLayers';
// import { useFlights } from '../hooks/useFlights';

// export default function FlightTracker() {
//   const { flights, loading, error } = useFlights();

//   return (
//     <div className="w-full h-full relative">
//       <Map>
//         <FlightLayers flights={flights} />
//       </Map>
      
//       <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg z-10 min-w-[250px]">
//         <h2 className="text-lg font-bold text-yellow-400">✈ Sydney Airport Tracker</h2>
//         <div className="mt-2 space-y-1 text-sm">
//           <p>Active Flights: <span className="text-green-400 font-bold">{flights.length}</span></p>
//           {flights.length === 0 && (
//             <p className="text-xs text-gray-400 mt-2">Waiting for real-time flight data...</p>
//           )}
//         </div>
//       </div>

//       <div className="absolute bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg z-10">
//         <h3 className="text-sm font-bold mb-2">Legend</h3>
//         <div className="space-y-2 text-xs">
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
//             <span>Ground / Low Altitude</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
//             <span>High Altitude</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import { useFlights } from '@/hooks/useFlights';
import Map from './Map/Map';
import FlightLayers from './Map/FlightLayers';
import { useFlightTrails } from '@/hooks/useFlightTrails';

// Tighter bbox around Sydney Airport
const SYDNEY_AIRPORT_BBOX = '-34.04,150.9,-33.88,151.3';

export default function FlightTracker() {
  const { flights, loading, error, refetch } = useFlights({
    bbox: SYDNEY_AIRPORT_BBOX,
    refreshInterval: 10000, // 10s for anonymous, 5s if authenticated
  });

  const trails = useFlightTrails(flights);

  console.log('[FlightTracker] Flights:', flights.length, 'Loading:', loading, 'Error:', error);

  return (
    <div className="relative w-full h-full">
      <Map>
        <FlightLayers flights={flights} trails={trails} />
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

      {/* Flight List */}
      {flights.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded z-50 max-h-64 overflow-auto">
          <h3 className="font-bold mb-2">Active Flights</h3>
          {flights.map(f => (
            <div key={f.icao24} className="text-xs mb-1">
              {f.callsign || 'Unknown'} | {f.altitude ? `${Math.round(f.altitude)}m` : 'GND'} | {Math.round(f.velocity)}m/s
            </div>
          ))}
        </div>
      )}
    </div>
  );
}