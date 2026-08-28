import { cp, mkdir } from 'node:fs/promises';

for (const route of ['privacy', 'terms']) {
  await mkdir(new URL(`../dist/${route}/`, import.meta.url), { recursive: true });
  await cp(new URL('../dist/index.html', import.meta.url), new URL(`../dist/${route}/index.html`, import.meta.url));
}
