// Serve only an exported ClearSign website, using the same page addresses as Netlify.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = await realpath(path.resolve(process.env.SITE_DIR || path.join(project, 'site')));
if (
  root !== path.join(project, 'site') &&
  !root.startsWith(path.join(project, 'outputs') + path.sep)
)
  throw new Error('Choose site/ or a review export inside outputs/.');
const port = Number(process.env.SITE_PORT || 3213);
const mime = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};
async function send(request, response, target, status = 200) {
  const file = await realpath(target);
  if (!file.startsWith(root + path.sep)) throw new Error('Not a public asset');
  const info = await stat(file);
  if (!info.isFile()) throw new Error('Not a file');
  const type = mime[path.extname(file)] || 'application/octet-stream';
  response.writeHead(status, {
    'Content-Type': type + (type.startsWith('text/') ? '; charset=utf-8' : ''),
    'Content-Length': info.size,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') response.end();
  else {
    const stream = createReadStream(file);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  }
}
const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    const route = decodeURIComponent(url.pathname);
    if (
      route.includes('\\') ||
      route.includes('\0') ||
      route.split('/').some((p) => p.startsWith('.'))
    )
      throw new Error('Invalid path');
    // Mirror exact redirects from the current export, including retired pages.
    if (!route.startsWith('/assets/') && !route.startsWith('/_next/')) {
      const rules = await readFile(path.join(root, '_redirects'), 'utf8');
      const matched = rules.split('\n').find((rule) => rule.split(' ')[0] === route);
      if (matched) {
        const [, target, code] = matched.split(' ');
        response.writeHead(parseInt(code, 10), { Location: target + url.search }).end();
        return;
      }
    }
    const requested = path.resolve(root, '.' + route);
    if (requested !== root && !requested.startsWith(root + path.sep))
      throw new Error('Outside export');
    const info = await stat(requested);
    if (info.isDirectory() && !route.endsWith('/')) {
      response.writeHead(308, { Location: url.pathname + '/' + url.search }).end();
      return;
    }
    await send(
      request,
      response,
      info.isDirectory() ? path.join(requested, 'index.html') : requested
    );
  } catch {
    try {
      await send(request, response, path.join(root, '404.html'), 404);
    } catch {
      if (!response.headersSent) response.writeHead(404);
      response.end();
    }
  }
});
server.listen(port, '127.0.0.1', () =>
  console.log('Preview available at http://127.0.0.1:' + port + '/')
);
