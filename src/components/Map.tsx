import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Circle,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MarkerType {
  lat: number;
  lng: number;
  label?: string;
}

interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerType[];
  polyline?: { lat: number; lng: number }[];
  circle?: { center: { lat: number; lng: number } | null; radius: number };
}

// Component để smooth pan
const MapUpdater: React.FC<{
  center: { lat: number; lng: number };
  zoom?: number;
}> = ({ center, zoom = 20 }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export default function Map({
  center,
  zoom = 20,
  markers = [],
  polyline = [],
  circle,
}: MapProps) {
  // Fix default icon Leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  return (
    <MapContainer center={center} zoom={zoom} className="w-screen min-h-screen">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapUpdater center={center} zoom={zoom} />

      {markers.map((m, idx) => (
        <Marker key={idx} position={m}>
          {m.label && <Popup>{m.label}</Popup>}
        </Marker>
      ))}

      {/* Vẽ Polyline nối các điểm */}
      {polyline.length > 0 && (
        <>
          <Polyline positions={polyline} color="red" weight={2} />
          {/* Vẽ từng điểm dưới dạng CircleMarker */}
          {polyline.map((p, idx) => (
            <CircleMarker
              key={idx}
              center={p}
              radius={3}
              pathOptions={{ color: "red", fillColor: "red", fillOpacity: 1 }}
            />
          ))}
        </>
      )}

      {/* Vòng tròn nếu có */}
      {circle?.center && circle.radius > 0 && (
        <Circle
          center={circle.center}
          radius={circle.radius}
          pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.2 }}
        />
      )}
    </MapContainer>
  );
}
