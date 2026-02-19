
// 'use client';

// import { useEffect, useContext, useState, useMemo } from 'react';
// import { MapboxOverlay } from '@deck.gl/mapbox';
// import { IconLayer, PathLayer } from '@deck.gl/layers';
// import { Flight } from '@/hooks/useFlights';
// import { MapContext } from './Map';

// interface FlightLayersProps {
//   flights: Flight[];
//   trails?: { icao24: string; path: [number, number, number][] }[];
// }



// export default function FlightLayers({ flights, trails = [] }: FlightLayersProps) {
//   const map = useContext(MapContext);
//   const [overlay, setOverlay] = useState<MapboxOverlay | null>(null);

//   useEffect(() => {
//     if (!map) return;
    
//     const deckOverlay = new MapboxOverlay({ layers: [] });
//     map.addControl(deckOverlay);
//     setOverlay(deckOverlay);

//     return () => {
//       map.removeControl(deckOverlay);
//     };
//   }, [map]);

//   // Memoize layers to prevent unnecessary updates
//   const layers = useMemo(() => {
//     if (!flights.length) return [];

//     const iconLayer = new IconLayer({
//       id: 'flights',
//       data: flights,
//       pickable: true,
//       iconAtlas: '/plane-icon.png',
//       iconMapping: {
//         airplane: { x: 0, y: 0, width: 24, height: 24, mask: true }
//       },
//       getIcon: () => 'airplane',
//       sizeScale: 2,
//       getPosition: (d: Flight) => [d.lon, d.lat, d.altitude || 0],
//       getSize: 20,
//       getColor: (d: Flight) => {
//         if (d.onGround) return [0, 255, 0]; // Green for ground
//         if ((d.altitude || 0) < 1000) return [255, 165, 0]; // Orange for low
//         return [0, 255, 255]; // Cyan for high
//       },
//       getAngle: (d: Flight) => d.heading - 90, // Adjust for icon orientation
//       billboard: false,
//       anchorY: 12,
//     });

//     const trailLayer = new PathLayer({
//       id: 'trails',
//       data: trails,
//       getPath: (d) => d.path,
//       getColor: [255, 255, 0, 200],
//       getWidth: 2,
//       widthMinPixels: 1,
//     });

//     return [iconLayer, trailLayer];
//   }, [flights, trails]);

//   useEffect(() => {
//     if (!overlay) return;
//     overlay.setProps({ layers });
//   }, [overlay, layers]);

//   return null;
// }



'use client';

import { useEffect, useContext, useState, useMemo } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { IconLayer, PathLayer } from '@deck.gl/layers';
import { Flight } from '@/hooks/useFlights';
import { MapContext } from './Map';

interface FlightLayersProps {
  flights: Flight[];
  trails?: { icao24: string; path: [number, number, number][] }[];
}

export default function FlightLayers({ flights, trails = [] }: FlightLayersProps) {
  const map = useContext(MapContext);
  const [overlay, setOverlay] = useState<MapboxOverlay | null>(null);

  // 1️⃣ Add deck.gl overlay to the map
  useEffect(() => {
    if (!map) return;

    const deckOverlay = new MapboxOverlay({ layers: [] });
    map.addControl(deckOverlay);
    setOverlay(deckOverlay);

    return () => {
      map.removeControl(deckOverlay);
    };
  }, [map]);

  // 2️⃣ Prepare layers (IconLayer for planes, PathLayer for trails)
  const layers = useMemo(() => {
    if (!map) return [];

    const iconLayer = new IconLayer({
      id: 'flights',
      data: flights,
      pickable: true,
      iconAtlas: '/plane-icon.png', // Place plane-icon.png in public folder
      iconMapping: {
        airplane: { x: 0, y: 0, width: 128, height: 128, mask: true }, // match PNG size
      },
      getIcon: () => 'airplane',
      getPosition: (d: Flight) => [d.lon, d.lat, d.altitude || 0],
      getSize: 64,
      sizeScale: 0.5, // adjust for proper visual size
      getColor: (d: Flight) => {
        if (d.onGround) return [0, 255, 0]; // green for grounded planes
        if ((d.altitude || 0) < 1000) return [255, 165, 0]; // orange for low
        return [0, 255, 255]; // cyan for high
      },
      getAngle: (d: Flight) => d.heading - 90, // rotate based on heading
      billboard: true, // always face camera
      anchorY: 64, // half of icon height
    });

    const trailLayer = new PathLayer({
      id: 'trails',
      data: trails,
      getPath: (d) => d.path,
      getColor: [255, 255, 0, 200],
      getWidth: 2,
      widthMinPixels: 1,
    });

    return [iconLayer, trailLayer];
  }, [flights, trails, map]);

  // 3️⃣ Apply layers to deck.gl overlay
  useEffect(() => {
    if (!overlay) return;
    overlay.setProps({ layers });
  }, [overlay, layers]);

  return null;
}
