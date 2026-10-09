
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var d = App.data;
    var picked = (this.state && this.state.picked) || d.theme;
    var data = App.THEMES;
    var current = data.filter(function (t) { return t.id === picked; })[0] || data[0];
    var owned = d.themesOwned.indexOf(picked) !== -1;
    var themes = data.map(function (t) {
      var on = t.id === picked;
      var isOwned = d.themesOwned.indexOf(t.id) !== -1;
      var status = !isOwned ? (t.cost + ' yıldız') : (t.id === d.theme ? 'Seçili' : 'Sende var');
      return {
        name: t.name, c1: t.c1, c2: t.c2, c3: t.c3,
        status: status, statusColor: !isOwned ? '#FFD35C' : '#B9BDE6',
        ring: on ? '0 0 0 3px #FFFFFF' : 'none',
        pressed: on ? 'true' : 'false',
        pick: function () { self.setState({ picked: t.id }); }
      };
    });
    var cta;
    if (owned) cta = (picked === d.theme) ? 'Kullanılıyor' : 'Temayı kullan';
    else cta = 'Kilidi aç (' + current.cost + ' ★)';
    return {
      stars: d.stars,
      themes: themes,
      pickedName: current.name,
      pickedStatus: owned ? (picked === d.theme ? 'Şu an kullanılıyor' : 'Koleksiyonunda') : (current.cost + ' yıldızla açılır'),
      c1: current.c1, c2: current.c2, c3: current.c3,
      cta: cta,
      apply: function () {
        if (owned) {
          d.theme = picked; App.save(); App.toast(current.name + ' teması uygulandı'); self.forceUpdate();
        } else if (d.stars >= current.cost) {
          d.stars -= current.cost; d.themesOwned.push(picked); d.theme = picked; App.save();
          App.toast(current.name + ' açıldı!'); self.forceUpdate();
        } else {
          App.toast('Yetersiz yıldız');
        }
      }
    };
  }
}
