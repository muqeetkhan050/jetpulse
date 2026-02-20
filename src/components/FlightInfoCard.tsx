
'use client';
import { Flight } from '@/hooks/useFlights';
import { useState } from 'react';

interface FlightInfoCardProps {
  flight: Flight;
  onClose: () => void;
  onAddAgent?: () => void;
}

export default function FlightInfoCard({ flight, onClose, onAddAgent }: FlightInfoCardProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'route'>('info');

  // Format altitude
  const formatAltitude = (alt: number | null) => {
    if (!alt) return 'Ground';
    return `${Math.round(alt)} m (${Math.round(alt * 3.28084)} ft)`;
  };

  // Format velocity
  const formatVelocity = (vel: number | null) => {
    if (!vel) return 'N/A';
    return `${Math.round(vel)} m/s (${Math.round(vel * 1.944)} knots)`;
  };

  // Format heading
  const formatHeading = (heading: number | null) => {
    if (heading === null || heading === undefined) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return `${Math.round(heading)}° (${directions[index]})`;
  };

  // Format vertical rate
  const formatVerticalRate = (rate: number | null) => {
    if (!rate) return 'Level';
    if (rate > 0) return `↗ Climbing ${Math.round(rate)} m/s`;
    return `↘ Descending ${Math.abs(Math.round(rate))} m/s`;
  };

  return (
    <div className="fixed right-4 top-4 bottom-4 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
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

        {/* Status Badge */}
        <div className="mt-3">
          {flight.onGround ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
              🛬 On Ground
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
              ✈️ In Flight
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'info'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Flight Info
        </button>
        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'route'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📍 Position
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {flight.lat.toFixed(4)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {flight.lon.toFixed(4)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Altitude:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formatAltitude(flight.altitude)}
                  </span>
                </div>
              </div>
            </div>

            {/* Flight Dynamics */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                🚀 Flight Dynamics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formatVelocity(flight.velocity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Heading:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formatHeading(flight.heading)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Vertical Rate:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formatVerticalRate(flight.verticalRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Indicator */}
            <div className="bg-gradient-to-r from-yellow-50 to-red-50 dark:from-yellow-900/20 dark:to-red-900/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                🎨 Altitude Color
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg shadow-md"
                  style={{
                    backgroundColor: flight.onGround || (flight.altitude || 0) < 100
                      ? 'rgb(255, 255, 0)'
                      : `rgb(255, ${Math.round(255 * (1 - Math.min((flight.altitude || 0) / 12000, 1)))}, 0)`,
                  }}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Route information is not available from OpenSky API.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                This would show origin, destination, and waypoints.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {onAddAgent && (
        <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onAddAgent}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🤖</span>
            <span>Add AI Agent to Flight</span>
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Join the conversation when 10 agents board
          </p>
        </div>
      )}
    </div>
  );
}