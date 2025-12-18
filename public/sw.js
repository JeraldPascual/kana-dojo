/// <reference lib="webworker" />

/**
 * Audio Caching Service Worker
 * 
 * This service worker caches audio files for offline support and faster repeat access.
 * It uses a cache-first strategy for audio files.
 */

const AUDIO_CACHE_NAME = 'audio-cache-v1';

// Audio files to precache
const AUDIO_FILES = [
  '/sounds/correct.opus',
  '/sounds/correct.wav',
  '/sounds/long.opus',
  '/sounds/long.wav',
  '/sounds/error/error1/error1_1.opus',
  '/sounds/error/error1/error1_1.wav',
  '/sounds/click/click4/click4_11.opus',
  '/sounds/click/click4/click4_11.wav',
  '/sounds/click/click4/click4_22.opus',
  '/sounds/click/click4/click4_22.wav',
  '/sounds/click/click4/click4_33.opus',
  '/sounds/click/click4/click4_33.wav',
  '/sounds/click/click4/click4_44.opus',
  '/sounds/click/click4/click4_44.wav',
  '/sounds/mariah-carey.opus'
];

// Install event - precache audio files
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(AUDIO_CACHE_NAME).then(cache => {
      // Don't fail installation if some files are missing
      return Promise.allSettled(
        AUDIO_FILES.map(url => 
          cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );
  // Activate immediately
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('audio-cache-') && name !== AUDIO_CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      // Take control of all clients immediately
      return (self as unknown as ServiceWorkerGlobalScope).clients.claim();
    })
  );
});

// Fetch event - cache-first strategy for audio files
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  
  // Only handle audio file requests
  if (!url.pathname.startsWith('/sounds/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached response
        return cachedResponse;
      }

      // Not in cache - fetch from network and cache it
      return fetch(event.request).then(networkResponse => {
        // Only cache successful responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(AUDIO_CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed and not in cache - return error
        return new Response('Audio file not available offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// Message event - handle cache updates
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'CACHE_AUDIO') {
    const url = event.data.url;
    if (url) {
      event.waitUntil(
        caches.open(AUDIO_CACHE_NAME).then(cache => cache.add(url))
      );
    }
  }
  
  if (event.data?.type === 'CLEAR_AUDIO_CACHE') {
    event.waitUntil(caches.delete(AUDIO_CACHE_NAME));
  }
});

export {};
