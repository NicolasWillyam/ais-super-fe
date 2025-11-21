// src/components/BuoySelect.tsx
import React, { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // điều chỉnh theo project của bạn

import { LifeBuoy, MapPin } from "lucide-react";
import { fetchBuoys } from "@/lib/api";

interface Buoy {
  id: number;
  name: string;
  area: string;
  lat: string;
  lng: string;
}

interface Area {
  id: string;
  name: string;
}

interface BuoySelectProps {
  onSelectBuoy?: (lat: number, lng: number) => void;
}

const BuoySelect: React.FC<BuoySelectProps> = ({ onSelectBuoy }) => {
  const [buoys, setBuoys] = useState<Buoy[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | undefined>(
    undefined
  );
  const [filteredBuoys, setFilteredBuoys] = useState<Buoy[]>([]);
  const [selectedBuoy, setSelectedBuoy] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleSelectBuoy = (buoyName: string) => {
    setSelectedBuoy(buoyName);
    const buoy = filteredBuoys.find((b) => b.name === buoyName);
    console.log("buoy :", buoy);
    if (buoy && onSelectBuoy) {
      onSelectBuoy(parseFloat(buoy.lat), parseFloat(buoy.lng));
    }
  };

  useEffect(() => {
    const getBuoys = async () => {
      try {
        const data: Buoy[] = await fetchBuoys();
        setBuoys(data);

        // Lấy danh sách khu vực duy nhất
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

  useEffect(() => {
    if (selectedArea) {
      setFilteredBuoys(buoys.filter((b) => b.area === selectedArea));
      setSelectedBuoy(undefined); // reset chọn phao khi đổi khu vực
    } else {
      setFilteredBuoys([]);
    }
  }, [selectedArea, buoys]);

  if (loading) return <p>Loading buoys...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex gap-4">
      {/* Select khu vực như trước */}
      <Select value={selectedArea} onValueChange={setSelectedArea}>
        <SelectTrigger className="w-[180px] bg-white rounded-full shadow-md">
          <div className="flex items-center gap-2">
            <MapPin />
            <SelectValue placeholder="Chọn khu vực" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {areas.map((area) => (
            <SelectItem className="rounded-lg" key={area} value={area}>
              {area}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Select phao */}
      {selectedArea && (
        <Select
          value={selectedBuoy}
          onValueChange={handleSelectBuoy}
          disabled={!selectedArea}
        >
          <SelectTrigger className="w-36 bg-white rounded-full shadow-md">
            <div className="flex items-center gap-2">
              <LifeBuoy />
              <SelectValue placeholder="Chọn phao" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {filteredBuoys.map((buoy) => (
              <SelectItem
                className="rounded-lg"
                key={buoy.id}
                value={buoy.name}
              >
                {buoy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default BuoySelect;
