
'use client';
import { useEffect, useContext, useState, useMemo } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { IconLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Flight } from '@/hooks/useFlights';
import { MapContext } from './Map';

interface FlightLayersProps {
  flights: Flight[];
  trails?: { icao24: string; path: [number, number, number][] }[];
  onPlaneClick?: (flight: Flight) => void;
}

// Function to get color based on altitude (green to red gradient)
function getAltitudeColor(altitude: number): [number, number, number, number] {
  // Normalize altitude: 0m = green, 10000m = red
  const maxAltitude = 10000;
  const normalized = Math.min(altitude / maxAltitude, 1);

  // Green (0, 255, 0) to Red (255, 0, 0)
  const r = Math.round(255 * normalized);
  const g = Math.round(255 * (1 - normalized));
  const b = 0;
  const a = 220; // Alpha

  return [r, g, b, a];
}

export default function FlightLayers({
  flights,
  trails = [],
  onPlaneClick,
}: FlightLayersProps) {
  const map = useContext(MapContext);
  const [overlay, setOverlay] = useState<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!map) return;

    const deckOverlay = new MapboxOverlay({ layers: [] });
    map.addControl(deckOverlay);
    setOverlay(deckOverlay);

    return () => {
      map.removeControl(deckOverlay);
    };
  }, [map]);

  // Prepare layers
  const layers = useMemo(() => {
    if (!map) return [];

    // IconLayer for actual plane
    const iconLayer = new IconLayer({
      id: 'flights',
      data: flights,
      pickable: true,
      iconAtlas: '/plane-icon_resized.png',
      iconMapping: {
        marker: { 
          x: 0, 
          y: 0, 
          width: 128, 
          height: 128, 
          mask: true 
        },
      },
      getIcon: () => 'marker',
      getPosition: (d: Flight) => [d.lon, d.lat, d.altitude || 0],
      getSize: 32,
      sizeScale: 1,
      sizeMinPixels: 12,
      sizeMaxPixels: 48,
      getColor: (d: Flight) => {
        if (d.onGround) return [0, 255, 0, 255]; // Green when on ground
        return getAltitudeColor(d.altitude || 0); // Color based on altitude
      },
      getAngle: (d: Flight) => (d.heading || 0) - 90,
      billboard: false,
      onClick: (info) => {
        if (onPlaneClick && info.object) onPlaneClick(info.object as Flight);
      },
    });

    // Filter trails to only show those with 2+ points (valid paths)
    const validTrails = trails.filter((trail) => trail.path.length > 1);

    // PathLayer for trails with smooth gradient coloring
    const trailLayer = new PathLayer({
      id: 'trails',
      data: validTrails,
      getPath: (d) => d.path,
      getColor: (d, { index }) => {
        // Get the altitude at this point in the path
        if (!d.path || !d.path[index]) {
          return [255, 255, 255, 220]; // Default white
        }
        const altitude = d.path[index][2] || 0;
        return getAltitudeColor(altitude);
      },
      getWidth: 3, // Slightly thicker for better visibility
      widthMinPixels: 2,
      widthMaxPixels: 5,
    });

    return [trailLayer, iconLayer]; // Trails first so planes render on top
  }, [flights, trails, map, onPlaneClick]);

  // Apply layers to overlay
  useEffect(() => {
    if (!overlay) return;
    overlay.setProps({ layers });
  }, [overlay, layers]);

  return null;
}