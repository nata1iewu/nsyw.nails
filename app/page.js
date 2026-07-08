import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SwatchTier from "@/components/SwatchTier";
import Botanical from "@/components/Botanical";
import { TIERS, LOYALTY_NOTE } from "@/lib/pricing";

export default function Home() {
  return (
    <>
      <Nav />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <Botanical className="pointer-events-none absolute -top-6 -left-10 h-64 w-64 text-ink/25 sm:h-80 sm:w-80" />
          <Botanical
            flip
            className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 text-ink/20 sm:h-80 sm:w-80"
          />
          <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
            <p className="text-sm uppercase tracking-[0.15em] text-umber mb-4">
              Gel manicures · by appointment
            </p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-inkDeep max-w-2xl">
              Precision gel,
              <br />
              <span className="font-script text-6xl sm:text-7xl text-umber">painted to last</span>
            </h1>
            <p className="mt-6 max-w-md text-ink/70 font-body">
              Nat W Nails is a private gel manicure studio. Slots open monthly, first come,
              first served — a small $5 deposit holds your seat.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/book"
                className="rounded-full bg-inkDeep px-7 py-3 font-body text-mist transition hover:bg-umber"
              >
                See open slots
              </Link>
              <Link
                href="/services"
                className="rounded-full px-7 py-3 font-body text-ink ring-1 ring-line transition hover:bg-mist"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Signature: tier swatch strip */}
        <section className="border-y border-line/70 bg-stoneDeep/60">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">Design tiers</p>
            <h2 className="font-display text-2xl italic text-inkDeep mb-8 max-w-md">
              Every set starts with a base color — how far you take the design sets the tier.
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {TIERS.map((tier) => (
                <SwatchTier key={tier.id} tier={tier} />
              ))}
            </div>
          </div>
        </section>

        {/* Policy strip */}
        <section className="mx-auto max-w-5xl px-6 py-16 grid gap-10 sm:grid-cols-4">
          <div>
            <p className="font-display text-lg text-inkDeep mb-1">Appointment only</p>
            <p className="text-base text-ink/70">No walk-ins. All bookings go through the site.</p>
          </div>
          <div>
            <p className="font-display text-lg text-inkDeep mb-1">Monthly slots</p>
            <p className="text-base text-ink/70">
              New availability is posted each month — check back or follow @nsyw.nails.
            </p>
          </div>
          <div>
            <p className="font-display text-lg text-inkDeep mb-1">$5 deposit</p>
            <p className="text-base text-ink/70">
              Sent via Zelle to secure your slot. Confirmed once your request is approved.
            </p>
          </div>
          <div>
            <p className="font-display text-lg text-inkDeep mb-1">Loyalty</p>
            <p className="text-base text-ink/70">{LOYALTY_NOTE}</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
