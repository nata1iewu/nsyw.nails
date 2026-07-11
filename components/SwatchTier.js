import Link from "next/link";

export default function SwatchTier({ tier, selected = false, onClick, interactive = false, href }) {
  const content = (
    <>
      <span
        aria-hidden
        className="relative block h-16 w-12 rounded-nail shadow-md ring-1 ring-black/10 overflow-hidden"
        style={{ background: tier.swatch }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-nail"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0) 55%)",
          }}
        />
      </span>
      <span className="text-center">
        <span className="block font-display text-sm uppercase tracking-[0.15em] text-ink/50">
          Tier
        </span>
        <span className="-mt-1 block font-script text-3xl text-inkDeep">{tier.label}</span>
        <span className="mt-1 block text-sm text-ink/60">{tier.desc}</span>
        <span className="mt-1 block font-display text-sm text-umber">
          {tier.add === 0 ? "included" : `+$${tier.add}`}
        </span>
      </span>
    </>
  );

  const className = `group flex flex-col items-center gap-3 rounded-2xl p-4 text-left transition ${interactive || href ? "cursor-pointer" : ""
    } ${selected
      ? "bg-mist ring-2 ring-inkDeep"
      : interactive || href
        ? "hover:bg-mist/70 ring-1 ring-line"
        : ""
    }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  const Comp = interactive ? "button" : "div";
  return (
    <Comp type={interactive ? "button" : undefined} onClick={onClick} className={className}>
      {content}
    </Comp>
  );
}