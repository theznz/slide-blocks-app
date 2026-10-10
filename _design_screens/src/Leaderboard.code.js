
// "Rekorlarım": the player's own bests, kept on this device (replaces the made-up leaderboard).
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var d = App.data;
    var tab = (this.state && this.state.tab) || 'genel';
    var tabs = [['genel', 'Genel'], ['hizli', 'En hızlı']].map(function (t) {
      var on = t[0] === tab;
      return { label: App.t(t[1]), pressed: on ? 'true' : 'false', bg: on ? '#3DD6C3' : '#232750', fg: on ? '#171A36' : '#B9BDE6', pick: function () { self.setState({ tab: t[0] }); } };
    });
    var ICON = {
      star: 'M12 2.500l2.900 6.200 6.600.8-4.900 4.600 1.300 6.600L12 17.400l-5.900 3.300 1.300-6.600-4.900-4.600 6.600-.8z',
      check: 'M5 12l5 5 9-10',
      crown: 'M4 18h16M4 18L3 8l5 4 4-7 4 7 5-4-1 10',
      bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.500 10.900c.6.5 1 1.200 1 2.100h5c0-.9.4-1.600 1-2.100A6 6 0 0 0 12 3z',
      flame: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z',
      bolt: 'M13 3L5 13h6l-1 8 8-10h-6l1-8z',
      cal: 'M5 6h14v15H5zM5 11h14M9 3v4M15 3v4'
    };
    var COLORS = ['#FFD35C', '#3DD6C3', '#FF9F45', '#6C8CFF', '#FF7AA8', '#9D8DF1', '#3DD6C3'];
    var recs = Object.keys(d.levels).map(function (k) { return { n: +k, r: d.levels[k] }; }).filter(function (x) { return (x.r.bestStars || 0) > 0; });
    var timed = recs.filter(function (x) { return x.r.bestTimeSec != null; }).sort(function (a, b) { return a.r.bestTimeSec - b.r.bestTimeSec || a.n - b.n; });
    var rows;
    if (tab === 'genel') {
      var fastest = timed[0];
      var list = [
        ['star', 'Toplam yıldız', String(App.earnedStarsTotal())],
        ['check', 'Biten seviye', recs.length + ' / ' + App.LEVELS.length],
        ['crown', 'Üç yıldızlı seviye', String(recs.filter(function (x) { return x.r.bestStars === 3; }).length)],
        ['bulb', 'İpucusuz çözüm', String(recs.filter(function (x) { return x.r.noHintClean; }).length)],
        ['flame', 'En uzun seri', App.t('{n} gün', { n: Math.max(d.daily.best || 0, d.daily.streak || 0) })],
        ['bolt', 'En hızlı çözüm', fastest ? App.fmtTime(fastest.r.bestTimeSec) + ' · ' + App.t('Seviye {n}', { n: fastest.n }) : '–'],
        ['cal', 'Çözülen günlük bulmaca', String(Object.keys(d.daily.claimed).length)]
      ];
      rows = list.map(function (x, i) {
        return { icon: ICON[x[0]], isIcon: true, isRank: false, badgeBg: COLORS[i], badgeFg: '#171A36', name: App.t(x[1]), value: x[2] };
      });
    } else {
      rows = timed.slice(0, 7).map(function (x, i) {
        var medal = i < 3;
        return { rank: i + 1, isIcon: false, isRank: true, badgeBg: medal ? '#FFD35C' : '#2E3366', badgeFg: medal ? '#171A36' : '#FFFFFF', name: App.t('Seviye {n}', { n: x.n }), value: App.fmtTime(x.r.bestTimeSec) };
      });
    }
    var empty = !recs.length;
    return {
      tabs: tabs, rows: empty ? [] : rows, empty: empty,
      footer: App.t(empty ? 'Henüz rekor yok. Bir seviye bitir, rekorların burada görünsün.' : 'Rekorların sadece bu cihazda saklanır.')
    };
  }
}
