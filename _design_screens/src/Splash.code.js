
class Component extends DCLogic {
  onShow() {
    var self = this;
    this.state = { pct: 0 };
    clearInterval(this._t);
    this._t = setInterval(function () {
      var p = (self.state.pct || 0) + 14;
      if (p >= 100) {
        clearInterval(self._t);
        self.setState({ pct: 100 });
        setTimeout(function () {
          window.go(App.data.onboarded ? 'Main' : 'Onboarding');
        }, 180);
      } else {
        self.setState({ pct: p });
      }
    }, 140);
  }
  onHide() { clearInterval(this._t); }
  renderVals() {
    return { pct: (this.state && this.state.pct) || 0 };
  }
}
