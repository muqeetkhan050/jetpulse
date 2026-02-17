import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { lamin, lomin, lamax, lomax } = req.query;

    const response = await axios.get('https://opensky-network.org/api/states/all', {
      params: {
        lamin: lamin || -34.1,
        lomin: lomin || 150.5,
        lamax: lamax || -33.5,
        lomax: lomax || 151.5,
      },
      // Optional authentication if you have an OpenSky account
      // auth: { username: 'YOUR_USERNAME', password: 'YOUR_PASSWORD' }
    });

    res.status(200).json(response.data.states || []);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
}
