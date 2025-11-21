import { NextRequest, NextResponse } from "next/server";
import { fetchBuoys } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const data = await fetchBuoys();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch buoys" },
      { status: 500 }
    );
  }
}
