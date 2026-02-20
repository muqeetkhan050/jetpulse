


'use client';
import React, { useEffect, useRef, useState, createContext } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  children?: React.ReactNode;
}

const SYDNEY_CENTER: [number, number] = [151.2093, -33.8688];

const DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const LIGHT_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const MapContext = createContext<maplibregl.Map | null>(null);

export default function Map({ children }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [styleLoaded, setStyleLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;
    if (!mapContainer.current) return;

    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: DARK_STYLE,
      center: SYDNEY_CENTER,
      zoom: 9,
      pitch: 55,
      bearing: 0,
    });

    instance.on("load", () => {
      mapRef.current = instance;
      setMap(instance);
      setStyleLoaded(true);
    });

    return () => {
      instance.remove();
      mapRef.current = null;
    };
  }, []);

  const changeMap = () => {
    if (!mapRef.current) return;

    const newStyle = isDark ? LIGHT_STYLE : DARK_STYLE;
    
    // When style changes, we need to wait for it to load
    setStyleLoaded(false);
    
    mapRef.current.once('style.load', () => {
      setStyleLoaded(true);
      // Trigger re-render of children by updating map state
      setMap(mapRef.current);
    });
    
    mapRef.current.setStyle(newStyle);
    setIsDark(!isDark);
  };

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >


      {map && styleLoaded && (
        <MapContext.Provider value={map}>
          {children}
        </MapContext.Provider>
      )}

      <button
        onClick={changeMap}
        className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-50 hover:bg-black/90 transition-colors"
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}