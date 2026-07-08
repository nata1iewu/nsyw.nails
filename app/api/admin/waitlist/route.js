import { NextResponse } from 'next/server';
import { getWaitlist, addToWaitlist } from '@/lib/kv';

export async function GET() {
    try {
        // Use the function already defined in your lib/kv.js
        const waitlist = await getWaitlist();
        return NextResponse.json({ waitlist: waitlist || [] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        // Use the function already defined in your lib/kv.js
        await addToWaitlist(body);
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await clearWaitlist();
        return NextResponse.json({ message: "Waitlist cleared" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}