// lib/products.ts

export type Product = {
  slug: string;
  name: string;
  price: number;
  color?: string;
  images: { front: string; back?: string };
  description: string;
  details: string[];
  care: string[];
  shipping: string;
  sizes: string[];

  // Shopify Variant IDs (GraphQL GIDs) per size
  // Example: "gid://shopify/ProductVariant/45392045832154"
  shopifyVariants?: Record<string, string>;

  // ✅ Preorder flags (new)
  preorder?: boolean;          // show “Pre-order” badge, pass to cart/checkout
  shipEstimate?: string;       // text shown to shopper + passed to cart lines
};

export const PRODUCTS: Product[] = [
  /* ---------- Twisted Love — Black ---------- */
  {
    slug: "twisted-love-black",
    name: "Twisted Love Tee",
    price: 55,
    color: "Black",
    preorder: true,                 // ✅ you can toggle per product
    shipEstimate: "Ships late Sept",
    images: {
      front: "/mockups/trvppy-black-front.png",
      back: "/mockups/twisted-love-black.png",
    },
    description:
      "Portal-grade cotton. Twisted print on back, minimal front badge.",
    details: [
      "100% heavyweight cotton",
      "Printed graphics front/back",
      "Boxy, slightly oversized fit",
    ],
    care: ["Machine wash cold", "Tumble dry low", "Do not iron print"],
    shipping: "Ships in 5–7 business days. Preorders ship once drop closes.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    shopifyVariants: {
      S:  "gid://shopify/ProductVariant/46697207333122",
      M:  "gid://shopify/ProductVariant/46697207365890",
      L:  "gid://shopify/ProductVariant/46697207398658",
      XL: "gid://shopify/ProductVariant/46697207398658", // (same as L per your file)
      // XXL missing in your data (optional to add later)
    },
  },

  /* ---------- Twisted Love — White ---------- */
  {
    slug: "twisted-love-white",
    name: "Twisted Love Tee",
    price: 55,
    color: "White",
    preorder: true,                 // ✅
    shipEstimate: "Ships late Sept",
    images: {
      front: "/mockups/trvppy-white-front.png",
      back: "/mockups/twisted-love-white.png",
    },
    description:
      "Whiteout variant of the Twisted Love tee—same portal energy, crisp canvas.",
    details: [
      "100% heavyweight cotton",
      "Printed graphics front/back",
      "Boxy, slightly oversized fit",
    ],
    care: ["Machine wash cold", "Tumble dry low", "Do not iron print"],
    shipping: "Ships in 5–7 business days. Preorders ship once drop closes.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    shopifyVariants: {
      S:  "gid://shopify/ProductVariant/46697207464194",
      M:  "gid://shopify/ProductVariant/46697207496962",
      L:  "gid://shopify/ProductVariant/46697207529730",
      XL: "gid://shopify/ProductVariant/46697207562498",
      // XXL missing (optional)
    },
  },

  /* ---------- UZI × YACHTY — Black ---------- */
  {
    slug: "uzi-yachty-black",
    name: "UZI × YACHTY Tee",
    price: 45,
    color: "Black",
    preorder: true,                 // ✅
    shipEstimate: "Ships late Sept",
    images: {
      front: "/mockups/UZI-X-YACHTY-BLK.png",
    },
    description:
      "Collab graphic locked in black. Loud where it needs to be.",
    details: ["Heavyweight cotton", "Front print", "Classic fit"],
    care: ["Machine wash cold", "Tumble dry low"],
    shipping: "Ships in 5–7 business days.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    shopifyVariants: {
      S:  "gid://shopify/ProductVariant/46651685503234",
      M:  "gid://shopify/ProductVariant/46651685536002",
      L:  "gid://shopify/ProductVariant/46651685568770",
      XL: "gid://shopify/ProductVariant/46651685601538",
      // XXL missing (optional)
    },
  },

  /* ---------- UZI × YACHTY — White ---------- */
  {
    slug: "uzi-yachty-white",
    name: "UZI × YACHTY Tee",
    price: 45,
    color: "White",
    preorder: true,                 // ✅
    shipEstimate: "Ships late Sept",
    images: {
      front: "/mockups/UZI-X-YACHTY-WHITE.png",
    },
    description:
      "White canvas with the UZI × YACHTY graphic. Summer armor.",
    details: ["Heavyweight cotton", "Front print", "Classic fit"],
    care: ["Machine wash cold", "Tumble dry low"],
    shipping: "Ships in 5–7 business days.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    shopifyVariants: {
      S:  "gid://shopify/ProductVariant/46697150873858",
      M:  "gid://shopify/ProductVariant/46697150906626",
      L:  "gid://shopify/ProductVariant/46697150939394",
      XL: "gid://shopify/ProductVariant/46697150972162",
      // XXL missing (optional)
    },
  },
];

export function getAllProductSlugs() {
  return PRODUCTS.map((p) => p.slug);
}
export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}
