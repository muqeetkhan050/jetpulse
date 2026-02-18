'use client';

import React, { useEffect, useContext, useState } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { IconLayer } from '@deck.gl/layers';
import { Flight } from '../../hooks/useFlights';
import { MapContext } from './Map';

interface FlightLayersProps {
  flights: Flight[];
}

export default function FlightLayers({ flights }: FlightLayersProps) {
  const map = useContext(MapContext);
  const [overlay, setOverlay] = useState<MapboxOverlay | null>(null);

  useEffect(() => {
    if (!map) return;
    
    const deckOverlay = new MapboxOverlay({
      layers: [],
    });
    
    map.addControl(deckOverlay);
    setOverlay(deckOverlay);

    return () => {
      map.removeControl(deckOverlay);
    };
  }, [map]);

  useEffect(() => {
    if (!overlay) return;

    const layer = new IconLayer({
      id: 'flight-icons',
      data: flights,
      pickable: true,
      iconAtlas: '/plane-icon.png',
      iconMapping: { marker: { x: 0, y: 0, width: 128, height: 128, mask: true } },
      getIcon: () => 'marker',
      sizeScale: 20,
      getPosition: (d: Flight) => [d.lon ?? 0, d.lat ?? 0, d.altitude ?? 0],
      getSize: 8,
      getColor: (d: Flight) => (d.altitude && d.altitude > 10000 ? [255, 215, 0] : [0, 255, 255]),
      getAngle: (d: Flight) => (d.heading ?? 0) - 90,
      billboard: false,
    });

    overlay.setProps({ layers: [layer] });
  }, [overlay, flights]);

  return null;
}
