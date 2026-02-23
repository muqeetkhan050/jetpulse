import { NextResponse } from 'next/server';

const MOCK_FLIGHTS = [
  { icao24: '7c6b0a', callsign: 'QFA123', originCountry: 'Australia', lat: -33.9399, lon: 151.1753, altitude: 0, onGround: true, velocity: 0, heading: 45, verticalRate: 0, lastContact: Date.now() },
  { icao24: '7c6b0b', callsign: 'QFA456', originCountry: 'Australia', lat: -33.9350, lon: 151.1800, altitude: 500, onGround: false, velocity: 150, heading: 90, verticalRate: 5, lastContact: Date.now() },
  { icao24: '7c6b0c', callsign: 'JST789', originCountry: 'Australia', lat: -33.9450, lon: 151.1700, altitude: 1200, onGround: false, velocity: 250, heading: 180, verticalRate: 8, lastContact: Date.now() },
  { icao24: '7c6b0d', callsign: 'VOZ321', originCountry: 'Australia', lat: -33.9200, lon: 151.1600, altitude: 5000, onGround: false, velocity: 400, heading: 270, verticalRate: 0, lastContact: Date.now() },
  { icao24: '7c6b0e', callsign: 'QFA999', originCountry: 'Australia', lat: -33.9600, lon: 151.1900, altitude: 8000, onGround: false, velocity: 450, heading: 0, verticalRate: 0, lastContact: Date.now() },
];

export async function GET() {
  try {
    const url = new URL('https://opensky-network.org/api/states/all');
    url.searchParams.set('lamin', '-34.2');
    url.searchParams.set('lomin', '150.8');
    url.searchParams.set('lamax', '-33.7');
    url.searchParams.set('lomax', '151.4');

    const headers: HeadersInit = {};
    
    if (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) {
      const auth = Buffer.from(
        `${process.env.OPENSKY_USERNAME}:${process.env.OPENSKY_PASSWORD}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    console.log('[API] Fetching:', url.toString());
    
    const res = await fetch(url.toString(), { 
      headers,
      next: { revalidate: 10 }
    });

    if (res.status === 429 || res.status === 401 || !res.ok) {
      console.log('[API] OpenSky unavailable, using mock data');
      return NextResponse.json(MOCK_FLIGHTS);
    }

    const data = await res.json();
    console.log(`[API] Got ${data.states?.length || 0} states`);

    if (!data.states?.length) {
      return NextResponse.json(MOCK_FLIGHTS);
    }

    const flights = data.states
      .filter((f: any) => f[5] != null && f[6] != null)
      .map((f: any) => ({
        icao24: f[0],
        callsign: f[1]?.trim() || 'Unknown',
        originCountry: f[2],
        lat: f[6],
        lon: f[5],
        altitude: f[7] ?? (f[8] ? 0 : null),
        onGround: f[8],
        velocity: f[9] ?? 0,
        heading: f[10] ?? 0,
        verticalRate: f[11],
        lastContact: f[4],
      }));

    return NextResponse.json(flights);
  } catch (err: any) {
    console.error('[API] Error, using mock:', err);
    return NextResponse.json(MOCK_FLIGHTS);
  }
}
