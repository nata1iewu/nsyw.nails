"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Calendar from "@/components/Calendar";

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function Manage() {
  const [params, setParams] = useState(null);
  const [state, setState] = useState("loading"); // loading | error | view | reschedule | done
  const [booking, setBooking] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [newSlotId, setNewSlotId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [doneAction, setDoneAction] = useState("");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setParams({ id: search.get("id"), t: search.get("t") });
  }, []);

  useEffect(() => {
    if (!params) return;
    if (!params.id || !params.t) {
      setState("error");
      setErrorMsg("This link looks incomplete.");
      return;
    }
    fetch(`/api/manage?id=${encodeURIComponent(params.id)}&t=${encodeURIComponent(params.t)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setState("error");
          setErrorMsg(data.error);
          return;
        }
        setBooking(data.booking);
        setAvailableSlots(data.availableSlots || []);
        setState("view");
      })
      .catch(() => {
        setState("error");
        setErrorMsg("Something went wrong loading your appointment.");
      });
  }, [params]);

  const timesForDate = useMemo(
    () => availableSlots.filter((s) => s.date === selectedDate),
    [availableSlots, selectedDate]
  );

  async function handleCancel() {
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id, token: params.t, action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setBooking(data.booking);
      setDoneAction("cancelled");
      setState("done");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReschedule() {
    if (!newSlotId) return;
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          token: params.t,
          action: "reschedule",
          newSlotId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setBooking(data.booking);
      setDoneAction("rescheduled");
      setState("done");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-lg px-6 py-28 text-center">
          <p className="text-ink/50">Loading your appointment…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (state === "error") {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-lg px-6 py-28 text-center">
          <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Not found</p>
          <h1 className="font-display text-3xl text-inkDeep mb-4">
            We couldn't find that appointment
          </h1>
          <p className="text-ink/70">{errorMsg}</p>
        </main>
        <Footer />
      </>
    );
  }

  if (state === "done") {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-lg px-6 py-28 text-center">
          <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">
            {doneAction === "cancelled" ? "Cancelled" : "Rescheduled"}
          </p>
          <h1 className="font-display text-3xl text-inkDeep mb-4">
            {doneAction === "cancelled"
              ? "Your appointment has been cancelled"
              : "You're all set for your new time"}
          </h1>
          {doneAction === "rescheduled" && (
            <p className="text-ink/70 text-lg">
              {formatDate(booking.date)} at {formatTime(booking.time)}
            </p>
          )}
          <a
            href="https://instagram.com/nsyw.nails"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block text-umber hover:underline"
          >
            Questions? DM @nsyw.nails
          </a>
        </main>
        <Footer />
      </>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-lg px-6 py-28 text-center">
          <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-3">
            Appointment cancelled
          </p>
          <h1 className="font-display text-3xl text-inkDeep mb-4">
            This appointment was already cancelled
          </h1>
          <p className="text-ink/70">
            Head to the booking page if you'd like to grab a new slot.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-xl px-6 pt-16 pb-24">
        <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Your appointment</p>
        <h1 className="font-display text-4xl text-inkDeep mb-8">
          {formatDate(booking.date)} <span className="font-script text-4xl text-umber">at</span>{" "}
          {formatTime(booking.time)}
        </h1>

        <div className="rounded-2xl ring-1 ring-line/70 bg-stoneDeep/60 p-6 mb-10 text-base text-ink/80 space-y-1">
          <p>
            {booking.size} — {booking.tier}
            {booking.removal ? ` — ${booking.removal}` : ""}
          </p>
          <p className="text-ink/60">
            Status:{" "}
            <span className="text-inkDeep font-medium">
              {booking.status === "approved" ? "Confirmed" : "Pending approval"}
            </span>
          </p>
          <p className="font-display text-xl text-umber pt-2">${booking.price}</p>
        </div>

        {state === "view" && !confirmingCancel && (
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setState("reschedule")}
              className="rounded-full bg-inkDeep px-7 py-3 font-body text-mist transition hover:bg-umber"
            >
              Reschedule
            </button>
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="rounded-full px-7 py-3 font-body text-ink ring-1 ring-line transition hover:bg-mist"
            >
              Cancel appointment
            </button>
          </div>
        )}

        {confirmingCancel && (
          <div className="rounded-2xl ring-1 ring-line/70 p-6">
            <p className="text-ink/80 mb-4">
              Are you sure you want to cancel this appointment? This can't be undone.
            </p>
            {errorMsg && <p className="text-umber text-sm mb-3">{errorMsg}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={handleCancel}
                className="rounded-full bg-inkDeep px-6 py-2 font-body text-mist transition hover:bg-umber disabled:opacity-40"
              >
                {busy ? "Cancelling…" : "Yes, cancel it"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                className="rounded-full px-6 py-2 font-body text-ink ring-1 ring-line transition hover:bg-mist"
              >
                Never mind
              </button>
            </div>
          </div>
        )}

        {state === "reschedule" && (
          <div>
            <p className="text-ink/70 mb-4">Pick a new date and time.</p>
            <Calendar
              slots={availableSlots}
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setNewSlotId("");
              }}
            />

            {selectedDate && (
              <div className="mt-5 grid grid-cols-3 gap-3">
                {timesForDate.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setNewSlotId(s.id)}
                    className={`rounded-xl px-4 py-3 text-sm ring-1 transition ${
                      newSlotId === s.id
                        ? "bg-inkDeep text-mist ring-inkDeep"
                        : "ring-line hover:bg-mist text-ink"
                    }`}
                  >
                    {formatTime(s.time)}
                  </button>
                ))}
              </div>
            )}

            {errorMsg && <p className="text-umber text-sm mt-4">{errorMsg}</p>}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={!newSlotId || busy}
                onClick={handleReschedule}
                className="rounded-full bg-inkDeep px-7 py-3 font-body text-mist transition hover:bg-umber disabled:opacity-40"
              >
                {busy ? "Saving…" : "Confirm new time"}
              </button>
              <button
                type="button"
                onClick={() => setState("view")}
                className="rounded-full px-7 py-3 font-body text-ink ring-1 ring-line transition hover:bg-mist"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
