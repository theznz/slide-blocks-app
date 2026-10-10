
class Component extends DCLogic {
  renderVals() {
    var r = App.data.lastResult || { levelIndex: 1, moves: 0, timeSec: 0, par: 0, bestStars: 0 };
    var stars = r.bestStars || 0;
    var hasNext = r.levelIndex < App.LEVELS.length;
    var self = this;
    return {
      levelIndex: r.levelIndex, moves: r.moves, par: r.par, timeLabel: App.fmtTime(r.timeSec),
      star1: stars >= 1 ? '#FFD35C' : '#2E3366', star2: stars >= 2 ? '#FFD35C' : '#2E3366', star3: stars >= 3 ? '#FFD35C' : '#2E3366',
      star1Stroke: stars >= 1 ? '#D9A92F' : '#3A4080', star2Stroke: stars >= 2 ? '#D9A92F' : '#3A4080', star3Stroke: stars >= 3 ? '#D9A92F' : '#3A4080',
      nextLabel: hasNext ? 'Sonraki seviye' : 'Tüm seviyeler tamam!',
      tip: stars >= 3 ? 'Üç yıldız! Mükemmel çözüm.' : ('Üçüncü yıldız için ' + r.par + ' hamle veya daha azıyla bitir.'),
      next: function () {
        if (hasNext) {
          App.data.currentLevelIndex = r.levelIndex + 1;
          App.data.pendingRestart = true;
          window.go('Game');
        } else {
          window.go('Main');
        }
      },
      replay: function () { App.data.currentLevelIndex = r.levelIndex; App.data.pendingRestart = true; window.go('Game'); }
    };
  }
}
