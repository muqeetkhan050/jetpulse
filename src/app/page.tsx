

// import FlightTracker from '../components/FlightTracker';

// export default function Home() {
//   return (
//     <main className="w-screen h-screen">
//       <FlightTracker />
//     </main>
//   );
// }


// src/app/page.tsx
'use client';
import { useState } from 'react';
import Map from '@/components/Map/Map';
import FlightLayers from '@/components/Map/FlightLayers';
import FlightInfoCard from '@/components/FlightInfoCard';
import { useFlights } from '@/hooks/useFlights';
import { useFlightTrails } from '@/hooks/useFlightTrails';
import { Flight } from '@/hooks/useFlights';

export default function Home() {
  const { flights, loading, error } = useFlights();
  const trails = useFlightTrails(flights);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const handlePlaneClick = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading flights</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <Map>
        <FlightLayers 
          flights={flights} 
          trails={trails}
          onPlaneClick={handlePlaneClick}
        />
      </Map>

      {/* Flight count indicator */}
      <div className="absolute top-20 left-4 bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg z-40">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {loading ? 'Loading...' : `${flights.length} flights tracked`}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Grounded / Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Mid altitude</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>High altitude</span>
          </div>
        </div>
      </div>

      {/* Flight Info Card */}
      {selectedFlight && (
        <FlightInfoCard
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  );
}