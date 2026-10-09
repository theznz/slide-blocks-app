
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var watching = this.state && this.state.watching;
    return {
      watchLabel: watching ? 'İzleniyor…' : 'Reklam izle · +1 ipucu',
      watchAd: function () {
        if (watching) return;
        self.setState({ watching: true });
        setTimeout(function () {
          App.data.hints += 1; App.save();
          self.setState({ watching: false });
          App.toast('+1 ipucu kazandın');
          window.go('Game');
        }, 1400);
      }
    };
  }
}
