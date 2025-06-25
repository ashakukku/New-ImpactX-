const CACHE_NAME = 'impactx-cache-v1';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/ngo-matchmaking.html',
    '/about-us.html',
    '/terms-of-use.html',
    '/privacy-policy.html',
    '/style.css',
    '/script.js',
    '/logo.png',
    '/logowithname.png', // For footer
    '/banner.jpg', // Hero image
    // External resources - CDNs
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js' // Chart.js
];

// Install event: Cache the app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching app shell');
                // Using cache.addAll which is atomic. If one fails, all fail.
                // For critical app shell, this is often desired.
                // Ensure all these URLs are correct and accessible.
                return cache.addAll(APP_SHELL_URLS);
            })
            .catch(err => {
                console.error('Service Worker: App shell caching failed during install', err);
            })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Ensure new service worker takes control immediately
        })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    // For navigation requests (HTML pages), try network first, then cache.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If valid response, clone it, cache it, and return it
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    } else if (!response && APP_SHELL_URLS.includes(event.request.url.replace(self.location.origin, ''))) {
                        // This case might not be hit often with fetch throwing an error for network failures
                        // but handles cases where fetch resolves but not with a good response for an app shell URL
                        return caches.match(event.request);
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try to serve from cache
                    return caches.match(event.request)
                        .then(cachedResponse => {
                             // If the specific page isn't in cache, try falling back to the cached root/index.html
                            return cachedResponse || caches.match('/');
                        });
                })
        );
        return;
    }

    // For other requests (CSS, JS, images, fonts from CDNs), use Cache-First strategy
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // Serve from cache
                }

                // Not in cache - fetch from network
                return fetch(event.request).then(
                    (networkResponse) => {
                        // Check if we received a valid response
                        // For cross-origin resources (CDNs), response.type will be 'opaque' if not CORS-enabled.
                        // We can cache opaque responses, but can't inspect them.
                        // Or, if they are CORS-enabled (like most CDNs are), type will be 'cors'.
                        if (!networkResponse || networkResponse.status !== 200 ) {
                            // For non-basic types, if not 200, just return it without caching.
                            // For basic types (same-origin), also only cache 200s.
                            if (networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                                 return networkResponse; // Don't cache opaque non-200 responses
                            }
                        }

                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Cache the fetched resource.
                                // This caches same-origin and CORS-enabled cross-origin resources.
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    }
                ).catch(error => {
                    console.warn('Service Worker: Fetch failed for non-navigate resource:', event.request.url, error);
                    // Optionally, return a placeholder for specific asset types like images
                    // if (event.request.destination === 'image') {
                    //    return caches.match('/path/to/placeholder-image.png');
                    // }
                });
            })
    );
});
