
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var st = App.data.settings;
    var defs = [['ses', 'Ses efektleri'], ['muzik', 'Müzik'], ['titresim', 'Titreşim'], ['bildirim', 'Bildirimler']];
    var toggles = defs.map(function (d) {
      var on = !!st[d[0]];
      return {
        label: d[1], checked: on ? 'true' : 'false',
        track: on ? '#3DD6C3' : '#171A36', knob: on ? '#171A36' : '#8D93C9', side: on ? 'flex-end' : 'flex-start',
        flip: function () { st[d[0]] = !on; App.save(); self.forceUpdate(); }
      };
    });
    return {
      toggles: toggles,
      resetProgress: function () {
        if (self.state && self.state.confirmReset) {
          localStorage.removeItem('sbp_save_v1');
          location.reload();
        } else {
          self.setState({ confirmReset: true });
          App.toast('Emin misin? Tekrar dokun: tüm ilerleme silinecek');
          setTimeout(function () { if (self.state) self.setState({ confirmReset: false }); }, 3000);
        }
      },
      resetLabel: (this.state && this.state.confirmReset) ? 'Emin misin? Tekrar dokun' : 'İlerlemeyi sıfırla'
    };
  }
}
