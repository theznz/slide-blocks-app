
class Component extends DCLogic {
  renderVals() {
    var d = App.data;
    var now = new Date();
    var year = now.getFullYear(), month = now.getMonth(), today = now.getDate();
    var monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
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
      streakLabel: d.daily.streak + ' günlük seri',
      streakSub: doneToday ? 'Bugün çözdün, yarın tekrar gel!' : ('Bugünü de oyna, seriyi ' + (d.daily.streak + 1) + ' güne çıkar.'),
      monthLabel: monthNames[month] + ' ' + year,
      days: days,
      dateLabel: today + ' ' + monthNames[month] + ' · ' + lv.tier,
      rewardLabel: doneToday ? 'Bugün tamamlandı' : ('Ödül: ' + (3 + Math.min(7, d.daily.streak + 1)) + ' yıldız'),
      playLabel: doneToday ? 'Yarın tekrar gel' : 'Bugünkü bulmacayı oyna',
      play: function () {
        if (doneToday) { App.toast('Bugünün bulmacası zaten tamamlandı'); return; }
        d.currentLevelIndex = lvlIdx; d.pendingRestart = true; d.dailyMode = true;
        window.go('Game');
      }
    };
  }
}
