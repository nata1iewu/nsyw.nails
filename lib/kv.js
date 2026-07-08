import { Redis } from '@upstash/redis';

// Hard-mapping to the exact names currently in your Vercel settings
const redis = new Redis({
  url: process.env.STORAGE_REDIS_URL,
  token: process.env.STORAGE_KV_REST_API_TOKEN,
});

// Now update all your functions to use the 'redis' client
export async function getSlots() {
  try { return (await redis.get("natwnails:slots")) || []; } catch { return []; }
}

export async function getBookings() {
  try { return (await redis.get("natwnails:bookings")) || []; } catch { return []; }
}

export async function getWaitlist() {
  try { return (await redis.get("natwnails:waitlist")) || []; } catch { return []; }
}

export async function setBookingStatus(id, status) {
  const bookings = (await redis.get("natwnails:bookings")) || [];
  const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
  await redis.set("natwnails:bookings", updated);
}

export async function setSlotStatus(id, status) {
  const slots = (await redis.get("natwnails:slots")) || [];
  const updated = slots.map(s => s.id === id ? { ...s, status } : s);
  await redis.set("natwnails:slots", updated);
}

export async function addSlot(slot) {
  const slots = (await redis.get("natwnails:slots")) || [];
  await redis.set("natwnails:slots", [...slots, slot]);
}

export async function removeSlot(id) {
  const slots = (await redis.get("natwnails:slots")) || [];
  await redis.set("natwnails:slots", slots.filter(s => s.id !== id));
}

export async function addBooking(booking) {
  const bookings = (await redis.get("natwnails:bookings")) || [];
  await redis.set("natwnails:bookings", [...bookings, booking]);
}

export async function addToWaitlist(data) {
  try {
    const list = (await redis.get("natwnails:waitlist")) || [];
    await redis.set("natwnails:waitlist", [...list, { ...data, timestamp: new Date().toISOString() }]);
  } catch (error) {
    console.error("Redis Error:", error);
    throw new Error("Database connection failed");
  }
}