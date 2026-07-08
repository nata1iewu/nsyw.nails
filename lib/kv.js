import { Redis } from '@upstash/redis';

// Safety check: Only initialize if the URL actually looks like a URL
const getRedis = () => {
  // Now looking for the new names we just added
  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !url.startsWith('https')) {
    console.error("REDIS ERROR: Check your UPSTASH_REDIS_URL in Vercel.");
    return null;
  }
  return new Redis({ url, token });
};

const redis = getRedis();

// Data fetchers
export async function getSlots() {
  if (!redis) return [];
  try { return (await redis.get("natwnails:slots")) || []; } catch { return []; }
}

export async function getBookings() {
  if (!redis) return [];
  try { return (await redis.get("natwnails:bookings")) || []; } catch { return []; }
}

export async function getWaitlist() {
  if (!redis) return [];
  try { return (await redis.get("natwnails:waitlist")) || []; } catch { return []; }
}

// Admin / Booking actions
export async function setBookingStatus(id, status) {
  if (!redis) return;
  const bookings = (await redis.get("natwnails:bookings")) || [];
  const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
  await redis.set("natwnails:bookings", updated);
}

export async function setSlotStatus(id, status) {
  if (!redis) return;
  const slots = (await redis.get("natwnails:slots")) || [];
  const updated = slots.map(s => s.id === id ? { ...s, status } : s);
  await redis.set("natwnails:slots", updated);
}

export async function addSlot(slot) {
  if (!redis) return;
  const slots = (await redis.get("natwnails:slots")) || [];
  await redis.set("natwnails:slots", [...slots, slot]);
}

export async function removeSlot(id) {
  if (!redis) return;
  const slots = (await redis.get("natwnails:slots")) || [];
  await redis.set("natwnails:slots", slots.filter(s => s.id !== id));
}

export async function addBooking(booking) {
  if (!redis) return;
  const bookings = (await redis.get("natwnails:bookings")) || [];
  await redis.set("natwnails:bookings", [...bookings, booking]);
}

export async function addToWaitlist(data) {
  if (!redis) throw new Error("Database not configured");
  try {
    const list = (await redis.get("natwnails:waitlist")) || [];
    await redis.set("natwnails:waitlist", [...list, { ...data, timestamp: new Date().toISOString() }]);
  } catch (error) {
    console.error("Redis Error:", error);
    throw new Error("Database connection failed");
  }
}

export async function clearWaitlist() {
  if (!redis) return;
  await redis.set("natwnails:waitlist", []);
}