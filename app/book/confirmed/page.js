"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function ConfirmationContent() {
    const params = useSearchParams();
    const when = params.get("when") || "your selected time";
    const removal = params.get("removal") || "no removal";
    const name = params.get("name") || "";
    const phone = params.get("phone") || "";
    const instagram = params.get("instagram") || "";
    const email = params.get("email") || "";

    return (
        <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
            <div className="rounded-2xl bg-stoneDeep/60 ring-1 ring-line p-8 text-center">
                <h1 className="font-display text-2xl text-inkDeep mb-3">
                    Successfully booked for {when} with {removal}!! ✿
                </h1>
                <p className="text-sm text-ink/70 mb-6">
                    Thank you! I've received your booking and will confirm with you shortly via text or Instagram. A $5 deposit is required but DO NOT send it until I message you! Please keep a look out!
                </p>

                <div className="rounded-xl bg-mist/70 ring-1 ring-line p-4 text-left text-sm text-ink/80 mb-6">
                    <p className="mb-1"><span className="font-bold">Name:</span> {name}</p>
                    <p className="mb-1"><span className="font-bold">Phone:</span> {phone}</p>
                    <p className="mb-1"><span className="font-bold">Instagram:</span> {instagram}</p>
                    <p><span className="font-bold">Email:</span> {email}</p>
                </div>

                <p className="text-sm font-bold text-umber uppercase tracking-wide">
                    📸 Screenshot this page for your confirmation!
                </p>
                <p className="text-xs text-ink/60 mt-1">
                    If anything ever fails on my end, a valid screenshot helps me troubleshoot your appointment quickly.
                </p>
            </div>
        </main>
    );
}

export default function BookingConfirmed() {
    return (
        <>
            <Nav />
            <Suspense fallback={<main className="mx-auto max-w-2xl px-6 pt-16 pb-24 text-center"><p className="text-base text-ink/50">Loading…</p></main>}>
                <ConfirmationContent />
            </Suspense>
            <Footer />
        </>
    );
}