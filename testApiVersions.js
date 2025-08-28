const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token  = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !token) {
  console.error("Missing env vars. Run with: node --env-file=.env.local testApiVersions.js");
  process.exit(1);
}

const VERSIONS = ["2023-07","2023-10","2024-01","2024-04","2024-07","2024-10"];

const query = `{ __schema { queryType { name } } }`;

async function tryVersion(version) {
  const url = `https://${domain}/api/${version}/graphql.json`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || res.status));
    console.log(`✅ ${version} works`);
  } catch (err) {
    console.log(`❌ ${version} failed:`, err.message);
  }
}

(async () => {
  for (const v of VERSIONS) {
    await tryVersion(v);
  }
})();
