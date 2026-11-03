// Trustit Rider Partner PWA Service Worker (v2.0)
const CACHE_NAME = "trustit-rider-v2-cache";
const OFFLINE_URL = "/rider";

// Static assets to pre-cache for instantaneous startup
const STATIC_ASSETS = [
  "/rider",
  "/api/manifest/rider",
  "/rider-icon-192.png",
  "/rider-icon-512.png",
  "/trustit-icon.svg",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network first, fall back to cache for dead-zones)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});

// Push Notification Event (Incoming Orders when Phone is Locked/Pocketed)
self.addEventListener("push", (event) => {
  let data = {
    title: "🚨 नया ऑर्डर! Trustit Partner",
    body: "नया आर्डर उपलब्ध है। स्वीकार करने के लिए ऐप खोलें।",
    orderId: "TR-4492",
    amount: "₹45",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/rider-icon-192.png",
    badge: "/trustit-icon.svg",
    vibrate: [500, 200, 500, 200, 1000],
    tag: "trustit-rider-order",
    renotify: true,
    requireInteraction: true,
    data: {
      url: `/rider?orderId=${data.orderId}`,
    },
    actions: [
      { action: "accept", title: "✓ Accept (कमाई " + (data.amount || "₹45") + ")" },
      { action: "view", title: "View Details" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/rider";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/rider") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
