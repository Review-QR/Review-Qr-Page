// Trustit Rider Partner PWA Service Worker (v2.1)
// Clean Push Notifications & Background Alerts Worker
// Strictly NO caching of _next/ static chunks or dynamic routes to prevent syntax errors

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

// Push Notification Event (Incoming Orders when Phone is Locked/Pocketed)
self.addEventListener("push", (event) => {
  let data = {
    title: "🚨 नया आर्डर! Trustit Fleet Partner",
    body: "नया डिलीवरी ऑर्डर उपलब्ध है। स्वीकार करने के लिए टैप करें।",
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
      { action: "accept", title: "✓ Accept (" + (data.amount || "₹45") + ")" },
      { action: "view", title: "View Details" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/rider";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes("/rider") && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
