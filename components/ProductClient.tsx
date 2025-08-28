// components/ProductClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

type Variant = {
  id: string; // gid://shopify/ProductVariant/...
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: { amount: string; currencyCode: string };
};

export default function ProductClient({
  title,
  options,
  variants,
  images,
  slug,              // required
}: {
  title: string;
  options: { name: string; values: string[] }[];
  variants: Variant[];
  images: { url: string; altText: string | null }[];
  slug: string;      // <-- change from `slug?: string` to `slug: string`
}) {

  const { addItem } = useCart();

  // Default selections (use first value for each option)
  const [sel, setSel] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.values[0]]))
  );

  // Find the variant matching current selections
  const match = useMemo(() => {
    const pairs = Object.entries(sel);
    return variants.find((v) =>
      pairs.every(([name, value]) =>
        v.selectedOptions.some((so) => so.name === name && so.value === value)
      )
    );
  }, [variants, sel]);

  const price = match ? Number(match.price.amount) : 0;

  function onAddToCart() {
    if (!match) {
      alert("Select options first.");
      return;
    }
    if (!match.availableForSale) {
      alert("That variant is unavailable.");
      return;
    }

    const img = images[0]?.url || "/placeholder.png";

    // IMPORTANT: do NOT pass `id` here; CartContext generates it.
    // Store the Shopify Variant GID under `variantId`.
    addItem({
      slug,
      name: `${title} — ${match.title}`,
      price,
      qty: 1,
      image: img,
      size: sel["Size"] || "",
      variantId: match.id, // <-- merchandiseId for checkout
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>

      {options.map((opt) => (
        <div key={opt.name} className="space-y-2">
          <div className="text-sm text-white/70">{opt.name}</div>
          <div className="flex gap-2 flex-wrap">
            {opt.values.map((v) => {
              const active = sel[opt.name] === v;
              return (
                <button
                  key={v}
                  onClick={() => setSel((s) => ({ ...s, [opt.name]: v }))}
                  className={`px-3 py-1 rounded-full border ${
                    active ? "bg-white text-black" : "bg-white/10"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={onAddToCart}
        className="mt-4 w-full rounded-full bg-white text-black font-bold py-3 active:scale-95"
        disabled={!match}
        title={!match ? "Select options first" : "Add to cart"}
      >
        Add to Cart — ${price.toFixed(2)}
      </button>
    </div>
  );
}
