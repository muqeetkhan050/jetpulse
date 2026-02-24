

'use client'
import { Flight } from '@/hooks/useFlights';

interface SpeedProps {
  flight?: Flight | null;
}

export default function Speed({ flight }: SpeedProps) {
  // Handle undefined or null flight data
  if (!flight || flight === null || flight === undefined) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 rounded-lg blur-xl -z-10" />
        <div className="relative overflow-hidden rounded-lg backdrop-blur-md bg-black/60 border border-white/10 shadow-2xl p-4">
          <div className="text-center text-gray-400 text-sm">No flight data available</div>
        </div>
      </div>
    );
  }

  try {
    const origin = flight?.originCountry || 'N/A';
    const velocity = flight?.velocity || 0;
    const altitude = flight?.altitude || 0;
    const heading = flight?.heading || 0;
    const verticalRate = flight?.verticalRate || 0;
    const lastContact = flight?.lastContact ? new Date(flight.lastContact * 1000).toLocaleTimeString() : 'N/A';

    const flightData = [
      { label: 'Country', value: String(origin), color: 'text-cyan-400' },
      { label: 'Speed', value: `${velocity} m/s`, color: 'text-amber-300' },
      { label: 'Altitude', value: `${altitude} m`, color: 'text-emerald-400' },
      { label: 'Heading', value: `${heading}°`, color: 'text-pink-400' },
      { label: 'Vertical Rate', value: `${verticalRate} m/s`, color: 'text-purple-400' },
      { label: 'Last Contact', value: lastContact, color: 'text-blue-300' },
    ];

    return (
      <div className="relative">
        {/* Outer container with subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 rounded-lg blur-xl -z-5" />
        
        {/* Main card with glassmorphism */}
        <div className="relative overflow-hidden rounded-lg backdrop-blur-md bg-black/60 border border-white/10 shadow-2xl">
          {/* Decorative top border gradient */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />

          <div className="p-4">
            {/* Header section with airline info */}
            <div className="mb-4 pb-3 border-b border-white/5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Flight Information
              </div>
            </div>

            {/* Horizontal scrollable layout for flight data */}
            <div className="flex gap-3 overflow-x-auto pb-2 mb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              {flightData.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-md bg-black/40 p-3 border border-white/5 transition-all duration-300 hover:bg-black/50 hover:border-white/10 flex-shrink-0 whitespace-nowrap"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    {/* Label */}
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {item.label}
                    </div>
                    
                    {/* Value with dynamic color */}
                    <div className={`text-sm font-mono font-bold ${item.color} transition-colors duration-300 group-hover:brightness-125`}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom decorative line */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-xs text-gray-600 text-center tracking-widest">
                LIVE TRACKING
              </div>
            </div>
          </div>

          {/* Corner accent elements */}
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 opacity-50 animate-pulse" />
          <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-cyan-400 opacity-40" />
        </div>

        {/* Global styles for animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error('Error rendering flight card:', error);
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 rounded-lg blur-xl -z-10" />
        <div className="relative overflow-hidden rounded-lg backdrop-blur-md bg-black/60 border border-white/10 shadow-2xl p-4">
          <div className="text-center text-red-400 text-sm">Error loading flight data</div>
        </div>
      </div>
    );
  }
}