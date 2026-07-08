export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { addToWaitlist } from "@/lib/kv";

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, phone, instagram } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { error: "Name and phone number are required." },
                { status: 400 }
            );
        }

        const entry = await addToWaitlist({ name, phone, instagram });
        return NextResponse.json({ success: true, entry });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}