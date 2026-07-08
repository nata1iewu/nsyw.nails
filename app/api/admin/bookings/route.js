export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getBookings, setBookingStatus, setSlotStatus } from "@/lib/kv";

export async function GET(request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await getBookings();
  bookings.sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ bookings });
}

export async function POST(request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, action } = await request.json();
  if (!id || !["approve", "deny"].includes(action)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const booking = await setBookingStatus(id, action === "approve" ? "approved" : "denied");
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  // Approving locks the slot as booked; denying frees it back up.
  await setSlotStatus(booking.slotId, action === "approve" ? "booked" : "open");

  return NextResponse.json({ booking });
}
