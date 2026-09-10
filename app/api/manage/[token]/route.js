export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { getBookings, getSlots, setSlotStatus, setBookingStatus, setBookingSlot, releaseSlotClaim, claimSlot } from "@/lib/kv";
import { notifyOwnerEmail, sendClientEmail } from "@/lib/email";
import { formatFriendlyDate, formatFriendlyTime } from "@/lib/format";

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

    if (booking.status === "approved") {
        return NextResponse.json(
            { error: "Your appointment has already been approved so you are unable to edit your slot. Please DM me on Instagram to make any changes." },
            { status: 409 }
        );
    }

    if (booking.status === "cancelled") {
        return NextResponse.json({ error: "This booking is already cancelled." }, { status: 409 });
    }

    if (action === "cancel") {
        await setBookingStatus(booking.id, "cancelled");
        await setSlotStatus(booking.slotId, "open");
        await releaseSlotClaim(booking.slotId);

        try {
            await notifyOwnerEmail(
                "Booking cancelled — nailsbynatwu",
                `${booking.name} cancelled their appointment on ${booking.date} at ${booking.time}. The slot has been reopened.`
            );
        } catch (e) {
            console.error("Owner cancellation notice failed:", e);
        }

        try {
            const friendlyDate = formatFriendlyDate(booking.date);
            const friendlyTime = formatFriendlyTime(booking.time);
            await sendClientEmail(
                booking.email,
                "Your appointment has been cancelled — nailsbynatwu",
                `Your appointment for ${friendlyDate} at ${friendlyTime} has been successfully cancelled! If you'd like to book again in the future, feel free to check my site or follow @nailsbynatwu on Instagram for updates. Thank you!`
            );
        } catch (e) {
            console.error("Client cancellation email failed:", e);
        }

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

        await setSlotStatus(booking.slotId, "open");
        await releaseSlotClaim(booking.slotId);
        await setSlotStatus(newSlotId, "held");
        await setBookingSlot(booking.id, newSlotId, newSlot.date, newSlot.time);

        try {
            await notifyOwnerEmail(
                "Booking rescheduled — nailsbynatwu",
                `${booking.name} rescheduled their appointment to ${newSlot.date} at ${newSlot.time}. Please review and approve in your admin page.`
            );
        } catch (e) {
            console.error("Owner reschedule notice failed:", e);
        }

        return NextResponse.json({ message: "Booking rescheduled." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}