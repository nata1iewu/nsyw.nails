import { NextResponse } from "next/server";
import {
  getBookingById,
  getSlots,
  setSlotStatus,
  updateBooking,
} from "@/lib/kv";
import { notifyOwner } from "@/lib/sms";

function verify(booking, token) {
  return booking && token && booking.manageToken === token;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const token = searchParams.get("t");

  const booking = await getBookingById(id);
  if (!verify(booking, token)) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  let availableSlots = [];
  if (booking.status !== "cancelled") {
    const slots = await getSlots();
    const needsExtended = Boolean(booking.removal);
    availableSlots = slots.filter(
      (s) =>
        s.status === "open" &&
        s.id !== booking.slotId &&
        (!needsExtended || (s.duration || 120) >= 180)
    );
  }

  return NextResponse.json({ booking, availableSlots });
}

export async function POST(request) {
  const { id, token, action, newSlotId } = await request.json();

  const booking = await getBookingById(id);
  if (!verify(booking, token)) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "This appointment is already cancelled." }, { status: 409 });
  }

  if (action === "cancel") {
    await setSlotStatus(booking.slotId, "open");
    const updated = await updateBooking(id, { status: "cancelled" });

    try {
      await notifyOwner(
        `Cancellation: ${booking.name} (${booking.phone}) cancelled their ${booking.date} ${booking.time} appointment. Slot is open again.`
      );
    } catch (e) {
      console.error("SMS notify failed:", e);
    }

    return NextResponse.json({ booking: updated });
  }

  if (action === "reschedule") {
    if (!newSlotId) {
      return NextResponse.json({ error: "Pick a new slot first." }, { status: 400 });
    }
    const slots = await getSlots();
    const newSlot = slots.find((s) => s.id === newSlotId);
    if (!newSlot || newSlot.status !== "open") {
      return NextResponse.json(
        { error: "That slot is no longer available. Please pick another." },
        { status: 409 }
      );
    }

    // Free the old slot, claim the new one at the same held/booked state
    // the booking already had.
    await setSlotStatus(booking.slotId, "open");
    await setSlotStatus(newSlotId, booking.status === "approved" ? "booked" : "held");

    const updated = await updateBooking(id, {
      slotId: newSlotId,
      date: newSlot.date,
      time: newSlot.time,
      duration: newSlot.duration || 120,
    });

    try {
      await notifyOwner(
        `Reschedule: ${booking.name} (${booking.phone}) moved their appointment from ${booking.date} ${booking.time} to ${newSlot.date} ${newSlot.time}.`
      );
    } catch (e) {
      console.error("SMS notify failed:", e);
    }

    return NextResponse.json({ booking: updated });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
