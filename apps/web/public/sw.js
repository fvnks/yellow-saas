// Yellow ERP Service Worker - Offline-first PWA
const CACHE_NAME = 'yellow-erp-v1';
const STATIC_CACHE = 'yellow-erp-static-v1';
const DYNAMIC_CACHE = 'yellow-erp-dynamic-v1';
const OFFLINE_CACHE = 'yellow-erp-offline-v1';
const OFFLINE_QUEUE_CACHE = 'yellow-erp-offline-queue-v1';

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/bodega',
  '/manifest.json',
  '/offline.html',
];

const OFFLINE_FALLBACK = '/offline.html';

const CACHE_STRATEGIES = {
  static: 'cache-first',
  api: 'network-first',
  images: 'cache-first',
  fonts: 'cache-first',
};

const OFFLINE_QUEUE_NAME = 'offline-queue';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== OFFLINE_CACHE && name !== OFFLINE_QUEUE_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    if (request.method === 'POST' && isMutationRequest(url)) {
      event.respondWith(handleMutationRequest(request));
    }
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirstWithOfflineQueue(request));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else if (isFontRequest(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isHTMLRequest(request)) {
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offlineResponse = await caches.match(OFFLINE_FALLBACK);
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithOfflineQueue(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (isMutationRequest(new URL(request.url)) && request.method === 'POST') {
      return queueForOfflineSync(request);
    }
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline', queued: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function queueForOfflineSync(request) {
  const cache = await caches.open(OFFLINE_QUEUE_CACHE);
  const clonedRequest = request.clone();
  const body = await clonedRequest.text();
  
  const queueItem = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers),
    body,
    timestamp: Date.now(),
  };

  const existing = await cache.match(OFFLINE_QUEUE_NAME);
  let queue = existing ? await existing.json() : [];
  queue.push(queueItem);
  
  await cache.put(OFFLINE_QUEUE_NAME, new Response(JSON.stringify(queue)));
  
  return new Response(JSON.stringify({ queued: true, offline: true }), {
    status: 202,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleMutationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    return queueForOfflineSync(request);
  }
}

async function processOfflineQueue() {
  const cache = await caches.open(OFFLINE_QUEUE_CACHE);
  const response = await cache.match(OFFLINE_QUEUE_NAME);
  if (!response) return;

  const queue = await response.json();
  if (queue.length === 0) return;

  const failed = [];
  for (const item of queue) {
    try {
      const req = new Request(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      const response = await fetch(req);
      if (!response.ok) {
        failed.push(item);
      }
    } catch (error) {
      failed.push(item);
    }
  }

  await cache.put(OFFLINE_QUEUE_NAME, new Response(JSON.stringify(failed)));
  
  if (failed.length < queue.length) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'SYNC_COMPLETE', synced: queue.length - failed.length });
      });
    });
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(processOfflineQueue());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_OFFLINE_QUEUE') {
    event.waitUntil(processOfflineQueue());
  }
});

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp|avif)$/i);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isImageRequest(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/i);
}

function isFontRequest(url) {
  return url.pathname.match(/\.(woff2?|ttf|eot)$/i);
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

function isMutationRequest(url) {
  // Note: actual method check is done via request.method in the fetch handler.
  // This function is only used for URL-path heuristics (POST/PUT/DELETE/PATCH to /api/).
  // Since we already guard by request.method !== 'GET' above, callers should pass request.method.
  return url.pathname.startsWith('/api/');
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(processOfflineQueue());
  }
});