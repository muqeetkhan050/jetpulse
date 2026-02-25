
'use client';
import { useEffect, useContext, useRef, useMemo } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { PathLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { Flight } from '@/hooks/useFlights';
import { MapContext } from './Map';

interface FlightLayersProps {
  flights: Flight[];
  trails?: { icao24: string; path: [number, number, number][] }[];
  onPlaneClick?: (flight: Flight) => void;
  selectedFlight?: Flight | null;
}

const AIRPLANE_GLB =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';

function getAltitudeColor(altitude: number): [number, number, number, number] {
  const maxAltitude = 10000;
  const normalized = Math.min(altitude / maxAltitude, 1);
  return [Math.round(255 * normalized), Math.round(255 * (1 - normalized)), 0, 255];
}

function getPlaneOrientation(flight: Flight): [number, number, number] {
  const heading = flight.heading || 0;
  const verticalRate = (flight as any).verticalRate ?? (flight as any).vertical_rate ?? 0;
  const pitchDeg = flight.onGround ? 0 : Math.max(-20, Math.min(20, (verticalRate / 10) * 15));
  return [-pitchDeg, 90 - heading, 90];
}

export default function FlightLayers({
  flights,
  trails = [],
  onPlaneClick,
  selectedFlight,
}: FlightLayersProps) {
  const { map, styleLoaded } = useContext(MapContext);

  // ✅ Overlay is stored in a ref — created ONCE, never recreated
  const overlayRef = useRef<MapboxOverlay | null>(null);

  // ✅ Create overlay once when map is first ready
  useEffect(() => {
    if (!map) return;
    if (overlayRef.current) return; // already created

    const overlay = new MapboxOverlay({ layers: [] });
    map.addControl(overlay as any);
    overlayRef.current = overlay;

    // cleanup only on full unmount
    return () => {
      try { map.removeControl(overlayRef.current as any); } catch (_) {}
      overlayRef.current = null;
    };
  }, [map]);

  const layers = useMemo(() => {
    // ✅ When style is reloading, return empty layers — don't crash
    if (!styleLoaded) return [];

    const scenegraphLayer = new ScenegraphLayer({
      id: 'flights-3d',
      data: flights,
      pickable: true,
      scenegraph: AIRPLANE_GLB,
      getPosition: (d: Flight) => [d.lon, d.lat, (d.altitude || 0) * 0.3],
      sizeScale: 25,
      sizeMinPixels: 0.7,
      getOrientation: (d: Flight) => getPlaneOrientation(d),
      _lighting: 'pbr',
      getColor: (d: Flight) => {
        if (selectedFlight && d.icao24 === selectedFlight.icao24) return [255, 220, 0, 255];
        if (d.onGround) return [0, 255, 100, 255];
        const c = getAltitudeColor(d.altitude || 0);
        return [c[0], c[1], c[2], 220];
      },
      onClick: (info: any) => {
        if (onPlaneClick && info.object) onPlaneClick(info.object as Flight);
      },
      updateTriggers: {
        getOrientation: flights.map(f => `${f.icao24}-${f.heading}-${(f as any).verticalRate}`),
        getColor: [selectedFlight?.icao24],
      },
    });

    const trailsToShow = selectedFlight
      ? trails.filter(t => t.icao24 === selectedFlight.icao24 && t.path.length > 1)
      : [];

    const trailLayer = new PathLayer({
      id: 'trails',
      data: trailsToShow,
      getPath: (d) => d.path,
      getColor: (d: any, { index }: { index: number }) => {
        if (!d.path?.[index]) return [255, 255, 255, 255];
        return getAltitudeColor(d.path[index][2] || 0);
      },
      getWidth: 4,
      widthMinPixels: 3,
      widthMaxPixels: 8,
      rounded: true,
    });

    return [trailLayer, scenegraphLayer];
  }, [flights, trails, styleLoaded, onPlaneClick, selectedFlight]);

  // ✅ Just update layers on the existing overlay — never remove/recreate it
  useEffect(() => {
    if (!overlayRef.current) return;
    try {
      overlayRef.current.setProps({ layers });
    } catch (e) {
      console.warn('[FlightLayers] setProps skipped:', e);
    }
  }, [layers]);

  return null;
}