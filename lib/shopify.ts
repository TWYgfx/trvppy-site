// lib/shopify.ts
/* Storefront GraphQL (direct) with clear userErrors + safe client redirect */

// ✅ match your .env.local keys exactly
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const token  = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

if (!domain) console.warn("[Shopify] NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN missing");
if (!token)  console.warn("[Shopify] NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN missing");

// Use a recent stable version
const API_VERSION = "2024-07";
const ENDPOINT = `https://${domain}/api/${API_VERSION}/graphql.json`;

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; extensions?: any }>;
};

/** Core fetch with detailed errors */
export async function shopifyFetch<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    // Next.js: avoid caching Storefront responses by default
    cache: "no-store",
  });

  let json: GraphQLResponse<TData> | undefined;

  try {
    json = (await res.json()) as GraphQLResponse<TData>;
  } catch {
    // non-JSON response (bad gateway, HTML, etc.)
    throw new Error(`[Shopify] Non-JSON response (HTTP ${res.status})`);
  }

  if (!res.ok) {
    console.error("[Shopify] HTTP error:", res.status, json);
    throw new Error(`[Shopify] HTTP ${res.status}`);
  }

  if (json?.errors?.length) {
    const msg = json.errors.map(e => e.message).join("; ");
    console.error("[Shopify] GraphQL errors:", json.errors);
    throw new Error(msg || "[Shopify] Unknown GraphQL error");
  }

  if (!json?.data) {
    throw new Error("[Shopify] Missing data in response");
  }

  return json.data;
}

/** Create an empty checkout (returns id, webUrl) */
export async function createCheckout(): Promise<{ id: string; webUrl: string }> {
  const MUTATION = /* GraphQL */ `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout { id webUrl }
        userErrors { field message }
      }
    }
  `;

  const variables = { input: {} };

  const data = await shopifyFetch<{
    checkoutCreate: {
      checkout: { id: string; webUrl: string } | null;
      userErrors: { field: string[] | null; message: string }[];
    };
  }>(MUTATION, variables);

  const { checkout, userErrors } = data.checkoutCreate;

  if (userErrors?.length) {
    const msg = userErrors.map(u => u.message).join("; ");
    console.error("[Shopify] checkoutCreate userErrors:", userErrors);
    throw new Error(msg);
  }

  if (!checkout?.id || !checkout?.webUrl) {
    throw new Error("[Shopify] Checkout not returned");
  }

  return { id: checkout.id, webUrl: checkout.webUrl };
}

/** Add line items (variantId + quantity) to a checkout */
export async function addLineItems(
  checkoutId: string,
  items: Array<{ variantId: string; quantity: number }>
) {
  const MUTATION = /* GraphQL */ `
    mutation checkoutLineItemsAdd($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
      checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
        checkout { id webUrl }
        userErrors { field message }
      }
    }
  `;

  const variables = {
    checkoutId,
    lineItems: items.map(it => ({ variantId: it.variantId, quantity: it.quantity })),
  };

  const data = await shopifyFetch<{
    checkoutLineItemsAdd: {
      checkout: { id: string; webUrl: string } | null;
      userErrors: { field: string[] | null; message: string }[];
    };
  }>(MUTATION, variables);

  const { checkout, userErrors } = data.checkoutLineItemsAdd;

  if (userErrors?.length) {
    const msg = userErrors.map(u => u.message).join("; ");
    console.error("[Shopify] checkoutLineItemsAdd userErrors:", userErrors);
    throw new Error(msg);
  }

  return checkout;
}

/**
 * Get a checkout's webUrl so a CLIENT component can navigate.
 * Use this in server code to fetch the URL, then push/redirect on the client.
 */
export async function getCheckoutWebUrl(checkoutId: string): Promise<string> {
  const QUERY = /* GraphQL */ `
    query getCheckout($id: ID!) {
      node(id: $id) {
        ... on Checkout { id webUrl }
      }
    }
  `;
  const data = await shopifyFetch<{ node: { id: string; webUrl: string } | null }>(QUERY, { id: checkoutId });
  const url = data.node?.webUrl;
  if (!url) throw new Error("[Shopify] No checkout webUrl");
  return url;
}

/**
 * Client-only helper (keep this inside a `"use client"` component/file)
 */
export function redirectToCheckoutOnClient(webUrl: string) {
  if (typeof window !== "undefined") {
    window.location.href = webUrl;
  } else {
    console.warn("[Shopify] redirectToCheckoutOnClient called on the server");
  }
}
