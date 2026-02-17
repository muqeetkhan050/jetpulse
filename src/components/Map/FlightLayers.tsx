

'use client';

import React from 'react';
import { DeckGL } from '@deck.gl/react';
import { IconLayer } from '@deck.gl/layers';
import {Flight} from '../../hooks/useFlights';

interface FlightLayersProps {
  flights: Flight[];
}

export default function FlightLayers({ flights }: FlightLayersProps) {
  const layers = [
    new IconLayer({
      id: 'flight-icons',
      data: flights,
      pickable: true,
      iconAtlas: '/plane-icon.png', // Place your plane icon in public folder
      iconMapping: { marker: { x: 0, y: 0, width: 128, height: 128, mask: true } },
      getIcon: () => 'marker',
      sizeScale: 15,
      getPosition: (d: Flight) => [d.lon ?? 0, d.lat ?? 0, d.altitude ?? 0],
      getSize: 5,
      getColor: (d: Flight) => (d.altitude && d.altitude > 10000 ? [255, 215, 0] : [0, 255, 255]),
    }),
  ];

  return (
    <DeckGL
      initialViewState={{
        longitude: 151.2093,
        latitude: -33.8688,
        zoom: 9,
        pitch: 55,
        bearing: 0,
      }}
      controller
      layers={layers}
     style={{
     position: 'absolute',
     top: '0px',
    left: '0px',
   width: '100%',   
        height: '100%',}}
    />
  );
}
