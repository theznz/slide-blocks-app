
class Component extends DCLogic {
  loadLevel(n) {
    var lv = App.getLevel(n);
    var blocks = lv.blocks.map(function (b) { return Object.assign({}, b); });
    this.state = { levelIndex: n, par: lv.par, tierName: App.tierOf(n).name, blocks: blocks, moves: 0, elapsedSec: 0, history: [], won: false, usedHint: false, hintInfo: null };
    this._timerStart = Date.now();
    this.persist();
  }
  persist() {
    if (!this.state || this.state.won) return;
    App.data.gameState = {
      levelIndex: this.state.levelIndex, blocks: this.state.blocks, moves: this.state.moves,
      elapsedSec: this.state.elapsedSec, history: this.state.history, usedHint: this.state.usedHint
    };
    App.save();
  }
  onShow() {
    var d = App.data;
    var gs = d.gameState;
    if (d.pendingRestart) {
      this.loadLevel(d.currentLevelIndex);
      d.pendingRestart = false;
    } else if (!this.state || this.state.levelIndex !== d.currentLevelIndex) {
      if (gs && gs.levelIndex === d.currentLevelIndex) {
        var lv = App.getLevel(gs.levelIndex);
        this.state = {
          levelIndex: gs.levelIndex, par: lv.par, tierName: App.tierOf(gs.levelIndex).name,
          blocks: gs.blocks, moves: gs.moves, elapsedSec: gs.elapsedSec, history: gs.history || [],
          won: false, usedHint: !!gs.usedHint, hintInfo: null
        };
        this._timerStart = Date.now() - (gs.elapsedSec || 0) * 1000;
      } else {
        this.loadLevel(d.currentLevelIndex);
      }
    } else {
      this._timerStart = Date.now() - (this.state.elapsedSec || 0) * 1000;
    }
    var self = this;
    clearInterval(this._timer);
    this._timer = setInterval(function () { self.tick(); }, 1000);
  }
  onHide() {
    clearInterval(this._timer);
    this.endDrag();
    this.persist();
  }
  tick() {
    if (this._drag || !this.state || this.state.won) return;
    this.setState({ elapsedSec: Math.floor((Date.now() - this._timerStart) / 1000) });
    this.persist();
  }
  blockStyle(b, hinted) {
    var CELL = 52, GAP = 4, STEP = 56;
    var w = b.orient === 'h' ? (b.len * CELL + (b.len - 1) * GAP) : CELL;
    var h = b.orient === 'h' ? CELL : (b.len * CELL + (b.len - 1) * GAP);
    var left = 9 + b.col * STEP, top = 9 + b.row * STEP;
    var pal = App.paletteFor(App.data.theme);
    var color = b.target ? { bg: '#FF9F45', sh: '#D9772A', target: true } : pal[b.id % pal.length];
    var skin = App.blockSkin(App.data.theme, color);
    var ring = hinted ? ', 0 0 0 4px #FFFFFF' : (b.target ? ', 0 0 0 3px #FFFFFF' : '');
    return 'position:absolute; left:' + left + 'px; top:' + top + 'px; width:' + w + 'px; height:' + h + 'px; box-sizing:border-box; padding-bottom:6px; background:' + skin.background + '; ' + skin.extra + ' border-radius:12px; box-shadow: ' + skin.shadow + ring + '; color:#171A36; display:flex; align-items:center; justify-content:center; touch-action:none; cursor:grab; z-index:' + (b.target ? 2 : 1) + '; transition: left .16s cubic-bezier(.2,.8,.2,1), top .16s cubic-bezier(.2,.8,.2,1);';
  }
  renderVals() {
    var self = this;
    if (!this.state) return { blocks: [], moves: 0, par: 0, levelIndex: App.data.currentLevelIndex, tierName: '', timeLabel: '00:00', hints: App.data.hints, exitTop: 121, boardBg: App.boardBackground(App.data.theme), muted: this.isMuted(), unmuted: !this.isMuted() };
    var st = this.state;
    var blocks = st.blocks.map(function (b) {
      var hinted = st.hintInfo && st.hintInfo.id === b.id;
      var wobble = self._wobbleId === b.id;
      return Object.assign({}, b, { style: self.blockStyle(b, hinted), cls: hinted ? 'hint-pulse' : (wobble ? 'jelly-wobble' : '') });
    });
    return {
      levelIndex: st.levelIndex, moves: st.moves, par: st.par,
      timeLabel: App.fmtTime(st.elapsedSec), hints: App.data.hints,
      exitTop: 9 + App.getLevel(st.levelIndex).exitRow * 56,
      blocks: blocks,
      boardBg: App.boardBackground(App.data.theme),
      tierName: App.t(App.tierOf(st.levelIndex).name),
      muted: this.isMuted(),
      unmuted: !this.isMuted(),
      toggleMute: function () { self.toggleMute(); },
      startDrag: function (e) { self.startDrag(e); },
      undo: function () { self.undo(); },
      restart: function () { self.doRestart(); },
      hint: function () { self.useHint(); }
    };
  }
  isMuted() {
    return !App.data.settings.ses && !App.data.settings.muzik;
  }
  toggleMute() {
    var on = this.isMuted();
    App.data.settings.ses = on;
    App.data.settings.muzik = on;
    App.save();
    App.syncMusic();
    this.forceUpdate();
  }
  startDrag(e) {
    if (this._drag || !this.state || this.state.won) return;
    e.preventDefault();
    var id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
    var blocks = this.state.blocks;
    var moving = blocks.filter(function (b) { return b.id === id; })[0];
    if (!moving) return;
    var range = App.computeRange(blocks, id);
    var el = e.currentTarget;
    el.style.transition = 'none';
    el.style.zIndex = '5';
    this._drag = {
      id: id, orient: moving.orient, len: moving.len, startRow: moving.row, startCol: moving.col,
      min: range.min, max: range.max, el: el, clientX: e.clientX, clientY: e.clientY, moved: false
    };
    var self = this;
    this._onMove = function (ev) { self.onDragMove(ev); };
    this._onUp = function (ev) { self.onDragUp(ev); };
    window.addEventListener('pointermove', this._onMove);
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
  }
  onDragMove(e) {
    var d = this._drag;
    if (!d) return;
    var STEP = 56, PAD = 9;
    var scale = App._scale || 1;
    var dxRaw = (e.clientX - d.clientX) / scale;
    var dyRaw = (e.clientY - d.clientY) / scale;
    var deltaPx = d.orient === 'h' ? dxRaw : dyRaw;
    var startPos = d.orient === 'h' ? d.startCol : d.startRow;
    var minPx = PAD + d.min * STEP, maxPx = PAD + d.max * STEP;
    var basePx = PAD + startPos * STEP;
    var pos = Math.max(minPx, Math.min(maxPx, basePx + deltaPx));
    if (Math.abs(deltaPx) > 3) d.moved = true;
    if (d.orient === 'h') d.el.style.left = pos + 'px'; else d.el.style.top = pos + 'px';
  }
  onDragUp(e) {
    var d = this._drag;
    if (!d) return;
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    var STEP = 56, PAD = 9;
    var curPx = parseFloat(d.orient === 'h' ? d.el.style.left : d.el.style.top) || PAD;
    var newPos = Math.max(d.min, Math.min(d.max, Math.round((curPx - PAD) / STEP)));
    var startPos = d.orient === 'h' ? d.startCol : d.startRow;
    d.el.style.transition = '';
    this._drag = null;
    if (newPos === startPos) { this.forceUpdate(); return; }
    var blocks = this.state.blocks;
    var snapshot = blocks.map(function (b) { return Object.assign({}, b); });
    var newBlocks = blocks.map(function (b) {
      if (b.id !== d.id) return b;
      var nb = Object.assign({}, b);
      if (d.orient === 'h') nb.col = newPos; else nb.row = newPos;
      return nb;
    });
    var moves = this.state.moves + 1;
    var history = this.state.history.concat([snapshot]);
    var target = newBlocks.filter(function (b) { return b.target; })[0];
    var won = target.col === 6 - target.len;
    this.setState({ blocks: newBlocks, moves: moves, history: history, hintInfo: null, won: won });
    if (won) {
      App.sfx('win'); App.vibrate([40, 60, 40, 60, 120]);
      this.finish(moves);
    } else {
      App.sfx('slide'); App.vibrate(12);
      this.wobble(d.id);
      this.persist();
    }
  }
  wobble(id) {
    if (App.finishOf(App.data.theme) !== 'jelly') return;
    var self = this;
    this._wobbleId = id;
    this.forceUpdate();
    clearTimeout(this._wobbleT);
    this._wobbleT = setTimeout(function () { self._wobbleId = null; self.forceUpdate(); }, 440);
  }
  endDrag() {
    if (this._onMove) window.removeEventListener('pointermove', this._onMove);
    if (this._onUp) { window.removeEventListener('pointerup', this._onUp); window.removeEventListener('pointercancel', this._onUp); }
    this._drag = null;
  }
  finish(moves) {
    var self = this;
    clearInterval(this._timer);
    App.data.gameState = null;
    App.save();
    setTimeout(function () {
      var res = App.recordResult(self.state.levelIndex, moves, self.state.elapsedSec, self.state.usedHint);
      var dailyBonus = 0;
      if (App.data.dailyMode) {
        App.data.dailyMode = false;
        var dr = App.claimDaily();
        if (!dr.already) dailyBonus = dr.reward;
      }
      App.data.lastResult = { levelIndex: self.state.levelIndex, moves: moves, timeSec: self.state.elapsedSec, par: res.par, bestStars: res.bestStars, starsDelta: res.starsDelta + dailyBonus };
      App.save();
      window.go('Win');
    }, 260);
  }
  undo() {
    if (!this.state || !this.state.history.length) { App.sfx('error'); App.toast(App.t('Geri alınacak hamle yok')); return; }
    App.sfx('undo'); App.vibrate(8);
    var history = this.state.history.slice();
    var prev = history.pop();
    this.setState({ blocks: prev, moves: Math.max(0, this.state.moves - 1), history: history, hintInfo: null });
    this.persist();
  }
  doRestart() {
    this.loadLevel(this.state.levelIndex);
    this.forceUpdate();
  }
  useHint() {
    if (App.data.hints <= 0) { window.go('NoHints'); return; }
    var mv = App.solveNextMove(this.state.blocks);
    if (!mv) { App.sfx('error'); App.toast(App.t('Şu an ipucu bulunamadı')); return; }
    App.data.hints -= 1;
    App.save();
    this.state.usedHint = true;
    var dir = mv.orient === 'h' ? (mv.toPos > mv.fromPos ? 'sağa' : 'sola') : (mv.toPos > mv.fromPos ? 'aşağı' : 'yukarı');
    App.sfx('hint'); App.vibrate(20);
    App.toast(App.t('Bu bloğu ' + dir + ' kaydır'));
    this.setState({ hintInfo: { id: mv.id } });
    this.persist();
    var self = this;
    setTimeout(function () { if (self.state && self.state.hintInfo) self.setState({ hintInfo: null }); }, 1600);
  }
}
