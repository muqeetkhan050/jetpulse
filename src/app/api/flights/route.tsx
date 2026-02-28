

// import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const bbox = searchParams.get('bbox');

//     const url = new URL('https://opensky-network.org/api/states/all');

//     // If bbox is provided, use it; otherwise use Australia as default
//     if (bbox) {
//       const [lamin, lomin, lamax, lomax] = bbox.split(',');
//       url.searchParams.set('lamin', lamin);
//       url.searchParams.set('lomin', lomin);
//       url.searchParams.set('lamax', lamax);
//       url.searchParams.set('lomax', lomax);
//       console.log('[API] Using bbox:', { lamin, lomin, lamax, lomax });
//     } else {
//       // Default to Australia
//       url.searchParams.set('lamin', '-43.6');
//       url.searchParams.set('lomin', '113.0');
//       url.searchParams.set('lamax', '-10.0');
//       url.searchParams.set('lomax', '154.0');
//       console.log('[API] Using default Australia bbox');
//     }

//     const headers: HeadersInit = {};

    
//     const res = await fetch(url.toString(), { 
//       headers,
//       next: { revalidate: 10 }
//     });

//     if (res.status === 429) {
//       return NextResponse.json({ error: 'Rate limited - try again later' }, { status: 429 });
//     }
//     if (res.status === 401) {
//       return NextResponse.json({ error: 'Unauthorized - check credentials' }, { status: 401 });
//     }
//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(`HTTP ${res.status}: ${text}`);
//     }

//     const data = await res.json();
//     console.log(`[API] Got ${data.states?.length || 0} flights`);

//     if (!data.states?.length) {
//       return NextResponse.json([]);
//     }

//     const flights = data.states
//       .filter((f: any) => f[5] != null && f[6] != null)
//       .map((f: any) => ({
//         icao24: f[0],
//         callsign: f[1]?.trim() || 'Unknown',
//         originCountry: f[2],
//         lat: f[6],
//         lon: f[5],
//         altitude: f[7] ?? (f[8] ? 0 : null),
//         onGround: f[8],
//         velocity: f[9] ?? 0,
//         heading: f[10] ?? 0,
//         verticalRate: f[11],
//         lastContact: f[4],
//       }));

//     return NextResponse.json(flights);
//   } catch (err: any) {
//     console.error('[API] Error:', err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bbox = searchParams.get('bbox');

    const url = new URL('https://opensky-network.org/api/states/all');

    if (bbox) {
      const [lamin, lomin, lamax, lomax] = bbox.split(',');
      url.searchParams.set('lamin', lamin);
      url.searchParams.set('lomin', lomin);
      url.searchParams.set('lamax', lamax);
      url.searchParams.set('lomax', lomax);
      console.log('[API] Using bbox:', { lamin, lomin, lamax, lomax });
    } else {
      url.searchParams.set('lamin', '-43.6');
      url.searchParams.set('lomin', '113.0');
      url.searchParams.set('lamax', '-10.0');
      url.searchParams.set('lomax', '154.0');
      console.log('[API] Using default Australia bbox');
    }


    const headers: HeadersInit = {};

    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;

    if (username && password) {
      const encoded = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${encoded}`;
      console.log('[API] Using authenticated request');
    } else {
      console.warn('[API] No credentials — anonymous request (may be blocked on Vercel)');
    }

    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 10 }
    });


    if (res.status === 429) {
      return NextResponse.json({ error: 'Rate limited - try again later' }, { status: 429 });
    }
    if (res.status === 401) {
      return NextResponse.json({ error: 'Unauthorized - check credentials' }, { status: 401 });
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    console.log(`[API] Got ${data.states?.length || 0} flights`);

    if (!data.states?.length) {
      return NextResponse.json([]);
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
    console.error('[API] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
