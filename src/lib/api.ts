import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://ais-super-fbb7310b3b65.herokuapp.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchBuoys = async () => {
  try {
    const response = await api.get("/buoys");
    return response.data;
  } catch (error) {
    console.error("Error fetching buoys:", error);
    throw error;
  }
};
