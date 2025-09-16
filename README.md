This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

## Performance notes (added)

- Deferred background video loading via `components/ResilientVideo.tsx` (use `deferLoad` to avoid downloading heavy MP4s until visible).
- Background and header MP4s are served from Shopify CDN (preconnect added for `https://cdn.shopify.com`).
- Large mockup images use `loading="lazy"` and `decoding="async"` to improve perceived load.
- A helper script `scripts/convert-images.js` is provided to convert PNG/JPEG assets in `public/mockups/` to `.webp` and `.avif` using `sharp` (run `npm install --save-dev sharp` then `npm run convert:images`).

Recommended next steps:
- Replace product/gallery images with `next/image` for automatic responsive optimization.
- Generate LQIP blur-up placeholders for hero and product images.
- Run Lighthouse and compare metrics before/after changes.

## Shopify sync & webhooks

To keep site data (prices, inventory, new products) in sync with your Shopify store you can configure Shopify webhooks to trigger on-demand revalidation of pages on your Next.js site.

Steps to set up:
1. Configure environment variables (in Vercel or local `.env`):
	- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` — your-store.myshopify.com
	- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` — Storefront API token
	- `SHOPIFY_WEBHOOK_SECRET` — webhook signing secret (from Shopify Admin)

2. Create a webhook in Shopify Admin → Settings → Notifications → Webhooks or via the Admin API:
	- URL: `https://<your-site>/api/shopify/webhook`
	- Topics: `products/update`, `variants/update` (and others if needed)
	- Format: JSON

3. The webhook handler at `pages/api/shopify/webhook.ts` verifies the HMAC signature and will call Next's `res.revalidate()` for affected pages. Ensure your deployment environment supports on-demand revalidation (Vercel does).

4. Test the webhook:
	- From Shopify admin (send test webhook), or
	- Use curl with a correctly signed payload (or temporarily bypass verification for testing).

Notes:
- The product data (`lib/products.ts`) contains `shopifyVariants` mapping. The webhook maps incoming variant IDs to local site slugs using this mapping. Keep the mapping up-to-date for correct revalidation.
- After webhooks revalidate pages, `getStaticProps` fetches the live variant price from Shopify and will update the rendered page.
