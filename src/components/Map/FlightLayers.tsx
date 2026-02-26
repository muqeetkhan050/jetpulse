
// 'use client';
// import { useEffect, useContext, useRef, useMemo, useState } from 'react';
// import { MapboxOverlay } from '@deck.gl/mapbox';
// import { PathLayer } from '@deck.gl/layers';
// import { ScenegraphLayer } from '@deck.gl/mesh-layers';
// import { Flight } from '@/hooks/useFlights';
// import { MapContext } from './Map';

// interface FlightLayersProps {
//   flights: Flight[];
//   trails?: { icao24: string; path: [number, number, number][] }[];
//   onPlaneClick?: (flight: Flight) => void;
//   selectedFlight?: Flight | null;
// }

// const AIRPLANE_GLB =
//   'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';

// function getAltitudeColor(altitude: number): [number, number, number, number] {
//   const maxAltitude = 10000;
//   const normalized = Math.min(altitude / maxAltitude, 1);
//   return [Math.round(255 * normalized), Math.round(255 * (1 - normalized)), 0, 255];
// }

// function getPlaneOrientation(flight: Flight): [number, number, number] {
//   const heading = flight.heading || 0;
//   const verticalRate = (flight as any).verticalRate ?? (flight as any).vertical_rate ?? 0;
//   const pitchDeg = flight.onGround ? 0 : Math.max(-20, Math.min(20, (verticalRate / 10) * 15));
//   return [-pitchDeg, 90 - heading, 90];
// }

// export default function FlightLayers({
//   flights,
//   trails = [],
//   onPlaneClick,
//   selectedFlight,
// }: FlightLayersProps) {
//   const { map, styleLoaded } = useContext(MapContext);

//   // Overlay is stored in a ref — created ONCE, never recreated
//   const overlayRef = useRef<MapboxOverlay | null>(null);

//   // Track map zoom level to scale planes dynamically
//   const [zoom, setZoom] = useState<number>(5);

//   // Listen to zoom changes on the map
//   useEffect(() => {
//     if (!map) return;
//     const onZoom = () => setZoom(map.getZoom());
//     map.on('zoom', onZoom);
//     setZoom(map.getZoom()); // set initial zoom
//     return () => {
//       map.off('zoom', onZoom);
//     };
//   }, [map]);

//   // Create overlay once when map is first ready
//   useEffect(() => {
//     if (!map) return;
//     if (overlayRef.current) return; // already created

//     const overlay = new MapboxOverlay({ layers: [] });
//     map.addControl(overlay as any);
//     overlayRef.current = overlay;

//     // cleanup only on full unmount
//     return () => {
//       try { map.removeControl(overlayRef.current as any); } catch (_) {}
//       overlayRef.current = null;
//     };
//   }, [map]);

//   // Compute sizeScale based on zoom:
//   // As zoom increases (zoomed in), sizeScale shrinks so planes appear smaller.
//   // Tweak the multiplier (300) and the floor (Math.max(2, ...)) to your liking.
//   const sizeScale = useMemo(() => {
//     return Math.max(2, 300 / Math.pow(2, zoom));
//   }, [zoom]);

//   const layers = useMemo(() => {
//     // When style is reloading, return empty layers — don't crash
//     if (!styleLoaded) return [];

//     const scenegraphLayer = new ScenegraphLayer({
//       id: 'flights-3d',
//       data: flights,
//       pickable: true,
//       scenegraph: AIRPLANE_GLB,
//       getPosition: (d: Flight) => [d.lon, d.lat, (d.altitude || 0) * 0.3],
//       sizeScale,               // dynamic — shrinks as zoom increases
//       sizeMinPixels: 0.7,
//       getOrientation: (d: Flight) => getPlaneOrientation(d),
//       _lighting: 'pbr',
//       getColor: (d: Flight) => {
//         if (selectedFlight && d.icao24 === selectedFlight.icao24) return [255, 220, 0, 255];
//         if (d.onGround) return [0, 255, 100, 255];
//         const c = getAltitudeColor(d.altitude || 0);
//         return [c[0], c[1], c[2], 220];
//       },
//       onClick: (info: any) => {
//         if (onPlaneClick && info.object) onPlaneClick(info.object as Flight);
//       },
//       updateTriggers: {
//         getOrientation: flights.map(f => `${f.icao24}-${f.heading}-${(f as any).verticalRate}`),
//         getColor: [selectedFlight?.icao24],
//       },
//     });

//     const trailsToShow = selectedFlight
//       ? trails.filter(t => t.icao24 === selectedFlight.icao24 && t.path.length > 1)
//       : [];

//     const trailLayer = new PathLayer({
//       id: 'trails',
//       data: trailsToShow,
//       getPath: (d) => d.path,
//       getColor: (d: any, { index }: { index: number }) => {
//         if (!d.path?.[index]) return [255, 255, 255, 255];
//         return getAltitudeColor(d.path[index][2] || 0);
//       },
//       getWidth: 4,
//       widthMinPixels: 3,
//       widthMaxPixels: 8,
//       rounded: true,
//     });

//     return [trailLayer, scenegraphLayer];
//   }, [flights, trails, styleLoaded, onPlaneClick, selectedFlight, sizeScale]);

//   // Just update layers on the existing overlay — never remove/recreate it
//   useEffect(() => {
//     if (!overlayRef.current) return;
//     try {
//       overlayRef.current.setProps({ layers });
//     } catch (e) {
//       console.warn('[FlightLayers] setProps skipped:', e);
//     }
//   }, [layers]);

//   return null;
// }

'use client';
import { useEffect, useContext, useRef, useMemo, useState } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { PathLayer } from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { Flight} from '@/hooks/useFlights';
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpHeading(a: number, b: number, t: number) {
  const delta = ((b - a + 540) % 360) - 180;
  return (a + delta * t + 360) % 360;
}

interface FlightSnapshot {
  lat: number;
  lon: number;
  altitude: number;
  heading: number;
}

export default function FlightLayers({
  flights,
  trails = [],
  onPlaneClick,
  selectedFlight,
}: FlightLayersProps) {
  const { map, styleLoaded } = useContext(MapContext);

  const overlayRef = useRef<MapboxOverlay | null>(null);
  // Bump this counter to force overlay recreation after style change
  const [overlayVersion, setOverlayVersion] = useState(0);

  const [zoom, setZoom] = useState<number>(5);
  const [interpolatedFlights, setInterpolatedFlights] = useState<Flight[]>(flights);

  const prevSnapshotRef = useRef<Map<string, FlightSnapshot>>(new Map());
  const nextSnapshotRef = useRef<Map<string, FlightSnapshot>>(new Map());
  const interpolationStartRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  // ─── Overlay lifecycle ────────────────────────────────────────────────────
  // Recreate overlay whenever styleLoaded flips back to true (style change)
  // overlayVersion is bumped on style change to force this effect to re-run
  useEffect(() => {
    if (!map || !styleLoaded) return;

    // Tear down any existing overlay cleanly
    if (overlayRef.current) {
      try { map.removeControl(overlayRef.current as any); } catch (_) {}
      overlayRef.current = null;
    }

    // Wait one frame for Mapbox to fully initialise the new GL context
    const raf = requestAnimationFrame(() => {
      const overlay = new MapboxOverlay({ layers: [] });
      try {
        map.addControl(overlay as any);
        overlayRef.current = overlay;
      } catch (e) {
        console.warn('[FlightLayers] addControl failed:', e);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      if (overlayRef.current) {
        try { map.removeControl(overlayRef.current as any); } catch (_) {}
        overlayRef.current = null;
      }
    };
  }, [map, styleLoaded, overlayVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Style change detection ───────────────────────────────────────────────
  // When Mapbox starts loading a new style, styleLoaded goes false → true.
  // We listen for 'styledata' to bump overlayVersion and force overlay recreation.
  useEffect(() => {
    if (!map) return;

    const onStyleData = () => {
      // Only bump when a full style swap happens (not just tile updates)
      if (!map.isStyleLoaded()) {
        setOverlayVersion(v => v + 1);
      }
    };

    map.on('styledata', onStyleData);
    return () => { map.off('styledata', onStyleData); };
  }, [map]);

  // ─── Zoom tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoom', onZoom);
    setZoom(map.getZoom());
    return () => { map.off('zoom', onZoom); };
  }, [map]);

  // ─── Interpolation snapshots ──────────────────────────────────────────────
  useEffect(() => {
    if (flights.length === 0) return;

    const newPrev = new Map<string, FlightSnapshot>();
    setInterpolatedFlights(current => {
      current.forEach(f => {
        newPrev.set(f.icao24, {
          lat: f.lat, lon: f.lon,
          altitude: f.altitude ?? 0,
          heading: f.heading,
        });
      });
      return current;
    });

    const newNext = new Map<string, FlightSnapshot>();
    flights.forEach(f => {
      newNext.set(f.icao24, {
        lat: f.lat, lon: f.lon,
        altitude: f.altitude ?? 0,
        heading: f.heading || 0,
      });
    });

    prevSnapshotRef.current = newPrev;
    nextSnapshotRef.current = newNext;
    interpolationStartRef.current = Date.now();
  }, [flights]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Animation loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const animate = () => {
      const t = Math.min(
        (Date.now() - interpolationStartRef.current) ,
        1
      );

      setInterpolatedFlights(
        flights.map(flight => {
          const prev = prevSnapshotRef.current.get(flight.icao24);
          const next = nextSnapshotRef.current.get(flight.icao24);
          if (!prev || !next) return flight;
          return {
            ...flight,
            lat: lerp(prev.lat, next.lat, t),
            lon: lerp(prev.lon, next.lon, t),
            altitude: lerp(prev.altitude, next.altitude ?? 0, t),
            heading: lerpHeading(prev.heading, next.heading, t),
          };
        })
      );

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [flights]);

  // ─── Dynamic size ─────────────────────────────────────────────────────────
  const sizeScale = useMemo(() => Math.max(2, 300 / Math.pow(2, zoom)), [zoom]);

  // ─── Build layers — only when style is fully loaded ───────────────────────
  const layers = useMemo(() => {
    // Hard guard: do not build layers until style + overlay are both ready
    if (!styleLoaded) return [];

    const scenegraphLayer = new ScenegraphLayer({
      id: 'flights-3d',
      data: interpolatedFlights,
      pickable: true,
      scenegraph: AIRPLANE_GLB,
      getPosition: (d: Flight) => [d.lon, d.lat, (d.altitude || 0) * 0.3],
      sizeScale,
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
        getPosition: interpolatedFlights.map(f => `${f.icao24}-${f.lat}-${f.lon}`),
        getOrientation: interpolatedFlights.map(f => `${f.icao24}-${f.heading}-${(f as any).verticalRate}`),
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
  }, [interpolatedFlights, trails, styleLoaded, onPlaneClick, selectedFlight, sizeScale]);

  // ─── Push layers to overlay ───────────────────────────────────────────────
  useEffect(() => {
    if (!overlayRef.current) return;

    // If style is not ready, clear layers instead of crashing
    if (!styleLoaded) {
      try { overlayRef.current.setProps({ layers: [] }); } catch (_) {}
      return;
    }

    try {
      overlayRef.current.setProps({ layers });
    } catch (e) {
      console.warn('[FlightLayers] setProps skipped:', e);
    }
  }, [layers, styleLoaded]);

  return null;
}