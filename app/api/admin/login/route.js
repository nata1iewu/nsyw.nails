export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function POST(request) {
  const { password } = await request.json();

  // This connects to the ADMIN_PASSWORD environment variable
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}