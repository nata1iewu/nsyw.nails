import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 mt-24">
      <div className="mx-auto max-w-5xl px-6 py-12 grid gap-8 sm:grid-cols-3 font-body text-sm text-ink/75">
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">Find me</p>
          <div className="flex items-center gap-3">
            {/* Added <a here */}
            <a
              href="https://instagram.com/nsywnails"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-ink/75 hover:text-inkDeep transition"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>

            {/* Added <a here */}
            <a
              href="https://tiktok.com/@nata1iewu"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="text-ink/75 hover:text-inkDeep transition"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.6 5.82c-.87-.85-1.4-2.02-1.4-3.32h-3.13v13.6c0 1.56-1.27 2.83-2.83 2.83a2.83 2.83 0 1 1 0-5.66c.28 0 .55.04.8.12V9.9a5.97 5.97 0 0 0-.8-.05 5.95 5.95 0 1 0 5.96 5.95V9.2a7.03 7.03 0 0 0 4.1 1.32V7.4a4.13 4.13 0 0 1-2.7-1.58z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">Questions?</p>
          <p>Feel free to message me on Instagram!</p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">Before you book</p>
          <Link href="/policies" className="hover:text-inkDeep transition">
            Read studio policies →
          </Link>
        </div>

      </div >
    </footer >
  );
}