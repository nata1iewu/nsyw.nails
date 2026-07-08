export default function SwatchTier({ tier, selected = false, onClick, interactive = false }) {
  const Comp = interactive ? "button" : "div";

  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={`group flex flex-col items-center gap-3 rounded-2xl p-4 text-left transition ${interactive ? "cursor-pointer" : ""
        } ${selected
          ? "bg-mist ring-2 ring-inkDeep"
          : interactive
            ? "hover:bg-mist/70 ring-1 ring-line"
            : ""
        }`}
    >
      <span
        aria-hidden
        className="block h-16 w-12 rounded-nail shadow-sm ring-1 ring-black/10"
        style={{ background: tier.swatch }}
      />
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
    </Comp>
  );
}
