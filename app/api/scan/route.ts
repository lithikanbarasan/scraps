import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: false,
    message: "Receipt scanning API is disabled for now.",
    items: [],
  });
}