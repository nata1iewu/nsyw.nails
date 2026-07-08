"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [waitlist, setWaitlist] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/waitlist");
      if (res.ok) {
        const data = await res.json();
        setWaitlist(data.waitlist || []);
      }
    } catch (e) { console.error("Error loading data", e); }
  }

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  async function handleAddSlot() {
    if (!date || !time) return alert("Fill in date and time!");
    const res = await fetch("/api/admin/add-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Date.now().toString(), date, time, status: "available" }),
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
    // Expects input like: 07/09, 10:00 AM, 12:00 PM, 2:00 PM
    const parts = date.split(',').map(p => p.trim());
    if (parts.length < 2) return alert("Format: Date, Time1, Time2...");

    const dateStr = parts[0];
    const timeSlots = parts.slice(1);

    const newSlots = timeSlots.map(time => ({
      id: Date.now().toString() + Math.random(),
      date: dateStr,
      time: time,
      status: "available"
    }));

    const res = await fetch("/api/admin/add-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSlots),
    });

    if (res.ok) {
      alert("Slots added!");
      setDate(""); // Clear the input
      fetchData(); // Refresh the list
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
      <div className="mb-10 p-6 border rounded-2xl">
        <h2 className="mb-4">Add Slot</h2>
        <div className="flex gap-2">
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="07/09" className="p-2 border rounded" />
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="2:00 PM" className="p-2 border rounded" />
          <button onClick={handleAddSlot} className="bg-black text-white px-4 py-2 rounded">Add</button>
        </div>
      </div>
      <div>
        <h2 className="text-xl mb-4">Waitlist ({waitlist.length})</h2>
        {waitlist.map((w, i) => (
          <div key={i} className="py-2 border-b">
            {w.name} - {w.phone} {w.instagram ? `- ${w.instagram}` : ""}
          </div>
        ))}
      </div>
    </main>
  );
}