"use client";

import { useEffect, useState } from "react";

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-xl text-ink mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const [slotsRes, bookingsRes] = await Promise.all([
      fetch("/api/admin/slots"),
      fetch("/api/admin/bookings"),
    ]);
    if (slotsRes.status === 401 || bookingsRes.status === 401) {
      setAuthed(false);
      return;
    }
    setSlots((await slotsRes.json()).slots || []);
    setBookings((await bookingsRes.json()).bookings || []);
  }

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setLoginError("Incorrect password.");
    }
  }

  async function addSlot(e) {
    e.preventDefault();
    if (!date || !time) return;
    setLoading(true);
    await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time }),
    });
    setDate("");
    setTime("");
    await refresh();
    setLoading(false);
  }

  async function deleteSlot(id) {
    await fetch("/api/admin/slots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refresh();
  }

  async function actOnBooking(id, action) {
    await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await refresh();
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-6 py-28">
        <h1 className="font-display text-2xl text-ink mb-6">Admin login</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl px-4 py-3 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-sm"
          />
          {loginError && <p className="text-sm text-umber">{loginError}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-inkDeep px-7 py-3 font-body text-mist transition hover:bg-umber"
          >
            Log in
          </button>
        </form>
      </main>
    );
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const decided = bookings.filter((b) => b.status !== "pending");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-10">Studio dashboard</h1>

      <Section title="Add a slot">
        <form onSubmit={addSlot} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-ink/50 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl px-4 py-2 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/50 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl px-4 py-2 bg-mist ring-1 ring-line focus:ring-inkDeep outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-inkDeep px-6 py-2 font-body text-mist transition hover:bg-umber disabled:opacity-40"
          >
            Add
          </button>
        </form>
      </Section>

      <Section title={`Open & held slots (${slots.length})`}>
        {slots.length === 0 && <p className="text-sm text-ink/50">No slots yet.</p>}
        <ul className="divide-y divide-line/70 rounded-2xl ring-1 ring-line/70 overflow-hidden bg-white/40">
          {slots.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>
                {s.date} · {s.time}{" "}
                <span className="ml-2 text-xs uppercase text-ink/40">{s.status}</span>
              </span>
              <button
                onClick={() => deleteSlot(s.id)}
                className="text-umber hover:underline text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Pending requests (${pending.length})`}>
        {pending.length === 0 && <p className="text-sm text-ink/50">Nothing pending.</p>}
        <ul className="space-y-3">
          {pending.map((b) => (
            <li key={b.id} className="rounded-2xl ring-1 ring-line/70 p-4 bg-stoneDeep/40">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm">
                  <p className="font-medium text-ink">{b.name}</p>
                  <p className="text-ink/60">{b.phone}</p>
                  <p className="text-ink/60">
                    {b.date} · {b.time}
                  </p>
                  <p className="text-ink/60">
                    {b.size} — {b.tier}
                    {b.removal ? ` — ${b.removal}` : ""} — ${b.price}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => actOnBooking(b.id, "approve")}
                    className="rounded-full bg-inkDeep px-4 py-1.5 text-xs text-mist hover:bg-umber"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => actOnBooking(b.id, "deny")}
                    className="rounded-full px-4 py-1.5 text-xs ring-1 ring-line hover:bg-white"
                  >
                    Deny
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`History (${decided.length})`}>
        {decided.length === 0 && <p className="text-sm text-ink/50">Nothing yet.</p>}
        <ul className="divide-y divide-line/70 rounded-2xl ring-1 ring-line/70 overflow-hidden bg-white/40">
          {decided.map((b) => (
            <li key={b.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>
                {b.name} — {b.date} · {b.time}
              </span>
              <span
                className={`text-xs uppercase ${
                  b.status === "approved" ? "text-green-700" : "text-ink/40"
                }`}
              >
                {b.status}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
