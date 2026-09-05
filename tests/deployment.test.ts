import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type StaticWebAppConfig = {
  globalHeaders: Record<string, string>;
  navigationFallback?: { rewrite: string; exclude: string[] };
  responseOverrides: Record<string, { rewrite: string }>;
  routes: Array<{ route: string; headers?: Record<string, string> }>;
};

const configPath = resolve(process.cwd(), 'public/staticwebapp.config.json');

async function deploymentConfig(): Promise<StaticWebAppConfig> {
  return JSON.parse(await readFile(configPath, 'utf8')) as StaticWebAppConfig;
}

describe('static deployment policy', () => {
  it('makes Vite content-hashed JavaScript and CSS immutable for one year', async () => {
    const config = await deploymentConfig();
    for (const route of ['/assets/*.js', '/assets/*.css']) {
      expect(config.routes.find((entry) => entry.route === route)?.headers?.['Cache-Control'])
        .toBe('public, max-age=31536000, immutable');
    }
  });

  it('keeps the service worker revalidatable and restricts browser capabilities', async () => {
    const config = await deploymentConfig();
    expect(config.routes.find((entry) => entry.route === '/sw.js')?.headers?.['Cache-Control'])
      .toBe('no-cache, no-store, must-revalidate');
    expect(config.globalHeaders['Content-Security-Policy'])
      .toContain("connect-src 'self' https://api.sociobot.in");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });
});
