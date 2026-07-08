import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SwatchTier from "@/components/SwatchTier";
import Botanical from "@/components/Botanical";
import { SIZES, TIERS, REMOVALS, LOYALTY_NOTE, DEPOSIT_NOTE } from "@/lib/pricing";

export const metadata = { title: "Services & Pricing — Nat W Nails" };

export default function Services() {
  return (
    <>
      <Nav />
      <main className="relative mx-auto max-w-5xl px-6 pt-16 pb-24 overflow-hidden">
        <Botanical className="pointer-events-none absolute -top-4 -right-16 h-56 w-56 text-ink/15 hidden sm:block" />

        <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Gel-X</p>
        <h1 className="font-display text-4xl sm:text-5xl text-inkDeep mb-2">
          Pricing <span className="font-script text-5xl sm:text-6xl text-umber">Information</span>
        </h1>
        <p className="max-w-lg text-ink/70 mb-4 mt-4">
          Price is base length plus your design tier. Pick your length below, then choose a
          tier that matches how detailed you want the set.
        </p>
        <p className="text-base text-ink/60 mb-14">
          {DEPOSIT_NOTE} DM @nsywnails for a price quote if you're not sure where your inspo
          falls!
        </p>

        {/* Length pricing */}
        <section className="mb-14">
          <h2 className="font-display text-xl italic text-inkDeep mb-5">By length</h2>
          <div className="divide-y divide-line/70 rounded-2xl ring-1 ring-line/70 overflow-hidden bg-mist/60">
            {SIZES.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-6 py-4">
                <span className="font-body text-ink">{s.label}</span>
                <span className="font-display text-lg text-umber">${s.price}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Removals */}
        <section className="mb-14">
          <h2 className="font-display text-xl italic text-inkDeep mb-5">Removals</h2>
          <div className="divide-y divide-line/70 rounded-2xl ring-1 ring-line/70 overflow-hidden bg-mist/60">
            {REMOVALS.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-6 py-4">
                <span className="font-body text-ink">{r.label}</span>
                <span className="font-display text-lg text-umber">+${r.price}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink/50">
            I <span className="font-medium text-inkDeep">DO NOT</span> do foreign soak-offs/removals
            Please ensure that if you have a set on that was not done by me that you have it removed before your appointment.
          </p>
        </section>

        {/* Tier pricing + galleries */}
        <section className="mb-16">
          <h2 className="font-display text-xl italic text-inkDeep mb-2">Design tiers</h2>
          <p className="text-base text-ink/60 mb-6">Added on top of your base length price.</p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 mb-10">
            {TIERS.map((tier) => (
              <SwatchTier key={tier.id} tier={tier} />
            ))}
          </div>
          <p className="mb-10 text-sm text-ink/50">
            Tier 4 starts at +$15 — For more intricate and complicated designs
          </p>

          {TIERS.filter((t) => t.gallery).map((tier) => (
            <div key={tier.id} className="mb-10">
              <p className="font-script text-3xl text-umber mb-1">Tier {tier.label}</p>
              {tier.placeholder && (
                <p className="text-sm text-ink/45 mb-3">
                  Placeholder photos — swap these for real examples in{" "}
                  <code className="text-ink/60">public/images/gallery/</code>.
                </p>
              )}
              <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${!tier.placeholder ? "mt-3" : ""}`}>
                {tier.gallery.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-line/70"
                  >
                    <Image
                      src={`/images/gallery/${src}`}
                      alt={`Tier ${tier.label} nail set example`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Loyalty + policy */}
        <section className="rounded-2xl bg-stoneDeep/60 ring-1 ring-line/70 p-8">
          <h2 className="font-display text-xl italic text-inkDeep mb-3">Booking policy</h2>
          <ul className="space-y-2 text-base text-ink/75 list-disc pl-5">
            <li>Appointment Only</li>
            <li>New slots are posted monthly on a first-come, first-served basis.</li>
            <li>$5 deposit via Zelle required to hold your slot.</li>
            <li>Your request is confirmed once it's manually approved.</li>
            <li>{LOYALTY_NOTE}</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/book"
              className="inline-block rounded-full bg-inkDeep px-7 py-3 font-body text-mist transition hover:bg-umber"
            >
              See open slots
            </Link>
            <Link
              href="/policies"
              className="inline-block rounded-full px-7 py-3 font-body text-ink ring-1 ring-line transition hover:bg-mist"
            >
              Full studio policies
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
