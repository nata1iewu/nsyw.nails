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
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState("idle");

  useEffect(() => {
    fetch("/api/slots").then((r) => r.json()).then((data) => setSlots(data.slots || [])).catch(() => setSlots([]));
    setHasMounted(true);
  }, []);

  const eligibleSlots = useMemo(() => {
    if (!slots) return null;
    if (!removalId) return slots;
    return slots.filter((s) => (s.duration || 120) >= 180);
  }, [slots, removalId]);

  const price = sizeId && tierId ? priceFor(sizeId, tierId, removalId || null) : null;
  const dueAtAppointment = price != null ? Math.max(price - DEPOSIT_AMOUNT, 0) : null;
  const canSubmit = slotId && sizeId && tierId && name && phone;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, sizeId, tierId, removalId: removalId || null, name, phone, instagram }),
      });
      if (!res.ok) throw new Error("Booking failed");
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong.");
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

  if (!hasMounted) return <><Nav /><main className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center"><p className="text-base text-ink/50">Loading booking portal…</p></main><Footer /></>;

  if (status === "done") {
    return (<><Nav /><main className="mx-auto max-w-xl px-6 py-28 text-center"><h1 className="font-display text-3xl text-inkDeep mb-4">You're booked ✿</h1><p>Check your messages!</p></main><Footer /></>);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">1. Removal</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => setRemovalId("")} className={`rounded-xl px-4 py-3 ring-1 ${removalId === "" ? "bg-mist ring-inkDeep" : "ring-line"}`}>None</button>
              {REMOVALS.map((r) => <button type="button" key={r.id} onClick={() => setRemovalId(r.id)} className={`rounded-xl px-4 py-3 ring-1 ${removalId === r.id ? "bg-mist ring-inkDeep" : "ring-line"}`}>{r.label}</button>)}
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">2. Slots</h2>
            {eligibleSlots?.length === 0 ? (
              <div className="p-6 rounded-2xl bg-stoneDeep/60">
                <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-2 p-2 rounded-xl" />
                <input required placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mb-2 p-2 rounded-xl" />
                <input required placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full mb-4 p-2 rounded-xl" />
                <button type="button" onClick={handleWaitlistSubmit} className="bg-inkDeep text-mist px-6 py-2 rounded-full">{waitlistStatus === "submitting" ? "Joining..." : "Join Waitlist"}</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {eligibleSlots?.map(s => <button type="button" key={s.id} onClick={() => setSlotId(s.id)} className={`p-3 rounded-xl ring-1 ${slotId === s.id ? "bg-inkDeep text-mist" : "ring-line"}`}>{formatDate(s.date)}</button>)}
              </div>
            )}
          </div>
          {/* Add Sections 3 (Size), 4 (Tier), 5 (Info) here as before */}
          <button type="submit" className="w-full bg-inkDeep text-mist py-3 rounded-full">Request Slot</button>
        </form>
      </main>
      <Footer />
    </>
  );
}