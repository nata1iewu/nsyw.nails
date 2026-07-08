import { NextResponse } from 'next/server';
import { addSlot, clearSlots } from '@/lib/kv';

export async function POST(req) {
    try {
        const body = await req.json();
        // If it's an array, loop through; otherwise add the single object
        const slots = Array.isArray(body) ? body : [body];
        for (const slot of slots) {
            await addSlot(slot);
        }
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await clearSlots();
        return NextResponse.json({ message: "Cleared" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;