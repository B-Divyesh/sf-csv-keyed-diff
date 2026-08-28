const API_ORIGIN = process.env.SOCIOBOT_API_ORIGIN ?? 'https://api.sociobot.in';
const PRODUCT_ORIGIN = process.env.PRODUCT_ORIGIN ?? 'https://csv-keyed-diff.sociobot.in';
const SLUG = 'csv-keyed-diff';
const EXPECTED = {
  name: 'CSV Keyed Diff Pro',
  price_minor: 1900,
  currency: 'USD',
  product_url: `${PRODUCT_ORIGIN}/`,
  checkout_url: `${API_ORIGIN}/api/v1/products/${SLUG}/checkout`,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const catalogResponse = await fetch(`${API_ORIGIN}/api/v1/products`, {
  headers: { accept: 'application/json' },
});
assert(catalogResponse.ok, `Product catalog returned HTTP ${catalogResponse.status}`);
const catalog = await catalogResponse.json();
const product = catalog.data?.find((entry) => entry.slug === SLUG);
assert(product, `${SLUG} is not registered in the live product catalog`);

for (const [field, expected] of Object.entries(EXPECTED)) {
  assert(product[field] === expected, `${field} mismatch: expected ${expected}, received ${product[field]}`);
}

const checkoutResponse = await fetch(EXPECTED.checkout_url, {
  headers: { accept: 'text/html' },
  redirect: 'manual',
});
assert(
  [302, 303, 307, 308].includes(checkoutResponse.status),
  `Checkout returned HTTP ${checkoutResponse.status} instead of a redirect`,
);
const location = checkoutResponse.headers.get('location');
assert(location, 'Checkout redirect did not include a Location header');
const checkoutDestination = new URL(location);
assert(checkoutDestination.protocol === 'https:', 'Checkout redirect is not HTTPS');
assert(checkoutDestination.hostname === 'checkout.dodopayments.com', `Unexpected checkout host: ${checkoutDestination.hostname}`);

console.log(`PASS ${SLUG}: catalog is enabled at $19 USD and checkout redirects to ${checkoutDestination.hostname}`);
