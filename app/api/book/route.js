export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { getSlots, setSlotStatus, addBooking, claimSlot, releaseSlotClaim } from "@/lib/kv";
import { REMOVALS } from "@/lib/pricing";
import { notifyOwnerEmail, sendClientEmail } from "@/lib/email";

export async function POST(request) {
  const body = await request.json();
  const { slotId, name, phone, instagram, email, removalId, isStudent } = body || {};
  if (!slotId || !name || !phone || !instagram || !email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  const slots = await getSlots();
  const slot = slots.find((s) => s.id === slotId);
  if (!slot || slot.status !== "open") {
    return NextResponse.json(
      { error: "Oh no! This slot has been taken! Please choose another one." },
      { status: 409 }
    );
  }

  const claimed = await claimSlot(slotId);
  if (!claimed) {
    return NextResponse.json(
      { error: "Oh no! This slot has been taken! Please choose another one." },
      { status: 409 }
    );
  }

  try {
    await setSlotStatus(slotId, "held");

    const removal = removalId ? REMOVALS.find((r) => r.id === removalId) : null;

    const booking = await addBooking({
      slotId,
      date: slot.date,
      time: slot.time,
      duration: slot.duration || 120,
      name,
      phone,
      instagram,
      email,
      removal: removal ? removal.label : "",
      isStudent: !!isStudent,
    });

    try {
      await notifyOwnerEmail(
        "New booking request — nsywnails",
        `${name} requested an appointment.\nPhone: ${phone}\nInstagram: ${instagram}\nEmail: ${email}\nDate: ${slot.date} at ${slot.time}${removal ? `\nRemoval: ${removal.label}` : ""}\n\nApprove in your admin page.`
      );
    } catch (e) {
      console.error("Owner email failed:", e);
    }

    try {
      const manageUrl = `https://nsywnails.com/manage/${booking.manageToken}`;
      await sendClientEmail(
        email,
        "Your appointment request — nsywnails",
        `Hi ${name}! Your appointment request for ${slot.date} at ${slot.time} has been received. To reschedule or cancel: ${manageUrl}`
      );
    } catch (e) {
      console.error("Client email failed:", e);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Booking error:", error);
    await releaseSlotClaim(slotId);
    await setSlotStatus(slotId, "open");
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}