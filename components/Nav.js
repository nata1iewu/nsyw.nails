"use client";

import { useState } from "react";
import Link from "next/link";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-stone/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl tracking-tight text-inkDeep" onClick={() => setOpen(false)}>
          <span className="font-script text-4xl align-middle text-umber">nsywnails</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 font-body text-base">
          <Link href="/services" className="text-ink/80 transition hover:text-inkDeep">
            Services
          </Link>
          <Link href="/showcase" className="text-ink/80 transition hover:text-inkDeep">
            Showcase
          </Link>
          <Link href="/policies" className="text-ink/80 transition hover:text-inkDeep">
            Policies
          </Link>
          <Link
            href="/book"
            className="rounded-full bg-inkDeep px-10 py-2.5 text-base text-mist transition hover:bg-umber"
          >
            Book a slot
          </Link>
        </nav>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-inkDeep"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <nav className="md:hidden flex flex-col gap-1 px-6 pb-5 font-body text-base border-t border-line/70">
          <Link href="/services" className="py-3 text-ink/80" onClick={() => setOpen(false)}>
            Services
          </Link>
          <Link href="/showcase" className="py-3 text-ink/80" onClick={() => setOpen(false)}>
            Showcase
          </Link>
          <Link href="/policies" className="py-3 text-ink/80" onClick={() => setOpen(false)}>
            Policies
          </Link>
          <Link
            href="/book"
            className="mt-2 rounded-full bg-inkDeep px-6 py-3 text-center text-mist"
            onClick={() => setOpen(false)}
          >
            Book a slot
          </Link>
        </nav>
      )}
    </header>
  );
}