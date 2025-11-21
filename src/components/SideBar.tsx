"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Map, Sheet } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const isHistory = pathname === "/history";
  const isAnalysis = pathname === "/analysis";

  return (
    <div className="w-16 sidebar h-screen bg-white border-r fixed left-0 z-[999] flex flex-col items-center py-3">
      <div className="font-bold text-xl pb-0.5 border w-10 h-10 flex items-center justify-center rounded-lg shadow">
        AIS
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t py-2">
        {/* HISTORY BUTTON */}
        <Link href="/history">
          <Button
            variant={"secondary"}
            className={`h-10 w-10 rounded-lg ${
              isHistory
                ? "bg-blue-500 text-white hover:text-black cursor-pointer"
                : ""
            }`}
            size="icon"
          >
            <Sheet />
          </Button>
        </Link>

        {/* ANALYSIS BUTTON */}
        <Link href="/analysis">
          <Button
            variant={"secondary"}
            className={`h-10 w-10 rounded-lg ${
              isAnalysis
                ? "bg-blue-500 text-white hover:text-black cursor-pointer"
                : ""
            }`}
            size="icon"
          >
            <Map />
          </Button>
        </Link>
      </div>
    </div>
  );
}
