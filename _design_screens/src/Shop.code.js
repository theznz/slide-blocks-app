
class Component extends DCLogic {
  doBuy(hints, cost) {
    if (App.data.stars < cost) { App.sfx('error'); App.toast(App.t('Yetersiz yıldız')); this.setState({ confirm: null }); return; }
    App.data.stars -= cost;
    App.data.hints += hints;
    App.save();
    App.sfx('coin'); App.toast(App.t('+{n} ipucu eklendi', { n: hints }));
    this.setState({ confirm: null });
  }
  renderVals() {
    var self = this;
    var watching = this.state && this.state.watching;
    var watchingStars = this.state && this.state.watchingStars;
    var confirm = this.state && this.state.confirm;
    function askBuy(hints, cost) {
      return function () { self.setState({ confirm: { hints: hints, cost: cost } }); };
    }
    return {
      stars: App.data.stars, hints: App.data.hints,
      watching: watching,
      watchLabel: App.t(watching ? 'İzleniyor…' : 'İzle'),
      buy5: askBuy(5, 25),
      buy15: askBuy(15, 60),
      buy40: askBuy(40, 140),
      watchStarsLabel: App.t(watchingStars ? 'İzleniyor…' : 'İzle'),
      watchAdStars: function () {
        if (watchingStars) return;
        self.setState({ watchingStars: true });
        setTimeout(function () {
          App.data.stars += 6; App.save();
          self.setState({ watchingStars: false });
          App.sfx('coin'); App.toast(App.t('+6 yıldız kazandın'));
        }, 1400);
      },
      watchAd: function () {
        if (watching) return;
        self.setState({ watching: true });
        setTimeout(function () {
          App.data.hints += 1; App.save();
          self.setState({ watching: false });
          App.sfx('coin'); App.toast(App.t('+1 ipucu kazandın'));
        }, 1400);
      },
      hasConfirm: !!confirm,
      confirmText: confirm ? App.t('{h} ipucu almak için {c} yıldız harcanacak.', { h: confirm.hints, c: confirm.cost }) : '',
      confirmYes: confirm ? function () { self.doBuy(confirm.hints, confirm.cost); } : function () {},
      confirmNo: function () { self.setState({ confirm: null }); }
    };
  }
}
