"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LOOKS } from "@/lib/gallery";

export default function Showcase() {
    const [selected, setSelected] = useState(null);

    return (
        <>
            <Nav />
            <main className="mx-auto max-w-5xl px-6 pt-16 pb-24">
                <h1 className="font-display text-4xl text-inkDeep mb-10">Showcase</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {LOOKS.map((look) => (
                        <button
                            key={look.id}
                            onClick={() => setSelected(look)}
                            className="aspect-square rounded-2xl overflow-hidden ring-1 ring-line"
                        >
                            <img src={look.cover} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </main>
            <Footer />

            {selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-stone rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="grid gap-3 mb-4">
                            <img src={selected.cover} alt="" className="w-full rounded-xl" />
                            {selected.images.map((src, i) => (
                                <img key={i} src={src} alt="" className="w-full rounded-xl" />
                            ))}
                        </div>
                        <p className="text-sm text-ink/80 mb-1"><span className="font-bold">Length:</span> {selected.length}</p>
                        <p className="text-sm text-ink/80 mb-4"><span className="font-bold">Design:</span> {selected.tier}</p>
                        <button
                            onClick={() => setSelected(null)}
                            className="w-full rounded-full bg-inkDeep py-2.5 text-mist"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}