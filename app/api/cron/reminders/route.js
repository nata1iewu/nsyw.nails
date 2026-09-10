export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { getBookings, setBookingReminderSent } from "@/lib/kv";
import { sendClientEmail } from "@/lib/email";

function getPacificDateString(daysOffset = 0) {
    const now = new Date();
    now.setDate(now.getDate() + daysOffset);
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(now);
}

export async function GET(request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tomorrow = getPacificDateString(1);
    const bookings = await getBookings();
    const toRemind = bookings.filter(
        (b) => b.status === "approved" && b.date === tomorrow && !b.reminderSent
    );

    for (const booking of toRemind) {
        try {
            await sendClientEmail(
                booking.email,
                "Appointment reminder — nsywnails",
                `Hi ${booking.name}! Just a reminder — your nail appointment is tomorrow, ${booking.date} at ${booking.time}. See you then! ✿`
            );
            await setBookingReminderSent(booking.id);
        } catch (e) {
            console.error(`Reminder failed for booking ${booking.id}:`, e);
        }
    }

    return NextResponse.json({ sent: toRemind.length });
}