

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

export default function FlightLayers({
  flights,
  trails = [],
  onPlaneClick,
}: FlightLayersProps) {
  const map = useContext(MapContext);
  const [overlay, setOverlay] = useState<MapboxOverlay | null>(null);

  // 1️⃣ Initialize Deck overlay
  useEffect(() => {
    if (!map) return;

    const deckOverlay = new MapboxOverlay({ layers: [] });
    map.addControl(deckOverlay);
    setOverlay(deckOverlay);

    return () => {
      map.removeControl(deckOverlay);
    };
  }, [map]);

  // 2️⃣ Prepare layers
  const layers = useMemo(() => {
    if (!map) return [];

    // IconLayer for actual plane
    const iconLayer = new IconLayer({
      id: 'flights',
      data: flights,
      pickable: true,
      // Use a reliable CDN icon as fallback, or your own /plane-icon.png
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
      getSize: 32, // Smaller base size
      sizeScale: 1,
      sizeMinPixels: 12, // Minimum pixel size
      sizeMaxPixels: 48, // Maximum pixel size
      getColor: (d: Flight) => {
        if (d.onGround) return [0, 255, 0, 255]; // green with alpha
        if ((d.altitude || 0) < 1000) return [255, 165, 0, 255]; // orange
        return [0, 255, 255, 255]; // cyan
      },
      getAngle: (d: Flight) => (d.heading || 0) - 90,
      billboard: false, // Set to false to see rotation
      onClick: (info) => {
        if (onPlaneClick && info.object) onPlaneClick(info.object as Flight);
      },
    });

    // PathLayer for trails
    const trailLayer = new PathLayer({
      id: 'trails',
      data: trails,
      getPath: (d) => d.path,
      getColor: [255, 255, 0, 200],
      getWidth: 2,
      widthMinPixels: 1,
    });

    return [iconLayer, trailLayer];
  }, [flights, trails, map, onPlaneClick]);

  // 3️⃣ Apply layers to overlay
  useEffect(() => {
    if (!overlay) return;
    overlay.setProps({ layers });
  }, [overlay, layers]);

  return null;
}
