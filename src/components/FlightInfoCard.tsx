
'use client';
import { Flight } from '@/hooks/useFlights';
import { useState } from 'react';

interface FlightInfoCardProps {
  flight: Flight;
  onClose: () => void;
}

export default function FlightInfoCard({ flight, onClose }: FlightInfoCardProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'route'>('info');


   const formatAltitude = (alt: number | null) => {
    if (!alt) return 'Ground';
     return `${Math.round(alt)} m (${Math.round(alt * 3.28084)} ft)`;
 };



  const formatVelocity = (vel: number | null) => {
    if (!vel) return 'N/A';
    return `${Math.round(vel)} m/s (${Math.round(vel * 1.944)} knots)`;
  };


  const formatHeading = (heading: number | null) => {
    if (heading === null || heading === undefined) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return `${Math.round(heading)}° (${directions[index]})`;
  };


  const formatVerticalRate = (rate: number | null) => {
    if (!rate) return 'Level';
    if (rate > 0) return `↗ Climbing ${Math.round(rate)} m/s`;
    return `↘ Descending ${Math.abs(Math.round(rate))} m/s`;
  };

  return (
    <div className="fixed right-4 top-4 bottom-4 w-96 bg-black/20 backdrop-blur-md rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden border border-white/10">
      {/* Header */}
      <div className="bg-linear-to-r from-black-600/90 to-blue-800/90 backdrop-blur-sm text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{flight.callsign}</h2>
            <p className="text-sm text-blue-100">ICAO24: {flight.icao24}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mt-3">
          {flight.onGround ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/90 backdrop-blur-sm text-white">
               On Ground
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/90 backdrop-blur-sm text-white">
              In Flight
            </span>
          )}
        </div>
      </div>
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'info'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Flight Info
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'route'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Route Details
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' ? (
          <div className="space-y-4">
            {/* Position */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                📍 Position
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Latitude:</span>
                  <span className="font-mono text-white">
                    {flight.lat.toFixed(4)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Longitude:</span>
                  <span className="font-mono text-white">
                    {flight.lon.toFixed(4)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Altitude:</span>
                  <span className="font-mono text-white">
                    {formatAltitude(flight.altitude)}
                  </span>
                </div>
              </div>
            </div>

            {/* Flight Dynamics */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                🚀 Flight Dynamics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Speed:</span>
                  <span className="font-mono text-white">
                    {formatVelocity(flight.velocity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Heading:</span>
                  <span className="font-mono text-white">
                    {formatHeading(flight.heading)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vertical Rate:</span>
                  <span className="font-mono text-white">
                    {formatVerticalRate(flight.verticalRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Indicator */}
            <div className="bg-linear-to-r from-yellow-500/10 to-red-500/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                🎨 Altitude Color
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg shadow-md border border-white/20"
                  style={{
                    backgroundColor: flight.onGround || (flight.altitude || 0) < 100
                      ? 'rgb(255, 255, 0)'
                      : `rgb(255, ${Math.round(255 * (1 - Math.min((flight.altitude || 0) / 12000, 1)))}, 0)`,
                  }}
                />
                <div className="text-sm text-gray-400">
                  {flight.onGround
                    ? 'Yellow - On Ground'
                    : (flight.altitude || 0) < 6000
                    ? 'Yellow-Orange - Low Altitude'
                    : 'Orange-Red - High Altitude'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Route Info Placeholder */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
              <p className="text-gray-400 text-sm">
                Your agent can talk to other passenget agents on the same flight, share information, and coordinate actions.
              </p>
   
             <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors">
              Get boarding pass for you AI Agent
             </button>
             <h3 className="text-xs text-gray-500 mt-2">Muqeeet on flight</h3>
            </div>
          </div>
        )}
      </div>
      <h1 className="text-xs text-gray-500 mt-2">Muqeeet on flight</h1>

    </div>
  );
}