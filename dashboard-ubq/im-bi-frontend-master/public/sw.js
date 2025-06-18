const CACHE_NAME = 'sms-analytics-v1.6.0';
const STATIC_CACHE = 'sms-analytics-static-v1.6.0';
const DYNAMIC_CACHE = 'sms-analytics-dynamic-v1.6.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/sms-analytics',
  '/manifest.json',
  '/offline.html',
  // CSS and JS files will be cached dynamically
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/business-metrics/,
  /\/api\/kpi/,
  /\/api\/executive/,
  /\/api\/countries/
];

// Background sync tag
const BACKGROUND_SYNC_TAG = 'analytics-sync';

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticAsset(request)) {
      event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    } else if (isAPIRequest(request)) {
      event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    } else if (isPageRequest(request)) {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(syncAnalyticsData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva alerta en SMS Analytics',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    image: data.image,
    tag: data.tag || 'analytics-alert',
    requireInteraction: data.priority === 'high',
    actions: [
      {
        action: 'view',
        title: 'Ver Dashboard',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/icons/icon-96x96.png'
      }
    ],
    data: {
      url: data.url || '/sms-analytics',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SMS Analytics', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data?.url || '/sms-analytics';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no existing one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_ANALYTICS_DATA':
      cacheAnalyticsData(payload);
      break;
    case 'CLEAR_CACHE':
      clearCaches();
      break;
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
  }
});

// Cache strategies
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cachedResponse);

  return cachedResponse || networkPromise;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update in background
    fetch(request).then((response) => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for critical requests
    if (request.destination === 'document') {
      return cache.match('/offline.html');
    }
    throw error;
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return cache.match('/offline.html');
    }
    
    throw error;
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isPageRequest(request) {
  return request.destination === 'document';
}

// Background sync functions
async function syncAnalyticsData() {
  console.log('🔄 Syncing analytics data...');
  
  try {
    // Get pending sync data from IndexedDB
    const pendingData = await getPendingSync();
    
    for (const data of pendingData) {
      try {
        await fetch(data.url, {
          method: data.method || 'POST',
          headers: data.headers || { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.payload)
        });
        
        // Remove from pending after successful sync
        await removePendingSync(data.id);
      } catch (error) {
        console.error('Failed to sync data:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Cache management
async function cacheAnalyticsData(data) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const response = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
  await cache.put('/api/cached-analytics', response);
}

async function clearCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}

// IndexedDB helpers for background sync
async function getPendingSync() {
  return new Promise((resolve) => {
    const request = indexedDB.open('sms-analytics-sync', 1);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending'], 'readonly');
      const store = transaction.objectStore('pending');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
    };
    
    request.onerror = () => resolve([]);
  });
}

async function removePendingSync(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('sms-analytics-sync', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      store.delete(id);
      resolve();
    };
    
    request.onerror = () => resolve();
  });
}

// Periodic cache cleanup
setInterval(() => {
  console.log('🧹 Periodic cache cleanup...');
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(async (cacheName) => {
        if (cacheName.includes('dynamic')) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          // Remove old entries (keep last 50)
          if (keys.length > 50) {
            const keysToDelete = keys.slice(0, keys.length - 50);
            await Promise.all(
              keysToDelete.map(key => cache.delete(key))
            );
          }
        }
      })
    );
  });
}, 30 * 60 * 1000); // Every 30 minutes

console.log('🚀 SMS Analytics Service Worker loaded'); 