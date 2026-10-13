import http from 'node:http';
import https from 'node:https';

import { rewriteSetCookie } from './cookieRewrite';

import type { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';


const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
]);

export interface ProxyTarget {
  backend: URL;
  localOrigin: string;
}

export const checkIsProxiedPath = (rawUrl: string | undefined): boolean => {
  const pathname = (rawUrl ?? '').split('?')[0] ?? '';
  return pathname.startsWith('/api') || pathname.startsWith('/socket.io');
};

const readHeaderList = (value: string | string[] | undefined): string[] => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const rewriteLocationHeader = (location: string, backendOrigin: string): string => {
  try {
    const resolvedUrl = new URL(location, backendOrigin);
    if (resolvedUrl.origin === new URL(backendOrigin).origin) {
      return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
    }
  } catch {
    return location;
  }

  return location;
};

export const rewriteProxyHeaders = (
  headers: http.IncomingHttpHeaders,
  backendOrigin: string,
): OutgoingHttpHeaders => {
  const nextHeaders: OutgoingHttpHeaders = {};

  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (headerValue === undefined) {
      continue;
    }

    const lowerCaseName = headerName.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lowerCaseName)) {
      continue;
    }

    if (lowerCaseName === 'set-cookie') {
      const rewrittenCookies = readHeaderList(headerValue).map((cookie) => rewriteSetCookie(cookie));
      if (rewrittenCookies.length > 0) {
        nextHeaders['set-cookie'] = rewrittenCookies;
      }
      continue;
    }

    if (lowerCaseName === 'location') {
      const locationValue = Array.isArray(headerValue) ? headerValue[0] : headerValue;
      if (locationValue) {
        nextHeaders.location = rewriteLocationHeader(locationValue, backendOrigin);
      }
      continue;
    }

    nextHeaders[headerName] = headerValue;
  }

  return nextHeaders;
};

const buildRequestHeaders = (
  headers: http.IncomingHttpHeaders,
  backend: URL,
  localOrigin: string,
  preserveUpgrade: boolean,
): OutgoingHttpHeaders => {
  const nextHeaders: OutgoingHttpHeaders = {};

  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (headerValue === undefined) {
      continue;
    }

    if (HOP_BY_HOP_HEADERS.has(headerName.toLowerCase())) {
      continue;
    }

    nextHeaders[headerName] = headerValue;
  }

  nextHeaders.host = backend.host;

  if (typeof nextHeaders.origin === 'string') {
    try {
      if (new URL(nextHeaders.origin).origin === localOrigin) {
        nextHeaders.origin = backend.origin;
      }
    } catch {
      nextHeaders.origin = backend.origin;
    }
  }

  if (typeof nextHeaders.referer === 'string' && nextHeaders.referer.startsWith(localOrigin)) {
    nextHeaders.referer = `${backend.origin}${nextHeaders.referer.slice(localOrigin.length)}`;
  }

  if (preserveUpgrade) {
    nextHeaders.connection = 'Upgrade';
    nextHeaders.upgrade = 'websocket';
  }

  return nextHeaders;
};

const resolveRequestOptions = (
  backend: URL,
  req: IncomingMessage,
  headers: OutgoingHttpHeaders,
): https.RequestOptions => {
  return {
    protocol: backend.protocol,
    hostname: backend.hostname,
    port: backend.port ? Number(backend.port) : undefined,
    method: req.method,
    path: req.url ?? '/',
    headers,
  };
};

const selectHttpClient = (backend: URL): typeof http | typeof https => {
  return backend.protocol === 'https:' ? https : http;
};

export const proxyHttp = (req: IncomingMessage, res: ServerResponse, target: ProxyTarget): void => {
  const outgoingHeaders = buildRequestHeaders(req.headers, target.backend, target.localOrigin, false);
  const client = selectHttpClient(target.backend);
  const requestOptions = resolveRequestOptions(target.backend, req, outgoingHeaders);

  const proxyRequest = client.request(requestOptions, (proxyResponse) => {
    const statusCode = proxyResponse.statusCode ?? 502;
    const responseHeaders = rewriteProxyHeaders(proxyResponse.headers, target.backend.origin);
    res.writeHead(statusCode, responseHeaders);
    proxyResponse.pipe(res);
  });

  proxyRequest.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    }
    res.end();
  });

  req.on('error', () => {
    proxyRequest.destroy();
  });

  req.pipe(proxyRequest);
};

const writeRawHead = (
  socket: Duplex,
  statusCode: number,
  statusMessage: string,
  headers: OutgoingHttpHeaders,
): void => {
  let rawHead = `HTTP/1.1 ${statusCode} ${statusMessage}\r\n`;
  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (headerValue === undefined) {
      continue;
    }

    const valueList = Array.isArray(headerValue) ? headerValue : [String(headerValue)];
    for (const item of valueList) {
      rawHead += `${headerName}: ${item}\r\n`;
    }
  }
  rawHead += '\r\n';
  socket.write(rawHead);
};

const enableNoDelay = (socket: Duplex): void => {
  if ('setNoDelay' in socket && typeof socket.setNoDelay === 'function') {
    socket.setNoDelay(true);
  }
};

export const proxyUpgrade = (req: IncomingMessage, socket: Duplex, head: Buffer, target: ProxyTarget): void => {
  const outgoingHeaders = buildRequestHeaders(req.headers, target.backend, target.localOrigin, true);
  const client = selectHttpClient(target.backend);
  const requestOptions = resolveRequestOptions(target.backend, req, outgoingHeaders);
  const proxyRequest = client.request(requestOptions);

  proxyRequest.on('upgrade', (proxyResponse, proxySocket, proxyHead) => {
    writeRawHead(socket, proxyResponse.statusCode ?? 101, proxyResponse.statusMessage ?? 'Switching Protocols', {
      ...rewriteProxyHeaders(proxyResponse.headers, target.backend.origin),
      connection: 'Upgrade',
      upgrade: 'websocket',
    });

    if (proxyHead.length > 0) {
      socket.write(proxyHead);
    }
    if (head.length > 0) {
      proxySocket.write(head);
    }

    enableNoDelay(proxySocket);
    enableNoDelay(socket);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);

    const closeBothSockets = (): void => {
      proxySocket.destroy();
      socket.destroy();
    };

    proxySocket.on('error', closeBothSockets);
    socket.on('error', closeBothSockets);
    proxySocket.on('close', () => socket.destroy());
    socket.on('close', () => proxySocket.destroy());
  });

  proxyRequest.on('response', (proxyResponse) => {
    writeRawHead(
      socket,
      proxyResponse.statusCode ?? 502,
      proxyResponse.statusMessage ?? '',
      rewriteProxyHeaders(proxyResponse.headers, target.backend.origin),
    );
    proxyResponse.pipe(socket);
  });

  proxyRequest.on('error', () => {
    socket.destroy();
  });

  proxyRequest.end();
};
