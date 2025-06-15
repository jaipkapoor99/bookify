// Service Worker for Bookify - Lazy Loading Optimization
const CACHE_NAME = "bookify-lazy-chunks-v1.6.2";
const STATIC_CACHE = "bookify-static-v1.6.2";
const CHUNK_CACHE = "bookify-chunks-v1.6.2";

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/Bookify_SVG.svg",
  "/placeholder.svg",
  "/manifest.json",
];

// Lazy chunk patterns to cache
const CHUNK_PATTERNS = [
  /\/assets\/.*\.js$/,
  /\/assets\/.*\.css$/,
  /\/.*-[a-f0-9]{8}\.js$/, // Vite hash pattern
];

// Preload priority chunks (most likely to be used)
const PRIORITY_CHUNKS = ["HomePage", "LoginPage", "vendor", "ui-core"];

self.addEventListener("install", (event) => {
  console.log("📦 Service Worker: Installing...");

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),

      // Pre-cache priority chunks if available
      cachePriorityChunks(),
    ]).then(() => {
      console.log("✅ Service Worker: Installation complete");
      // Force activation of new service worker
      return self.skipWaiting();
    }),
  );
});

self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker: Activating...");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      cleanupOldCaches(),

      // Take control of all open tabs
      self.clients.claim(),
    ]).then(() => {
      console.log("✅ Service Worker: Activation complete");
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests from same origin
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Handle different types of requests
  if (isChunkRequest(url.pathname)) {
    event.respondWith(handleChunkRequest(event.request));
  } else if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(event.request));
  } else if (isAPIRequest(url.pathname)) {
    // Let API requests pass through (Supabase)
    return;
  } else {
    // Handle navigation requests
    event.respondWith(handleNavigationRequest(event.request));
  }
});

// Handle lazy-loaded chunk requests
async function handleChunkRequest(request) {
  const url = new URL(request.url);
  const chunkName = extractChunkName(url.pathname);

  try {
    // Try cache first
    const cache = await caches.open(CHUNK_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log(`💾 Serving cached chunk: ${chunkName}`);
      // Notify about cache hit
      notifyPerformanceMetric("chunk_cache_hit", chunkName);
      return cachedResponse;
    }

    // Fetch from network
    console.log(`🌐 Fetching chunk: ${chunkName}`);
    const startTime = performance.now();
    const response = await fetch(request);
    const loadTime = performance.now() - startTime;

    // Cache successful responses
    if (response.ok) {
      await cache.put(request, response.clone());
      console.log(`✅ Cached chunk: ${chunkName} (${loadTime.toFixed(2)}ms)`);

      // Notify about successful load
      notifyPerformanceMetric("chunk_network_load", chunkName, loadTime);
    }

    return response;
  } catch (error) {
    console.error(`❌ Failed to load chunk: ${chunkName}`, error);

    // Try to serve from cache as fallback
    const cache = await caches.open(CHUNK_CACHE);
    const fallback = await cache.match(request);

    if (fallback) {
      console.log(`🔄 Serving stale chunk as fallback: ${chunkName}`);
      return fallback;
    }

    throw error;
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error("Failed to fetch static asset:", error);
    throw error;
  }
}

// Handle navigation requests (SPA routing)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Serve cached index.html for offline functionality
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match("/");
    return fallback || Response.error();
  }
}

// Utility functions
function isChunkRequest(pathname) {
  return CHUNK_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isStaticAsset(pathname) {
  return (
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".ico") ||
    pathname.includes("/assets/") ||
    pathname === "/" ||
    pathname === "/manifest.json"
  );
}

function isAPIRequest(pathname) {
  return (
    pathname.includes("/rest/v1/") ||
    pathname.includes("/auth/v1/") ||
    pathname.includes("/functions/v1/")
  );
}

function extractChunkName(pathname) {
  const filename = pathname.split("/").pop() || "";
  // Extract meaningful name from hash-based filenames
  const match =
    filename.match(/^(.+?)-[a-f0-9]{8}\.js$/) || filename.match(/^(.+?)\.js$/);
  return match ? match[1] : filename;
}

async function cachePriorityChunks() {
  const cache = await caches.open(CHUNK_CACHE);

  // In a real implementation, you'd have the actual chunk URLs
  // For now, we'll prepare the cache for when chunks are loaded
  console.log("📋 Priority chunks prepared for caching:", PRIORITY_CHUNKS);
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(
    (name) =>
      name.startsWith("bookify-") &&
      name !== CACHE_NAME &&
      name !== STATIC_CACHE &&
      name !== CHUNK_CACHE,
  );

  await Promise.all(
    oldCaches.map((name) => {
      console.log(`🗑️ Deleting old cache: ${name}`);
      return caches.delete(name);
    }),
  );
}

function notifyPerformanceMetric(type, chunkName, duration) {
  // Send performance data to main thread
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "PERFORMANCE_METRIC",
        data: { type, chunkName, duration, timestamp: Date.now() },
      });
    });
  });
}

// Handle messages from main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "PRELOAD_CHUNK":
      handleChunkPreload(data.url, data.chunkName);
      break;

    case "CLEAR_CHUNK_CACHE":
      clearChunkCache();
      break;

    case "GET_CACHE_STATUS":
      getCacheStatus().then((status) => {
        event.ports[0].postMessage(status);
      });
      break;
  }
});

async function handleChunkPreload(url, chunkName) {
  try {
    const cache = await caches.open(CHUNK_CACHE);
    const request = new Request(url);

    // Check if already cached
    const existing = await cache.match(request);
    if (existing) {
      console.log(`✅ Chunk already cached: ${chunkName}`);
      return;
    }

    // Preload and cache
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
      console.log(`📦 Preloaded chunk: ${chunkName}`);
    }
  } catch (error) {
    console.error(`❌ Failed to preload chunk: ${chunkName}`, error);
  }
}

async function clearChunkCache() {
  const cache = await caches.open(CHUNK_CACHE);
  const keys = await cache.keys();
  await Promise.all(keys.map((key) => cache.delete(key)));
  console.log("🗑️ Chunk cache cleared");
}

async function getCacheStatus() {
  const chunkCache = await caches.open(CHUNK_CACHE);
  const staticCache = await caches.open(STATIC_CACHE);

  const chunkKeys = await chunkCache.keys();
  const staticKeys = await staticCache.keys();

  return {
    chunksCount: chunkKeys.length,
    staticCount: staticKeys.length,
    chunks: chunkKeys.map((key) => extractChunkName(key.url)),
  };
}
