


// 'use client';
// import React, { useEffect, useRef, useState, createContext } from 'react';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

// interface MapProps {
//   children?: React.ReactNode;
// }

// const SYDNEY_CENTER: [number, number] = [151.2093, -33.8688];

// const DARK_STYLE =
//   "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// const LIGHT_STYLE =
//   "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// export const MapContext = createContext<maplibregl.Map | null>(null);

// export default function Map({ children }: MapProps) {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const mapRef = useRef<maplibregl.Map | null>(null);
//   const [map, setMap] = useState<maplibregl.Map | null>(null);
//   const [isDark, setIsDark] = useState(true);
//   const [styleLoaded, setStyleLoaded] = useState(false);

//   useEffect(() => {
//     if (mapRef.current) return;
//     if (!mapContainer.current) return;

//     const instance = new maplibregl.Map({
//       container: mapContainer.current,
//       style: DARK_STYLE,
//       center: SYDNEY_CENTER,
//       zoom: 9,
//       pitch: 55,
//       bearing: 0,
//     });

//     instance.on("load", () => {
//       mapRef.current = instance;
//       setMap(instance);
//       setStyleLoaded(true);
//     });

//     return () => {
//       instance.remove();
//       mapRef.current = null;
//     };
//   }, []);

//   const changeMap = () => {
//     if (!mapRef.current) return;

//     const newStyle = isDark ? LIGHT_STYLE : DARK_STYLE;
    
//     // When style changes, we need to wait for it to load
//     setStyleLoaded(false);
    
//     mapRef.current.once('style.load', () => {
//       setStyleLoaded(true);
//       // Trigger re-render of children by updating map state
//       setMap(mapRef.current);
//     });
    
//     mapRef.current.setStyle(newStyle);
//     setIsDark(!isDark);
//   };

//   return (
//     <div
//       ref={mapContainer}
//       style={{ width: "100%", height: "100%", position: "relative" }}
//     >


//       {map && styleLoaded && (
//         <MapContext.Provider value={map}>
//           {children}
//         </MapContext.Provider>
//       )}

//       <button
//         onClick={changeMap}
//         className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-50 hover:bg-black/90 transition-colors"
//       >
//         {isDark ? '☀️ Light' : '🌙 Dark'}
//       </button>
//     </div>
//   );
// }

'use client';
import React, { useEffect, useRef, useState, createContext } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  children?: React.ReactNode;
}

interface MapContextValue {
  map: maplibregl.Map | null;
  styleLoaded: boolean;
}

// ✅ Context is now an object { map, styleLoaded } — not just the map instance
export const MapContext = createContext<MapContextValue>({
  map: null,
  styleLoaded: false,
});

const WORLD_CENTER: [number, number] = [0, 20];
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export default function Map({ children }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [zoom, setZoom] = useState(2);

  useEffect(() => {
    if (mapRef.current) return;
    if (!mapContainer.current) return;

    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: DARK_STYLE,
      center: WORLD_CENTER,
      zoom: 2,
      pitch: 0,
      bearing: 0,
      minZoom: 1,
      maxZoom: 18,
    });

    instance.on('load', () => {
      mapRef.current = instance;
      setMap(instance);
      setStyleLoaded(true);
    });

    instance.on('zoom', () => setZoom(instance.getZoom()));

    return () => {
      instance.remove();
      mapRef.current = null;
    };
  }, []);

  const toggle3D = () => {
    if (!mapRef.current) return;
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    mapRef.current.easeTo({ pitch: newIs3D ? 60 : 0, duration: 800 });
  };

  const changeMap = () => {
    if (!mapRef.current) return;
    const newStyle = isDark ? LIGHT_STYLE : DARK_STYLE;
    setStyleLoaded(false);
    mapRef.current.once('style.load', () => {
      setStyleLoaded(true);
      setMap(mapRef.current);
    });
    mapRef.current.setStyle(newStyle);
    setIsDark(!isDark);
  };

  const resetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: WORLD_CENTER, zoom: 2, pitch: 0, bearing: 0, duration: 1500 });
    setIs3D(false);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

      {/* ✅ Provider now passes object { map, styleLoaded } */}
      {map && styleLoaded && (
        <MapContext.Provider value={{ map, styleLoaded }}>
          {children}
        </MapContext.Provider>
      )}

      {/* Top-right controls */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 50,
        display: 'flex', flexDirection: 'column', gap: 8,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <button onClick={toggle3D} style={btnStyle(is3D)}>
          {is3D ? '📐 3D MODE' : '🗺 2D MODE'}
        </button>
        <button onClick={changeMap} style={btnStyle(false)}>
          {isDark ? '☀️ LIGHT' : '🌙 DARK'}
        </button>
        <button onClick={resetView} style={btnStyle(false)}>
          🌍 WORLD
        </button>
      </div>

      {/* Zoom indicator */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 40,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(99,179,237,0.3)',
        borderRadius: 10, padding: '8px 14px',
        color: '#e2e8f0', fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        ZOOM: {zoom.toFixed(2)}
      </div>
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(99,179,237,0.25)' : 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${active ? '#63b3ed' : 'rgba(99,179,237,0.3)'}`,
    borderRadius: 10,
    padding: '8px 16px',
    color: active ? '#63b3ed' : '#e2e8f0',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 1,
    transition: 'all 0.2s',
    fontFamily: "'JetBrains Mono', monospace",
  };
}