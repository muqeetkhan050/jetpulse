

'use client';

import React from 'react';
import { useEffect, useRef, useState, createContext } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  children?: React.ReactNode;
}

const SYDNEY_CENTER: [number, number] = [151.2093, -33.8688];

export const MapContext = createContext<maplibregl.Map | null>(null);

export default function Map({ children }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const instance = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: SYDNEY_CENTER,
      zoom: 9,
      pitch: 55,
      bearing: 0,
    });

    // ✅ Wait for map to fully load before exposing it to children
    instance.on('load', () => {
      mapRef.current = instance;
      setMap(instance);
    });

    return () => {
      instance.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%' }}>
 
      {map && (
        <MapContext.Provider value={map}>
          {children}
        </MapContext.Provider>
      )}
    </div>
  );
}
