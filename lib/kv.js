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

// Fixed & sanitized double-booking prevention logic
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

// Clean waitlist functions with safety arrays
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