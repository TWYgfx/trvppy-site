// pages/api/checkout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
}

// ✅ no apiVersion passed — avoids type mismatch
const stripe = new Stripe(secret);

type IncomingItem = {
  name: string;
  image?: string;
  unit_amount: number; // cents
  qty: number;
  metadata?: Record<string, string>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { items } = (req.body || {}) as { items?: IncomingItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items" });
    }

    // Basic validation
    for (const [i, it] of items.entries()) {
      if (
        !it ||
        typeof it.name !== "string" ||
        !Number.isFinite(it.unit_amount) ||
        it.unit_amount <= 0 ||
        !Number.isFinite(it.qty) ||
        it.qty < 1
      ) {
        return res.status(400).json({ error: `Invalid item at index ${i}` });
      }
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((it) => ({
      quantity: Math.min(Math.max(Math.trunc(it.qty), 1), 99),
      price_data: {
        currency: "usd",
        unit_amount: Math.trunc(it.unit_amount),
        product_data: {
          name: it.name,
          // Stripe requires https images; omit if local dev asset
          images: it.image && it.image.startsWith("http") ? [it.image] : [],
          metadata: it.metadata,
        },
      },
      adjustable_quantity: { enabled: true, minimum: 1, maximum: 9 },
    }));

    // Build absolute URLs for success/cancel
    const origin =
      (req.headers.origin as string) ||
      (process.env.NEXT_PUBLIC_SITE_URL as string) ||
      `http://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // wallets will appear automatically where eligible
      line_items,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR"],
      },
      allow_promotion_codes: true,
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    // Don’t leak internals to the client
    console.error("[checkout] error:", err?.message || err);
    return res.status(500).json({ error: "Internal error creating checkout session" });
  }
}
