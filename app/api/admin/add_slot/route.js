import { NextResponse } from 'next/server';
import { addSlot } from '@/lib/kv';

export async function POST(req) {
    try {
        const body = await req.json();
        // body is now an array of slots
        for (const slot of body) {
            await addSlot(slot);
        }
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}