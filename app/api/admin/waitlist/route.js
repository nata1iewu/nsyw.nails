// VERSION: REMOVED ALL KV REFERENCES
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function GET() {
    try {
        const waitlist = await redis.lrange('waitlist', 0, -1);
        const parsedWaitlist = waitlist.map(item => typeof item === 'string' ? JSON.parse(item) : item);
        return NextResponse.json({ waitlist: parsedWaitlist });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        await redis.rpush('waitlist', JSON.stringify(body));
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}