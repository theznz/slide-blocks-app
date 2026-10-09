
class Component extends DCLogic {
  renderVals() {
    return {
      guest: function () { App.data.guest = true; App.data.onboarded = true; App.save(); window.go('Main'); },
      notAvailable: function () { App.toast('Bu özellik çevrimdışı sürümde yok. Misafir olarak devam edebilirsin.'); }
    };
  }
}
