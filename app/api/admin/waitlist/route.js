// app/api/waitlist/route.js
import { NextResponse } from 'next/server';
import { getWaitlist, addToWaitlist } from '@/lib/kv'; // Ensure this exists in your lib/kv.js

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
// In your user-facing form submit handler:
async function handleWaitlistSubmit(e) {
    e.preventDefault(); // <--- THIS IS REQUIRED to stop the refresh

    const res = await fetch("/api/waitlist", {
        method: "POST",
        // ... rest of your fetch logic
    });

    if (res.ok) {
        alert("Joined waitlist!");
        // Clear form fields here
    }
}