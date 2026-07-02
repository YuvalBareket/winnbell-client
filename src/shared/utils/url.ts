/**
 * Returns a safe, navigable http(s) URL for any user- or externally-supplied value, or `null`
 * if the value is empty or uses a disallowed scheme (e.g. `javascript:`, `data:`, `vbscript:`).
 *
 * Bare domains ("example.com") are upgraded to https so they still work. Use this for ANY value
 * that flows into an `<a href>` or `window.open` / `window.location`, so attacker-controlled
 * content (a business's website field, etc.) can never render an executable `javascript:` link.
 */
export function safeHttpUrl(raw: string | null | undefined): string | null {
  const s = (raw ?? '').trim();
  if (!s) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

/**
 * True only for a genuine Stripe Checkout URL. Use before redirecting the browser to a checkout
 * URL returned by the server: the server relays it from Stripe's API, but the client must never
 * navigate to an arbitrary response value (defense-in-depth against a misconfig / tampering).
 */
export function isStripeCheckoutUrl(raw: string | null | undefined): boolean {
  try {
    const u = new URL(raw ?? '');
    return u.protocol === 'https:' && u.hostname === 'checkout.stripe.com';
  } catch {
    return false;
  }
}
