import { NextResponse } from 'next/server';
import { addToWaitlist } from '@/lib/kv';

export async function POST(req) {
    try {
        const body = await req.json();
        await addToWaitlist(body);
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}