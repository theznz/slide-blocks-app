
class Component extends DCLogic {
  renderVals() {
    return {
      guest: function () { App.data.guest = true; App.data.onboarded = true; App.save(); window.go('Main'); },
      notAvailable: function () { App.toast(App.t('Bu özellik çevrimdışı sürümde yok. Misafir olarak devam edebilirsin.')); }
    };
  }
}
