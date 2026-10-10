// ---- daily-puzzle reminder (the "Bildirimler" setting) ----
// In-app: once a day the home screen reminds you if today's daily puzzle is still open.
// System notification: from 19:00, if the app is in the background and permission was given.
// Browsers cannot wake a closed page without a push server, so this needs the app to be open
// (or in a background tab); phones show it through the service worker in sw.js when available.
(function (App) {
  var REMIND_HOUR = 19;
  // In the store app (Capacitor) native.js replaces all of this with real local notifications.
  var native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  App.syncReminder = function () {};
  var supported = typeof Notification !== 'undefined';
  var swReg = null;
  if (!native && typeof navigator !== 'undefined' && navigator.serviceWorker && window.isSecureContext) {
    navigator.serviceWorker.register('sw.js').then(function (r) { swReg = r; }).catch(function () {});
  }

  function dailyDone() { return !!App.data.daily.claimed[App.dateKey()]; }

  // Called when the setting is switched on.
  App.enableNotifications = function () {
    if (!supported || !window.isSecureContext) {
      App.toast(App.t('Bu tarayıcı bildirimleri desteklemiyor; hatırlatma uygulama içinde gösterilecek.'), 3000);
      return;
    }
    var denied = function () { App.toast(App.t('Bildirim izni verilmedi; hatırlatma uygulama içinde gösterilecek.'), 3000); };
    if (Notification.permission === 'denied') { denied(); return; }
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(function (p) { if (p !== 'granted') denied(); });
    }
  };

  function systemReminder() {
    var s = App.data.settings;
    if (!s.bildirim || dailyDone() || !supported || Notification.permission !== 'granted') return;
    if (!document.hidden || new Date().getHours() < REMIND_HOUR) return;
    var today = App.dateKey();
    if (App.data.lastReminder === today) return;
    App.data.lastReminder = today;
    App.save();
    var title = 'Sliding Block Puzzle';
    var opts = { body: App.t('Günlük bulmacan seni bekliyor! Seriyi bozma.'), tag: 'daily' };
    if (swReg && swReg.showNotification) { swReg.showNotification(title, opts); return; }
    try { new Notification(title, opts); } catch (e) {}
  }

  // Shown once a day when the home screen opens.
  App.remindInApp = function () {
    if (!App.data.settings.bildirim || dailyDone()) return;
    var today = App.dateKey();
    if (App.data.lastInAppReminder === today) return;
    App.data.lastInAppReminder = today;
    App.save();
    setTimeout(function () { App.toast(App.t('Günlük bulmacan seni bekliyor!'), 2600); }, 600);
  };

  if (!native) {
    setInterval(systemReminder, 60000);
    document.addEventListener('visibilitychange', systemReminder);
  }
})(window.App);
