
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var d = App.data;
    var tab = (this.state && this.state.tab) || App.tierOf(d.unlockedLevel).name;
    var tabs = App.TIERS.map(function (t) {
      var on = t.name === tab;
      return { label: App.t(t.name), on: on, bg: on ? '#3DD6C3' : '#232750', fg: on ? '#171A36' : '#B9BDE6', pick: function () { self.setState({ tab: t.name }); } };
    });
    var tier = App.TIERS.filter(function (t) { return t.name === tab; })[0] || App.TIERS[0];
    var levels = [];
    for (var n = tier.from; n <= tier.to; n++) {
      var rec = d.levels[n];
      var stars = rec ? (rec.bestStars || 0) : 0;
      var open = n <= d.unlockedLevel;
      var isCurrent = n === d.unlockedLevel;
      var on = '#FFD35C', off = isCurrent ? '#D9772A' : '#171A36';
      levels.push({
        n: n, open: open, locked: !open,
        bg: isCurrent ? '#FF9F45' : (stars > 0 ? '#2E3366' : '#232750'),
        edge: isCurrent ? '#D9772A' : '#171A36',
        fg: isCurrent ? '#171A36' : '#FFFFFF',
        s1: stars >= 1 ? on : off, s2: stars >= 2 ? on : off, s3: stars >= 3 ? on : off,
        pick: function (lvl) { return function () { d.currentLevelIndex = lvl; window.go('Game'); }; }(n)
      });
    }
    return { stars: d.stars, tabs: tabs, levels: levels };
  }
}
