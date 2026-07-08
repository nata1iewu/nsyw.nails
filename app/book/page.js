"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SwatchTier from "@/components/SwatchTier";
import { SIZES, TIERS, REMOVALS } from "@/lib/pricing";

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
    } catch (err) {
      setStatus("error");
    }
  }

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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Booking failed");
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      alert(err.message);
    }
  }

  if (!hasMounted) return <><Nav /><main className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center"><p className="text-base text-ink/50">Loading booking portal…</p></main><Footer /></>;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
        <h1 className="font-display text-4xl text-inkDeep mb-4">Pick your appointment</h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">1. Removal</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => setRemovalId("")} className={`rounded-xl px-4 py-3 text-left ring-1 transition ${removalId === "" ? "bg-mist ring-inkDeep" : "ring-line"}`}>None needed</button>
              {REMOVALS.map((r) => (
                <button type="button" key={r.id} onClick={() => setRemovalId(r.id)} className={`rounded-xl px-4 py-3 ring-1 transition ${removalId === r.id ? "bg-mist ring-inkDeep" : "ring-line"}`}>
                  {r.label} +${r.price}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">2. Open slots</h2>
            {eligibleSlots?.length === 0 ? (
              <div className="rounded-2xl bg-stoneDeep/60 ring-1 ring-line p-6 text-center">
                {waitlistStatus === "done" ? (
                  <div className="py-4">
                    <h3 className="font-display text-lg text-inkDeep mb-2">You're on the list! ✿</h3>
                    <p className="text-sm text-ink/70">You've successfully joined the waitlist! If there are any spots that open up, I will contact you! Thank you so much for your support!!</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-w-md mx-auto">
                    <p className="font-display text-base text-inkDeep mb-1">
                      Currently fully booked! Follow @nsyw.nails on Instagram for availability updates! In the meantime, feel free to join the waitlist!
                    </p>
                    <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep focus:outline-none" />
                    <input required type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep focus:outline-none" />
                    <input required placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep focus:outline-none" />
                    <button type="button" onClick={handleWaitlistSubmit} className="w-full rounded-full bg-inkDeep py-2.5 text-mist">
                      {waitlistStatus === "submitting" ? "Joining..." : "Join Priority Waitlist"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {eligibleSlots?.map((s) => (
                  <button type="button" key={s.id} onClick={() => setSlotId(s.id)} className={`rounded-xl px-4 py-3 ring-1 ${slotId === s.id ? "bg-inkDeep text-mist" : "ring-line"}`}>
                    {formatDate(s.date)} <br /> {formatTime(s.time)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">3. Length</h2>
            <div className="grid gap-2">{SIZES.map((s) => <button type="button" key={s.id} onClick={() => setSizeId(s.id)} className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-base ring-1 transition ${sizeId === s.id ? "bg-mist ring-inkDeep" : "ring-line"}`}><span>{s.label}</span><span className="text-umber font-display text-lg">${s.price}</span></button>)}</div>
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">4. Design tier</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{TIERS.map((tier) => <SwatchTier key={tier.id} tier={tier} interactive selected={tierId === tier.id} onClick={() => setTierId(tier.id)} />)}</div>
          </div>

          <button type="submit" disabled={!canSubmit || status === "submitting"} className="w-full rounded-full bg-inkDeep px-7 py-3 text-mist">
            {status === "submitting" ? "Sending..." : "Request this slot"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}