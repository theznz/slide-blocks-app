
class Component extends DCLogic {
  renderVals() {
    return {
      skip: function () { App.data.onboarded = true; App.save(); window.go('Main'); },
      start: function () { App.data.onboarded = true; App.data.currentLevelIndex = App.data.unlockedLevel || 1; App.save(); window.go('Game'); }
    };
  }
}
