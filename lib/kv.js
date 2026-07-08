// lib/kv.js
import { kv } from "@vercel/kv";

// Data fetchers
export async function getSlots() {
  try { return (await kv.get("natwnails:slots")) || []; } catch { return []; }
}

export async function getBookings() {
  try { return (await kv.get("natwnails:bookings")) || []; } catch { return []; }
}

export async function getWaitlist() {
  try { return (await kv.get("natwnails:waitlist")) || []; } catch { return []; }
}

// Admin / Booking actions
export async function setBookingStatus(id, status) {
  const bookings = (await kv.get("natwnails:bookings")) || [];
  const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
  await kv.set("natwnails:bookings", updated);
}

export async function setSlotStatus(id, status) {
  const slots = (await kv.get("natwnails:slots")) || [];
  const updated = slots.map(s => s.id === id ? { ...s, status } : s);
  await kv.set("natwnails:slots", updated);
}

export async function addSlot(slot) {
  const slots = (await kv.get("natwnails:slots")) || [];
  await kv.set("natwnails:slots", [...slots, slot]);
}

export async function removeSlot(id) {
  const slots = (await kv.get("natwnails:slots")) || [];
  await kv.set("natwnails:slots", slots.filter(s => s.id !== id));
}

export async function addBooking(booking) {
  const bookings = (await kv.get("natwnails:bookings")) || [];
  await kv.set("natwnails:bookings", [...bookings, booking]);
}

export async function addToWaitlist(data) {
  try {
    const list = (await kv.get("natwnails:waitlist")) || [];
    await kv.set("natwnails:waitlist", [...list, { ...data, timestamp: new Date().toISOString() }]);
  } catch (error) {
    console.error("KV Error:", error);
    throw new Error("Database connection failed");
  }
}