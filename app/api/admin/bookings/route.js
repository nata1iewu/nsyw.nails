export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getBookings, setBookingStatus, setSlotStatus, clearBookings, releaseSlotClaim } from "@/lib/kv";
import { sendClientEmail } from "@/lib/email";

function formatFriendlyDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const monthName = d.toLocaleDateString("en-US", { month: "long" });
  const dayNum = d.getDate();
  const suffix = (n) => {
    if (n >= 11 && n <= 13) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };
  return `${monthName} ${dayNum}${suffix(dayNum)} ${year}`;
}

function formatFriendlyTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

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
      await sendClientEmail(
        booking.email,
        "Your appointment is confirmed! — nsywnails",
        `Hi ${booking.name}! Your appointment on ${formatFriendlyDate(booking.date)} at ${formatFriendlyTime(booking.time)} is confirmed! I will be reaching out shortly via the Instagram or phone number you provided me for the REQUIRED $5 deposit!

Thank you so much for showing interest in my work :) I appreciate YOU!!
I can't wait to see you at your appointment!

(if any changes are needed for your appointment, ie. cancellations, please MESSAGE ME on Instagram !!!)

Best Regards,
Natalie Wu

@nailsbynatwu on instagram`
      );
    } catch (e) {
      console.error("Confirmation email failed:", e);
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