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
    if (!name || !phone || !instagram) {
      alert("Please fill in all fields!");
      return;
    }

    setWaitlistStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, instagram }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join");
      }

      // If we got a 200 OK, this will trigger the UI change
      setWaitlistStatus("done");
    } catch (err) {
      console.error("Waitlist error:", err);
      alert("Error: " + err.message);
      setWaitlistStatus("idle"); // Reset button so you can try again
    }
  }

  if (!hasMounted) return <><Nav /><main className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center"><p className="text-base text-ink/50">Loading booking portal…</p></main><Footer /></>;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
        <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Book a slot</p>
        <h1 className="font-display text-4xl text-inkDeep mb-4">Pick your <span className="font-script text-5xl text-umber">appointment</span></h1>
        <p className="text-ink/70 mb-10 text-lg">Slots are posted monthly and go fast. Choose an open time, your service, and confirm with a ${DEPOSIT_AMOUNT} deposit.</p>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">1. Removal</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => setRemovalId("")} className={`rounded-xl px-4 py-3 text-left text-base ring-1 transition ${removalId === "" ? "bg-mist ring-inkDeep" : "ring-line hover:bg-mist"}`}>None needed</button>
              {REMOVALS.map((r) => (
                <button type="button" key={r.id} onClick={() => setRemovalId(r.id)} className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-base ring-1 transition ${removalId === r.id ? "bg-mist ring-inkDeep" : "ring-line hover:bg-mist"}`}>
                  <span>{r.label}</span>
                  <span className="text-umber font-display text-lg">+${r.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">2. Open slots</h2>
            {eligibleSlots?.length === 0 ? (
              <div className="rounded-2xl bg-stoneDeep/60 ring-1 ring-line/70 p-6 text-center">
                {waitlistStatus === "done" ? (
                  <div className="py-4">
                    <h3 className="font-display text-lg text-inkDeep mb-2">You're on the list! ✿</h3>
                    <p className="text-sm text-ink/70">You've successfully joined the waitlist! If there are any spots that open up, I will contact you! Thank you so much for your support!!</p>
                  </div>
                ) : (
                  <><h3 className="font-display text-lg text-inkDeep mb-2">All slots are fully booked!</h3>
                    <form onSubmit={handleWaitlistSubmit} className="grid gap-3 max-w-md mx-auto">
                      <input required placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line text-sm" />
                      <input required type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line text-sm" />
                      <input required placeholder="Instagram Handle" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line text-sm" />
                      <button type="submit" className="w-full rounded-full bg-inkDeep py-2.5 text-sm font-medium text-mist">
                        {waitlistStatus === "submitting" ? "Joining..." : "Join Priority Waitlist"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {eligibleSlots?.map((s) => (
                  <button type="button" key={s.id} onClick={() => setSlotId(s.id)} className={`rounded-xl px-4 py-3 text-left text-base ring-1 transition ${slotId === s.id ? "bg-inkDeep text-mist ring-inkDeep" : "ring-line hover:bg-mist text-ink"}`}>
                    <span className="block font-medium">{formatDate(s.date)}</span>
                    <span className="block opacity-80">{formatTime(s.time)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">3. Length</h2>
            <div className="grid gap-2">{SIZES.map((s) => <button type="button" key={s.id} onClick={() => setSizeId(s.id)} className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-base ring-1 transition ${sizeId === s.id ? "bg-mist ring-inkDeep" : "ring-line hover:bg-mist"}`}><span>{s.label}</span><span className="text-umber font-display text-lg">${s.price}</span></button>)}</div>
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">4. Design tier</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{TIERS.map((tier) => <SwatchTier key={tier.id} tier={tier} interactive selected={tierId === tier.id} onClick={() => setTierId(tier.id)} />)}</div>
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">5. Your info</h2>
            <div className="grid gap-3">
              <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line text-base" />
              <input required type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line text-base" />
              <input required placeholder="Instagram username" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line text-base" />
            </div>
          </div>

          <button type="submit" disabled={!canSubmit || status === "submitting"} className="w-full rounded-full bg-inkDeep px-7 py-3 font-body text-lg text-mist transition hover:bg-umber disabled:opacity-40">
            {status === "submitting" ? "Sending request…" : "Request this slot"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}