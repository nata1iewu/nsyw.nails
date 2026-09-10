"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ManageBooking() {
    const params = useParams();
    const token = params.token;

    const [booking, setBooking] = useState(null);
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [rescheduling, setRescheduling] = useState(false);
    const [newSlotId, setNewSlotId] = useState("");

    useEffect(() => {
        fetch(`/api/manage/${token}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) setError(data.error);
                else setBooking(data.booking);
            });
        fetch("/api/slots")
            .then((r) => r.json())
            .then((data) => setSlots(data.slots || []));
    }, [token]);

    async function handleCancel() {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;
        const res = await fetch(`/api/manage/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cancel" }),
        });
        const data = await res.json();
        if (res.ok) {
            setMessage("Your appointment has been cancelled.");
            setBooking((b) => ({ ...b, status: "cancelled" }));
        } else {
            setError(data.error || "Failed to cancel.");
        }
    }

    async function handleReschedule() {
        if (!newSlotId) {
            setError("Please pick a new time.");
            return;
        }
        const res = await fetch(`/api/manage/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reschedule", newSlotId }),
        });
        const data = await res.json();
        if (res.ok) {
            setMessage("Your appointment has been rescheduled! You'll need approval again.");
            setRescheduling(false);
            const newSlot = slots.find((s) => s.id === newSlotId);
            setBooking((b) => ({ ...b, status: "pending", date: newSlot.date, time: newSlot.time }));
        } else {
            setError(data.error || "Failed to reschedule.");
        }
    }

    return (
        <>
            <Nav />
            <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
                <h1 className="font-display text-3xl text-inkDeep mb-6">Manage your appointment</h1>

                {error && <p className="text-red-600 mb-4">{error}</p>}
                {message && <p className="text-umber mb-4">{message}</p>}

                {booking && (
                    <div className="rounded-2xl ring-1 ring-line p-6 mb-6">
                        <p className="font-body text-ink mb-1"><span className="font-bold">Name:</span> {booking.name}</p>
                        <p className="font-body text-ink mb-1"><span className="font-bold">Date:</span> {booking.date}</p>
                        <p className="font-body text-ink mb-1"><span className="font-bold">Time:</span> {booking.time}</p>
                        <p className="font-body text-ink"><span className="font-bold">Status:</span> {booking.status}</p>
                    </div>
                )}

                {booking && booking.status === "approved" && (
                    <p className="text-base text-ink/80 rounded-2xl bg-stoneDeep/60 ring-1 ring-line p-5">
                        Your appointment has already been approved so you are unable to edit your slot. Please DM me on Instagram to make any changes.
                    </p>
                )}

                {booking && booking.status === "cancelled" && (
                    <p className="text-base text-ink/80 rounded-2xl bg-stoneDeep/60 ring-1 ring-line p-5">
                        This appointment has been cancelled.
                    </p>
                )}

                {booking && booking.status === "pending" && (
                    <div className="flex flex-col gap-3">
                        {!rescheduling ? (
                            <>
                                <button onClick={() => setRescheduling(true)} className="rounded-full bg-inkDeep px-6 py-3 text-mist">
                                    Reschedule
                                </button>
                                <button onClick={handleCancel} className="rounded-full px-6 py-3 ring-1 ring-line text-red-600">
                                    Cancel appointment
                                </button>
                            </>
                        ) : (
                            <div>
                                <p className="mb-3 text-ink/70">Pick a new time:</p>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {slots.filter((s) => s.status === "open").map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setNewSlotId(s.id)}
                                            className={`rounded-xl px-4 py-3 ring-1 ${newSlotId === s.id ? "bg-inkDeep text-mist" : "ring-line"}`}
                                        >
                                            {s.date} {s.time}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleReschedule} className="rounded-full bg-inkDeep px-6 py-3 text-mist">
                                    Confirm new time
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}