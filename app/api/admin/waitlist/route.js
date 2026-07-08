import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
    try {
        console.log("Fetching waitlist from Redis...");
        const waitlist = await kv.lrange('waitlist', 0, -1);
        console.log("Data returned from Redis:", waitlist);

        // If data is stored as a string, parse it; otherwise return as is
        const parsedWaitlist = waitlist.map(item => typeof item === 'string' ? JSON.parse(item) : item);

        return NextResponse.json({ waitlist: parsedWaitlist });
    } catch (error) {
        console.error("Redis fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        await kv.rpush('waitlist', JSON.stringify(body));
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}