
'use client';

import { useEffect, useContext, useState, useMemo } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { IconLayer, PathLayer } from '@deck.gl/layers';
import { Flight } from '@/hooks/useFlights';
import { MapContext } from './Map';

interface FlightLayersProps {
  flights: Flight[];
  trails?: { icao24: string; path: [number, number, number][] }[];
}

// SVG airplane icon as data URI (no external file needed)
const AIRPLANE_ICON = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
</svg>
`)}`;

export default function FlightLayers({ flights, trails = [] }: FlightLayersProps) {
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

  // Memoize layers to prevent unnecessary updates
  const layers = useMemo(() => {
    if (!flights.length) return [];

    const iconLayer = new IconLayer({
      id: 'flights',
      data: flights,
      pickable: true,
      iconAtlas: AIRPLANE_ICON,
      iconMapping: {
        airplane: { x: 0, y: 0, width: 24, height: 24, mask: true }
      },
      getIcon: () => 'airplane',
      sizeScale: 2,
      getPosition: (d: Flight) => [d.lon, d.lat, d.altitude || 0],
      getSize: 20,
      getColor: (d: Flight) => {
        if (d.onGround) return [0, 255, 0]; // Green for ground
        if ((d.altitude || 0) < 1000) return [255, 165, 0]; // Orange for low
        return [0, 255, 255]; // Cyan for high
      },
      getAngle: (d: Flight) => d.heading - 90, // Adjust for icon orientation
      billboard: false,
      anchorY: 12,
    });

    const trailLayer = new PathLayer({
      id: 'trails',
      data: trails,
      getPath: (d) => d.path,
      getColor: [255, 255, 0, 200],
      getWidth: 2,
      widthMinPixels: 1,
    });

    return [iconLayer, trailLayer];
  }, [flights, trails]);

  useEffect(() => {
    if (!overlay) return;
    overlay.setProps({ layers });
  }, [overlay, layers]);

  return null;
}
