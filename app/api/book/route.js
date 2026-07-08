export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getSlots, setSlotStatus, addBooking } from "@/lib/kv";
import { priceFor, SIZES, TIERS, REMOVALS } from "@/lib/pricing";
import { notifyOwner } from "@/lib/sms";

export async function POST(request) {
  const body = await request.json();
  const { slotId, name, phone, email, sizeId, tierId, removalId } = body || {};

  if (!slotId || !name || !phone || !sizeId || !tierId) {
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

  const price = priceFor(sizeId, tierId, removalId || null);
  if (price == null) {
    return NextResponse.json({ error: "Invalid service selection." }, { status: 400 });
  }

  // Hold the slot immediately so two people can't grab the same time.
  await setSlotStatus(slotId, "held");

  const size = SIZES.find((s) => s.id === sizeId);
  const tier = TIERS.find((t) => t.id === tierId);
  const removal = removalId ? REMOVALS.find((r) => r.id === removalId) : null;

  const booking = await addBooking({
    slotId,
    date: slot.date,
    time: slot.time,
    name,
    phone,
    email: email || "",
    size: size.label,
    tier: `Tier ${tier.label}`,
    removal: removal ? removal.label : "",
    price,
  });

  try {
    await notifyOwner(
      `New booking request: ${name} (${phone}) — ${slot.date} ${slot.time} — ${size.label}, Tier ${tier.label}${removal ? `, ${removal.label}` : ""
      } — $${price}. Approve in your admin page.`
    );
  } catch (e) {
    console.error("SMS notify failed:", e);
  }

  return NextResponse.json({ booking });
}
