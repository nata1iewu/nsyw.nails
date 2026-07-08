import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
    try {
        // This fetches the list stored in your Redis key 'waitlist'
        const waitlist = await kv.lrange('waitlist', 0, -1);
        return NextResponse.json({ waitlist: waitlist || [] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        // This adds the entry to your Redis list
        await kv.rpush('waitlist', body);
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}