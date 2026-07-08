// lib/kv.js
import { createClient } from "@vercel/kv";

export function getClient() {
  if (typeof window !== "undefined") return null;
  return createClient({
    url: process.env.KV_REST_API_URL || "",
    token: process.env.KV_REST_API_TOKEN || "",
  });
}

// All functions now call getClient() inside the function, not at the top of the file
export async function getBookings() {
  const kv = getClient();
  if (!kv) return [];
  try { return (await kv.get("natwnails:bookings")) || []; } catch { return []; }
}

export async function getSlots() {
  const kv = getClient();
  if (!kv) return [];
  try { return (await kv.get("natwnails:slots")) || []; } catch { return []; }
}
// ... add the same "const kv = getClient(); if (!kv) return;" pattern to ALL other functions