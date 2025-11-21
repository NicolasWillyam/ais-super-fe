"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistoryData {
  utcpos: number;
  distance: number;
  lon: number;
  lat: number;
  cog: string;
  sog: string;
  name: string;
}

// Hàm chuyển độ sang DMS
const toDMS = (deg: number, isLat: boolean) => {
  const d = Math.floor(deg);
  const minFloat = (deg - d) * 60;
  const m = Math.floor(minFloat);
  const s = ((minFloat - m) * 60).toFixed(2);
  const dir = isLat ? (deg >= 0 ? "N" : "S") : deg >= 0 ? "E" : "W";
  return `${Math.abs(d)}° ${m}′ ${s}″ ${dir}`;
};

// Hàm chuyển utcpos sang thời gian dễ đọc
const formatTime = (utcpos: number) => {
  return new Date(utcpos * 1000).toLocaleString("vi-VN", { hour12: false });
};

// Hàm chuyển quãng đường km sang km + hải lý
const formatDistance = (km: number) => {
  const nautical = (km / 1.852).toFixed(2);
  return `${km.toFixed(2)} km (${nautical} hải lý)`;
};

export default function HistoryRoutePage() {
  const [mmsi, setMmsi] = useState("");
  const [name, setName] = useState("");
  const [beginDate, setBeginDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [data, setData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [buoys, setBuoys] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData([]);

    try {
      const begin = beginDate ? Math.floor(beginDate.getTime() / 1000) : "";
      const end = endDate ? Math.floor(endDate.getTime() / 1000) : "";

      const query = `mmsi=${mmsi}&name=${name}&calsign=&imo=&begin=${begin}&end=${end}&async=0&_=${Date.now()}`;
      // const res = await fetch(`https://ais-super-601ce338d685.herokuapp.com/ais/historyroute?${query}`);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ais/historyroute?${query}`
      );
      // http://localhost:9001
      const json = await res.json();

      if (json.Response && Array.isArray(json.Response[0])) {
        // setData(json.Response[0]);
        let result = json.Response[0];

        // Lọc theo thời gian nếu người dùng chọn
        if (timeGap > 0) {
          const filtered = [];
          let lastTime = 0;

          for (const item of result) {
            if (lastTime === 0 || item.utcpos - lastTime >= timeGap) {
              filtered.push(item);
              lastTime = item.utcpos;
            }
          }

          result = filtered;
        }

        setRawData(result);
        setData(result);
      } else {
        setError("Không có dữ liệu");
      }
    } catch (err) {
      setError("Lỗi khi gọi API");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (data.length === 0) return;

    // Chuẩn bị dữ liệu với tên cột chuẩn
    const wsData = data.map((item) => ({
      "Thời gian": formatTime(item.utcpos),
      "Vị trí": `${toDMS(item.lat, true)} ${toDMS(item.lon, false)}`,
      "Hướng (˚)": item.cog,
      "Tốc độ (knots)": item.sog,
      "Quãng đường": formatDistance(item.distance),
    }));

    // Tạo worksheet
    const ws = XLSX.utils.json_to_sheet(wsData);

    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HistoryRoute");

    // Xuất file
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    saveAs(blob, `HistoryRoute_${Date.now()}.xlsx`);
  };

  const [timeGap, setTimeGap] = useState(0);

  useEffect(() => {
    if (timeGap === 0) {
      setData(rawData);
    } else {
      const filtered: any[] = [];
      let lastTime = 0;
      for (const item of rawData) {
        if (lastTime === 0 || item.utcpos - lastTime >= timeGap) {
          filtered.push(item);
          lastTime = item.utcpos;
        }
      }
      setData(filtered);
    }
  }, [timeGap, rawData]);

  return (
    <div className="py-6 relative pl-16">
      <div className="px-6 pr-12 fixed w-[calc(100vw-64px)] top-0 bg-white z-10 shadow-lg h-16 py-3.5">
        {/* <h1 className="text-2xl font-bold mb-4">Tìm kiếm History Route</h1> */}

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit(e as any);
          }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <Label className="">MMSI:</Label>
              <Input
                className="w-32"
                value={mmsi}
                onChange={(e) => setMmsi(e.target.value)}
                placeholder="Ví dụ: 574792499"
              />
            </div>

            {/* Date Picker Begin */}
            <div className="flex gap-2">
              <Label className="pl-2">Begin:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-44 justify-start text-left"
                  >
                    {beginDate
                      ? beginDate.toLocaleDateString()
                      : "Chọn ngày bắt đầu"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={beginDate}
                    onSelect={setBeginDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Picker End */}
            <div className="flex gap-2">
              <Label className="pl-2">End:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-44 justify-start text-left"
                  >
                    {endDate
                      ? endDate.toLocaleDateString()
                      : "Chọn ngày kết thúc"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Khoảng thời gian:</Label>
              <Select
                value={timeGap.toString()}
                onValueChange={(val) => setTimeGap(Number(val))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Chọn khoảng cách" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Không lọc</SelectItem>
                  <SelectItem value="60">1 phút</SelectItem>
                  <SelectItem value="180">3 phút</SelectItem>
                  <SelectItem value="300">5 phút</SelectItem>
                  <SelectItem value="600">10 phút</SelectItem>
                  <SelectItem value="900">15 phút</SelectItem>
                  <SelectItem value="1800">30 phút</SelectItem>
                  <SelectItem value="2700">45 phút</SelectItem>
                  <SelectItem value="3600">1 giờ</SelectItem>
                  <SelectItem value="8100">3 giờ</SelectItem>
                  <SelectItem value="16200">6 giờ</SelectItem>
                  <SelectItem value="24300">9 giờ</SelectItem>
                  <SelectItem value="32400">12 giờ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant={"secondary"}
              className="border"
              disabled={loading}
            >
              <Search /> {loading ? "Đang tải..." : "Tìm kiếm"}
              <span className="px-2 py-1 rounded-sm border text-xs bg-white">
                Enter
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {data.length > 0 && (
              <Button className="has-[>svg]:px-4" onClick={exportToExcel}>
                <Download /> <p className="text-sm">Export</p>
              </Button>
            )}
          </div>
        </form>
      </div>
      {loading && (
        <div className="h-screen w-[calc(100vw-80px)] flex items-center justify-center">
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
      )}

      <div className="pt-12">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {data.length > 0 && (
          <div className="w-[calc(100vw-80px)]">
            <p className="text-sm text-center my-1 mb-2">
              (Lưu ý: Hệ thống chỉ hiển thị 1000 bản ghi đầu tiên, tải xuống
              file xlsx để theo dõi toàn bộ dữ liệu.)
            </p>
            <Table>
              <TableHeader className="text-[13px] border-t h-10 ">
                <TableRow>
                  <TableHead className="px-4 border-l"></TableHead>
                  <TableHead className="px-4 border-l">Thời gian</TableHead>
                  <TableHead className="px-4 border-l">Vị trí</TableHead>
                  <TableHead className="px-4 border-l">Hướng (˚)</TableHead>
                  <TableHead className="px-4 border-l">
                    Tốc độ (knots)
                  </TableHead>
                  <TableHead className="px-4 border-l">Quãng đường</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-[13px] border-b">
                {data.slice(0, 1000).map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-center">{idx + 1}</TableCell>
                    <TableCell className="px-4 h-10 border-l">
                      {formatTime(item.utcpos)}
                    </TableCell>
                    <TableCell className="px-4 h-10 border-l">{`${toDMS(
                      item.lat,
                      true
                    )} ${toDMS(item.lon, false)}`}</TableCell>
                    <TableCell className="px-4 h-10 border-l">
                      {item.cog}
                    </TableCell>
                    <TableCell className="px-4 h-10 border-l">
                      {item.sog}
                    </TableCell>
                    <TableCell className="px-4 h-10 border-l">
                      {formatDistance(item.distance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
