import { NextResponse } from 'next/server';
import { addSlot, clearSlots, getSlots, removeSlot } from '@/lib/kv';

export async function GET() {
    try {
        const slots = await getSlots();
        const sorted = slots.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        return NextResponse.json({ slots: sorted });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const slots = Array.isArray(body) ? body : [body];
        for (const slot of slots) {
            await addSlot(slot);
        }
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        let id = null;
        try {
            const body = await req.json();
            id = body?.id || null;
        } catch {
            // No body sent — treat as "clear all"
        }

        if (id) {
            await removeSlot(id);
            return NextResponse.json({ message: "Slot removed" });
        } else {
            await clearSlots();
            return NextResponse.json({ message: "Cleared" });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;