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
async function handleAddSlot(e) {
    // This line stops the form from reloading your page
    if (e) e.preventDefault();

    const res = await fetch('/api/admin/add-slot/route,js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: Date.now().toString(), // Added a unique ID
            date,
            time,
            status: "available"
        })
    });

    if (res.ok) {
        setDate("");
        setTime("");
        await refresh(); // This updates your UI without needing a manual page reload
    } else {
        console.error("Failed to add slot");
    }
}