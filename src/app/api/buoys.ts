import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const url = "https://0dddf5f833f7.ngrok-free.app/buoys";

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Error fetching buoys via proxy:", err.message);
    res.status(500).json({ error: err.message });
  }
}
