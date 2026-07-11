"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LOOKS } from "@/lib/gallery";

export default function Showcase() {
    const [selected, setSelected] = useState(null);
    const [imgIndex, setImgIndex] = useState(0);

    function openLook(look) {
        setSelected(look);
        setImgIndex(0);
    }

    function closeLook() {
        setSelected(null);
        setImgIndex(0);
    }

    const allImages = selected ? [selected.cover, ...selected.images] : [];

    function nextImage() {
        setImgIndex((i) => (i + 1) % allImages.length);
    }

    function prevImage() {
        setImgIndex((i) => (i - 1 + allImages.length) % allImages.length);
    }

    return (
        <>
            <Nav />
            <main className="mx-auto max-w-5xl px-6 pt-16 pb-24">
                <h1 className="font-display text-4xl text-inkDeep mb-3">Showcase</h1>
                <p className="text-base text-ink/70 mb-10">
                    For more pictures, check out my Instagram{" "}
                    <a
                        href="https://instagram.com/nsywnails"
                        target="_blank"
                        rel="noreferrer"
                        className="text-umber underline hover:text-inkDeep"
                    >
                        @nsywnails
                    </a>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {LOOKS.map((look) => (
                        <button
                            key={look.id}
                            onClick={() => openLook(look)}
                            className="aspect-square rounded-2xl overflow-hidden ring-1 ring-line"
                        >
                            <img src={look.cover} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </main >
            <Footer />

            {
                selected && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
                        onClick={closeLook}
                    >
                        <div
                            className="bg-stone rounded-2xl max-w-2xl w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative aspect-[16/10] bg-stoneDeep">
                                <img
                                    src={allImages[imgIndex]}
                                    alt=""
                                    className="w-full h-full object-contain"
                                />

                                {allImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-inkDeep/80 text-mist w-9 h-9 flex items-center justify-center hover:bg-inkDeep"
                                            aria-label="Previous image"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-inkDeep/80 text-mist w-9 h-9 flex items-center justify-center hover:bg-inkDeep"
                                            aria-label="Next image"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="p-6">
                                <p className="text-sm text-ink/80 mb-1"><span className="font-bold">Length:</span> {selected.length}</p>
                                <p className="text-sm text-ink/80 mb-4"><span className="font-bold">Design:</span> {selected.tier}</p>
                                <button
                                    onClick={closeLook}
                                    className="w-full rounded-full bg-inkDeep py-2.5 text-mist"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}