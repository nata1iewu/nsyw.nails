import crypto from "crypto";

const COOKIE_NAME = "natwnails_admin";

function sessionToken() {
  const secret = process.env.ADMIN_PASSWORD || "dev-only-insecure";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function checkPassword(password) {
  return password && password === process.env.ADMIN_PASSWORD;
}

export function sessionCookieHeader() {
  const token = sessionToken();
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 12}`;
}

export function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function isAuthed(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  return match[1] === sessionToken();
}
