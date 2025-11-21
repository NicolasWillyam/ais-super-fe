"use client";

import React, { useRef, useEffect } from "react";
import Map from "./Map";

interface Props {
  center: { lat: number; lng: number };
  markers: { lat: number; lng: number; label: string }[];
  polyline: { lat: number; lng: number }[];
  circle?: { center: { lat: number; lng: number }; radius: number };
}

export default function AnalysisMap({
  center,
  markers,
  polyline,
  circle,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  return (
    <Map
      center={center}
      markers={markers}
      polyline={polyline}
      circle={circle}
      zoom={14}
    />
  );
}
