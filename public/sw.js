// Service Worker untuk Web Push Notifications GEMASIX

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "New NGL Message!";
    const options = {
      body: data.body || "Ada pesan anonim baru yang masuk di GEMASIX.",
      icon: data.icon || "/icon.png",
      badge: "/icon.png",
      vibrate: [200, 100, 200],
      data: {
        url: data.url || "/admin/messages",
      },
      actions: [
        {
          action: "open",
          title: "Buka Pesan",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error showing notification:", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/admin/messages";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
