import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planeId = searchParams.get('planeId');

  if (!planeId) {
    return NextResponse.json({ error: 'planeId required' }, { status: 400 });
  }

  // Proxy to OpenSky to get plane details
  const url = `https://opensky-network.org/api/states/all?icao24=${planeId}`;
  
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.states || data.states.length === 0) {
      return NextResponse.json({ error: 'Plane not found' }, { status: 404 });
    }
    
    const state = data.states[0];
    
    return NextResponse.json({
      icao24: state[0],
      callsign: state[1]?.trim() || 'Unknown',
      originCountry: state[2],
      lat: state[6],
      lon: state[5],
      altitude: state[7],
      velocity: state[9],
      heading: state[10],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
