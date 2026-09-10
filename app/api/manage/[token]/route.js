export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { getBookings, getSlots, setSlotStatus, setBookingStatus, releaseSlotClaim, claimSlot } from "@/lib/kv";

export async function GET(request, { params }) {
    const { token } = await params;
    const bookings = await getBookings();
    const booking = bookings.find((b) => b.manageToken === token);
    if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    return NextResponse.json({ booking });
}

export async function POST(request, { params }) {
    const { token } = await params;
    const { action, newSlotId } = await request.json();

    const bookings = await getBookings();
    const booking = bookings.find((b) => b.manageToken === token);
    if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

    if (booking.status === "cancelled") {
        return NextResponse.json({ error: "This booking is already cancelled." }, { status: 409 });
    }

    if (action === "cancel") {
        await setBookingStatus(booking.id, "cancelled");
        await setSlotStatus(booking.slotId, "open");
        await releaseSlotClaim(booking.slotId);
        return NextResponse.json({ message: "Booking cancelled." });
    }

    if (action === "reschedule") {
        if (!newSlotId) return NextResponse.json({ error: "No new slot selected." }, { status: 400 });

        const slots = await getSlots();
        const newSlot = slots.find((s) => s.id === newSlotId);
        if (!newSlot || newSlot.status !== "open") {
            return NextResponse.json({ error: "That slot is no longer available." }, { status: 409 });
        }

        const claimed = await claimSlot(newSlotId);
        if (!claimed) {
            return NextResponse.json({ error: "That slot was just taken by someone else." }, { status: 409 });
        }

        // Free the old slot
        await setSlotStatus(booking.slotId, "open");
        await releaseSlotClaim(booking.slotId);

        // Claim the new one
        await setSlotStatus(newSlotId, "held");

        const updatedBookings = bookings.map((b) =>
            b.manageToken === token
                ? { ...b, slotId: newSlotId, date: newSlot.date, time: newSlot.time, status: "pending" }
                : b
        );
        await setBookingSlot(booking.id, newSlotId, newSlot.date, newSlot.time);

        return NextResponse.json({ message: "Booking rescheduled." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}