// lib/kv.js
import { createClient } from "@vercel/kv";

function getKv() {
  // If variables are missing, return null to prevent crashes
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  return createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export async function getWaitlist() {
  const kv = getKv();
  if (!kv) return [];
  try { return (await kv.get("natwnails:waitlist")) || []; } catch { return []; }
}

export async function addToWaitlist(data) {
  const kv = getKv();
  if (!kv) return;

  const currentList = (await kv.get("natwnails:waitlist")) || [];
  const newList = [...currentList, {
    name: data.name,
    phone: data.phone,
    instagram: data.instagram,
    timestamp: new Date().toISOString()
  }];

  await kv.set("natwnails:waitlist", newList);
}

// Keep your getSlots and getBookings functions here too!
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