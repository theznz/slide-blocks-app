// Minimal service worker: lets phones show the daily-puzzle reminder (see notify.js)
// and brings the game to the front when the notification is tapped.
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function (wins) {
    if (wins.length) return wins[0].focus();
    return self.clients.openWindow('./index.html');
  }));
});
