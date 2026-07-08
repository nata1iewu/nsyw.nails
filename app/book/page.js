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
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState("");

  // Waitlist states
  const [waitlistStatus, setWaitlistStatus] = useState("idle"); // idle | submitting | done | error

  useEffect(() => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
    setHasMounted(true);
  }, []);

  // Only show removal-friendly (3 hr) slots once a removal is selected.
  const eligibleSlots = useMemo(() => {
    if (!slots) return null;
    if (!removalId) return slots;
    return slots.filter((s) => (s.duration || 120) >= 180);
  }, [slots, removalId]);

  // If someone picks a slot, then later selects a removal that slot doesn't
  // support, clear the now-invalid selection so they have to re-pick.
  useEffect(() => {
    if (!slotId || !eligibleSlots) return;
    if (!eligibleSlots.some((s) => s.id === slotId)) {
      setSlotId("");
    }
  }, [eligibleSlots, slotId]);

  const price = sizeId && tierId ? priceFor(sizeId, tierId, removalId || null) : null;
  const dueAtAppointment = price != null ? Math.max(price - DEPOSIT_AMOUNT, 0) : null;
  const canSubmit = slotId && sizeId && tierId && name && phone;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          sizeId,
          tierId,
          removalId: removalId || null,
          name,
          phone,
          instagram,
        }),
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
    if (!name || !phone) return;
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

  if (!hasMounted) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center">
          <p className="text-base text-ink/50">Loading booking portal…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (status === "done") {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-xl px-6 py-28 text-center">
          <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Request sent</p>
          <h1 className="font-display text-3xl text-inkDeep mb-4">
            You're on the list <span className="font-script text-4xl text-umber">✿</span>
          </h1>
          <p className="text-ink/70 mb-8 text-lg">
            Send your ${DEPOSIT_AMOUNT} deposit via Zelle to{" "}
            <span className="text-inkDeep font-medium">626-295-8572</span> (no note needed — an
            emoji is fine if one's required). Your slot is confirmed once I approve your
            request.
          </p>

          <a
            href="https://instagram.com/nsyw.nails"
            target="_blank"
            rel="noreferrer"
            className="text-umber hover:underline"
          >
            Questions? DM @nsyw.nails
          </a>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
        <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Book a slot</p>
        <h1 className="font-display text-4xl text-inkDeep mb-4">
          Pick your <span className="font-script text-5xl text-umber">appointment</span>
        </h1>
        <p className="text-ink/70 mb-10 text-lg">
          Slots are posted monthly and go fast. Choose an open time, your service, and confirm
          with a ${DEPOSIT_AMOUNT} deposit.
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Removal — asked first so we can filter slots correctly */}
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">
              1. Removal <span className="text-base text-ink/50 font-body not-italic">(if needed)</span>
            </h2>
            <p className="mb-3 text-sm text-ink/50">
              Removals are only offered for sets originally done here — no foreign removals.
              Choosing one below will filter the open slots to ones with room for it.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setRemovalId("")}
                className={`rounded-xl px-4 py-3 text-left text-base ring-1 transition ${removalId === "" ? "bg-mist ring-inkDeep" : "ring-line hover:bg-mist"
                  }`}
              >
                None needed
              </button>
              {REMOVALS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRemovalId(r.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-base ring-1 transition ${removalId === r.id ? "bg-mist ring-inkDeep" : "ring-line hover:bg-mist"
                    }`}
                >
                  <span>{r.label}</span>
                  <span className="text-umber font-display text-lg">+${r.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">2. Open slots</h2>
            {removalId && (
              <p className="mb-3 text-sm text-ink/50">
                Showing only slots with room for a removal.
              </p>
            )}
            {eligibleSlots === null && <p className="text-base text-ink/50">Loading availability…</p>}

            {eligibleSlots !== null && eligibleSlots.length === 0 && (
              <div className="rounded-2xl bg-stoneDeep/60 ring-1 ring-line/70 p-6 text-center">
                {waitlistStatus === "done" ? (
                  <div>
                    <h3 className="font-display text-xl text-inkDeep mb-2">You're on the waitlist! ✿</h3>
                    <p className="text-sm text-ink/70">
                      If a spot opens up or a client cancels, you'll be the first to know via text or DM.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-display text-lg text-inkDeep mb-2">All slots are fully booked!</h3>
                    <p className="text-sm text-ink/60 max-w-md mx-auto mb-4">
                      {removalId
                        ? "No removal-friendly slots open right now. Join the priority waitlist below and I'll reach out if room opens up!"
                        : "No open slots right now. Join the priority waitlist below and I'll contact you directly if a spot opens up!"}
                    </p>
                    <div className="grid gap-3 max-w-md mx-auto">
                      <input
                        required
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-sm"
                      />
                      <input
                        required
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-sm"
                      />
                      <input
                        placeholder="Instagram username (optional)"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleWaitlistSubmit}
                        disabled={!name || !phone || waitlistStatus === "submitting"}
                        className="w-full rounded-full bg-inkDeep py-2.5 text-sm font-medium text-mist hover:bg-umber transition disabled:opacity-40"
                      >
                        {waitlistStatus === "submitting" ? "Joining..." : "Join Priority Waitlist"}
                      </button>
                      {waitlistStatus === "error" && (
                        <p className="text-xs text-umber mt-1">Something went wrong. Please try again.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {eligibleSlots !== null && eligibleSlots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {eligibleSlots.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSlotId(s.id)}
                    className={`rounded-xl px-4 py-3 text-left text-base ring-1 transition ${slotId === s.id
                      ? "bg-inkDeep text-mist ring-inkDeep"
                      : "ring-line hover:bg-mist text-ink"
                      }`}
                  >
                    <span className="block font-medium">{formatDate(s.date)}</span>
                    <span className="block opacity-80">
                      {formatTime(s.time)}
                      {(s.duration || 120) >= 180 && (
                        <span className="ml-1 opacity-70">· extended</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Size */}
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">3. Length</h2>
            <div className="grid gap-2">
              {SIZES.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSizeId(s.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-base ring-1 transition ${sizeId === s.id ? "bg-mist ring-inkDeep" : "ring-line hover:bg-mist"
                    }`}
                >
                  <span>{s.label}</span>
                  <span className="text-umber font-display text-lg">${s.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tier */}
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">4. Design tier</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {TIERS.map((tier) => (
                <SwatchTier
                  key={tier.id}
                  tier={tier}
                  interactive
                  selected={tierId === tier.id}
                  onClick={() => setTierId(tier.id)}
                />
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">5. Your info</h2>
            <div className="grid gap-3">
              <input
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-base"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-base"
              />
              <input
                placeholder="Instagram username"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="rounded-xl px-4 py-3 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-base"
              />
            </div>
          </div>

          {/* Summary + submit */}
          <div className="rounded-2xl bg-stoneDeep/60 ring-1 ring-line/70 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base text-ink/70">Service total</span>
              <span className="font-display text-xl text-ink">
                {price != null ? `$${price}` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-base text-ink/70">
                Due day-of <span className="text-sm text-ink/45">(after ${DEPOSIT_AMOUNT} deposit)</span>
              </span>
              <span className="font-display text-2xl text-umber">
                {dueAtAppointment != null ? `$${dueAtAppointment}` : "—"}
              </span>
            </div>
            <p className="text-sm text-ink/50 mb-4">
              A ${DEPOSIT_AMOUNT} Zelle deposit (626-295-8572) secures this slot once your
              request is approved — it comes off your total above.
            </p>
            {errorMsg && <p className="text-base text-umber mb-4">{errorMsg}</p>}
            <button
              type="submit"
              disabled={!canSubmit || status === "submitting"}
              className="w-full rounded-full bg-inkDeep px-7 py-3 font-body text-lg text-mist transition hover:bg-umber disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Sending request…" : "Request this slot"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}