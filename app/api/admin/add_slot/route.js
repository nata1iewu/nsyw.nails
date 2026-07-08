import { NextResponse } from 'next/server';
import { addSlot } from '@/lib/kv';

export async function POST(req) {
    try {
        // Expecting an object like { id: "1", time: "10:00 AM", status: "available" }
        const slotData = await req.json();
        await addSlot(slotData);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}