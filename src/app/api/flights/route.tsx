
// import { NextResponse } from 'next/server';

// let cachedToken: string | null = null;
// let tokenExpiry: number = 0;

// async function getAccessToken(): Promise<string> {
//   if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

//   const res = await fetch(
//     'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({
//         grant_type: 'client_credentials',
//         client_id: process.env.OPENSKY_CLIENT_ID!,
//         client_secret: process.env.OPENSKY_CLIENT_SECRET!,
//       }),
//     }
//   );

//   if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  
//   const data = await res.json();
//   cachedToken = data.access_token;
//   tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
//   return cachedToken!;
// }

// export async function GET() {
//   try {
//     // ✅ FIXED: Removed space in URL
//     const url = new URL('https://opensky-network.org/api/states/all');
//     url.searchParams.set('lamin', '-34.2');
//     url.searchParams.set('lomin', '150.8');
//     url.searchParams.set('lamax', '-33.7');
//     url.searchParams.set('lomax', '151.4');

//     const headers: HeadersInit = {};
    
//     if (process.env.OPENSKY_CLIENT_ID && process.env.OPENSKY_CLIENT_SECRET) {
//       const token = await getAccessToken();
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     console.log('[API] Fetching:', url.toString());
    
//     const res = await fetch(url.toString(), { 
//       headers, 
//       next: { revalidate: 0 } // Disable cache
//     });

//     if (res.status === 429) {
//       return NextResponse.json({ error: 'Rate limited - try again later' }, { status: 429 });
//     }
//     if (res.status === 401) {
//       return NextResponse.json({ error: 'Unauthorized - check credentials' }, { status: 401 });
//     }
//     if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

//     const data = await res.json();
//     console.log(`[API] Got ${data.states?.length || 0} states`);

//     if (!data.states?.length) {
//       return NextResponse.json([]); // Empty but valid
//     }

//     const flights = data.states
//       .filter((f: any) => f[5] != null && f[6] != null) // lon and lat exist
//       .map((f: any) => ({
//         icao24: f[0],
//         callsign: f[1]?.trim() || 'Unknown',
//         originCountry: f[2],
//         lat: f[6],
//         lon: f[5],
//         altitude: f[7] ?? (f[8] ? 0 : null), // baro_altitude or ground level
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

export async function GET() {
  try {
    const url = new URL('https://opensky-network.org/api/states/all');
    url.searchParams.set('lamin', '-34.2');
    url.searchParams.set('lomin', '150.8');
    url.searchParams.set('lamax', '-33.7');
    url.searchParams.set('lomax', '151.4');

    const headers: HeadersInit = {};
    
    // ✅ CORRECT: OpenSky uses Basic Auth, not OAuth Bearer tokens
    if (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) {
      const auth = Buffer.from(
        `${process.env.OPENSKY_USERNAME}:${process.env.OPENSKY_PASSWORD}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    console.log('[API] Fetching:', url.toString());
    
    const res = await fetch(url.toString(), { 
      headers,
      next: { revalidate: 10 } // Cache for 10 seconds
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
    console.log(`[API] Got ${data.states?.length || 0} states`);

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