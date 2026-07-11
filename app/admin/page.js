"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [waitlist, setWaitlist] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("120");
  const [bulkInput, setBulkInput] = useState("");

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/waitlist");
      if (res.ok) {
        const data = await res.json();
        setWaitlist(data.waitlist || []);
      } else if (res.status === 401) {
        alert("Session expired — please log in again.");
        setAuthed(false);
      }
      const bookingsRes = await fetch("/api/admin/bookings");
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      } else if (bookingsRes.status === 401) {
        alert("Session expired — please log in again.");
        setAuthed(false);
      }
    } catch (e) { console.error("Error loading data", e); }
  }

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  async function handleBookingAction(id, action) {
    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      fetchData();
    } else {
      alert("Failed to update booking.");
    }
  }

  async function handleAddSlot() {
    if (!date || !time) return alert("Fill in date and time!");
    const res = await fetch("/api/admin/add-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Date.now().toString(), date, time, duration: Number(duration), status: "open" }),
    });
    if (res.ok) {
      alert("Slot added successfully!");
      setDate(""); setTime("");
      fetchData();
    } else {
      alert("Failed to add slot.");
    }
  }

  async function handleBulkAdd() {
    const lines = bulkInput.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return alert("Enter at least one slot line.");

    const newSlots = [];
    for (const line of lines) {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length < 2) {
        return alert(`Bad line (needs date, time): "${line}"`);
      }
      const [lineDate, lineTime, lineDuration] = parts;
      newSlots.push({
        id: Date.now().toString() + Math.random(),
        date: lineDate,
        time: lineTime,
        duration: lineDuration ? Number(lineDuration) : 120,
        status: "open",
      });
    }

    const res = await fetch("/api/admin/add-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSlots),
    });

    if (res.ok) {
      alert(`${newSlots.length} slots added!`);
      setBulkInput("");
      fetchData();
    } else {
      alert("Failed to add slots.");
    }
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-6 py-28">
        <h1 className="text-2xl mb-6">Admin Login</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl" />
        <button onClick={async () => {
          const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          if (res.ok) setAuthed(true);
          else alert("Wrong password.");
        }} className="w-full mt-3 bg-black text-white p-3 rounded-full">Log in</button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-10">
      <h1 className="text-3xl mb-10">Dashboard</h1>
      <button onClick={fetchData} className="mb-8 text-sm underline text-inkDeep">
        ↻ Refresh bookings & waitlist
      </button>

      <div className="mb-10 p-6 border rounded-2xl">

        <h2 className="text-lg font-bold mb-4">Add Single Slot</h2>
        <div className="flex gap-2 mb-8">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-2 border rounded" />
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="p-2 border rounded">
            <option value="120">2 hrs (standard)</option>
            <option value="180">3 hrs (removal-eligible)</option>
            <option value="240">4 hrs (removal-eligible)</option>
          </select>
          <button onClick={handleAddSlot} className="bg-black text-white px-4 py-2 rounded">Add</button>
        </div>

        <h2 className="text-lg font-bold mb-2">Bulk Add Slots</h2>
        <p className="text-xs text-gray-500 mb-2">
          One slot per line: date, time, duration (minutes, optional — defaults to 120). 180+ = removal-eligible.<br />
          Example:<br />
          2026-07-09, 10:00, 120<br />
          2026-07-09, 14:00, 180<br />
          2026-07-10, 09:00
        </p>
        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder={"2026-07-09, 10:00, 120\n2026-07-09, 14:00, 180\n2026-07-10, 09:00"}
          rows={6}
          className="w-full p-2 border rounded font-mono text-sm mb-2"
        />
        <button onClick={handleBulkAdd} className="bg-black text-white px-4 py-2 rounded">Bulk Add</button>

        <button onClick={async () => {
          if (confirm("Are you sure? This will delete ALL slots, including valid upcoming ones.")) {
            const res = await fetch("/api/admin/add-slot", { method: "DELETE" });
            if (res.ok) {
              alert("All slots cleared.");
              fetchData();
            } else {
              alert("Failed to clear slots.");
            }
          }
        }} className="block text-red-500 text-sm underline mt-3">Clear All Slots</button>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Bookings ({bookings.length})</h2>
          <button onClick={async () => {
            if (confirm("Are you sure? This will delete ALL booking records.")) {
              const res = await fetch("/api/admin/bookings", { method: "DELETE" });
              if (res.ok) {
                alert("All bookings cleared.");
                fetchData();
              } else {
                alert("Failed to clear bookings.");
              }
            }
          }} className="text-red-500 text-sm underline">Clear Bookings</button>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-500">No bookings yet.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="py-3 border-b">
              <div className="font-bold">{b.date} at {b.time} — {b.name}</div>
              <div className="text-sm text-gray-600 mb-2">
                {b.phone} {b.instagram ? `- @${b.instagram}` : ""} {b.removal ? `· ${b.removal}` : ""} · <span className="uppercase">{b.status}</span>
              </div>
              {b.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleBookingAction(b.id, "approve")} className="bg-green-600 text-white text-sm px-3 py-1 rounded">Approve</button>
                  <button onClick={() => handleBookingAction(b.id, "deny")} className="bg-red-600 text-white text-sm px-3 py-1 rounded">Deny</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Waitlist ({waitlist.length})</h2>
          <button onClick={async () => {
            if (confirm("Are you sure? This will delete all entries.")) {
              const res = await fetch("/api/admin/waitlist", { method: "DELETE" });
              if (res.ok) fetchData();
            }
          }} className="text-red-500 text-sm underline">Clear Waitlist</button>
        </div>
        {waitlist.map((w, i) => (
          <div key={i} className="py-2 border-b">
            {w.name} - {w.phone} {w.instagram ? `- ${w.instagram}` : ""} {w.removal ? `- ${w.removal}` : ""}
          </div>
        ))}
      </div>
    </main>
  );
}