
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var tab = (this.state && this.state.tab) || 'arkadas';
    var tabs = [['arkadas', 'Arkadaşlar'], ['dunya', 'Dünya']].map(function (t) {
      var on = t[0] === tab;
      return { label: t[1], pressed: on ? 'true' : 'false', bg: on ? '#3DD6C3' : '#232750', fg: on ? '#171A36' : '#B9BDE6', pick: function () { self.setState({ tab: t[0] }); } };
    });
    var myStars = App.earnedStarsTotal();
    var palette = ['#6C8CFF', '#FF7AA8', '#3DD6C3', '#FFD35C'];
    var names = tab === 'arkadas' ? ['Ela', 'Mert', 'Zeynep', 'Kaan', 'Defne', 'Arda', 'Nil'] : ['Aylin', 'Berk', 'Cem', 'Derya', 'Emre', 'Filiz', 'Gökhan'];
    var baseScores = tab === 'arkadas' ? [58, 44, 39, 31, 27, 20, 12] : [540, 538, 531, 525, 519, 512, 508];
    var rows = names.map(function (nm, i) { return { name: nm, stars: baseScores[i] }; });
    rows.push({ name: 'Sen', stars: myStars, me: true });
    rows.sort(function (a, b) { return b.stars - a.stars; });
    rows = rows.map(function (r, i) {
      var medal = i < 3 && !r.me;
      return {
        rank: i + 1, name: r.name, stars: r.stars,
        avatar: r.me ? '#FF9F45' : palette[i % 4],
        ring: r.me ? '0 0 0 3px #FF9F45' : 'none',
        rankBg: medal ? '#FFD35C' : '#2E3366', rankFg: medal ? '#171A36' : '#FFFFFF'
      };
    });
    var myRank = rows.filter(function (r) { return r.name === 'Sen'; })[0];
    return { tabs: tabs, rows: rows, footer: (tab === 'arkadas' ? 'Arkadaşların arasında' : 'Bu cihazdaki sıralamada') + ' ' + myRank.rank + '. sıradasın. (Çevrimdışı, sadece bu cihazda)' };
  }
}
