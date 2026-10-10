
class Component extends DCLogic {
  renderVals() {
    var d = App.data;
    var tier = App.tierOf(d.unlockedLevel);
    var pkg = App.packageProgress(tier.name);
    var pkgPct = pkg.total ? Math.round((pkg.done / pkg.total) * 100) : 0;
    var totalStars = App.earnedStarsTotal();
    var starPct = Math.round((totalStars / App.totalPossibleStars()) * 100);
    var BADGE_ICON = {
      check: 'M5 12l5 5 9-10',
      star: 'M12 2.500l2.900 6.200 6.600.8-4.900 4.600 1.300 6.600L12 17.400l-5.900 3.300 1.300-6.600-4.900-4.600 6.600-.8z',
      bolt: 'M13 3L5 13h6l-1 8 8-10h-6l1-8z',
      bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.5 1 1.200 1 2.100h5c0-.9.4-1.600 1-2.100A6 6 0 0 0 12 3z'
    };
    var BADGE_COLORS = ['#3DD6C3', '#FFD35C', '#6C8CFF', '#FF7AA8', '#FF9F45'];
    var badges = App.computeBadges().slice(0, 4);
    var av = App.avatarLook(d.avatar);
    return Object.assign({}, av, {
      playerName: App.t(d.guest ? 'Misafir Oyuncu' : 'Oyuncu'),
      tierLabel: App.t('{tier} paket · Seviye {n}', { tier: App.t(tier.name), n: d.unlockedLevel }),
      totalStars: totalStars, completedCount: App.completedCount(), streak: d.daily.streak,
      goBadges: function () { window.go('Badges'); },
      badges: badges.map(function (b, i) {
        var accent = BADGE_COLORS[i % BADGE_COLORS.length];
        return {
          name: b.name, earned: b.earned, icon: BADGE_ICON[b.icon] || BADGE_ICON.check,
          bg: b.earned ? accent : '#232750', shadow: b.earned ? 'inset 0 -5px 0 rgba(0,0,0,0.25)' : 'none', border: b.earned ? '0' : '2px solid #2E3366', fg: b.earned ? '#171A36' : '#5B6190'
        };
      }),
      pkgLabel: App.t('{tier} paket', { tier: App.t(tier.name) }), pkgDone: pkg.done, pkgTotal: pkg.total, pkgPct: pkgPct,
      starDone: totalStars, starTotal: App.totalPossibleStars(), starPct: starPct
    });
  }
}
