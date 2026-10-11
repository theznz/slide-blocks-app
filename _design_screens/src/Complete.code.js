
// "Tebrikler": shown once when the last unfinished level is solved (all levels done).
class Component extends DCLogic {
  onShow() {
    setTimeout(App.confetti, 150);
    App.sfx('applause');
    App.vibrate(App.HAPTIC.win);
  }
  renderVals() {
    var d = App.data;
    var done = Object.keys(d.levels).map(function (k) { return d.levels[k]; });
    var stars = App.earnedStarsTotal(), max = App.totalPossibleStars();
    var three = done.filter(function (r) { return r.bestStars === 3; }).length;
    return {
      allDone: App.t('{n} seviyenin hepsini bitirdin', { n: App.LEVELS.length }),
      stars: stars + ' / ' + max,
      three: three,
      badgeCount: (function () { var b = App.computeBadges(); return b.filter(function (x) { return x.earned; }).length + ' / ' + b.length; })(),
      streak: App.t('{n} gün', { n: Math.max(d.daily.best || 0, d.daily.streak || 0) }),
      tip: App.t(stars < max
        ? 'Kalan yıldızlar için seviyelere dönebilirsin; her gün de yeni bir günlük bulmaca seni bekliyor.'
        : 'Bütün yıldızları topladın! Her gün yeni bir günlük bulmaca seni bekliyor.'),
      goDaily: function () { window.go('Daily'); }
    };
  }
}
