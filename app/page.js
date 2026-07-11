import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SwatchTier from "@/components/SwatchTier";
import { TIERS, LOYALTY_NOTE } from "@/lib/pricing";

export default function Home() {
  return (
    <>
      <Nav />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              {/* Text */}
              <div>
                <p className="text-sm uppercase tracking-[0.15em] text-umber mb-4">
                  Gel-X Manicures · Specialized in intricate nail art
                </p>
                <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-inkDeep">
                  Currently in:
                  <br />
                  <span className="font-script text-6xl sm:text-7xl text-umber">
                    Los Angeles
                  </span>
                </h1>
                <p className="mt-6 max-w-md text-ink/90 font-body">
                  Hi everyone! My name is Natalie and I've been doing nails for roughly 2 years
                  now! Over the school year, I am on campus at UCSD and dorm based, while
                  outside of the active school year, I am based in Los Angeles, California! I
                  offer Gel-X and specialize in intricate nail art with a love for asian-style
                  designs! Thank you for visiting my site!!
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
                  <Link
                    href="/showcase"
                    className="rounded-full px-7 py-3 font-body text-ink ring-1 ring-line transition hover:bg-mist"
                  >
                    Check out some of my work!
                  </Link>
                </div>
              </div>

              {/* Photo */}
              <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] ring-1 ring-line/70 shadow-sm">
                  <Image
                    src="/images/hero.jpg"
                    alt="Natalie, nail tech at nsyw.nails"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 40vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Signature: tier swatch strip */}
        <section className="border-y border-line/70 bg-stoneDeep/60">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">Design tiers</p>
            <h2 className="font-display text-2xl italic text-inkDeep mb-8 max-w-md">
              Every set tailored to your style and preferences — how far you take the design
              sets the tier.
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {TIERS.map((tier) => (
                <SwatchTier key={tier.id} tier={tier} />
              ))}
            </div>
          </div>
        </section>

        {/* Policy strip */}
        <section className="mx-auto max-w-5xl px-6 py-6 grid gap-6 sm:grid-cols-4">
          <div>
            <p className="font-display text-lg text-inkDeep mb-1">Appointment only</p>
            <p className="text-base text-ink/70">All bookings go through the site!</p>
          </div>
          <div>
            <p className="font-display text-lg text-inkDeep mb-1">Monthly slots</p>
            <p className="text-base text-ink/70">
              New availability is posted each month!
              All updates are posted on instagram
              @nsywnails.
            </p>
          </div>
          <div>
            <p className="font-display text-lg text-inkDeep mb-1">$5 deposit</p>
            <p className="text-base text-ink/70">Required after confirming your booking.</p>
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