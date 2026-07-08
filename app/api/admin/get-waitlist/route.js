import { NextResponse } from 'next/server';
import { getWaitlist } from '@/lib/kv';

export async function GET() {
    const list = await getWaitlist();
    return NextResponse.json({ waitlist: list });
}