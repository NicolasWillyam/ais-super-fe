// services/ais.ts
import axios from "axios";

const api = axios.create({
  baseURL: "", // gọi qua BE proxy
  headers: { "Content-Type": "application/json" },
});

export const fetchHistoryRoute = async (params: Record<string, any>) => {
  const response = await api.get("/ais/historyroute", { params });
  return response.data;
};

export const fetchBuoys = async () => {
  const response = await api.get("/buoys");
  return response.data;
};
