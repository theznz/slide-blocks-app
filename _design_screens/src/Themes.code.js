
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var d = App.data;
    var picked = (this.state && this.state.picked) || d.theme;
    var data = App.THEMES;
    var current = data.filter(function (t) { return t.id === picked; })[0] || data[0];
    var currentName = App.t(current.name);
    var owned = d.themesOwned.indexOf(picked) !== -1;
    function tile(themeId, hex, r, shape) { return App.skinStyle(themeId, { bg: hex, sh: App.darken(hex, 0.22) }, r, shape); }
    var SQ = { len: 1 }, H2 = { orient: 'h', len: 2 }, V2 = { orient: 'v', len: 2 };
    var themes = data.map(function (t) {
      var on = t.id === picked;
      var isOwned = d.themesOwned.indexOf(t.id) !== -1;
      var status = !isOwned ? App.t('{n} yıldız', { n: t.cost }) : App.t(t.id === d.theme ? 'Seçili' : 'Sende var');
      return {
        name: App.t(t.name), s1: tile(t.id, t.c1, 10, SQ), s2: tile(t.id, t.c2, 10, SQ), s3: tile(t.id, t.c3, 10, SQ),
        status: status, statusColor: !isOwned ? '#FFD35C' : '#B9BDE6',
        ring: on ? '0 0 0 3px #FFFFFF' : 'none',
        pressed: on ? 'true' : 'false',
        pick: function () { self.setState({ picked: t.id }); }
      };
    });
    var cta;
    if (owned) cta = App.t((picked === d.theme) ? 'Kullanılıyor' : 'Temayı kullan');
    else cta = App.t('Kilidi aç ({n} ★)', { n: current.cost });
    return {
      stars: d.stars,
      themes: themes,
      pickedName: currentName,
      pickedStatus: owned ? App.t(picked === d.theme ? 'Şu an kullanılıyor' : 'Koleksiyonunda') : App.t('{n} yıldızla açılır', { n: current.cost }),
      p1: tile(current.id, current.c1, 11, H2), p2: tile(current.id, current.c2, 11, V2), p3: tile(current.id, current.c3, 11, V2), p4: tile(current.id, current.c3, 11, H2),
      cta: cta,
      apply: function () {
        if (owned) {
          d.theme = picked; App.save(); App.toast(App.t('{name} teması uygulandı', { name: currentName })); self.forceUpdate();
        } else if (d.stars >= current.cost) {
          d.stars -= current.cost; d.themesOwned.push(picked); d.theme = picked; App.save();
          App.sfx('coin'); App.toast(App.t('{name} açıldı!', { name: currentName })); self.forceUpdate();
        } else {
          App.sfx('error'); App.toast(App.t('Yetersiz yıldız'));
        }
      }
    };
  }
}
