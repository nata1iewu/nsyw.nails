export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import {
  getBookings,
  getSlots,
  setBookingStatus,
  setSlotStatus,
  setBookingSlot,
  clearBookings,
  removeBooking,
  claimSlot,
  releaseSlotClaim,
} from "@/lib/kv";
import { sendClientEmail } from "@/lib/email";
import { formatFriendlyDate, formatFriendlyTime } from "@/lib/format";

const IG_URL = "https://instagram.com/nailsbynatwu";

function todayPacific() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function handleAdminCancel(booking) {
  await setBookingStatus(booking.id, "cancelled");
  await setSlotStatus(booking.slotId, "open");
  await releaseSlotClaim(booking.slotId);

  let emailed = false;
  if (booking.email) {
    try {
      const friendlyDate = formatFriendlyDate(booking.date);
      const friendlyTime = formatFriendlyTime(booking.time);
      const text = `Hi ${booking.name}, your appointment on ${friendlyDate} at ${friendlyTime} has been cancelled.

If you'd like to rebook in the future, feel free to check my site or message me on Instagram @nailsbynatwu for updates. If you think this was a mistake, please MESSAGE ME on Instagram!

Best Regards,
Natalie Wu`;
      const html = `<p>Hi ${booking.name}, your appointment on ${friendlyDate} at ${friendlyTime} has been cancelled.</p>
<p>If you'd like to rebook in the future, feel free to check my site or message me on Instagram for updates. If you think this was a mistake, please MESSAGE ME on Instagram!</p>
<p>Best Regards,<br/>Natalie Wu</p>
<p><a href="${IG_URL}">@nailsbynatwu on instagram</a></p>`;
      await sendClientEmail(booking.email, "Your appointment has been cancelled — nailsbynatwu", text, html);
      emailed = true;
    } catch (e) {
      console.error("Admin cancellation email failed:", e);
    }
  }

  return NextResponse.json({ message: "Booking cancelled.", emailed });
}

async function handleAdminReschedule(booking, newSlotId) {
  if (!newSlotId) {
    return NextResponse.json({ error: "No new slot selected." }, { status: 400 });
  }
  if (newSlotId === booking.slotId) {
    return NextResponse.json({ error: "That is already their current slot." }, { status: 400 });
  }

  const slots = await getSlots();
  const newSlot = slots.find((s) => s.id === newSlotId);
  if (!newSlot || newSlot.status !== "open") {
    return NextResponse.json({ error: "That slot is no longer available." }, { status: 409 });
  }

  const claimed = await claimSlot(newSlotId);
  if (!claimed) {
    return NextResponse.json({ error: "That slot was just taken." }, { status: 409 });
  }

  const oldDate = booking.date;
  const oldTime = booking.time;

  await setSlotStatus(booking.slotId, "open");
  await releaseSlotClaim(booking.slotId);
  await setSlotStatus(newSlotId, booking.status === "approved" ? "booked" : "held");
  await setBookingSlot(booking.id, newSlotId, newSlot.date, newSlot.time, booking.status, newSlot.duration || 120);

  let emailed = false;
  if (booking.email) {
    try {
      const oldFriendly = `${formatFriendlyDate(oldDate)} at ${formatFriendlyTime(oldTime)}`;
      const newFriendly = `${formatFriendlyDate(newSlot.date)} at ${formatFriendlyTime(newSlot.time)}`;
      const text = `Hi ${booking.name}! Your appointment has been updated.

Previous time: ${oldFriendly}
New time: ${newFriendly}

If this new time doesn't work for you, please MESSAGE ME on Instagram @nailsbynatwu so we can sort it out!

Best Regards,
Natalie Wu`;
      const html = `<p>Hi ${booking.name}! Your appointment has been updated.</p>
<p><strong>Previous time:</strong> ${oldFriendly}<br/><strong>New time:</strong> ${newFriendly}</p>
<p>If this new time doesn't work for you, please MESSAGE ME on Instagram so we can sort it out!</p>
<p>Best Regards,<br/>Natalie Wu</p>
<p><a href="${IG_URL}">@nailsbynatwu on instagram</a></p>`;
      await sendClientEmail(booking.email, "Your appointment has been updated — nailsbynatwu", text, html);
      emailed = true;
    } catch (e) {
      console.error("Admin reschedule email failed:", e);
    }
  }

  return NextResponse.json({ message: "Booking rescheduled.", emailed });
}

export async function GET(request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await getBookings();
  bookings.sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ bookings });
}

export async function POST(request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, action, newSlotId } = await request.json();
  if (!id || !["approve", "deny", "cancel", "reschedule"].includes(action)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (action === "cancel" || action === "reschedule") {
    const bookings = await getBookings();
    const existing = bookings.find((b) => b.id === id);
    if (!existing) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    if (existing.status === "cancelled" || existing.status === "denied") {
      return NextResponse.json({ error: `This booking is already ${existing.status}.` }, { status: 409 });
    }
    if (action === "cancel") return handleAdminCancel(existing);
    return handleAdminReschedule(existing, newSlotId);
  }

  const booking = await setBookingStatus(id, action === "approve" ? "approved" : "denied");
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  if (action === "approve") {
    await setSlotStatus(booking.slotId, "booked");
    try {
      const friendlyDate = formatFriendlyDate(booking.date);
      const friendlyTime = formatFriendlyTime(booking.time);
      const textMsg = `Hi ${booking.name}! Your appointment on ${friendlyDate} at ${friendlyTime} is confirmed! I will be reaching out shortly via the Instagram or phone number you provided me for the REQUIRED $5 deposit!

Thank you so much for showing interest in my work :) I appreciate YOU!!
I can't wait to see you at your appointment!

(if any changes are needed for your appointment, ie. cancellations, please MESSAGE ME on Instagram !!!)

Best Regards,
Natalie Wu

@nailsbynatwu on instagram`;

      const htmlMsg = `<p>Hi ${booking.name}! Your appointment on ${friendlyDate} at ${friendlyTime} is confirmed! I will be reaching out shortly via the Instagram or phone number you provided me for the REQUIRED $5 deposit!</p>
<p>Thank you so much for showing interest in my work :) I appreciate YOU!!<br/>I can't wait to see you at your appointment!</p>
<p>(if any changes are needed for your appointment, ie. cancellations, please MESSAGE ME on Instagram !!!)</p>
<p>Best Regards,<br/>Natalie Wu</p>
<p><a href="${IG_URL}">@nailsbynatwu on instagram</a></p>`;

      await sendClientEmail(booking.email, "Your appointment is confirmed! — nailsbynatwu", textMsg, htmlMsg);
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

  let id = null;
  try {
    const body = await request.json();
    id = body?.id || null;
  } catch {

  }

  if (!id) {
    await clearBookings();
    return NextResponse.json({ message: "Cleared" });
  }

  const removed = await removeBooking(id);
  if (!removed) return NextResponse.json({ error: "Booking not found." }, { status: 404 });


  if ((removed.status === "pending" || removed.status === "approved") && removed.date >= todayPacific()) {
    await setSlotStatus(removed.slotId, "open");
    await releaseSlotClaim(removed.slotId);
  }

  return NextResponse.json({ message: "Booking deleted." });
}