
class Component extends DCLogic {
  buy(hints, cost) {
    if (App.data.stars < cost) { App.toast('Yetersiz yıldız'); return; }
    App.data.stars -= cost;
    App.data.hints += hints;
    App.save();
    App.toast('+' + hints + ' ipucu eklendi');
    this.forceUpdate();
  }
  renderVals() {
    var self = this;
    var watching = this.state && this.state.watching;
    return {
      stars: App.data.stars, hints: App.data.hints,
      watching: watching,
      watchLabel: watching ? 'İzleniyor…' : 'İzle',
      buy5: function () { self.buy(5, 25); },
      buy15: function () { self.buy(15, 60); },
      buy40: function () { self.buy(40, 140); },
      watchAd: function () {
        if (watching) return;
        self.setState({ watching: true });
        setTimeout(function () {
          App.data.hints += 1; App.save();
          self.setState({ watching: false });
          App.toast('+1 ipucu kazandın');
        }, 1400);
      },
      noAds: function () {
        if (App.data.stars < 200) { App.toast('Yetersiz yıldız'); return; }
        App.data.stars -= 200; App.data.adsRemoved = true; App.save();
        App.toast('Reklamlar kaldırıldı');
        self.forceUpdate();
      },
      adsRemoved: App.data.adsRemoved,
      restore: function () { App.toast('Geri yüklenecek bir satın alım bulunamadı'); }
    };
  }
}
