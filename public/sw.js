const CACHE_NAME = 'eventory-v1';
const STATIC_CACHE = 'eventory-static-v1';
const DYNAMIC_CACHE = 'eventory-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets
];

// Install event - cache static assets
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache error responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to dynamic cache
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Push notification event
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data,
      actions: [
        {
          action: 'view',
          title: 'View Event'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      vibrate: [200, 100, 200],
      tag: data.eventId || 'default',
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/events/' + event.notification.data.eventId)
    );
  }
});

// Background sync for offline ticket purchases
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-tickets') {
    event.waitUntil(syncOfflineTickets());
  }
});

// Message event for cache management
self.addEventListener('message', function(event) {
  if (event.data.type === 'CACHE_IMAGES') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          return Promise.all(
            event.data.urls.map(url => {
              return fetch(url)
                .then(response => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                })
                .catch(error => console.log('Failed to cache image:', url, error));
            })
          );
        })
    );
  }
});

async function syncOfflineTickets() {
  try {
    // Get offline tickets from IndexedDB
    const tickets = await getOfflineTickets();
    
    // Sync with server
    for (const ticket of tickets) {
      try {
        await fetch('/api/sync-ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticket)
        });
      } catch (error) {
        console.log('Failed to sync ticket:', ticket.id, error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

async function getOfflineTickets() {
  // This would integrate with IndexedDB in a real implementation
  return [];
}
