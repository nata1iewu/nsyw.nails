import { NextResponse } from 'next/server';
import { addSlot } from '@/lib/kv';

export async function POST(req) {
    try {
        const body = await req.json();
        await addSlot(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}