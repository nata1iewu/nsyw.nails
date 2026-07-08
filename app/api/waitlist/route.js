// app/api/waitlist/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { addToWaitlist } from "@/lib/kv";

export async function POST(req) {
    try {
        const { name, phone, instagram } = await req.json();

        // Enforce the requirement for all three fields
        if (!name || !phone || !instagram) {
            return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
        }

        await addToWaitlist({ name, phone, instagram });
        return new Response(JSON.stringify({ message: "Success" }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}