export const SIZES = [
  { id: "natural", label: "Natural nails", price: 40 },
  { id: "short", label: "X-Short / Short extensions (Gel-X)", price: 45 },
  { id: "medium", label: "Medium extensions (Gel-X)", price: 50 },
  { id: "long", label: "Long extensions (Gel-X)", price: 55 },
  { id: "xlong", label: "XL extensions (Gel-X)", price: 60 },
];

export const REMOVALS = [
  { id: "with_set", label: "Removal with a new set", price: 10 },
  { id: "without_set", label: "Removal without a new set", price: 20 },
];

export const LOYALTY_NOTE = "Every 6th appointment is 50% off.";
export const DEPOSIT_AMOUNT = 5;
export const DEPOSIT_NOTE = `A $${DEPOSIT_AMOUNT} deposit is required to secure every appointment.`;

export const TIERS = [
  {
    id: "tier1",
    label: "One",
    desc: "Solid color, minimal design",
    add: 0,
    swatch: "linear-gradient(160deg,#F3F0EA,#E4DED2)",
    gallery: ["tier1-a.jpg", "tier1-b.jpg", "tier1-c.jpg", "tier1-d.jpg"],
  },
  {
    id: "tier2",
    label: "Two",
    desc: "Simple accents & line work",
    add: 5,
    swatch: "linear-gradient(160deg,#D8D2C7,#C3BAA9)",
    gallery: [
      "tier2-placeholder.jpg",
      "tier2-placeholder.jpg",
      "tier2-placeholder.jpg",
      "tier2-placeholder.jpg",
    ],
    placeholder: true,
  },
  {
    id: "tier3",
    label: "Three",
    desc: "Detailed design, multiple elements",
    add: 10,
    swatch: "linear-gradient(160deg,#A99D8B,#8C7E6A)",
    gallery: [
      "tier3-placeholder.jpg",
      "tier3-placeholder.jpg",
      "tier3-placeholder.jpg",
      "tier3-placeholder.jpg",
    ],
    placeholder: true,
  },
  {
    id: "tier4",
    label: "Four",
    desc: "Full custom art, charms, 3D",
    add: 15,
    swatch: "linear-gradient(160deg,#6B5E4E,#413728)",
    plus: true,
    gallery: ["tier4-a.jpg", "tier4-b.jpg", "tier4-c.jpg", "tier4-d.jpg"],
  },
];

export function priceFor(sizeId, tierId, removalId = null) {
  const size = SIZES.find((s) => s.id === sizeId);
  const tier = TIERS.find((t) => t.id === tierId);
  if (!size || !tier) return null;
  const removal = removalId ? REMOVALS.find((r) => r.id === removalId) : null;
  return size.price + tier.add + (removal ? removal.price : 0);
}
