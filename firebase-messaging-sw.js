/* Brixtrade push service worker. Upload to the SAME folder as trade.html (site root). */
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA7KMnx_MBfX3DQ5hQ6qzOg6jCbX7kZs-o",
  authDomain: "brixtrade-c142d.firebaseapp.com",
  projectId: "brixtrade-c142d",
  storageBucket: "brixtrade-c142d.firebasestorage.app",
  messagingSenderId: "489953142453",
  appId: "1:489953142453:web:2499588c325482d17a00fc"
});

const messaging = firebase.messaging();

/* Messages are sent as data-only, so we show the notification ourselves (no duplicates). */
messaging.onBackgroundMessage(function (payload) {
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'Brixtrade', {
    body: d.body || '',
    icon: '/icons/icon-192.jpg',
    badge: '/icons/icon-192.jpg',
    data: { url: d.url || '/trade.html' }
  });
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/trade.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url); return c.focus(); }
      }
      return clients.openWindow(url);
    })
  );
});