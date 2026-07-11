"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function ConfirmationContent() {
    const params = useSearchParams();
    const when = params.get("when") || "your selected time";
    const removal = params.get("removal") || "no removal";

    return (
        <main className="mx-auto max-w-2xl px-6 pt-16 pb-24">
            <div className="rounded-2xl bg-stoneDeep/60 ring-1 ring-line p-8 text-center">
                <h1 className="font-display text-2xl text-inkDeep mb-3">
                    Successfully booked for {when} with {removal}!! ✿
                </h1>
                <p className="text-sm text-ink/70">
                    Thank you! I've received your booking and will confirm with you shortly via text or Instagram. A $5 deposit is required but DO NOT send it until I message you! Please keep a look out!
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