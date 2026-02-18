
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Sydney area bounding box
    const lamin = '-34.2';
    const lomin = '150.8';
    const lamax = '-33.7';
    const lomax = '151.4';

    const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    
    console.log(`[API] Fetching from: ${url}`);

    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000), // increased to 30s
    });

    console.log(`[API] Response status: ${res.status}`);

    if (res.status === 429) {
      return NextResponse.json({ error: 'Rate limited by OpenSky' }, { status: 429 });
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.states || data.states.length === 0) {
      return NextResponse.json([]);
    }

    const flights = data.states
      .filter((f: any) => f[6] != null && f[5] != null)
      .map((f: any) => ({
        icao24: f[0],
        callsign: f[1]?.trim() || '',
        lat: f[6],
        lon: f[5],
        altitude: f[7] ?? 0,
        velocity: f[9] ?? 0,
        heading: f[10] ?? 0,
      }));

    console.log(`[API] Returning ${flights.length} flights`);
    return NextResponse.json(flights);

  } catch (err: any) {
    console.error('[API] Error fetching flights:', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch flights', details: err.message },
      { status: 500 }
    );
  }
}
