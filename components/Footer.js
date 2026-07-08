import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 mt-24">
      <div className="mx-auto max-w-5xl px-6 py-12 grid gap-8 sm:grid-cols-4 font-body text-sm text-ink/75">
        <div>
          <p className="font-display text-lg text-inkDeep mb-2">nsywnails</p>
          <p>UCSD and Los Angeles based nail tech</p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">Find me</p>
          <a
            href="https://instagram.com/nsywnails"
            target="_blank"
            rel="noreferrer"
            className="hover:text-inkDeep transition"
          >
            @nsywnails on instagram !!
          </a>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">Booking</p>
          <p>New slots posted monthly!</p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">BEFORE YOU BOOK</p>
          <Link href="/policies" className="hover:text-inkDeep transition">
            Read studio policies →
          </Link>
        </div>
      </div>
    </footer>
  );
}
