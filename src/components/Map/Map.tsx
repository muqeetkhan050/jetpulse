
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

export const MapContext = createContext<MapContextValue>({
  map: null,
  styleLoaded: false,
});

const WORLD_CENTER: [number, number] = [0, 20];
const DARK_STYLE  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export default function Map({ children }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<maplibregl.Map | null>(null);
  const [map, setMap]                 = useState<maplibregl.Map | null>(null);
  const [isDark, setIsDark]           = useState(true);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [zoom, setZoom]               = useState(2);
  const [pitch, setPitch]             = useState(45);
  const [bearing, setBearing]         = useState(0);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: DARK_STYLE,
      center: WORLD_CENTER,
      zoom: 2,
      pitch: 45,
      bearing: 0,
      minZoom: 1,
      maxZoom: 20,
      maxPitch: 75,
    });

    instance.on('load', () => {
      mapRef.current = instance;
      setMap(instance);
      setStyleLoaded(true);
    });

    // ✅ Every time ANY style finishes loading (including theme switches),
    //    wait one frame then signal ready — keeps overlay alive
    instance.on('style.load', () => {
      requestAnimationFrame(() => {
        setStyleLoaded(true);
      });
    });

    instance.on('zoom',   () => setZoom(instance.getZoom()));
    instance.on('pitch',  () => setPitch(instance.getPitch()));
    instance.on('rotate', () => setBearing(instance.getBearing()));

    return () => {
      instance.remove();
      mapRef.current = null;
    };
  }, []);

  const changeMap = () => {
    if (!mapRef.current) return;
    // ✅ Just set false briefly so FlightLayers skips setProps during reload
    setStyleLoaded(false);
    mapRef.current.setStyle(isDark ? LIGHT_STYLE : DARK_STYLE);
    setIsDark(!isDark);
    // style.load listener above will set it back to true
  };

  const resetView = () => {
    mapRef.current?.flyTo({ center: WORLD_CENTER, zoom: 2, pitch: 45, bearing: 0, duration: 1500 });
  };

  const adjustPitch   = (d: number) => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ pitch: Math.max(0, Math.min(75, mapRef.current.getPitch() + d)), duration: 250 });
  };
  const adjustBearing = (d: number) => mapRef.current?.easeTo({ bearing: mapRef.current.getBearing() + d, duration: 250 });
  const adjustZoom    = (d: number) => mapRef.current?.easeTo({ zoom: mapRef.current.getZoom() + d, duration: 250 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowUp')    { e.preventDefault(); adjustPitch(+8);   }
      if (e.key === 'ArrowDown')  { e.preventDefault(); adjustPitch(-8);   }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); adjustBearing(-8); }
      if (e.key === 'ArrowRight') { e.preventDefault(); adjustBearing(+8); }
      if (e.key === '=' || e.key === '+') adjustZoom(+0.5);
      if (e.key === '-')                  adjustZoom(-0.5);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      position: 'fixed', top: 0, left: 0,
      overflow: 'hidden',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* ✅ Children NEVER unmount — context just updates styleLoaded value */}
      {map && (
        <MapContext.Provider value={{ map, styleLoaded }}>
          {children}
        </MapContext.Provider>
      )}

      {/* Top-left HUD */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 9999,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(99,179,237,0.35)', borderRadius: 12,
        padding: '12px 16px', color: '#e2e8f0', fontSize: 11,
        display: 'flex', flexDirection: 'column', gap: 4, minWidth: 170,
        pointerEvents: 'none',
      }}>
        <div style={{ color: '#63b3ed', fontWeight: 700, fontSize: 13, letterSpacing: 2, marginBottom: 4 }}>
          ✈ FLIGHT TRACKER
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px' }}>
          <span style={{ color: '#718096' }}>ZOOM</span>    <span>{zoom.toFixed(1)}</span>
          <span style={{ color: '#718096' }}>PITCH</span>   <span>{pitch.toFixed(0)}°</span>
          <span style={{ color: '#718096' }}>BEARING</span> <span>{((bearing % 360 + 360) % 360).toFixed(0)}°</span>
        </div>
      </div>

      {/* Top-right buttons */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn onClick={changeMap}>{isDark ? '☀️ LIGHT' : '🌙 DARK'}</Btn>
        <Btn onClick={resetView}>🌍 RESET</Btn>
      </div>

      {/* Bottom-left camera pad */}
      <div style={{
        position: 'absolute', bottom: 24, left: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        userSelect: 'none',
      }}>
        <div style={{
          color: '#63b3ed', fontSize: 9, letterSpacing: 3, fontWeight: 700,
          background: 'rgba(0,0,0,0.75)', padding: '3px 10px', borderRadius: 6,
          border: '1px solid rgba(99,179,237,0.25)',
        }}>CAMERA</div>

        <PadBtn onClick={() => adjustPitch(+10)}    icon="▲" label="Tilt Up" />
        <div style={{ display: 'flex', gap: 6 }}>
          <PadBtn onClick={() => adjustBearing(-15)} icon="↺" label="Rotate Left" />
          <PadBtn onClick={() => adjustZoom(+1)}     icon="＋" label="Zoom In" accent />
          <PadBtn onClick={() => adjustBearing(+15)} icon="↻" label="Rotate Right" />
        </div>
        <PadBtn onClick={() => adjustPitch(-10)}    icon="▼" label="Tilt Down" />
        <PadBtn onClick={() => adjustZoom(-1)}      icon="−" label="Zoom Out" wide />

        <div style={{ color: '#4a5568', fontSize: 9, letterSpacing: 1, textAlign: 'center', marginTop: 2, lineHeight: 1.8 }}>
          ⌨ ↑↓ tilt · ←→ rotate · +/− zoom
        </div>
      </div>
    </div>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(99,179,237,0.35)', borderRadius: 10,
      padding: '8px 16px', color: '#e2e8f0', fontSize: 12, fontWeight: 700,
      cursor: 'pointer', letterSpacing: 1,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {children}
    </button>
  );
}

function PadBtn({ onClick, icon, label, wide, accent }: {
  onClick: () => void; icon: string; label: string; wide?: boolean; accent?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      title={label}
      onMouseDown={() => { setPressed(true); onClick(); }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={(e) => { e.preventDefault(); setPressed(true); onClick(); }}
      onTouchEnd={() => setPressed(false)}
      style={{
        width: wide ? 148 : 44, height: 44, borderRadius: 10,
        background: pressed ? 'rgba(99,179,237,0.35)' : accent ? 'rgba(99,179,237,0.15)' : 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${pressed || accent ? '#63b3ed' : 'rgba(99,179,237,0.3)'}`,
        color: pressed || accent ? '#63b3ed' : '#e2e8f0',
        fontSize: wide ? 12 : 18, fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: wide ? 1 : 0,
        boxShadow: accent ? '0 0 12px rgba(99,179,237,0.25)' : 'none',
      }}
    >
      {wide ? `${icon} ${label}` : icon}
    </button>
  );
}