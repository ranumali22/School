importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCOS79uU38mvZZjfXcFgUsQPtLF6-8_GZA",
  authDomain: "notification-8fbf2.firebaseapp.com",
  projectId: "notification-8fbf2",
  storageBucket: "notification-8fbf2.firebasestorage.app",
  messagingSenderId: "569228179120",
  appId: "1:569228179120:web:73c64dcfd249ea36ef6d75",
});

const messaging = firebase.messaging();

// 🔥 BACKGROUND MESSAGE
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message:", payload);

  const title = payload?.notification?.title || "E-GyanPath";
  const body = payload?.notification?.body || "You have a new notification";

  self.registration.showNotification(title, {
    body,
    icon: "/logo192.png",
    badge: "/logo192.png",
    data: payload.data || {},
    tag: "school-notification",
    renotify: true,
  });
});

// 🔥 CLICK ACTION (VERY IMPORTANT)
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const urlToOpen = "/"; // 👈 change if needed

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (let client of clientsArr) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});