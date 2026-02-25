

// 'use client';
// import { useState } from 'react';
// import Map from '@/components/Map/Map';
// import FlightLayers from '@/components/Map/FlightLayers';
// import FlightInfoCard from '@/components/FlightInfoCard';
// import { useFlights } from '@/hooks/useFlights';
// import { useFlightTrails } from '@/hooks/useFlightTrails';
// import { Flight } from '@/hooks/useFlights';
// import Speed from '@/components/Speed';

// export default function Home() {
//   const { flights, loading, error } = useFlights();
//   const trails = useFlightTrails(flights);
//   const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

//   const handlePlaneClick = (flight: Flight) => {
//     setSelectedFlight(flight);
//   };

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           <p className="font-bold">Error loading flights</p>
//           <p className="text-sm">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-screen">
//       <Map>
//         <FlightLayers 
//           flights={flights} 
//           trails={trails}
//           onPlaneClick={handlePlaneClick}
//         />
//       </Map>

//       {/* Flight count indicator */}
//       <div className="absolute top-20 left-4 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-white/10 shadow-2xl z-40">
//         <div className="text-sm font-semibold text-white mb-3">
//           {loading ? 'Loading...' : `✈️ ${flights.length} flights tracked`}
//         </div>
//         <div className="text-xs text-gray-300 space-y-2">
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg"></div>
//             <span>Grounded / Low</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg"></div>
//             <span>Mid altitude</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
//             <span>High altitude</span>
//           </div>
//         </div>
//       </div>

//   {selectedFlight && (
//   <div className="absolute top-4 left-4 z-50">
//     <Speed flight={selectedFlight} />
//   </div>
// )}


//       {/* Flight Info Card */}
//       {selectedFlight && (
//         <FlightInfoCard
//           flight={selectedFlight}
//           onClose={() => setSelectedFlight(null)}
//         />
//       )}
//     </div>
//   );
// }


'use client';
import { useState } from 'react';
import Map from '@/components/Map/Map';
import FlightLayers from '@/components/Map/FlightLayers';
import FlightInfoCard from '@/components/FlightInfoCard';
import { useFlights } from '@/hooks/useFlights';
import { useFlightTrails } from '@/hooks/useFlightTrails';
import { Flight } from '@/hooks/useFlights';
import Speed from '@/components/Speed';

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
    <div  className="relative w-full h-screen">
      <Map>
        <FlightLayers 
          flights={flights} 
          trails={trails}
          onPlaneClick={handlePlaneClick}
          selectedFlight={selectedFlight}
        />
      </Map>

      {/* Flight count indicator */}
      <div className="absolute top-20 left-4 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-white/10 shadow-2xl z-40">
        <div className="text-sm font-semibold text-white mb-3">
          {loading ? 'Loading...' : `✈️ ${flights.length} flights tracked`}
        </div>
        <div className="text-xs text-gray-300 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
            <span>On Ground</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg"></div>
            <span>Low Altitude</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
            <span>High Altitude</span>
          </div>
        </div>
      </div>

      {/* Speed Component - Bottom Center */}
      {selectedFlight && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 hover:bg-black/50 transition-colors">
            <Speed flight={selectedFlight} />
            
            {/* Close button */}
            <button
              onClick={() => setSelectedFlight(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    
    </div>
  );
}