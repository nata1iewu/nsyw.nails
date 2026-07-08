"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SwatchTier from "@/components/SwatchTier";
import { SIZES, TIERS, REMOVALS, DEPOSIT_AMOUNT, priceFor } from "@/lib/pricing";

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function Book() {
  const [hasMounted, setHasMounted] = useState(false);
  const [slots, setSlots] = useState(null);
  const [slotId, setSlotId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [tierId, setTierId] = useState("");
  const [removalId, setRemovalId] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  const [status, setStatus] = useState("idle"); // Booking status
  const [errorMsg, setErrorMsg] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState("idle"); // Waitlist status

  useEffect(() => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
    setHasMounted(true);
  }, []);

  const eligibleSlots = useMemo(() => {
    if (!slots) return null;
    if (!removalId) return slots;
    return slots.filter((s) => (s.duration || 120) >= 180);
  }, [slots, removalId]);

  const price = sizeId && tierId ? priceFor(sizeId, tierId, removalId || null) : null;
  const dueAtAppointment = price != null ? Math.max(price - DEPOSIT_AMOUNT, 0) : null;
  const canSubmitBooking = slotId && sizeId && tierId && name && phone;

  async function handleBookingSubmit(e) {
    e.preventDefault();
    if (!canSubmitBooking) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, sizeId, tierId, removalId: removalId || null, name, phone, instagram }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  async function handleWaitlistSubmit(e) {
    e.preventDefault();
    if (!name || !phone || !instagram) return;
    setWaitlistStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, instagram }),
      });
      if (!res.ok) throw new Error();
      setWaitlistStatus("done");
    } catch {
      setWaitlistStatus("error");
    }
  }

  if (!hasMounted) return <><Nav /><main className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center"><p className="text-base text-ink/50">Loading…</p></main><Footer /></>;

  if (status === "done") {
    return (
      <><Nav /><main className="mx-auto max-w-xl px-6 py-28 text-center">
        <h1 className="font-display text-3xl text-inkDeep mb-4">Request sent ✿</h1>
        <p className="text-ink/70 mb-8 text-lg">Send your ${DEPOSIT_AMOUNT} deposit via Zelle to <span className="text-inkDeep font-medium">626-295-8572</span>.</p>
      </main><Footer /></>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
        <form onSubmit={handleBookingSubmit} className="space-y-10">
          {/* ... [Keep your existing form sections for 1. Removal, 2. Open Slots, 3. Length, 4. Tier here] ... */}

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">5. Your info</h2>
            <div className="grid gap-3">
              <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line text-base" />
              <input required type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line text-base" />
              <input required placeholder="Instagram username" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line text-base" />
            </div>
          </div>

          {/* Waitlist Section (Inside the "Open Slots" area or at the bottom) */}
          {eligibleSlots?.length === 0 && (
            <div className="rounded-2xl bg-stoneDeep/60 p-6">
              {waitlistStatus === "done" ? <p>Successfully added to the waitlist! ✿</p> : (
                <div className="grid gap-3">
                  <button type="button" onClick={handleWaitlistSubmit} disabled={!name || !phone || !instagram || waitlistStatus === "submitting"}>
                    {waitlistStatus === "submitting" ? "Joining..." : "Join Priority Waitlist"}
                  </button>
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={!canSubmitBooking || status === "submitting"}>Request this slot</button>
        </form>
      </main>
      <Footer />
    </>
  );
}