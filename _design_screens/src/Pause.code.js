
class Component extends DCLogic {
  renderVals() {
    var d = App.data;
    var lv = App.getLevel(d.currentLevelIndex);
    return {
      levelIndex: d.currentLevelIndex, par: lv ? lv.par : 0,
      restart: function () { d.pendingRestart = true; window.go('Game'); }
    };
  }
}
