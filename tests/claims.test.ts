import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Claim = { id: string; claim: string; where: string; test: string; sandbox: string };

describe('public claims registry', () => {
  it('maps every registered claim to exactly one tagged outcome test', async () => {
    const claims = JSON.parse(await readFile(resolve('.factory/claims.json'), 'utf8')) as Claim[];
    const browserTests = await readFile(resolve('tests/e2e/claims.spec.ts'), 'utf8');
    expect(claims.length).toBeGreaterThan(0);
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);

    for (const claim of claims) {
      expect(claim.claim.length).toBeGreaterThan(12);
      expect(claim.where.length).toBeGreaterThan(0);
      expect(claim.sandbox.length).toBeGreaterThan(20);
      expect(claim.test).toContain(`@claim:${claim.id}`);
      expect(browserTests.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g'))).toHaveLength(1);
    }
  });
});
