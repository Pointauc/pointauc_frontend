import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import { checkIsProxiedPath, proxyHttp, proxyUpgrade } from './proxy';

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
};

export interface LocalServerOptions {
  staticRoot: string;
  backendOrigin: string;
}

export interface LocalServerHandle {
  origin: string;
  close: () => Promise<void>;
}

const resolveRequestPath = (rawUrl: string): string | undefined => {
  try {
    return decodeURIComponent(new URL(rawUrl, 'http://127.0.0.1').pathname);
  } catch {
    return undefined;
  }
};

const resolveStaticFile = (root: string, pathname: string): string | undefined => {
  const relativePath = pathname.replace(/^\/+/, '');
  const resolvedRoot = path.resolve(root);
  const resolvedFile = path.resolve(root, relativePath);
  const rootWithSeparator = resolvedRoot.endsWith(path.sep) ? resolvedRoot : `${resolvedRoot}${path.sep}`;

  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(rootWithSeparator)) {
    return undefined;
  }

  return resolvedFile;
};

export const checkShouldFallbackToIndex = (pathname: string): boolean => {
  return path.extname(pathname) === '';
};

const sendFile = (res: http.ServerResponse, filePath: string, size: number, headOnly: boolean): void => {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] ?? 'application/octet-stream';
  res.writeHead(200, {
    'content-type': contentType,
    'content-length': size,
  });

  if (headOnly) {
    res.end();
    return;
  }

  fs.createReadStream(filePath).pipe(res);
};

const serveStatic = (req: http.IncomingMessage, res: http.ServerResponse, staticRoot: string): void => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' });
    res.end();
    return;
  }

  const pathname = resolveRequestPath(req.url ?? '/');
  if (!pathname) {
    res.writeHead(400);
    res.end();
    return;
  }

  const targetPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = resolveStaticFile(staticRoot, targetPath);
  if (!filePath) {
    res.writeHead(400);
    res.end();
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (!statError && stat.isFile()) {
      sendFile(res, filePath, stat.size, req.method === 'HEAD');
      return;
    }

    if (!checkShouldFallbackToIndex(pathname)) {
      res.writeHead(404);
      res.end();
      return;
    }

    const indexPath = path.join(staticRoot, 'index.html');
    fs.stat(indexPath, (indexError, indexStat) => {
      if (indexError || !indexStat.isFile()) {
        res.writeHead(404);
        res.end();
        return;
      }

      sendFile(res, indexPath, indexStat.size, req.method === 'HEAD');
    });
  });
};

export const startLocalServer = async (options: LocalServerOptions): Promise<LocalServerHandle> => {
  const backend = new URL(options.backendOrigin);
  let localOrigin = '';
  const getProxyTarget = () => ({ backend, localOrigin });

  const server = http.createServer((req, res) => {
    if (checkIsProxiedPath(req.url)) {
      proxyHttp(req, res, getProxyTarget());
      return;
    }

    serveStatic(req, res, options.staticRoot);
  });

  server.on('upgrade', (req, socket, head) => {
    if (!checkIsProxiedPath(req.url)) {
      socket.destroy();
      return;
    }

    proxyUpgrade(req, socket, head, getProxyTarget());
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind the local desktop server');
  }

  localOrigin = `http://127.0.0.1:${address.port}`;

  return {
    origin: localOrigin,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
};

export const requestLocalStatus = (origin: string, requestPath = '/'): Promise<number> => {
  return new Promise((resolve, reject) => {
    const req = http.get(`${origin}${requestPath}`, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });
    req.on('error', reject);
  });
};
