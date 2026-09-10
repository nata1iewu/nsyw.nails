export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { getSlots, setSlotStatus, addBooking, claimSlot, releaseSlotClaim } from "@/lib/kv";
import { REMOVALS } from "@/lib/pricing";
import { notifyOwner, sendClientSMS } from "@/lib/sms";

export async function POST(request) {
  const body = await request.json();
  const { slotId, name, phone, instagram, removalId, isStudent } = body || {};
  if (!slotId || !name || !phone || !instagram) {
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

  // Atomic claim — only one concurrent request can win this, even under heavy traffic.
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
      removal: removal ? removal.label : "",
      isStudent: !!isStudent,
    });

    try {
      await notifyOwner(
        `New booking request: ${name} (${phone}, @${instagram.replace(/^@/, "")}) — ${slot.date} ${slot.time}${removal ? ` — ${removal.label}` : ""}. Approve in your admin page.`
      );
    } catch (e) {
      console.error("SMS notify failed:", e);
    }

    try {
      const manageUrl = `https://nsywnails.com/manage/${booking.manageToken}`;
      await sendClientSMS(
        phone,
        `Hi ${name}! Your appointment request for ${slot.date} at ${slot.time} has been received. To reschedule or cancel: ${manageUrl}`
      );
    } catch (e) {
      console.error("Client SMS failed:", e);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Booking error:", error);
    await releaseSlotClaim(slotId);
    await setSlotStatus(slotId, "open");
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}