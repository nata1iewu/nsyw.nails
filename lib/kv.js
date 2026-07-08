// lib/kv.js
import { createClient } from "@vercel/kv";

function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  return createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

// Data fetchers
export async function getSlots() {
  const kv = getKv();
  if (!kv) return [];
  try { return (await kv.get("natwnails:slots")) || []; } catch { return []; }
}

export async function getBookings() {
  const kv = getKv();
  if (!kv) return [];
  try { return (await kv.get("natwnails:bookings")) || []; } catch { return []; }
}

export async function getWaitlist() {
  const kv = getKv();
  if (!kv) return [];
  try { return (await kv.get("natwnails:waitlist")) || []; } catch { return []; }
}

// Admin / Booking actions
export async function setBookingStatus(id, status) {
  const kv = getKv();
  if (!kv) return;
  const bookings = (await kv.get("natwnails:bookings")) || [];
  const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
  await kv.set("natwnails:bookings", updated);
}

export async function setSlotStatus(id, status) {
  const kv = getKv();
  if (!kv) return;
  const slots = (await kv.get("natwnails:slots")) || [];
  const updated = slots.map(s => s.id === id ? { ...s, status } : s);
  await kv.set("natwnails:slots", updated);
}

export async function addSlot(slot) {
  const kv = getKv();
  if (!kv) return;
  const slots = (await kv.get("natwnails:slots")) || [];
  await kv.set("natwnails:slots", [...slots, slot]);
}

export async function removeSlot(id) {
  const kv = getKv();
  if (!kv) return;
  const slots = (await kv.get("natwnails:slots")) || [];
  await kv.set("natwnails:slots", slots.filter(s => s.id !== id));
}

export async function addBooking(booking) {
  const kv = getKv();
  if (!kv) return;
  const bookings = (await kv.get("natwnails:bookings")) || [];
  await kv.set("natwnails:bookings", [...bookings, booking]);
}

export async function addToWaitlist(data) {
  const kv = getKv();
  if (!kv) return;
  const list = (await kv.get("natwnails:waitlist")) || [];
  await kv.set("natwnails:waitlist", [...list, { ...data, timestamp: new Date().toISOString() }]);
}