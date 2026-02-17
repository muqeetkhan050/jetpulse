'use client';

import React from 'react';
import {useEffect, useRef} from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';


interface MapProps{
    children?:React.ReactNode;
}

const SYDNEY_CENTER: [number, number] = [151.2093, -33.8688]; // Lon, Lat


export default function Map({ children }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // Initialize only once
    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: SYDNEY_CENTER,
      zoom: 9,
      pitch: 55,
      bearing: 0,
    });
  }, []);

  return <div ref={mapContainer} className="w-full h-full relative">{children}</div>;
}
