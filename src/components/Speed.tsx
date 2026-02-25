

'use client'
import { Flight } from '@/hooks/useFlights';

interface SpeedProps {
  flight?: Flight | null;
}

// Country Flag Icon
function CountryIcon() {
  return (
    <svg 
      className="w-4 h-4 inline-block mr-1" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M5 3v18M5 3h4v6H5m14-6v18m-14 0h14" />
    </svg>
  );
}

// Speed Icon
function SpeedIcon() {
  return (
    <svg 
      className="w-4 h-4 inline-block mr-1" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="currentColor" 
      viewBox="0 0 24 24" 
      height="24" 
      width="24"
    >
      <path d="M12 4c2.0148 0 3.8891 0.59793 5.459 1.62305L15.6055 6.8584C14.5219 6.31026 13.2974 6 12 6c-4.41828 0 -8 3.58172 -8 8 0 1.4588 0.39055 2.8237 1.07129 4H18.9287C19.6095 16.8237 20 15.4588 20 14c0 -1.2978 -0.3109 -2.5226 -0.8594 -3.6064l1.2354 -1.85356C21.4016 10.1101 22 11.9847 22 14c0 2.0543 -0.6206 3.9671 -1.6846 5.5566L20.0186 20H3.98145l-0.29688 -0.4434C2.62056 17.9671 2 16.0543 2 14 2 8.47715 6.47715 4 12 4m4.9199 4.38672c0.4547 -0.30309 0.9965 0.23864 0.6934 0.69336l-4.2129 6.32032c-0.3 0.4499 -0.7671 0.6792 -1.4004 0.6875s-1.1498 -0.188 -1.5498 -0.5879c-0.4 -0.4 -0.5875 -0.9087 -0.5625 -1.5254 0.02508 -0.6164 0.2621 -1.0751 0.7119 -1.375z" />
    </svg>
  );
}

// Altitude Icon - Flaticon style (Mountain/Height indicator)
function AltitudeIcon() {
  return (
    <svg 
      className="w-4 h-4 inline-block mr-1" 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      {/* Mountain peak style altitude icon */}
      <path d="M3 20h18L12 5L3 20z" />
      {/* Horizontal line showing altitude level */}
      <line x1="3" y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Heading Icon - Compass
function HeadingIcon() {
  return (
    <svg 
      className="w-4 h-4 inline-block mr-1" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// Vertical Rate Icon - Up/Down indicator
function VerticalIcon() {
  return (
    <svg 
      className="w-4 h-4 inline-block mr-1" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
      <path d="M12 5l-3 3M12 5l3 3" />
    </svg>
  );
}

// Last Contact Icon - Clock
function ContactIcon() {
  return (
    <svg 
      className="w-4 h-4 inline-block mr-1" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
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
      { label: 'Country', value: String(origin), color: 'text-white', icon: CountryIcon },
      { label: 'Speed', value: `${velocity} m/s`, color: 'text-white', icon: SpeedIcon },
      { label: 'Altitude', value: `${altitude} m`, color: 'text-white', icon: AltitudeIcon },
      { label: 'Heading', value: `${heading}°`, color: 'text-white', icon: HeadingIcon },
      { label: 'Vertical Rate', value: `${verticalRate} m/s`, color: 'text-white', icon: VerticalIcon },
      { label: 'Last Contact', value: lastContact, color: 'text-white', icon: ContactIcon },
    ];

    return (
      <div className="relative">
        {/* Outer container with subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 rounded-lg blur-xl -z-10" />
        
        {/* Main card with glassmorphism */}
        <div className="relative overflow-hidden rounded-lg backdrop-blur-md bg-black/60 border border-white/10 shadow-2xl">
          {/* Decorative top border gradient */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

          <div className="p-4">
            {/* Header section with airline info */}
            <div className="mb-4 pb-3 border-b border-white/5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Flight Information
              </div>
            </div>

            {/* Horizontal scrollable layout for flight data */}
            <div className="flex gap-3 overflow-x-auto pb-2 mb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              {flightData.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-md bg-black/60 p-3 border border-white/5 transition-all duration-300 hover:bg-black/70 hover:border-white/10 flex-shrink-0 whitespace-nowrap"
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative">
                      {/* Label with icon */}
                      <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <IconComponent />
                        {item.label}
                      </div>
                      
                      {/* Value with dynamic color - NOW READABLE */}
                      <div className={`text-xs font-mono font-bold ${item.color} transition-colors duration-300 group-hover:brightness-125`}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                );
              })}
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

