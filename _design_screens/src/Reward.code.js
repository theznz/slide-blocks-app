
class Component extends DCLogic {
  renderVals() {
    var star = 'M12 2.500l2.900 6.200 6.600.8-4.900 4.600 1.300 6.600L12 17.400l-5.900 3.300 1.300-6.600-4.900-4.600 6.600-.8z';
    var check = 'M5 12l5 5 9-10';
    var gift = 'M4 10h16v10H4zM12 10v10M3 7h18v3H3zM12 7c-1-3-5-3-4 0M12 7c1-3 5-3 4 0';
    var d = App.data;
    var todayKey = App.dateKey();
    var doneToday = !!d.daily.claimed[todayKey];
    var todayPos = doneToday ? ((d.daily.streak - 1) % 7 + 7) % 7 + 1 : (d.daily.streak % 7) + 1;
    var rewards = [3, 4, 5, 6, 7, 8, 10];
    var days = rewards.map(function (r, i) {
      var n = i + 1;
      var dd = { day: n + '. gün', reward: r + ' yıldız', icon: star, span: n === 7 ? 'span 2' : 'auto', pad: '0', bg: '#2E3366', shadow: 'none', border: '0', fg: '#FFFFFF' };
      if (n < todayPos || (n === todayPos && doneToday)) { dd.icon = check; dd.reward = 'Alındı'; dd.fg = '#B9BDE6'; }
      else if (n === todayPos) { dd.bg = '#FFD35C'; dd.shadow = 'inset 0 -5px 0 #D9A92F'; dd.pad = '5px'; dd.fg = '#171A36'; }
      else { dd.bg = 'transparent'; dd.border = '2px solid #3A4080'; dd.fg = '#B9BDE6'; }
      return dd;
    });
    return {
      days: days,
      ctaLabel: doneToday ? 'Bugünü tamamladın' : (todayPos + '. gün ödülü için bulmacaya git'),
      goDaily: function () { window.go('Daily'); }
    };
  }
}
