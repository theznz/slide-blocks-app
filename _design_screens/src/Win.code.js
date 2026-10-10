
class Component extends DCLogic {
  renderVals() {
    var r = App.data.lastResult || { levelIndex: 1, moves: 0, timeSec: 0, par: 0, bestStars: 0 };
    // stars earned in this run (older saves only have the best-ever count)
    var stars = r.earnedStars || r.bestStars || 0;
    var ON = '#FFD35C', ON_EDGE = '#D9A92F', OFF = 'rgba(255,255,255,0.04)', OFF_EDGE = '#4A4F86';
    var hasNext = r.levelIndex < App.LEVELS.length;
    var self = this;
    return {
      levelIndex: r.levelIndex, moves: r.moves, par: r.par, timeLabel: App.fmtTime(r.timeSec),
      star1: stars >= 1 ? ON : OFF, star2: stars >= 2 ? ON : OFF, star3: stars >= 3 ? ON : OFF,
      star1Stroke: stars >= 1 ? ON_EDGE : OFF_EDGE, star2Stroke: stars >= 2 ? ON_EDGE : OFF_EDGE, star3Stroke: stars >= 3 ? ON_EDGE : OFF_EDGE,
      star1Dash: stars >= 1 ? 'none' : '1.6 1.4', star2Dash: stars >= 2 ? 'none' : '1.6 1.4', star3Dash: stars >= 3 ? 'none' : '1.6 1.4',
      nextLabel: App.t(hasNext ? 'Sonraki seviye' : 'Tüm seviyeler tamam!'),
      tip: stars >= 3 ? App.t('Üç yıldız! Mükemmel çözüm.') : App.t('Üçüncü yıldız için {n} hamle veya daha azıyla bitir.', { n: r.par }),
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
