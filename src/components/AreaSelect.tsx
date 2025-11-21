"use client";
import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { fetchBuoys } from "@/lib/api";

interface Area {
  id: string;
  name: string;
}

export default function AreaSelect() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getBuoys = async () => {
      try {
        const data: Area[] = await fetchBuoys();
        setAreas(data);
      } catch (err) {
        setError("Failed to load buoys");
      } finally {
        setLoading(false);
      }
    };
    getBuoys();
  }, []);

  return (
    <Select>
      <SelectTrigger className="w-[180px] bg-white rounded-full shadow-md">
        <SelectValue placeholder="Khu vực" />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="" disabled>
            Loading...
          </SelectItem>
        ) : (
          areas.map((area) => (
            <SelectItem key={area.id} value={area.id}>
              {area.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
