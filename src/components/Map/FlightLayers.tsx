
'use client';
import { useEffect, useContext, useState, useMemo } from 'react';
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
  return [
    Math.round(255 * normalized),
    Math.round(255 * (1 - normalized)),
    0,
    255,
  ];
}

function getPlaneOrientation(flight: Flight): [number, number, number] {
  const heading = flight.heading || 0;
  const verticalRate = (flight as any).verticalRate ?? (flight as any).vertical_rate ?? 0;

  let pitchDeg = 0;
  if (!flight.onGround && verticalRate !== 0) {
    pitchDeg = Math.max(-20, Math.min(20, (verticalRate / 10) * 15));
  }

  const yaw = 90 - heading;
  const pitch = -pitchDeg;
  const roll = 90;

  return [pitch, yaw, roll];
}

export default function FlightLayers({
  flights,
  trails = [],
  onPlaneClick,
  selectedFlight,
}: FlightLayersProps) {
  const { map, styleLoaded } = useContext(MapContext);
  const [overlay, setOverlay] = useState<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!map || !styleLoaded) return;

    const attach = () => {
      const deckOverlay = new MapboxOverlay({ layers: [] });
      map.addControl(deckOverlay as any);
      setOverlay(deckOverlay);
    };

    if (map.loaded()) {
      attach();
    } else {
      map.once('load', attach);
    }

    return () => {
      setOverlay((prev) => {
        if (prev) {
          try { map.removeControl(prev as any); } catch (_) {}
        }
        return null;
      });
    };
  }, [map, styleLoaded]);

  const layers = useMemo(() => {
    if (!map || !styleLoaded) return [];

    // ✅ Only the 3D model — no icon layer fallback
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
      ? trails.filter(
          (trail) => trail.icao24 === selectedFlight.icao24 && trail.path.length > 1
        )
      : [];

    const trailLayer = new PathLayer({
      id: 'trails',
      data: trailsToShow,
      getPath: (d) => d.path,
      getColor: (d: any, { index }: { index: number }) => {
        if (!d.path || !d.path[index]) return [255, 255, 255, 255];
        return getAltitudeColor(d.path[index][2] || 0);
      },
      getWidth: 4,
      widthMinPixels: 3,
      widthMaxPixels: 8,
      rounded: true,
    });

    return [trailLayer, scenegraphLayer];
  }, [flights, trails, map, styleLoaded, onPlaneClick, selectedFlight]);

  useEffect(() => {
    if (!overlay) return;
    try {
      overlay.setProps({ layers });
    } catch (e) {
      console.warn('[FlightLayers] setProps skipped:', e);
    }
  }, [overlay, layers]);

  return null;
}