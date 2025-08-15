"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: { lat: number; lng: number }[];
}

export default function Map({ center, zoom = 10, markers = [] }: MapProps) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={center}
        zoom={zoom}
      >
        {markers.map((m, idx) => (
          <Marker key={idx} position={m} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
