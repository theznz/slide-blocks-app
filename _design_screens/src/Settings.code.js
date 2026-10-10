
class Component extends DCLogic {
  onHide() { if (this.state) this.state.langOpen = false; }
  renderVals() {
    var self = this;
    var st = App.data.settings;
    var defs = [['ses', 'Ses efektleri'], ['muzik', 'Müzik'], ['titresim', 'Titreşim'], ['bildirim', 'Bildirimler']];
    var toggles = defs.map(function (d) {
      var on = !!st[d[0]];
      return {
        label: App.t(d[1]), checked: on ? 'true' : 'false',
        track: on ? '#3DD6C3' : '#171A36', knob: on ? '#171A36' : '#8D93C9', side: on ? 'flex-end' : 'flex-start',
        flip: function () {
          st[d[0]] = !on; App.save();
          if (d[0] === 'muzik') App.syncMusic();
          if (d[0] === 'bildirim' && !on) App.enableNotifications();
          if (d[0] === 'titresim' && !on) {
            if (App.canVibrate()) App.vibrate(App.HAPTIC.toggle); else App.toast(App.t('Bu cihaz titreşimi desteklemiyor'));
          }
          self.forceUpdate();
        }
      };
    });
    var langOpen = !!(this.state && this.state.langOpen);
    var cur = App.lang();
    var current = App.LANGS.filter(function (l) { return l.id === cur; })[0] || App.LANGS[0];
    var langs = App.LANGS.map(function (l) {
      var on = l.id === cur;
      return {
        name: l.name, checked: on ? 'true' : 'false', selected: on, fg: on ? '#3DD6C3' : '#FFFFFF',
        pick: function () { App.setLang(l.id); self.setState({ langOpen: false }); }
      };
    });
    return {
      toggles: toggles,
      build: App.BUILD + ' · ' + App.hapticMode() + ' · ' + App.audioState(),
      langName: current.name,
      langOpen: langOpen,
      langExpanded: langOpen ? 'true' : 'false',
      langChevron: langOpen ? 'rotate(90deg)' : 'none',
      langs: langs,
      toggleLang: function () { self.setState({ langOpen: !langOpen }); },
      resetProgress: function () {
        if (self.state && self.state.confirmReset) {
          localStorage.removeItem('sbp_save_v1');
          location.reload();
        } else {
          self.setState({ confirmReset: true });
          App.toast(App.t('Emin misin? Tekrar dokun: tüm ilerleme silinecek'));
          setTimeout(function () { if (self.state) self.setState({ confirmReset: false }); }, 3000);
        }
      },
      resetLabel: App.t((this.state && this.state.confirmReset) ? 'Emin misin? Tekrar dokun' : 'İlerlemeyi sıfırla')
    };
  }
}
