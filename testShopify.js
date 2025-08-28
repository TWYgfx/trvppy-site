// testShopify.js
// Lists products and their VARIANT IDs (merchandiseId) so you can use them in cart checkout.

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token  = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !token) {
  console.error(
    "Missing env vars. Make sure these exist in .env.local:\n" +
    "  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=yourstore.myshopify.com\n" +
    "  NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxxxxx\n\n" +
    "Run with: node --env-file=.env.local testShopify.js"
  );
  process.exit(1);
}

const API_VERSION = "2024-07";
const URL = `https://${domain}/api/${API_VERSION}/graphql.json`;

// testShopify.js — replace the query with:
const query = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      variants(first: 50) {
        edges { node { id title } }  // title like "White / M"
      }
    }
  }
`;
const variables = { handle: "twisted-love-tee-white" }; // your real handle

async function run() {
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    console.error("GraphQL errors:", json.errors);
    process.exit(1);
  }

  // Pretty print a compact list so you can copy IDs easily
  const list = json.data.products.edges.map(({ node }) => ({
    product: node.title,
    handle: node.handle,
    variants: node.variants.edges.map(v => ({
      id: v.node.id,                 // <-- copy this into your cart items
      title: v.node.title,
      sku: v.node.sku,
      available: v.node.availableForSale,
      price: `${v.node.price.amount} ${v.node.price.currencyCode}`,
    })),
  }));

  console.log(JSON.stringify(list, null, 2));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
