import { kv } from "@vercel/kv";

const SLOTS_KEY = "natwnails:slots";
const BOOKINGS_KEY = "natwnails:bookings";

// --- Slots ---
// slot: { id, date: "YYYY-MM-DD", time: "HH:MM", status: "open" | "held" | "booked" }

export async function getSlots() {
  const slots = await kv.get(SLOTS_KEY);
  return Array.isArray(slots) ? slots : [];
}

export async function saveSlots(slots) {
  await kv.set(SLOTS_KEY, slots);
}

export async function addSlot({ date, time }) {
  const slots = await getSlots();
  const id = `${date}_${time}_${Math.random().toString(36).slice(2, 7)}`;
  slots.push({ id, date, time, status: "open" });
  slots.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  await saveSlots(slots);
  return id;
}

export async function removeSlot(id) {
  const slots = await getSlots();
  await saveSlots(slots.filter((s) => s.id !== id));
}

export async function setSlotStatus(id, status) {
  const slots = await getSlots();
  const next = slots.map((s) => (s.id === id ? { ...s, status } : s));
  await saveSlots(next);
}

// --- Bookings ---
// booking: { id, slotId, date, time, name, phone, email, size, tier, price,
//            createdAt, status: "pending" | "approved" | "denied" }

export async function getBookings() {
  const bookings = await kv.get(BOOKINGS_KEY);
  return Array.isArray(bookings) ? bookings : [];
}

export async function saveBookings(bookings) {
  await kv.set(BOOKINGS_KEY, bookings);
}

export async function addBooking(data) {
  const bookings = await getBookings();
  const id = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const booking = { id, status: "pending", createdAt: Date.now(), ...data };
  bookings.push(booking);
  await saveBookings(bookings);
  return booking;
}

export async function setBookingStatus(id, status) {
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
