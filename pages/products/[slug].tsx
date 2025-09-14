// pages/products/[slug].tsx
/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  getAllProductSlugs,
  getProductBySlug,
  Product,
  PRODUCTS,
} from "../../lib/products";
import { useCart } from "../../context/CartContext";
import SiteHeader from "../../components/SiteHeader";
import ResilientVideo from "../../components/ResilientVideo";
import { Analytics } from "../../lib/analytics";

/* ========= Background video ========= */
function SiteBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
  <ResilientVideo src="https://cdn.shopify.com/videos/c/o/v/3f7b18f1efac45968db75f10d284ac1b.mp4" poster="/mockups/res.png" className="bgvid h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
    </div>
  );
}

/* ========= Color + image config (local mockup images) ========= */
const COLOR_SWATCH: Record<string, string> = {
  Black: "#111111",
  White: "#DDDDDD",
  Blue: "#2563eb",
  "Kashmir Blue": "#3B5C82",
};

const VARIANTS: Record<
  string,
  {
    colors: Array<"black" | "white">;
    pretty: Record<"black" | "white", string>;
    images: Record<"black" | "white", { front: string; back?: string }>;
  }
> = {
  "twisted-love": {
    colors: ["black", "white"],
    pretty: { black: "Black", white: "White" },
    images: {
      black: { front: "/mockups/trvppy-black-front.png", back: "/mockups/twisted-love-black.png" },
      white: { front: "/mockups/trvppy-white-front.png", back: "/mockups/twisted-love-white.png" },
    },
  },
  "uzi-yachty": {
    colors: ["black", "white"],
    pretty: { black: "Black", white: "White" },
    images: {
      black: { front: "/mockups/UZI-X-YACHTY-BLK.png" },
      white: { front: "/mockups/UZI-X-YACHTY-WHITE.png" },
    },
  },
};

// Map color-specific slugs to base keys
const BASE_OF: Record<string, string> = {
  "twisted-love": "twisted-love",
  "twisted-love-black": "twisted-love",
  "twisted-love-white": "twisted-love",
  "uzi-yachty": "uzi-yachty",
  "uzi-yachty-black": "uzi-yachty",
  "uzi-yachty-white": "uzi-yachty",
};

/* ========= Size normalization ========= */
const SIZE_ALIAS: Record<string, "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL"> = {
  xs: "XS", "x-small": "XS",
  small: "S", s: "S",
  medium: "M", m: "M",
  large: "L", l: "L",
  xl: "XL", "x-large": "XL", xlarge: "XL",
  xxl: "XXL", "xx-large": "XXL",
  xxxl: "XXXL", "xxx-large": "XXXL",
};
const normalizeSize = (raw: string) => {
  const k = raw.trim().toLowerCase();
  return SIZE_ALIAS[k] ?? (raw.trim().toUpperCase() as any);
};

type Props = { product: Product };

export default function ProductPage({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCart();

  const colorQuery = router.query.color;
  const queryColor = typeof colorQuery === "string" ? (colorQuery.toLowerCase() as "black" | "white") : undefined;

  const [face, setFace] = useState<"front" | "back">("front");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [banner, setBanner] = useState<string>("");
  const [adding, setAdding] = useState(false);

  useEffect(() => setFace("front"), [product.slug]);

  const baseKey = BASE_OF[product.slug] || product.slug;
  const variantCfg = VARIANTS[baseKey];

  const activeColor: "black" | "white" | undefined =
    variantCfg ? (queryColor && variantCfg.colors.includes(queryColor) ? queryColor : "black") : undefined;

  const viewImages: { front: string; back?: string } =
    variantCfg && activeColor ? variantCfg.images[activeColor] : product.images;

  const viewColorName = variantCfg && activeColor ? variantCfg.pretty[activeColor] : product.color || "";

  // choose PRODUCTS entry that matches the visible color
  const catalogSlug = variantCfg && activeColor ? `${baseKey}-${activeColor}` : product.slug;

  const priceFmt = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price),
    [product.price]
  );

  const hasBack = !!viewImages.back;
  const colorHex = COLOR_SWATCH[viewColorName] || "#FFFFFF";

  const catalogEntry = useMemo(() => PRODUCTS.find((p) => p.slug === catalogSlug), [catalogSlug]);

  useEffect(() => {
    const firstSizeWithVariant =
      product.sizes.find((s) => !!catalogEntry?.shopifyVariants?.[normalizeSize(s)]) || product.sizes[0] || "";
    setSize(firstSizeWithVariant);
  }, [product.sizes, catalogEntry]);

  const sizeHasVariant = (s: string) => !!catalogEntry?.shopifyVariants?.[normalizeSize(s)];

  // Fire view event (once color/slug is known)
  useEffect(() => {
    Analytics.viewItem({
      item_id: catalogEntry?.shopifyVariants?.[normalizeSize("S")] || product.slug,
      item_name: product.name,
      price: product.price,
      item_brand: "TRVPPY",
      item_category: "Tees",
      item_variant: viewColorName,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogSlug, viewColorName]);

  const addToCartNow = () => {
    if (adding) return;
    if (!size) {
      setBanner("Select a size first.");
      setTimeout(() => setBanner(""), 1400);
      return;
    }

    const normalized = normalizeSize(size);
    const variantId =
      catalogEntry?.shopifyVariants?.[normalized] ||
      catalogEntry?.shopifyVariants?.[size] ||
      "";

    if (!variantId) {
      setBanner("This size is unavailable right now.");
      setTimeout(() => setBanner(""), 1500);
      return;
    }

    setAdding(true);

    addItem({
      slug: product.slug,
      name: variantCfg ? `${product.name} — ${viewColorName}` : product.name,
      price: product.price,
      size,
      qty,
      image: viewImages.front,
      variantId,                         // required for Shopify Cart API
      preorder: !!catalogEntry?.preorder,
      shipEstimate: catalogEntry?.shipEstimate || "",
    });

    try {
      Analytics.addToCart({
        item_id: variantId,
        item_name: `${product.name} — ${viewColorName}`,
        price: product.price,
        quantity: qty,
        item_brand: "TRVPPY",
        item_category: "Tees",
        item_variant: `${viewColorName} / ${size}`,
      });
    } catch {}

    setBanner(`Added ${qty} × ${product.name} (${viewColorName} • ${size})`);
    setTimeout(() => setBanner(""), 1600);
    setTimeout(() => setAdding(false), 500);
  };

  const nextImage = () => hasBack && setFace((f) => (f === "front" ? "back" : "front"));
  const prevImage = () => hasBack && setFace((f) => (f === "back" ? "front" : "back"));

  const setColor = (c: "black" | "white") => {
    if (!variantCfg) return;
    const url = { pathname: router.pathname, query: { ...router.query, color: c } };
    router.replace(url, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>{product.name} — TRVPPY</title>
        <meta name="description" content={product.description} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} — TRVPPY`} />
        <meta
          property="og:image"
          content={(VARIANTS[BASE_OF[product.slug] || product.slug]?.images.black.front) || product.images.front}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <SiteBackground />

      <main className="relative z-10 min-h-screen text-white">
        <SiteHeader />

        {/* ===== Breadcrumb ===== */}
        <nav className="px-4 sm:px-6 py-4 text-sm text-white/70">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/#drop" className="hover:text-white">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        {banner && (
          <div className="mx-4 sm:mx-6 mb-4 rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-sm">
            {banner}
          </div>
        )}

        {/* ===== Main layout ===== */}
        <section className="px-4 sm:px-6 pb-16">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* LEFT: Big product image */}
            <div className="relative">
              <div className="relative w-full bg-white rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                <img
                  src={face === "front" ? viewImages.front : (viewImages.back || viewImages.front)}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              {hasBack && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 text-black p-2 hover:bg-white" aria-label="Previous image" title="Previous">‹</button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 text-black p-2 hover:bg-white" aria-label="Next image" title="Next">›</button>
                </>
              )}
            </div>

            {/* RIGHT: Info stack */}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">{product.name}</h1>
              <div className="mt-3 text-lg md:text-xl font-semibold">{priceFmt}</div>

              {/* Preorder badge */}
              {catalogEntry?.preorder && (
                <div className="mt-2 text-sm text-yellow-300">
                  Pre-order — {catalogEntry.shipEstimate || "ships soon"}
                </div>
              )}

              {/* Bullet list */}
              <ul className="mt-6 space-y-2 text-white/90">
                {product.details.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-[7px] block h-1.5 w-1.5 rounded-full bg-white/70" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              {/* Color */}
              <div className="mt-6 text-sm tracking-widest text-white/70">COLOR</div>
              {variantCfg ? (
                <div className="mt-2 flex items-center gap-3">
                  {variantCfg.colors.map((c) => {
                    const label = variantCfg.pretty[c];
                    const selected = activeColor === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        aria-label={label}
                        title={label}
                        className={`h-7 w-7 rounded-full border ${selected ? "border-white ring-2 ring-white/60" : "border-white/30 hover:ring-2 hover:ring-white/30"}`}
                        style={{ backgroundColor: COLOR_SWATCH[label] ?? (c === "black" ? "#111" : "#eee") }}
                      />
                    );
                  })}
                  <span className="ml-2 text-sm">{variantCfg.pretty[activeColor!]}</span>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-6 w-6 rounded border border-white/20" style={{ backgroundColor: colorHex }} aria-hidden />
                  <div className="text-sm">{product.color || "—"}</div>
                </div>
              )}

              {/* Sizes */}
              <div className="mt-6">
                <div className="text-sm tracking-widest text-white/70">SIZE</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const enabled = sizeHasVariant(s);
                    const active = size === s;
                    return (
                      <button
                        key={s}
                        onClick={() => enabled && setSize(s)}
                        disabled={!enabled}
                        className={`px-3 py-2 rounded-lg border text-sm ${
                          active
                            ? "bg-white text-black border-white"
                            : enabled
                            ? "border-white/30 text-white/90 hover:bg-white/10"
                            : "border-white/20 text-white/40 cursor-not-allowed"
                        }`}
                        title={enabled ? s : "Unavailable"}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Qty */}
              <div className="mt-6">
                <div className="text-sm tracking-widest text-white/70">QTY</div>
                <div className="mt-2 inline-flex items-center rounded-lg border border-white/20 overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-white/10" aria-label="Decrease">−</button>
                  <div className="px-4 py-2 min-w-[2ch] text-center">{qty}</div>
                  <button onClick={() => setQty((q) => Math.min(9, q + 1))} className="px-3 py-2 hover:bg-white/10" aria-label="Increase">+</button>
                </div>
              </div>

              {/* Add to bag */}
              <button
                onClick={addToCartNow}
                className="mt-8 w-full rounded-none md:rounded-md bg-black/90 hover:bg-black text-white font-bold py-4 border border-white/10 disabled:opacity-60 active:scale-95"
                disabled={adding || !sizeHasVariant(size)}
                title={!sizeHasVariant(size) ? "Select an available size" : "Add to bag"}
              >
                {adding ? "Adding…" : "ADD TO BAG"}
              </button>
            </div>
          </div>

          {/* Related strip */}
          <div className="mx-auto max-w-6xl mt-16">
            <h3 className="text-lg font-semibold mb-4">Related</h3>
            {(() => {
              const ALL_BASES = ["twisted-love", "uzi-yachty"] as const;
              const currentBase = baseKey;
              const relatedBases = ALL_BASES.filter((b) => b !== currentBase);

              return (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                  {relatedBases.map((b) => {
                    const v = VARIANTS[b];
                    const preview = v.images.black; // show black preview
                    return (
                      <div key={b} className="group text-center">
                        <Link href={{ pathname: `/products/${b}`, query: { color: "black" } }} className="block">
                          <div className="relative w-full overflow-hidden rounded-2xl bg-white aspect-[4/5]">
                            {preview.back ? (
                              <>
                                <img src={preview.back} alt={`${b} back`} className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300 group-hover:opacity-0" />
                                <img src={preview.front} alt={`${b} front`} className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                              </>
                            ) : (
                              <img src={preview.front} alt={`${b} front`} className="absolute inset-0 h-full w-full object-contain" />
                            )}
                          </div>
                        </Link>

                        <div className="mt-2 text-sm font-semibold">
                          {b === "twisted-love" ? "Twisted Love Tee" : "UZI × YACHTY Tee"}
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-2">
                          {v.colors.map((c) => (
                            <Link
                              key={c}
                              href={{ pathname: `/products/${b}`, query: { color: c } }}
                              aria-label={`${b} ${v.pretty[c]}`}
                              title={v.pretty[c]}
                              className="h-5 w-5 rounded-full border border-white/40 hover:ring-2 hover:ring-white/40"
                              style={{ backgroundColor: c === "black" ? "#111111" : "#EEEEEE" }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </section>
      </main>

      <style jsx global>{`
        h1, h2, h3, h4, h5, h6, p, span, li, button { text-shadow: 0 2px 4px rgba(0,0,0,.85); }
        @media (prefers-reduced-motion: reduce) {
          .bgvid { display: none !important; }
          body { background: url("/mockups/res.png") center/cover no-repeat; }
        }
      `}</style>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const dataSlugs = getAllProductSlugs();
  const baseSlugs = ["twisted-love", "uzi-yachty"];
  const paths = [...dataSlugs, ...baseSlugs].map((slug) => ({ params: { slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<{ product: Product }> = async ({ params }) => {
  const incoming = params?.slug as string;
  const CANONICAL_DEFAULT: Record<string, string> = {
    "twisted-love": "twisted-love-black",
    "uzi-yachty": "uzi-yachty-black",
  };
  const effectiveSlug = CANONICAL_DEFAULT[incoming] || incoming;
  const product = getProductBySlug(effectiveSlug);
  if (!product) return { notFound: true };
  return { props: { product } };
};
