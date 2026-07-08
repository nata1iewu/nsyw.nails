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
  const [waitlist, setWaitlist] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  async function refresh() {
    try {
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

      const wRes = await fetch("/api/admin/waitlist");
      if (wRes.ok) setWaitlist((await wRes.json()).waitlist || []);
    } catch (e) {
      console.error("Refresh failed", e);
    }
  }

  async function handleAddSlot() {
    const res = await fetch('/api/admin/add-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: Date.now().toString(),
        time: `${date} ${time}`,
        status: "available"
      })
    });
    if (res.ok) {
      alert("Slot added!");
      setDate("");
      setTime("");
      refresh();
    }
  }

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAuthed(true);
    else setLoginError("Incorrect password.");
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-6 py-28">
        <h1 className="font-display text-2xl text-ink mb-6">Admin login</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl px-4 py-3 bg-mist ring-1 ring-line" />
          <button type="submit" className="w-full rounded-full bg-inkDeep px-7 py-3 text-mist">Log in</button>
        </form>
      </main>
    );
  }

  const pending = bookings.filter((b) => b.status === "pending");

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-10">Studio dashboard</h1>

      <Section title="Add new slot">
        <div className="flex gap-2">
          <input
            type="text" placeholder="Date (e.g., 07/09)"
            value={date} onChange={(e) => setDate(e.target.value)}
            className="rounded-xl px-4 py-2 bg-mist ring-1 ring-line w-1/3"
          />
          <input
            type="text" placeholder="Time (e.g., 2:00 PM)"
            value={time} onChange={(e) => setTime(e.target.value)}
            className="rounded-xl px-4 py-2 bg-mist ring-1 ring-line w-1/3"
          />
          <button onClick={handleAddSlot} className="rounded-full bg-inkDeep px-6 py-2 text-mist">
            Add
          </button>
        </div>
      </Section>

      <Section title="Waitlist">
        <ul className="divide-y divide-line/70">
          {waitlist.map((entry, idx) => (
            <li key={idx} className="py-2">{entry.name} · {entry.phone} · @{entry.instagram}</li>
          ))}
        </ul>
      </Section>

      <Section title={`Pending requests (${pending.length})`}>
        <ul className="space-y-3">
          {pending.map((b) => (
            <li key={b.id} className="rounded-2xl ring-1 ring-line/70 p-4 bg-stoneDeep/40">
              <p className="font-medium">{b.name}</p>
              <p>{b.phone} · @{b.instagram}</p>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}