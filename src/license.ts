const SLUG = 'csv-keyed-diff';
const API = 'https://api.sociobot.in/api/v1';
const LICENSE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

type Verdict = { valid: boolean; checkedAt: number; reason?: string };

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;

export function captureLicense(): string | null {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (token) {
    localStorage.setItem(LICENSE_KEY, token.trim());
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  return token;
}

export function storeLicense(token: string) {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function removeLicense() {
  localStorage.removeItem(LICENSE_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedLicense(): { token: string | null; unlocked: boolean; stale: boolean } {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return { token: null, unlocked: false, stale: false };
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict;
    return { token, unlocked: verdict.valid, stale: Date.now() - verdict.checkedAt > DAY };
  } catch {
    return { token, unlocked: true, stale: true };
  }
}

export async function verifyLicense(force = false): Promise<Verdict | null> {
  const cached = cachedLicense();
  if (!cached.token) return null;
  if (!force && !cached.stale) {
    return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as Verdict;
  }
  const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(cached.token)}`);
  if (!response.ok) throw new Error('License service is temporarily unavailable.');
  const body = (await response.json()) as { valid: boolean; reason?: string };
  const verdict = { valid: body.valid, reason: body.reason, checkedAt: Date.now() };
  localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
  return verdict;
}
