import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { mmsi, buoy_id, start_time, end_time, radius } = req.query;

    const url =
      "https://0dddf5f833f7.ngrok-free.app/ais/buoy-activity?" +
      new URLSearchParams({
        mmsi: mmsi as string,
        buoy_id: buoy_id as string,
        start_time: start_time as string,
        end_time: end_time as string,
        radius: radius as string,
      });

    const response = await axios.get(url, {
      headers: { "Content-Type": "application/json" },
    });

    res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Error fetching buoy activity via proxy:", err.message);
    res.status(500).json({ error: err.message });
  }
}
