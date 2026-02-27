import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/db";

export async function POST() {
  await seedDemoData();
  return NextResponse.json({ ok: true });
}
