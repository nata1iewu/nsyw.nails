export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { getSlots, setSlotStatus, addBooking } from "@/lib/kv";
import { REMOVALS } from "@/lib/pricing";
import { notifyOwner } from "@/lib/sms";

export async function POST(request) {
  const body = await request.json();
  const { slotId, name, phone, instagram, removalId } = body || {};
  if (!slotId || !name || !phone || !instagram) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  const slots = await getSlots();
  const slot = slots.find((s) => s.id === slotId);
  if (!slot || slot.status !== "open") {
    return NextResponse.json(
      { error: "That slot is no longer available. Please pick another." },
      { status: 409 }
    );
  }
  // Hold the slot immediately so two people can't grab the same time.
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
  });

  try {
    await notifyOwner(
      `New booking request: ${name} (${phone}, @${instagram.replace(/^@/, "")}) — ${slot.date} ${slot.time}${removal ? ` — ${removal.label}` : ""}. Approve in your admin page.`
    );
  } catch (e) {
    console.error("SMS notify failed:", e);
  }
  return NextResponse.json({ booking });
}