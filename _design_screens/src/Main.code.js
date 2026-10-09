
class Component extends DCLogic {
  renderVals() {
    var d = App.data;
    var n = d.unlockedLevel;
    var tier = App.tierOf(n);
    var pkg = App.packageProgress(tier.name);
    var pct = pkg.total ? Math.round((pkg.done / pkg.total) * 100) : 0;
    var av = App.avatarLook(d.avatar);
    return Object.assign({}, av, {
      stars: d.stars,
      unlockedLevel: n,
      tierName: tier.name,
      pkgLabel: tier.name + ' paket',
      pkgDone: pkg.done, pkgTotal: pkg.total, pkgPct: pct,
      play: function () { d.currentLevelIndex = n; window.go('Game'); },
      goShop: function () { App.goOnline('Shop'); },
      goDaily: function () { App.goOnline('Daily'); }
    });
  }
}
