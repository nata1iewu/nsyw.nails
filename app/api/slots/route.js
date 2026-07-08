export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { getSlots } from "@/lib/kv";

export async function GET() {
  const slots = await getSlots();
  const open = slots
    .filter((s) => s.status === "available")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return NextResponse.json({ slots: open });
}
