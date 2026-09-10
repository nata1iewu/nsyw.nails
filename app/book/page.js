"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { REMOVALS } from "@/lib/pricing";

function formatTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function Book() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [slots, setSlots] = useState(null);
  const [slotId, setSlotId] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [removalId, setRemovalId] = useState("");
  const [removalChosen, setRemovalChosen] = useState(false);
  const [isStudent, setIsStudent] = useState(null);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailFieldError, setEmailFieldError] = useState("");
  const [instagram, setInstagram] = useState("");
  const [status, setStatus] = useState("idle");
  const [waitlistStatus, setWaitlistStatus] = useState("idle");
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [waitlistError, setWaitlistError] = useState("");

  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const instagramRef = useRef(null);

  useEffect(() => {
    fetch("/api/slots").then((r) => r.json()).then((data) => setSlots(data.slots || [])).catch(() => setSlots([]));
    setHasMounted(true);
  }, []);

  const eligibleSlots = useMemo(() => {
    if (!slots) return null;
    if (!removalId) return slots.filter((s) => (s.duration || 120) < 180);
    return slots.filter((s) => (s.duration || 120) >= 180);
  }, [slots, removalId]);

  const datesWithSlots = useMemo(() => {
    const set = new Set();
    (eligibleSlots || []).forEach((s) => set.add(s.date));
    return set;
  }, [eligibleSlots]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate || !eligibleSlots) return [];
    return eligibleSlots.filter((s) => s.date === selectedDate);
  }, [eligibleSlots, selectedDate]);

  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [viewMonth]);

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function handleNameKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      phoneRef.current?.focus();
    }
  }

  function handlePhoneKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      emailRef.current?.focus();
    }
  }

  function handleEmailKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailFieldError("Please enter a valid email address.");
      } else {
        setEmailFieldError("");
        instagramRef.current?.focus();
      }
    }
  }
  function handleEmailBlur() {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailFieldError("Please enter a valid email address.");
    } else {
      setEmailFieldError("");
    }
  }

  function handleInstagramKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      instagramRef.current?.blur();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFormNotice("");
    const missing = [];
    if (!name) missing.push("Name");
    if (!phone) missing.push("Phone");
    if (!email) {
      missing.push("Email");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!instagram) missing.push("Instagram");
    if (isStudent === null) missing.push("student status");
    if (!slotId) {
      if (eligibleSlots?.length === 0) {
        setFormNotice("Currently fully booked! Feel free to join the waitlist !! ♡");
        return;
      }
      missing.push("a time slot");
    }
    if (!policyAgreed) missing.push("confirmation that you've read the policies");
    if (missing.length > 0) {
      setFormError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, removalId: removalId || null, name, phone, instagram, email, isStudent }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Booking failed");
      }

      const slot = slots.find((s) => s.id === slotId);
      const removal = removalId ? REMOVALS.find((r) => r.id === removalId) : null;
      const when = slot ? `${slot.date} at ${formatTime(slot.time)}` : "";
      const removalLabel = removal ? removal.label : "no removal";

      const params = new URLSearchParams({ when, removal: removalLabel, name, phone, instagram, email });
      router.push(`/book/confirmed?${params.toString()}`);
    } catch (err) {
      setStatus("error");
      setFormError(err.message);
    }
  }

  async function handleWaitlistSubmit() {
    setWaitlistError("");
    const missing = [];
    if (!name) missing.push("Name");
    if (!phone) missing.push("Phone");
    if (!instagram) missing.push("Instagram");
    if (!removalChosen) missing.push("a removal option");
    if (missing.length > 0) {
      setWaitlistError(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    setWaitlistStatus("submitting");
    try {
      const removal = removalId ? REMOVALS.find((r) => r.id === removalId) : null;
      const res = await fetch("/api/admin/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, instagram, removal: removal ? removal.label : "None needed" }),
      });
      if (!res.ok) throw new Error("Failed to join");
      setWaitlistStatus("done");
    } catch (err) {
      setWaitlistError("Error: " + err.message);
      setWaitlistStatus("idle");
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
            <h2 className="font-display text-xl italic text-inkDeep mb-4">1. Your info</h2>
            <div className="grid gap-3 max-w-md">
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep focus:outline-none"
              />
              <input
                ref={phoneRef}
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handlePhoneKeyDown}
                className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep focus:outline-none"
              />
              <div>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailFieldError(""); }}
                  onKeyDown={handleEmailKeyDown}
                  onBlur={handleEmailBlur}
                  className="w-full rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep focus:outline-none"
                />
                {emailFieldError && (
                  <p className="text-sm text-red-600 mt-1">{emailFieldError}</p>
                )}
              </div>
              <input
                ref={instagramRef}
                placeholder="Instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                onKeyDown={handleInstagramKeyDown}
                className="rounded-xl px-4 py-2.5 bg-mist ring-1 ring-line focus:ring-inkDeep focus:outline-none"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-2">2. Student status</h2>
            <p className="text-sm text-ink/60 mb-4">Student pricing is self-reported and requires a valid student status.</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button type="button" onClick={() => setIsStudent(true)} className={`rounded-xl px-4 py-3 ring-1 transition ${isStudent === true ? "bg-mist ring-inkDeep" : "ring-line"}`}>
                Yes, I'm a student
              </button>
              <button type="button" onClick={() => setIsStudent(false)} className={`rounded-xl px-4 py-3 ring-1 transition ${isStudent === false ? "bg-mist ring-inkDeep" : "ring-line"}`}>
                No, regular rate
              </button>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-2">3. Removal</h2>
            <p className="text-sm text-ink/80 mb-4">PLEASE NOTE: I DO NOT OFFER FOREIGN REMOVALS <br /> (please do not select a removal option if you got your nails done elsewhere).</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => { setRemovalId(""); setRemovalChosen(true); setSelectedDate(null); setSlotId(""); }} className={`rounded-xl px-4 py-3 text-left ring-1 transition ${removalId === "" ? "bg-mist ring-inkDeep" : "ring-line"}`}>None needed</button>
              {REMOVALS.map((r) => (
                <button type="button" key={r.id} onClick={() => { setRemovalId(r.id); setRemovalChosen(true); setSelectedDate(null); setSlotId(""); }} className={`rounded-xl px-4 py-3 ring-1 transition ${removalId === r.id ? "bg-mist ring-inkDeep" : "ring-line"}`}>
                  {r.label} +${r.price}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl italic text-inkDeep mb-4">4. Open slots</h2>
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
                      Currently fully booked! Follow @nsywnails on Instagram for availability updates! In the meantime, feel free to join the waitlist!
                    </p>
                    {waitlistError && (
                      <p className="text-sm text-red-600 font-medium">{waitlistError}</p>
                    )}
                    <button type="button" onClick={handleWaitlistSubmit} className="w-full rounded-full bg-inkDeep py-2.5 text-mist">
                      {waitlistStatus === "submitting" ? "Joining..." : "Join Priority Waitlist"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl ring-1 ring-line p-4">
                {/* Calendar header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 })}
                    className="p-2 rounded-full hover:bg-mist"
                    aria-label="Previous month"
                  >
                    ←
                  </button>
                  <p className="font-display text-lg text-inkDeep">{monthLabel}</p>
                  <button
                    type="button"
                    onClick={() => setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 })}
                    className="p-2 rounded-full hover:bg-mist"
                    aria-label="Next month"
                  >
                    →
                  </button>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 gap-1 mb-1 text-center text-xs uppercase tracking-wide text-ink/40">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i}>{d}</div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    if (day === null) return <div key={i} />;
                    const key = dateKey(viewMonth.year, viewMonth.month, day);
                    const hasSlots = datesWithSlots.has(key);
                    const isSelected = selectedDate === key;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={!hasSlots}
                        onClick={() => { setSelectedDate(key); setSlotId(""); }}
                        className={`aspect-square rounded-lg text-sm flex items-center justify-center transition ${isSelected
                          ? "bg-inkDeep text-mist"
                          : hasSlots
                            ? "bg-mist text-inkDeep hover:ring-1 hover:ring-inkDeep"
                            : "text-ink/25 cursor-not-allowed"
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Times for selected date */}
                {selectedDate && (
                  <div className="mt-5 pt-5 border-t border-line/70">
                    <p className="text-sm text-ink/60 mb-3">Available times</p>
                    <div className="grid grid-cols-2 gap-3">
                      {slotsForSelectedDate.map((s) => (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setSlotId(s.id)}
                          className={`rounded-xl px-4 py-3 ring-1 ${slotId === s.id ? "bg-inkDeep text-mist" : "ring-line"}`}
                        >
                          {formatTime(s.time)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-stoneDeep/60 ring-1 ring-line p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={policyAgreed}
                onChange={(e) => setPolicyAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 accent-inkDeep flex-shrink-0"
              />
              <span className="text-base text-inkDeep">
                I have read and understood the{" "}
                <Link href="/policies" target="_blank" className="underline text-umber hover:text-inkDeep">
                  studio policies
                </Link>.
              </span>
            </label>
          </div>

          {formError && (
            <p className="text-sm text-red-600 font-medium text-center">{formError}</p>
          )}
          {formNotice && (
            <p className="text-sm text-umber font-medium text-center">{formNotice}</p>
          )}

          <button type="submit" disabled={status === "submitting"} className="w-full rounded-full bg-inkDeep px-7 py-3 text-mist">
            {status === "submitting" ? "Sending..." : "Book Now"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}