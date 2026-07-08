export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";

export async function POST(request) {
  const { password } = await request.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}