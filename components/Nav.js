import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-stone/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl tracking-tight text-inkDeep">
          Nat W <span className="font-script text-3xl align-middle text-umber">Nails</span>
        </Link>
        <nav className="flex items-center gap-6 font-body text-sm">
          <Link href="/services" className="text-ink/80 transition hover:text-inkDeep">
            Services
          </Link>
          <Link href="/policies" className="text-ink/80 transition hover:text-inkDeep">
            Policies
          </Link>
          <Link
            href="/book"
            className="rounded-full bg-inkDeep px-5 py-2 text-mist transition hover:bg-umber"
          >
            Book a slot
          </Link>
        </nav>
      </div>
    </header>
  );
}
