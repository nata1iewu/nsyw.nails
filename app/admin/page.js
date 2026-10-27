"use client";
import { useEffect, useMemo, useState } from "react";

function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [waitlist, setWaitlist] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("120");
  const [bulkInput, setBulkInput] = useState("");
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editSlotId, setEditSlotId] = useState("");

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
      const slotsRes = await fetch("/api/admin/add-slot");
      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setAllSlots(data.slots || []);
      }
    } catch (e) { console.error("Error loading data", e); }
  }

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  const openSlots = useMemo(() => allSlots.filter((s) => s.status === "open"), [allSlots]);

  const datesWithSlots = useMemo(() => {
    const set = new Set();
    allSlots.forEach((s) => set.add(s.date));
    return set;
  }, [allSlots]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return allSlots.filter((s) => s.date === selectedDate);
  }, [allSlots, selectedDate]);

  // Maps slotId -> the pending/approved booking currently holding that slot
  const activeBookingBySlot = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (b.status === "pending" || b.status === "approved") map[b.slotId] = b;
    });
    return map;
  }, [bookings]);

  const currentMonthKey = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  })();

  const bookingsByMonth = useMemo(() => {
    const groups = {};
    bookings.forEach((b) => {
      const key = b.date ? b.date.slice(0, 7) : "unknown";
      (groups[key] = groups[key] || []).push(b);
    });
    return Object.keys(groups)
      .sort((a, b) => (a === "unknown" ? 1 : b === "unknown" ? -1 : b.localeCompare(a)))
      .map((key) => ({
        key,
        label:
          key === "unknown"
            ? "No date"
            : new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            }),
        items: groups[key].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
      }));
  }, [bookings]);

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

  async function handleCancelBooking(b) {
    if (!confirm(`Cancel ${b.name}'s appointment on ${b.date} at ${b.time}? This will reopen the slot and email them.`)) return;
    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, action: "cancel" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      alert(data.emailed
        ? "Appointment cancelled and the client was emailed."
        : "Appointment cancelled. No email was sent (no email on file, or sending failed).");
      fetchData();
    } else {
      alert(data.error || "Failed to cancel booking.");
    }
  }

  async function handleDeleteBooking(b) {
    const active = b.status === "pending" || b.status === "approved";
    const msg = active
      ? `Delete ${b.name}'s booking record? If the appointment is still upcoming, its time slot will be reopened. No email will be sent — use "Cancel appointment" if you want to notify them.`
      : `Permanently delete ${b.name}'s ${b.status} booking record?`;
    if (!confirm(msg)) return;
    const res = await fetch("/api/admin/bookings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id }),
    });
    if (res.ok) {
      fetchData();
    } else {
      alert("Failed to delete booking.");
    }
  }

  async function handleSaveEdit(b) {
    if (!editSlotId) return alert("Pick a new time first.");
    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, action: "reschedule", newSlotId: editSlotId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      alert(data.emailed
        ? "Appointment updated and the client was emailed."
        : "Appointment updated. No email was sent (no email on file, or sending failed).");
      setEditingId(null);
      setEditSlotId("");
      fetchData();
    } else {
      alert(data.error || "Failed to update appointment.");
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

  async function handleRemoveSlot(slot, booking) {
    const msg = booking
      ? `This slot has an active booking for ${booking.name}. Removing the slot will NOT cancel or email them — cancel the appointment first if you want that. Remove the slot anyway?`
      : "Remove this slot?";
    if (!confirm(msg)) return;
    const res = await fetch("/api/admin/add-slot", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: slot.id }),
    });
    if (res.ok) {
      fetchData();
    } else {
      alert("Failed to remove slot.");
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
        ↻ Refresh bookings, waitlist & slots
      </button>

      <div className="mb-10 p-6 border rounded-2xl">

        <h2 className="text-lg font-bold mb-4">Add Single Slot</h2>
        <div className="flex gap-2 mb-8">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-2 border rounded" />
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="p-2 border rounded">
            <option value="60">1 hr (removal only, no new set)</option>
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

      <div className="mb-10 p-6 border rounded-2xl">
        <h2 className="text-lg font-bold mb-4">Manage Slots</h2>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 })}
            className="p-2 rounded hover:bg-gray-100"
          >
            ←
          </button>
          <p className="font-bold">{monthLabel}</p>
          <button
            onClick={() => setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 })}
            className="p-2 rounded hover:bg-gray-100"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1 text-center text-xs uppercase text-gray-400">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={i} />;
            const key = dateKey(viewMonth.year, viewMonth.month, day);
            const hasSlots = datesWithSlots.has(key);
            const isSelected = selectedDate === key;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(key)}
                className={`aspect-square rounded text-sm flex items-center justify-center ${isSelected ? "bg-black text-white" : hasSlots ? "bg-yellow-100 hover:bg-yellow-200" : "text-gray-300"
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="border-t pt-4">
            <p className="text-sm font-bold mb-2">Slots on {selectedDate}</p>
            {slotsForSelectedDate.length === 0 ? (
              <p className="text-sm text-gray-500">No slots on this date.</p>
            ) : (
              slotsForSelectedDate.map((s) => {
                const booking = activeBookingBySlot[s.id];
                return (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b gap-3">
                    <span className="text-sm">
                      {s.time} — {s.duration || 120} min — <span className="uppercase">{s.status}</span>
                      {booking && (
                        <>
                          {" "}— <span className="font-bold">{booking.name}</span>{" "}
                          <span className="text-gray-500">
                            ({booking.status === "approved" ? "approved" : "pending approval"})
                          </span>
                        </>
                      )}
                    </span>
                    <button onClick={() => handleRemoveSlot(s, booking)} className="text-red-500 text-sm underline shrink-0">
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Bookings ({bookings.length})</h2>
          <button onClick={async () => {
            if (confirm("Are you sure? This will permanently delete ALL booking records, including past ones. This can't be undone.")) {
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
          bookingsByMonth.map((group) => {
            const pendingCount = group.items.filter((b) => b.status === "pending").length;
            return (
              <details
                key={group.key}
                open={group.key >= currentMonthKey}
                className="mb-4 border rounded-2xl px-4"
              >
                <summary className="cursor-pointer select-none py-3 text-lg font-bold">
                  {group.label} ({group.items.length})
                  {pendingCount > 0 && (
                    <span className="ml-3 text-xs font-normal bg-yellow-200 px-2 py-0.5 rounded">
                      {pendingCount} pending
                    </span>
                  )}
                </summary>

                <div className="pb-2">
                  {group.items.map((b) => (
                    <div key={b.id} className="py-3 border-t">
                      <div className="font-bold">{b.date} at {b.time} — {b.name}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {b.phone} {b.email ? `· ${b.email}` : ""} {b.instagram ? `- @${b.instagram}` : ""} {b.removal ? `· ${b.removal}` : ""} · {b.isStudent ? "Student rate" : "Regular rate"} · <span className="uppercase">{b.status}</span>
                      </div>

                      {editingId === b.id ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <select
                            value={editSlotId}
                            onChange={(e) => setEditSlotId(e.target.value)}
                            className="p-2 border rounded text-sm"
                          >
                            <option value="">Pick a new time…</option>
                            {openSlots.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.date} at {s.time} ({s.duration || 120} min)
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(b)} className="bg-black text-white text-sm px-3 py-1 rounded">Save & email client</button>
                            <button onClick={() => { setEditingId(null); setEditSlotId(""); }} className="text-sm underline">Never mind</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {b.status === "pending" && (
                            <>
                              <button onClick={() => handleBookingAction(b.id, "approve")} className="bg-green-600 text-white text-sm px-3 py-1 rounded">Approve</button>
                              <button onClick={() => handleBookingAction(b.id, "deny")} className="bg-red-600 text-white text-sm px-3 py-1 rounded">Deny</button>
                            </>
                          )}
                          {b.status === "approved" && (
                            <>
                              <button onClick={() => { setEditingId(b.id); setEditSlotId(""); }} className="bg-black text-white text-sm px-3 py-1 rounded">Edit time</button>
                              <button onClick={() => handleCancelBooking(b)} className="bg-red-600 text-white text-sm px-3 py-1 rounded">Cancel appointment</button>
                            </>
                          )}
                          <button onClick={() => handleDeleteBooking(b)} className="border border-red-600 text-red-600 text-sm px-3 py-1 rounded">Delete</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            );
          })
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