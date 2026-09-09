import { createClient } from "@vercel/kv";

const SLOTS_KEY = "natwnails:slots";
const BOOKINGS_KEY = "natwnails:bookings";
const WAITLIST_KEY = "natwnails:waitlist";

// Only create a real client when a valid production URL is configured.
// This keeps `next build` from crashing when env vars are missing/placeholder —
// e.g. during local builds or before the KV database is connected on Vercel.
const hasValidUrl =
  process.env.KV_REST_API_URL &&
  process.env.KV_REST_API_URL.startsWith("https://") &&
  !process.env.KV_REST_API_URL.includes("localhost") &&
  !process.env.KV_REST_API_URL.includes("dummy");

const kvClient = hasValidUrl
  ? createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
  : null;

// --- Slots ---
// slot: { id, date: "YYYY-MM-DD", time: "HH:MM", duration: minutes (120 or 180),
//         status: "open" | "held" | "booked" }

export async function getSlots() {
  if (!kvClient) return [];
  const slots = await kvClient.get(SLOTS_KEY);
  return Array.isArray(slots) ? slots : [];
}

export async function saveSlots(slots) {
  if (!kvClient) return;
  await kvClient.set(SLOTS_KEY, slots);
}

export async function addSlot({ date, time, duration = 120 }) {
  if (!kvClient) return "";
  const slots = await getSlots();
  const id = `${date}_${time}_${Math.random().toString(36).slice(2, 7)}`;
  slots.push({ id, date, time, duration, status: "open" });
  slots.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  await saveSlots(slots);
  return id;
}

export async function removeSlot(id) {
  if (!kvClient) return;
  const slots = await getSlots();
  await saveSlots(slots.filter((s) => s.id !== id));
}

export async function setSlotStatus(id, status) {
  if (!kvClient) return;
  const slots = await getSlots();
  const next = slots.map((s) => (s.id === id ? { ...s, status } : s));
  await saveSlots(next);
}

// --- Bookings ---
// booking: { id, slotId, date, time, duration, name, phone, instagram, size, tier,
//            removal, price, manageToken, createdAt, status: "pending" | "approved" | "denied" | "cancelled" }

export async function getBookings() {
  if (!kvClient) return [];
  const bookings = await kvClient.get(BOOKINGS_KEY);
  return Array.isArray(bookings) ? bookings : [];
}

export async function getBookingById(id) {
  const bookings = await getBookings();
  return bookings.find((b) => b.id === id) || null;
}

export async function saveBookings(bookings) {
  if (!kvClient) return;
  await kvClient.set(BOOKINGS_KEY, bookings);
}

export async function addBooking(data) {
  if (!kvClient) return { id: "mock" };
  const bookings = await getBookings();
  const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const booking = { id, status: "pending", createdAt: Date.now(), ...data };
  bookings.push(booking);
  await saveBookings(bookings);
  return booking;
}

export async function setBookingStatus(id, status) {
  return updateBooking(id, { status });
}

// Generic patch used by reschedule/cancel — merges any fields into the booking.
export async function updateBooking(id, patch) {
  if (!kvClient) return null;
  const bookings = await getBookings();
  let target = null;
  const next = bookings.map((b) => {
    if (b.id === id) {
      target = { ...b, ...patch };
      return target;
    }
    return b;
  });
  await saveBookings(next);
  return target;
}

// --- Waitlist ---
// entry: { id, createdAt, name, phone, instagram, removal, ... }

export async function getWaitlist() {
  if (!kvClient) return [];
  const list = await kvClient.get(WAITLIST_KEY);
  return Array.isArray(list) ? list : [];
}

export async function saveWaitlist(list) {
  if (!kvClient) return;
  await kvClient.set(WAITLIST_KEY, list);
}

export async function addToWaitlist(data) {
  if (!kvClient) return { id: "mock" };
  const list = await getWaitlist();
  const entry = {
    id: `wl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    ...data,
  };
  list.push(entry);
  await saveWaitlist(list);
  return entry;
}

export async function clearWaitlist() {
  if (!kvClient) return;
  await saveWaitlist([]);
}