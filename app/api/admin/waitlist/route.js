// app/api/waitlist/route.js
import { NextResponse } from 'next/server';
import { getWaitlist } from '@/lib/kv'; // Ensure this exists in your lib/kv.js

export async function GET() {
    const waitlist = await getWaitlist();
    return NextResponse.json({ waitlist });
}

export async function POST(req) {
    try {
        const { name, phone, instagram } = await req.json();

        if (!name || !phone || !instagram) {
            return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
        }

        await addToWaitlist({ name, phone, instagram });

        return new Response(JSON.stringify({ message: "Success" }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}