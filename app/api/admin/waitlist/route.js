import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function GET() {
    try {
        console.log("Fetching waitlist from Redis...");
        // Use 'redis' here
        const waitlist = await redis.lrange('waitlist', 0, -1);
        console.log("Data returned from Redis:", waitlist);

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
        // Use 'redis' here
        await redis.rpush('waitlist', JSON.stringify(body));
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        console.error("Redis POST error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}