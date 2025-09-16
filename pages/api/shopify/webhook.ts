import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { findSlugsByVariantGid } from '../../../lib/products';

// Shared secret from Shopify (Admin webhook signing secret)
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';

function verifyHmac(req: NextApiRequest, rawBody: Buffer) {
  try {
    const hmac = req.headers['x-shopify-hmac-sha256'] as string | undefined;
    if (!hmac) return false;

    // Compute HMAC of the raw body (base64)
    const digestBase64 = crypto.createHmac('sha256', SHOPIFY_WEBHOOK_SECRET).update(rawBody).digest('base64');

    // Decode both to buffers using base64 so timingSafeEqual compares raw bytes
    const digestBuf = Buffer.from(digestBase64, 'base64');
    let headerBuf: Buffer;
    try {
      headerBuf = Buffer.from(hmac, 'base64');
    } catch (e) {
      // If header isn't valid base64, fail verification
      console.warn('[webhook] HMAC header not valid base64');
      return false;
    }

    // Must be same length for timingSafeEqual; if not, verification fails
    if (headerBuf.length !== digestBuf.length) {
      console.warn('[webhook] HMAC length mismatch', { headerLen: headerBuf.length, digestLen: digestBuf.length });
      return false;
    }

    const ok = crypto.timingSafeEqual(digestBuf, headerBuf);
    return ok;
  } catch (err) {
    console.error('[webhook] verifyHmac error', err);
    return false;
  }
}

export const config = {
  api: {
    bodyParser: false, // we need raw body for HMAC
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log every incoming request for debugging
  console.log('[webhook] Incoming request', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    time: new Date().toISOString(),
  });

  if (req.method !== 'POST') {
    console.warn('[webhook] Non-POST request received');
    return res.status(405).end('Method not allowed');
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of req as any) chunks.push(chunk);
  const raw = Buffer.concat(chunks);
  console.log('[webhook] Raw body length:', raw.length);

  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.warn('[webhook] SHOPIFY_WEBHOOK_SECRET not configured');
    return res.status(500).end('Webhook not configured');
  }

  if (!verifyHmac(req, raw)) {
    console.warn('[webhook] HMAC verification failed');
    return res.status(401).end('HMAC verification failed');
  }

  let data: any;
  try {
    data = JSON.parse(raw.toString('utf8'));
    console.log('[webhook] Parsed JSON:', data);
  } catch (e) {
    console.error('[webhook] Invalid JSON', e);
    return res.status(400).end('Invalid JSON');
  }

  // Shopify sends many webhook types. We'll handle 'products/update' and 'variants/update' events.
  const topic = (req.headers['x-shopify-topic'] as string) || '';
  console.log('[webhook] Topic:', topic);

  const slugsToRevalidate = new Set<string>();

  if (topic === 'products/update' && data?.id) {
    // A product changed — find any local slugs that have variants matching the incoming product's variants
    const variants = data.variants || [];
    for (const v of variants) {
      const matched = findSlugsByVariantGid(v.id);
      matched.forEach(s => slugsToRevalidate.add(s));
    }
  }

  if (topic === 'variants/update' && data?.id) {
    const matched = findSlugsByVariantGid(data.id);
    matched.forEach(s => slugsToRevalidate.add(s));
  }

  // Always revalidate homepage in case product lists/pricing are shown there
  slugsToRevalidate.add('/');

  try {
    for (const slug of slugsToRevalidate) {
      // product pages are under /products/[slug]
      const path = slug === '/' ? '/' : `/products/${slug}`;
      console.log('[webhook] Revalidating', path);
      await res.revalidate(path).catch((err) => console.error('revalidate failed', err));
    }
  } catch (err) {
    console.error('[webhook] Error during revalidation', err);
    return res.status(500).end('Revalidation error');
  }

  return res.status(200).json({ ok: true, revalidated: Array.from(slugsToRevalidate) });
}
