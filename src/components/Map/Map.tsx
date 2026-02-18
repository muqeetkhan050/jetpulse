'use client';

import React from 'react';
import {useEffect, useRef, useState, createContext} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';


interface MapProps{
    children?:React.ReactNode;
}

const SYDNEY_CENTER: [number, number] = [151.2093, -33.8688]; // Lon, Lat

export const MapContext = createContext<maplibregl.Map | null>(null);

export default function Map({ children }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: SYDNEY_CENTER,
      zoom: 9,
      pitch: 55,
      bearing: 0,
    });
    setMap(mapRef.current);
  }, []);

  return (
    <div ref={mapContainer} className="w-full h-full relative">
      <MapContext.Provider value={map}>
        {children}
      </MapContext.Provider>
    </div>
  );
}
