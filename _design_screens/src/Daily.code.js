
class Component extends DCLogic {
  renderVals() {
    var d = App.data;
    var now = new Date();
    var year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
    var monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map(App.tr);
    var firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0=Mon
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var days = [];
    for (var i = 0; i < firstWeekday; i++) days.push({ n: '', bg: 'transparent', border: '0', fg: '#FFFFFF' });
    for (var n = 1; n <= daysInMonth; n++) {
      var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(n).padStart(2, '0');
      var dd = { n: n, bg: 'transparent', border: '0', fg: '#8D93C9' };
      if (d.daily.claimed[key]) { dd.bg = '#3DD6C3'; dd.fg = '#171A36'; }
      else if (n === today) { dd.bg = '#FF9F45'; dd.fg = '#171A36'; }
      else if (n < today) { dd.border = '2px solid #3A4080'; dd.fg = '#B9BDE6'; }
      days.push(dd);
    }
    var lvlIdx = App.dailyLevelIndex();
    var lv = App.getLevel(lvlIdx);
    var todayKey = App.dateKey();
    var doneToday = !!d.daily.claimed[todayKey];
    return {
      streak: d.daily.streak,
      streakLabel: App.t('{n} günlük seri', { n: d.daily.streak }),
      streakSub: doneToday ? App.t('Bugün çözdün, yarın tekrar gel!') : App.t('Bugünü de oyna, seriyi {n} güne çıkar.', { n: d.daily.streak + 1 }),
      monthLabel: monthNames[month] + ' ' + year,
      days: days,
      dateLabel: App.t('{d} {m} · {tier}', { d: today, m: monthNames[month], tier: App.t(lv.tier) }),
      rewardLabel: doneToday ? App.t('Bugün tamamlandı') : App.t('Ödül: {n} yıldız', { n: 3 + Math.min(7, d.daily.streak + 1) }),
      playLabel: App.t(doneToday ? 'Yarın tekrar gel' : 'Bugünkü bulmacayı oyna'),
      play: function () {
        if (doneToday) { App.sfx('error'); App.toast(App.t('Bugünün bulmacası zaten tamamlandı')); return; }
        d.currentLevelIndex = lvlIdx; d.pendingRestart = true; d.dailyMode = true;
        window.go('Game');
      }
    };
  }
}
