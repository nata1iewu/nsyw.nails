export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getBookings, setBookingStatus, setSlotStatus, clearBookings, releaseSlotClaim } from "@/lib/kv";
import { sendClientSMS } from "@/lib/sms";

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

  if (action === "approve") {
    await setSlotStatus(booking.slotId, "booked");
    try {
      await sendClientSMS(
        booking.phone,
        `Hi ${booking.name}! Your appointment on ${booking.date} at ${booking.time} is confirmed! A $5 deposit is required — I'll follow up with payment details. See you then! ✿`
      );
    } catch (e) {
      console.error("Confirmation SMS failed:", e);
    }
  } else {
    await setSlotStatus(booking.slotId, "open");
    await releaseSlotClaim(booking.slotId);
  }

  return NextResponse.json({ booking });
}

export async function DELETE(request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await clearBookings();
  return NextResponse.json({ message: "Cleared" });
}