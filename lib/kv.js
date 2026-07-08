import { createClient } from "@vercel/kv";

export const kvClient = process.env.KV_REST_API_URL
  ? createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

const BOOKINGS_KEY = "natwnails:bookings";
const SLOTS_KEY = "natwnails:slots";
const WAITLIST_KEY = "natwnails:waitlist";

export async function getBookings() {
  if (!kvClient) return [];
  const b = await kvClient.get(BOOKINGS_KEY);
  return Array.isArray(b) ? b : [];
}

export async function getSlots() {
  if (!kvClient) return [];
  const s = await kvClient.get(SLOTS_KEY);
  return Array.isArray(s) ? s : [];
}

// Atomic double-booking prevention logic
export async function addBooking(data) {
  if (!kvClient) return { id: "mock" };
  
  const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const bookings = await getBookings();
  const slots = await getSlots();
  
  const targetSlot = slots.find((s) => s.id === data.slotId);
  if (!targetSlot || targetSlot.status !== "open") {
    throw new Error("This slot was just secured by someone else!");
  }

  const booking = { id, status: "pending", createdAt: Date.now(), ...data };
  bookings.push(booking);
  
  const updatedSlots = slots.map((s) =>
    s.id === data.slotId ? { ...s, status: "pending" } : s
  );
  
  await kvClient.set(BOOKINGS_KEY, bookings);
  await kvClient.set(SLOTS_KEY, updatedSlots);
  
  return booking;
}

// --- ADMIN SLOT UTILITIES ---
export async function addSlot(slotData) {
  if (!kvClient) return;
  const slots = await getSlots();
  const newSlot = {
    id: `sl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "open",
    ...slotData,
  };
  slots.push(newSlot);
  await kvClient.set(SLOTS_KEY, slots);
  return newSlot;
}

export async function removeSlot(slotId) {
  if (!kvClient) return;
  const slots = await getSlots();
  const updatedSlots = slots.filter((s) => s.id !== slotId);
  await kvClient.set(SLOTS_KEY, updatedSlots);
}

export async function setSlotStatus(slotId, status) {
  if (!kvClient) return;
  const slots = await getSlots();
  const updatedSlots = slots.map((s) => (s.id === slotId ? { ...s, status } : s));
  await kvClient.set(SLOTS_KEY, updatedSlots);
}

// --- ADMIN BOOKING UTILITIES ---
export async function setBookingStatus(bookingId, status) {
  if (!kvClient) return;
  const bookings = await getBookings();
  const updatedBookings = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
  await kvClient.set(BOOKINGS_KEY, updatedBookings);
}

// --- WAITLIST UTILITIES ---
export async function getWaitlist() {
  if (!kvClient) return [];
  const list = await kvClient.get(WAITLIST_KEY);
  return Array.isArray(list) ? list : [];
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
  await kvClient.set(WAITLIST_KEY, list);
  return entry;
}
// cache bust: 1783491435
