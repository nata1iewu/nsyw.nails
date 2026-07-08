import { createClient } from "@vercel/kv";

const SLOTS_KEY = "natwnails:slots";
const BOOKINGS_KEY = "natwnails:bookings";

// Check if we have a real, valid Upstash/Vercel KV URL configured
const hasValidUrl =
  process.env.KV_REST_API_URL &&
  process.env.KV_REST_API_URL.startsWith("https://") &&
  !process.env.KV_REST_API_URL.includes("localhost") &&
  !process.env.KV_REST_API_URL.includes("dummy");

// Only initialize the client if the URL is completely valid
const kvClient = hasValidUrl
  ? createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
  : null;

// --- Slots ---
export async function getSlots() {
  if (!kvClient) return []; // Safe fallback for the build process
  const slots = await kvClient.get(SLOTS_KEY);
  return Array.isArray(slots) ? slots : [];
}

export async function saveSlots(slots) {
  if (!kvClient) return;
  await kvClient.set(SLOTS_KEY, slots);
}

export async function addSlot({ date, time, duration }) {
  if (!kvClient) return "";
  const slots = await getSlots();
  const id = `${date}_${time}_${Math.random().toString(36).slice(2, 7)}`;
  // Keeps Claude's duration update
  slots.push({ id, date, time, duration: duration || 60, status: "open" });
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
export async function getBookings() {
  if (!kvClient) return []; // Safe fallback for the build process
  const bookings = await kvClient.get(BOOKINGS_KEY);
  return Array.isArray(bookings) ? bookings : [];
}

export async function saveBookings(bookings) {
  if (!kvClient) return;
  await kvClient.set(BOOKINGS_KEY, bookings);
}

export async function addBooking(data) {
  if (!kvClient) return { id: "mock" };
  const bookings = await getBookings();
  const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Keeps Claude's updates (instagram, deposit, removalPolicy, etc.) passed via data
  const booking = { id, status: "pending", createdAt: Date.now(), ...data };
  bookings.push(booking);
  await saveBookings(bookings);
  return booking;
}

export async function setBookingStatus(id, status) {
  if (!kvClient) return null;
  const bookings = await getBookings();
  let target = null;
  const next = bookings.map((b) => {
    if (b.id === id) {
      target = { ...b, status };
      return target;
    }
    return b;
  });
  await saveBookings(next);
  return target;
}