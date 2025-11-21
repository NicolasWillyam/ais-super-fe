"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time";
import Map from "@/components/Map";
import {
  Search,
  LifeBuoy,
  MapPin,
  RulerDimensionLine,
  X,
  Clock,
} from "lucide-react";

import dynamic from "next/dynamic";
const AnalysisMap = dynamic(() => import("@/components/AnalysisMap"), {
  ssr: false,
});

import { Button } from "@/components/ui/button";
import { fetchBuoys } from "@/lib/api";

interface Buoy {
  id: string; // UUID từ API
  name: string;
  area: string;
  lat: string;
  lng: string;
}

const AnalysisPage = () => {
  const [buoys, setBuoys] = useState<Buoy[]>([]);
  const [polylinePoints, setPolylinePoints] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | undefined>();
  const [selectedBuoy, setSelectedBuoy] = useState<string | undefined>();
  const [filteredBuoys, setFilteredBuoys] = useState<Buoy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingScan, setLoadingScan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [center, setCenter] = useState({ lat: 19.984694, lng: 106.219028 });
  const mapRef = useRef<google.maps.Map | null>(null);

  const [mmsi, setMmsi] = useState<string>("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [radius, setRadius] = useState<number>(100);

  const [analysisData, setAnalysisData] = useState<any | null>(null);

  const [circleCenter, setCircleCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [circleRadius, setCircleRadius] = useState<number>(100); // mặc định 100m

  // Load map instance
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // Fetch buoys
  useEffect(() => {
    const getBuoys = async () => {
      try {
        const data: Buoy[] = await fetchBuoys();
        setBuoys(data);

        const uniqueAreas = Array.from(new Set(data.map((b) => b.area)));
        setAreas(uniqueAreas);
      } catch (err) {
        setError("Failed to load buoys");
      } finally {
        setLoading(false);
      }
    };
    getBuoys();
  }, []);

  // Filter buoys khi chọn area
  useEffect(() => {
    if (selectedArea) {
      const filtered = buoys.filter((b) => b.area === selectedArea);
      setFilteredBuoys(filtered);
      setSelectedBuoy(undefined);
    } else {
      setFilteredBuoys([]);
      setSelectedBuoy(undefined);
    }
  }, [selectedArea, buoys]);

  useEffect(() => {
    if (circleCenter) {
      setCircleRadius(radius);
    }
  }, [radius, circleCenter]);
  // Khi chọn phao
  const handleSelectBuoy = (buoyName: string) => {
    setSelectedBuoy(buoyName);
    const buoy = filteredBuoys.find((b) => b.name === buoyName);
    if (buoy) {
      const newCenter = {
        lat: parseFloat(buoy.lat),
        lng: parseFloat(buoy.lng),
      };
      setCenter(newCenter);
      setCircleCenter(newCenter); // vẽ vòng tròn quanh phao
      setCircleRadius(radius); // dùng radius hiện tại

      // Smooth pan
      if (mapRef.current) {
        mapRef.current.panTo(newCenter);
        mapRef.current.setZoom(14);
      }
    }
  };

  // Chuẩn bị payload và gọi API
  const handleSearch = async () => {
    // Kiểm tra đầy đủ thông tin
    if (!selectedArea || !selectedBuoy || !startTime || !endTime) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoadingScan(true);

    const buoy = filteredBuoys.find((b) => b.name === selectedBuoy);
    if (!buoy) return;

    const startUnix = Math.floor(startTime.getTime() / 1000);
    const endUnix = Math.floor(endTime.getTime() / 1000);

    // Payload (giữ để debug hoặc gửi POST nếu cần)
    const payload = {
      area: selectedArea,
      buoy_id: buoy.id,
      mmsi: mmsi,
      start_time: startUnix,
      end_time: endUnix,
      radius: radius,
    };
    console.log("Payload:", payload);

    // Chuẩn bị URL với query params
    const url =
      `${process.env.NEXT_PUBLIC_BASE_URL}/ais/buoy-activity?` +
      new URLSearchParams({
        mmsi: mmsi,
        buoy_id: buoy.id,
        start_time: startUnix.toString(),
        end_time: endUnix.toString(),
        radius: radius.toString(),
      });

    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log("API response:", data);
      setLoadingScan(false);

      setAnalysisData(data);

      // Vẽ polyline
      if (data.polyline && data.polyline.length > 0) {
        const points = data.polyline.map((p: { lat: number; lon: number }) => ({
          lat: p.lat,
          lng: p.lon,
        }));
        setPolylinePoints(points);

        // Optionally: center map on first point
        if (points.length > 0) setCenter(points[0]);
      }
    } catch (err) {
      console.error("Failed to fetch analysis data:", err);
    }
  };

  const markers = buoys.map((b) => ({
    lat: parseFloat(b.lat),
    lng: parseFloat(b.lng),
    label: `${b.area} - ${b.name}`,
  }));

  {
    loading && (
      <div className="h-screen w-[calc(100vw-80px)] flex items-center justify-center z-[999]">
        {loading && (
          <svg
            className="animate-spin h-4 w-4 text-"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        <p className="ml-2 text-sm">{loading && "Đang tải dữ liệu..."}</p>
      </div>
    );
  }
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full h-screen relative">
      <div className="absolute z-0">
        <AnalysisMap
          center={center}
          markers={markers}
          polyline={polylinePoints}
          circle={
            circleCenter
              ? { center: circleCenter, radius: circleRadius }
              : undefined
          }
        />
      </div>

      {loadingScan && (
        <div className="w-full absolute top-0 z-[9999] h-screen bg-black/50 text-white">
          <div className="h-screen w-[calc(100vw-80px)] flex items-center justify-center z-[999]">
            {loadingScan && (
              <svg
                className="animate-spin h-5 w-5 text-"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            <p className="ml-2 text-base">Đang phân tích dữ liệu...</p>
          </div>
        </div>
      )}

      <div className="w-full absolute top-0 z-[999]">
        <div className="rounded-full pl-20 py-3 flex gap-2 items-center">
          {/* MMSI input */}
          <div className="flex items-center gap-2 bg-white pl-3 border rounded-full shadow-md">
            <Search size={20} />
            <Input
              placeholder="MMSI"
              value={mmsi}
              onChange={(e) => setMmsi(e.target.value)}
              className="w-48 pl-0 h-11 bg-white rounded-full shadow-none border-none rounded-l-none"
            />
          </div>

          {/* Area select */}
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-[200px] bg-white rounded-full shadow-md">
              <div className="flex items-center gap-2">
                <MapPin />
                <SelectValue placeholder="Chọn khu vực" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {areas.map((area) => (
                <SelectItem key={area} value={area} className="rounded-lg">
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Buoy select */}
          {selectedArea && (
            <Select value={selectedBuoy} onValueChange={handleSelectBuoy}>
              <SelectTrigger className="w-36 bg-white rounded-full shadow-md">
                <div className="flex items-center gap-2">
                  <LifeBuoy />
                  <SelectValue placeholder="Chọn phao" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {filteredBuoys.map((b) => (
                  <SelectItem key={b.id} value={b.name} className="rounded-lg">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Thời gian chọn */}
          <DateTimePicker
            value={startTime}
            onChange={setStartTime}
            placeholder="Bắt đầu"
          />
          {/* <DateTimePicker
            value={endTime}
            onChange={setEndTime}
            placeholder="End time"
          /> */}

          <Select
            onValueChange={(val) => {
              const hours = Number(val);
              if (startTime) {
                const newEnd = new Date(
                  startTime.getTime() + hours * 3600 * 1000
                );
                setEndTime(newEnd);
              }
            }}
          >
            <SelectTrigger className="w-32 bg-white rounded-full shadow-md">
              <div className="flex items-center gap-2">
                <Clock />
                <SelectValue placeholder="Kết thúc" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {Array.from({ length: 24 }).map((_, i) => (
                <SelectItem
                  className="rounded-lg"
                  key={i + 1}
                  value={(i + 1).toString()}
                >
                  + {i + 1} giờ
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Radius select */}
          <Select
            value={radius.toString()}
            onValueChange={(val) => setRadius(Number(val))}
          >
            <SelectTrigger className="w-fit bg-white rounded-full shadow-md">
              <RulerDimensionLine />
              <SelectValue placeholder="Radius" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem className="rounded-lg" value="10">
                10m
              </SelectItem>
              <SelectItem className="rounded-lg" value="100">
                100m
              </SelectItem>
              <SelectItem className="rounded-lg" value="1000">
                1000m
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Button Search */}
          <Button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 h-9 rounded-full shadow-md hover:bg-blue-700"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="w-fit absolute top-20 left-20 z-[999]">
        {analysisData && (
          <div className="w-72 p-4 rounded-2xl border shadow-md bg-white analysis-panel relative">
            <X size={16} className="absolute top-3 right-3" />
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <strong>Tên Phao:</strong> {analysisData.buoy_name}
              </div>
              <div>
                <strong>Khu vực:</strong> {analysisData.area}
              </div>
              <div>
                <strong>Mã MMSI:</strong> {analysisData.mmsi}
              </div>
              <div>
                <strong>Bán kính vùng quét:</strong> {analysisData.radius} m
              </div>
              <div>
                <strong>Bên trong vùng quét hiện tại:</strong>{" "}
                {analysisData.inside_now ? "Có" : "Không"}
              </div>
              <div>
                <strong>
                  Tổng thời gian bên trong vùng quét: <br />
                </strong>{" "}
                {Math.floor(analysisData.total_time_inside_seconds / 60)} phút{" "}
                {analysisData.total_time_inside_seconds % 60} giây
              </div>

              <div>
                <strong>Tốc độ trung bình:</strong>{" "}
                {analysisData.average_speed_knots_inside} knots
              </div>
              <div>
                <strong>Số lần ra/vào:</strong> {analysisData.enter_exit_count}
              </div>
              <div>
                <strong>Khoảng cách gần phao nhất:</strong>{" "}
                {analysisData.nearest_distance_meters} m
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
