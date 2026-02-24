


'use client';
import { useEffect, useContext, useState, useMemo } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { IconLayer, PathLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { Flight } from '@/hooks/useFlights';
import { MapContext } from './Map';

interface FlightLayersProps {
  flights: Flight[];
  trails?: { icao24: string; path: [number, number, number][] }[];
  onPlaneClick?: (flight: Flight) => void;
  selectedFlight?: Flight | null;
}

// Function to get color based on altitude (green to red gradient)
function getAltitudeColor(altitude: number): [number, number, number, number] {
  const maxAltitude = 10000;
  const normalized = Math.min(altitude / maxAltitude, 1);

  const r = Math.round(255 * normalized);
  const g = Math.round(255 * (1 - normalized));
  const b = 0;
  const a = 255;

  return [r, g, b, a];
}

export default function FlightLayers({
  flights,
  trails = [],
  onPlaneClick,
  selectedFlight,
}: FlightLayersProps) {
  const map = useContext(MapContext);
  const [overlay, setOverlay] = useState<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!map) return;

    const deckOverlay = new MapboxOverlay({ layers: [] });
    map.addControl(deckOverlay);
    setOverlay(deckOverlay);

    return () => {
      map.removeControl(deckOverlay);
    };
  }, [map]);

  // Prepare layers
  const layers = useMemo(() => {
    if (!map) return [];

    // 3D Scenegraph Layer for real 3D planes
    const scenegraphLayer = new ScenegraphLayer({
      id: 'flights-3d',
      data: flights,
      pickable: true,
      scenegraph: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph/airplane.glb',
      getPosition: (d: Flight) => [d.lon, d.lat, (d.altitude || 0) / 100],
      getScale: [40, 40, 40],
      getRotation: [0, 0, (d: Flight) => -(d.heading || 0)],
      getColor: (d: Flight) => {
        if (selectedFlight && d.icao24 === selectedFlight.icao24) {
          return [255, 255, 0];
        }
        if (d.onGround) return [0, 255, 0];
        
        const color = getAltitudeColor(d.altitude || 0);
        return [color[0], color[1], color[2]];
      },
      onClick: (info: any) => {
        if (onPlaneClick && info.object) onPlaneClick(info.object as Flight);
      },
      minZoom: 6,
    });

    // Fallback icon layer for low zoom
    const iconLayer = new IconLayer({
      id: 'flights-icon',
      data: flights,
      pickable: true,
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
      getSize: (d: Flight) => {
        return selectedFlight && d.icao24 === selectedFlight.icao24 ? 48 : 32;
      },
      sizeScale: 1,
      sizeMinPixels: 12,
      sizeMaxPixels: 64,
      getColor: (d: Flight) => {
        if (selectedFlight && d.icao24 === selectedFlight.icao24) {
          return [255, 255, 0, 255];
        }
        if (d.onGround) return [0, 255, 0, 255];
        return getAltitudeColor(d.altitude || 0);
      },
      getAngle: (d: Flight) => (d.heading || 0) - 90,
      billboard: false,
      onClick: (info: any) => {
        if (onPlaneClick && info.object) onPlaneClick(info.object as Flight);
      },
      maxZoom: 6,
    });

    // Only show trail for selected flight
    const trailsToShow = selectedFlight
      ? trails.filter((trail) => trail.icao24 === selectedFlight.icao24 && trail.path.length > 1)
      : [];

    // PathLayer for trails
    const trailLayer = new PathLayer({
      id: 'trails',
      data: trailsToShow,
      getPath: (d) => d.path,
      getColor: (d: any, { index }: { index: number }) => {
        if (!d.path || !d.path[index]) {
          return [255, 255, 255, 255];
        }
        const altitude = d.path[index][2] || 0;
        return getAltitudeColor(altitude);
      },
      getWidth: 4,
      widthMinPixels: 3,
      widthMaxPixels: 8,
      rounded: true,
    });

    return [trailLayer, scenegraphLayer, iconLayer];
  }, [flights, trails, map, onPlaneClick, selectedFlight]);

  // Apply layers to overlay
  useEffect(() => {
    if (!overlay) return;
    overlay.setProps({ layers });
  }, [overlay, layers]);

  return null;
}

