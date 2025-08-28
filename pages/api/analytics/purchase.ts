// pages/api/analytics/purchase.ts
import type { NextApiRequest, NextApiResponse } from "next";

const GA_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID!;
const GA_API_SECRET = process.env.GA4_API_SECRET!;
const FB_PIXEL_ID = process.env.FB_PIXEL_ID!;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN!;
const FB_TEST_EVENT_CODE = process.env.FB_TEST_EVENT_CODE || ""; // optional

// Basic CORS so Shopify's order status page can POST here
function setCORS(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const { orderId, value, currency = "USD", items = [], clientId } = req.body || {};
  try {
    const promises: Promise<any>[] = [];

    // ---- GA4 Measurement Protocol ----
    if (GA_MEASUREMENT_ID && GA_API_SECRET) {
      const gaUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;
      const gaPayload = {
        client_id: clientId || "555.123", // any stable id; can be random
        events: [
          {
            name: "purchase",
            params: {
              transaction_id: String(orderId || Date.now()),
              currency,
              value: Number(value || 0),
              items,
            },
          },
        ],
      };
      promises.push(fetch(gaUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(gaPayload) }));
    }

    // ---- Meta CAPI ----
    if (FB_PIXEL_ID && FB_ACCESS_TOKEN) {
      const fbUrl = `https://graph.facebook.com/v17.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`;
      const fbPayload = {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_source_url: "https://your-site.com/",
            custom_data: {
              currency,
              value: Number(value || 0),
              contents: items.map((i: any) => ({ id: i.item_id, quantity: i.quantity, item_price: i.price })),
              content_type: "product",
            },
          },
        ],
        ...(FB_TEST_EVENT_CODE ? { test_event_code: FB_TEST_EVENT_CODE } : {}),
      };
      promises.push(fetch(fbUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fbPayload) }));
    }

    await Promise.all(promises);
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("purchase api error", e?.message || e);
    res.status(500).json({ ok: false, error: e?.message || "error" });
  }
}
