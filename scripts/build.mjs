import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'static'), { recursive: true });
await mkdir(resolve(dist, 'server'), { recursive: true });
await mkdir(resolve(dist, '.openai'), { recursive: true });

for (const file of ['index.html', 'styles.css', 'script.js']) {
  await cp(resolve(root, file), resolve(dist, 'static', file));
}
await cp(resolve(root, 'public', 'og.png'), resolve(dist, 'static', 'og.png'));
await cp(resolve(root, '.openai', 'hosting.json'), resolve(dist, '.openai', 'hosting.json'));

const worker = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/') url.pathname = '/index.html';
    const response = await env.ASSETS.fetch(new Request(url, request));
    if (response.status !== 404) {
      if (url.pathname === '/index.html') {
        const html = (await response.text()).replaceAll('__SITE_ORIGIN__', new URL(request.url).origin);
        return new Response(html, { headers: { ...Object.fromEntries(response.headers), 'content-type': 'text/html; charset=utf-8' } });
      }
      return response;
    }
    return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
  }
};\n`;

await writeFile(resolve(dist, 'server', 'index.js'), worker);
console.log('Portfolio built successfully.');
