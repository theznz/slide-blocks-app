// ---- native app bridge (Capacitor). In a browser this file does nothing. ----
// Inside the App Store / Google Play build the web workarounds are swapped for real APIs:
// Taptic Engine / vibrator haptics, local notifications that fire while the app is closed,
// and a light status bar over the dark background.
(function (App) {
  var C = window.Capacitor;
  App.isNative = !!(C && C.isNativePlatform && C.isNativePlatform());
  if (!App.isNative) return;
  var P = C.Plugins || {};
  var noop = function () {};

  // Android: GameHaptics (android/.../GameHapticsPlugin.java) sends untagged vibrations, which
  // play even when the phone's touch-feedback vibration is off, unlike Haptics.impact.
  if (C.getPlatform() === 'android' && P.GameHaptics) {
    var lastA = 0, lastStrengthA = 0;
    App.canVibrate = function () { return true; };
    App.hapticMode = function () { return 'native-android'; };
    App.vibrate = function (pattern) {
      if (!App.data.settings.titresim) return;
      var list = [].concat(pattern), now = Date.now();
      var strength = list.filter(function (v, i) { return i % 2 === 0; }).reduce(function (a, b) { return a + b; }, 0);
      if (now - lastA < 80 && strength <= lastStrengthA) return;
      lastA = now; lastStrengthA = strength;
      P.GameHaptics.vibrate({ pattern: list }).catch(noop);
    };
  } else if (P.Haptics) {
    // iPhone: Taptic Engine with real strengths; works for drags too (no browser gesture rules).
    var last = 0;
    App.canVibrate = function () { return true; };
    App.hapticMode = function () { return 'native'; };
    App.vibrate = function (pattern) {
      if (!App.data.settings.titresim) return;
      var now = Date.now();
      if (now - last < 80) return;
      last = now;
      if (pattern === App.HAPTIC.win) { P.Haptics.notification({ type: 'SUCCESS' }).catch(noop); return; }
      var first = Array.isArray(pattern) ? pattern[0] : pattern;
      var style = first >= 50 ? 'HEAVY' : (first >= 25 ? 'MEDIUM' : 'LIGHT');
      P.Haptics.impact({ style: style }).catch(noop);
      if (Array.isArray(pattern)) {
        for (var i = 2, t = 0; i < pattern.length; i += 2) {
          t += pattern[i - 2] + pattern[i - 1];
          setTimeout(function () { P.Haptics.impact({ style: style }).catch(noop); }, t);
        }
      }
    };
  }

  if (P.StatusBar) {
    P.StatusBar.setStyle({ style: 'DARK' }).catch(noop); // light icons
    if (C.getPlatform() === 'android') P.StatusBar.setBackgroundColor({ color: '#0B0D1F' }).catch(noop);
  }

  // Daily reminder at 19:00 for the next 7 days, skipping today once the daily is solved.
  // Rescheduled whenever the app opens, the setting changes or today's puzzle is claimed.
  if (P.LocalNotifications) {
    var LN = P.LocalNotifications, IDS = [1, 2, 3, 4, 5, 6, 7], HOUR = 19;
    App.syncReminder = function () {
      LN.cancel({ notifications: IDS.map(function (id) { return { id: id }; }) }).catch(noop).then(function () {
        if (!App.data.settings.bildirim) return;
        var list = [];
        var doneToday = !!App.data.daily.claimed[App.dateKey()];
        for (var d = 0; d < 7; d++) {
          var at = new Date();
          at.setDate(at.getDate() + d);
          at.setHours(HOUR, 0, 0, 0);
          if (at <= new Date() || (d === 0 && doneToday)) continue;
          list.push({ id: IDS[d], title: 'Sliding Block Puzzle', body: App.t('Günlük bulmacan seni bekliyor! Seriyi bozma.'), schedule: { at: at, allowWhileIdle: true },
            // inexact is fine for a daily nudge; an exact alarm would send Android users to the
            // 'Alarms & reminders' settings screen and needs a permission Play restricts
            isExactNotification: false });
        }
        if (list.length) LN.schedule({ notifications: list }).catch(noop);
      });
    };
    App.enableNotifications = function () {
      LN.requestPermissions().then(function (r) {
        if (r.display !== 'granted') App.toast(App.t('Bildirim izni verilmedi; hatırlatma uygulama içinde gösterilecek.'), 3000);
        App.syncReminder();
      }).catch(noop);
    };
    var claim = App.claimDaily;
    App.claimDaily = function () { var r = claim.apply(App, arguments); App.syncReminder(); return r; };
    LN.checkPermissions().then(function (r) { if (r.display === 'granted') App.syncReminder(); }).catch(noop);
    // ask for notification permission once, the first time the home screen opens
    var remind = App.remindInApp;
    App.remindInApp = function () {
      if (App.data.settings.bildirim && !App.data.askedNotifications) { App.data.askedNotifications = true; App.save(); App.enableNotifications(); }
      return remind.apply(App, arguments);
    };
  }
})(window.App);
