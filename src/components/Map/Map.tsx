

'use client';
import Headline from '../headline';
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
    });

    return () => {
      instance.remove();
      mapRef.current = null;
    };
  }, []);


const changeMap=()=>{
    if(!mapRef.current) return;

    const newStype=isDark?LIGHT_STYLE:DARK_STYLE;
    mapRef.current.setStyle(newStype);
    setIsDark(!isDark);
}

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >

 <Headline className="absolute top-4 left-0 w-full z-[100] overflow-hidden">
  <div className="whitespace-nowrap animate-scroll px-4">
    Sydney Flight Tracker — Real-time 3D flight tracking for Sydney airports — Sydney Flight Tracker — Real-time 3D flight tracking for Sydney airports
  </div>
</Headline>



      {map && (
        <MapContext.Provider value={map}>
          {children}
        </MapContext.Provider>
      )}

      <button
        onClick={changeMap}
        className="absolute bottom-4 right-4 bg-black/80 text-white p-2 rounded z-50"
      >
        Toggle Map Style
      </button>

    </div>
  );
}
