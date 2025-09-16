// components/CartDrawer.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { Analytics } from "../lib/analytics";

// Public Storefront envs
// NOTE: allow the environment variable to be set either as just the domain
// (example: `myshop.myshopify.com`) or include protocol; normalize to avoid
// building `https://https://...` which causes network failures.
const RAW_SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";
const SHOP_DOMAIN = RAW_SHOP_DOMAIN.replace(/^https?:\/\//i, "").replace(/\/$/, "");
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const API_VERSION = "2024-10";
const ENDPOINT = `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`;
if (typeof window !== "undefined") {
  // Helpful debug print in browser console when running locally or in preview
  // so you can see the exact endpoint being used.
  // eslint-disable-next-line no-console
  console.debug("[Shopify] GraphQL endpoint:", ENDPOINT);
}

type GQLUserError = { field: string[] | null; message: string };

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("[Shopify] HTTP error", res.status, json);
    throw new Error(`Shopify HTTP ${res.status}`);
  }
  if (json?.errors?.length) {
    const msg = (json.errors as { message: string }[]).map((e) => e.message).join("; ");
    console.error("[Shopify] GraphQL errors:", json.errors);
    throw new Error(msg || "Shopify GraphQL error");
  }
  return json.data as T;
}

const MUTATION_CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      onClick={() => setOpen(true)}
      className="relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg hover:bg-white/10 focus:outline-none"
      aria-label="Open cart"
      title="Cart"
    >
      <img src="/cart.png" alt="Cart" className="w-6 h-6 object-contain" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 rounded-full bg-white text-black text-[10px] font-bold px-1.5 py-0.5 leading-none">
          {count}
        </span>
      )}
    </button>
  );
}

export default function CartDrawer() {
  const { items, removeItem, setQty, subtotal, open, setOpen, clear } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [banner, setBanner] = useState<string>("");

  const missingVariantIds = useMemo(() => items.filter((it) => !it.variantId), [items]);

  const handleCheckout = useCallback(async () => {
    if (!items.length || isCheckingOut) return;
    if (missingVariantIds.length) {
      setBanner("One or more items are missing a Shopify variant. Please re-add the item.");
      setTimeout(() => setBanner(""), 1800);
      return;
    }

    // Analytics: begin checkout
    try {
      const itemsPayload = items.map((i) => ({
        item_id: i.variantId!,
        item_name: i.name,
        price: i.price,
        quantity: i.qty,
        item_brand: "TRVPPY",
        item_category: "Tees",
        item_variant: i.size ? `${i.size}` : undefined,
      }));
      Analytics.beginCheckout(itemsPayload, subtotal);
    } catch {}

    setIsCheckingOut(true);
    try {
      const lines = items.map((it) => ({
        merchandiseId: it.variantId, // ProductVariant GID
        quantity: it.qty,
        attributes: [
          { key: "preorder", value: String(!!it.preorder) },
          ...(it.shipEstimate ? [{ key: "ship_estimate", value: it.shipEstimate }] : []),
          ...(it.size ? [{ key: "size", value: String(it.size) }] : []),
        ],
      }));

      const variables = {
        input: {
          lines,
          attributes: [{ key: "order_type", value: "preorder" }], // helpful tag in order
        },
      };

      const data = await shopifyFetch<{
        cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: GQLUserError[] };
      }>(MUTATION_CART_CREATE, variables);

      const errs = data.cartCreate.userErrors;
      if (errs?.length) throw new Error(errs.map((u) => u.message).join("; "));
      const checkoutUrl = data.cartCreate.cart?.checkoutUrl;
      if (!checkoutUrl) throw new Error("No checkoutUrl returned.");

      setOpen(false);
      window.location.href = checkoutUrl;
    } catch (e: any) {
      console.error("[Cart] Checkout error:", e?.message || e);
      setBanner(e?.message || "Checkout failed. Please try again.");
      setTimeout(() => setBanner(""), 2200);
      setIsCheckingOut(false);
    }
  }, [items, isCheckingOut, setOpen, missingVariantIds, subtotal]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => !isCheckingOut && setOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-[90%] max-w-md bg-zinc-900/95 backdrop-blur border-l border-white/10
                    transition-transform ${open ? "translate-x-0" : "translate-x-full"} shadow-2xl`}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-lg font-semibold">Your Cart</h3>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 disabled:opacity-50"
            aria-label="Close"
            disabled={isCheckingOut}
          >
            ✕
          </button>
        </div>

        {banner && (
          <div className="mx-4 mt-3 rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm">
            {banner}
          </div>
        )}

        <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 && <div className="text-white/70 text-sm">Your cart is empty.</div>}

          {items.map((it) => (
            <div key={it.id} className="flex gap-3 border border-white/10 rounded-xl p-3 bg-white/5">
              <img src={it.image} alt={it.name} className="h-16 w-16 object-contain rounded-lg bg-white" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{it.name}</div>
                <div className="text-xs text-white/70 flex items-center gap-2">
                  <span>Size: {it.size || "—"}</span>
                  {it.preorder && (
                    <span className="rounded px-1.5 py-0.5 bg-yellow-200/20 border border-yellow-300/30 text-yellow-200">
                      Pre-order{it.shipEstimate ? ` • ${it.shipEstimate}` : ""}
                    </span>
                  )}
                  {!it.variantId && <span className="text-red-300">• missing variant</span>}
                </div>
                <div className="mt-1 text-sm">${(it.price * it.qty).toFixed(2)}</div>
                <div className="mt-2 inline-flex items-center rounded-lg border border-white/15">
                  <button
                    onClick={() => {
                      try {
                        Analytics.removeFromCart({
                          item_id: it.variantId || it.id,
                          item_name: it.name,
                          price: it.price,
                          quantity: 1,
                          item_brand: "TRVPPY",
                          item_category: "Tees",
                          item_variant: it.size,
                        });
                      } catch {}
                      setQty(it.id, it.qty - 1);
                    }}
                    className="px-2 py-1 hover:bg-white/10 disabled:opacity-50"
                    disabled={isCheckingOut || it.qty <= 1}
                  >
                    −
                  </button>
                  <div className="px-3 py-1 text-sm">{it.qty}</div>
                  <button
                    onClick={() => setQty(it.id, it.qty + 1)}
                    className="px-2 py-1 hover:bg-white/10 disabled:opacity-50"
                    disabled={isCheckingOut || it.qty >= 99}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  try {
                    Analytics.removeFromCart({
                      item_id: it.variantId || it.id,
                      item_name: it.name,
                      price: it.price,
                      quantity: it.qty,
                      item_brand: "TRVPPY",
                      item_category: "Tees",
                      item_variant: it.size,
                    });
                  } catch {}
                  removeItem(it.id);
                }}
                className="self-start rounded-lg p-2 hover:bg-white/10 disabled:opacity-50"
                aria-label="Remove"
                disabled={isCheckingOut}
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-white/10 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Subtotal</span>
            <span className="text-lg font-semibold">${subtotal.toFixed(2)}</span>
          </div>

          <button
            className="w-full rounded-full bg-white text-black font-bold py-3 active:scale-95 disabled:opacity-60"
            onClick={handleCheckout}
            disabled={items.length === 0 || isCheckingOut || missingVariantIds.length > 0}
            title={missingVariantIds.length ? "An item is missing its Shopify variant; re-add it." : "Proceed to checkout"}
          >
            {isCheckingOut ? "Redirecting…" : "Checkout"}
          </button>

          {items.length > 0 && (
            <button
              className="w-full rounded-full bg-white/10 border border-white/20 py-2 hover:bg-white/15 disabled:opacity-60"
              onClick={clear}
              disabled={isCheckingOut}
            >
              Clear Cart
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
