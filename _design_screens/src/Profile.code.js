
class Component extends DCLogic {
  renderVals() {
    var d = App.data;
    var tier = App.tierOf(d.unlockedLevel);
    var pkg = App.packageProgress(tier.name);
    var pkgPct = pkg.total ? Math.round((pkg.done / pkg.total) * 100) : 0;
    var totalStars = App.earnedStarsTotal();
    var starPct = Math.round((totalStars / App.totalPossibleStars()) * 100);
    var badges = App.computeBadges().slice(0, 4);
    return {
      playerName: d.guest ? 'Misafir Oyuncu' : 'Oyuncu',
      tierLabel: tier.name + ' paket · Seviye ' + d.unlockedLevel,
      totalStars: totalStars, completedCount: App.completedCount(), streak: d.daily.streak,
      badges: badges.map(function (b) {
        return { name: b.name, earned: b.earned, bg: b.earned ? '#3DD6C3' : 'transparent', shadow: b.earned ? 'inset 0 -5px 0 #25A898' : 'none', border: b.earned ? '0' : '2px solid #2E3366', fg: b.earned ? '#171A36' : '#8D93C9' };
      }),
      pkgLabel: tier.name + ' paket', pkgDone: pkg.done, pkgTotal: pkg.total, pkgPct: pkgPct,
      starDone: totalStars, starTotal: App.totalPossibleStars(), starPct: starPct
    };
  }
}
