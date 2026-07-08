// app/api/waitlist/route.js
import { addToWaitlist } from "@/lib/kv";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, phone, instagram } = body;

        // Strict check
        if (!name || !phone || !instagram) {
            return Response.json({ error: "Missing fields" }, { status: 400 });
        }

        await addToWaitlist({ name, phone, instagram });

        return Response.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}