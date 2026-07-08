export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getSlots, addSlot, removeSlot } from "@/lib/kv";

export async function GET(request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slots = await getSlots();
  return NextResponse.json({ slots });
}

export async function POST(request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { date, time, duration } = await request.json();
  if (!date || !time) {
    return NextResponse.json({ error: "Date and time are required." }, { status: 400 });
  }
  const id = await addSlot({ date, time, duration: duration || 120 });
  return NextResponse.json({ id });
}

export async function DELETE(request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  await removeSlot(id);
  return NextResponse.json({ ok: true });
}
