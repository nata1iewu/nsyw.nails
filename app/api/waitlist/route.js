import { NextResponse } from "next/server";
import { addToWaitlist } from "@/lib/kv";

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, phone, instagram, notes } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
        }

        await addToWaitlist({ name, phone, instagram, notes });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}