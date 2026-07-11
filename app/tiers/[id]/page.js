import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TIER_EXAMPLES } from "@/lib/tierExamples";

const TIER_ORDER = ["tier1", "tier2", "tier3", "tier4"];

export default function TierExamplePage({ params }) {
    const tier = TIER_EXAMPLES[params.id];

    if (!tier) {
        return (
            <>
                <Nav />
                <main className="mx-auto max-w-3xl px-6 pt-16 pb-24 text-center">
                    <p className="text-ink/60">No examples found for this tier yet.</p>
                    <Link href="/" className="mt-4 inline-block text-umber underline">
                        Back home
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    const currentIndex = TIER_ORDER.indexOf(params.id);
    const prevId = currentIndex > 0 ? TIER_ORDER[currentIndex - 1] : null;
    const nextId = currentIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentIndex + 1] : null;

    return (
        <>
            <Nav />
            <main className="mx-auto max-w-4xl px-6 pt-16 pb-24">
                <p className="text-sm uppercase tracking-[0.15em] text-ink/50 mb-2">Design tier</p>
                <h1 className="font-display text-4xl text-inkDeep mb-2">
                    Tier <span className="font-script text-5xl text-umber">{tier.label}</span>
                </h1>
                <p className="text-base text-ink/70 mb-10">{tier.desc}</p>

                {tier.images.length === 0 ? (
                    <p className="text-sm text-ink/50">Examples coming soon!</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {tier.images.map((src, i) => (
                            <div key={i} className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-line">
                                <Image
                                    src={src}
                                    alt={`Tier ${tier.label} example`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 50vw, 33vw"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-10 flex items-center justify-between">
                    {prevId ? (
                        <Link
                            href={`/tiers/${prevId}`}
                            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-body text-ink ring-1 ring-line transition hover:bg-mist"
                        >
                            ← Tier {TIER_EXAMPLES[prevId].label}
                        </Link>
                    ) : (
                        <span />
                    )}
                    {nextId ? (
                        <Link
                            href={`/tiers/${nextId}`}
                            className="inline-flex items-center gap-2 rounded-full bg-inkDeep px-6 py-3 font-body text-mist transition hover:bg-umber"
                        >
                            Tier {TIER_EXAMPLES[nextId].label} →
                        </Link>
                    ) : (
                        <span />
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}