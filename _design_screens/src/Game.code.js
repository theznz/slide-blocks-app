
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
    this.introduce(App.getLevel(this.state.levelIndex));
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
  blockStyle(b, hinted, colors) {
    var CELL = 52, GAP = 4, STEP = 56;
    var w = b.orient === 'h' ? (b.len * CELL + (b.len - 1) * GAP) : CELL;
    var h = b.orient === 'h' ? CELL : (b.len * CELL + (b.len - 1) * GAP);
    var left = 9 + b.col * STEP, top = 9 + b.row * STEP;
    var pos = 'position:absolute; left:' + left + 'px; top:' + top + 'px; width:' + w + 'px; height:' + h + 'px; box-sizing:border-box; ';
    if (b.wall) {
      return pos + 'background: linear-gradient(160deg, #2A2E5C, #1A1D3D); border-radius:10px; box-shadow: inset 0 -5px 0 #12142B, inset 0 1px 0 rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center; overflow:hidden; z-index:1;';
    }
    var color = b.target ? Object.assign({ target: true }, colors.target) : colors.others[b.id % colors.others.length];
    var skin = App.blockSkin(App.data.theme, color);
    var ring = hinted ? ', 0 0 0 4px #FFFFFF' : (b.target ? ', 0 0 0 3px #FFFFFF' : '');
    return pos + 'padding-bottom:6px; background:' + skin.background + '; ' + skin.extra + ' border-radius:12px; box-shadow: ' + skin.shadow + ring + '; color:#171A36; display:flex; align-items:center; justify-content:center; touch-action:none; cursor:grab; z-index:' + (b.target ? 2 : 1) + '; transition: left .16s cubic-bezier(.2,.8,.2,1), top .16s cubic-bezier(.2,.8,.2,1);';
  }
  exitStyle(lv, hex) {
    var L = 52; // the exit gap is as wide as the arrow block, which is always one cell thick
    var along = 9 + lv.exit.index * 56;
    var glow = 'background:' + hex + '; box-shadow: 0 0 12px ' + hex + ';';
    switch (lv.exit.side) {
      case 'left': return 'left:-4px; top:' + along + 'px; width:8px; height:' + L + 'px; ' + glow;
      case 'top': return 'top:-4px; left:' + along + 'px; width:' + L + 'px; height:8px; ' + glow;
      case 'bottom': return 'bottom:-4px; left:' + along + 'px; width:' + L + 'px; height:8px; ' + glow;
      default: return 'right:-4px; top:' + along + 'px; width:8px; height:' + L + 'px; ' + glow;
    }
  }
  renderVals() {
    var self = this;
    if (!this.state) return { blocks: [], moves: 0, par: 0, levelIndex: App.data.currentLevelIndex, tierName: '', timeLabel: '00:00', hints: App.data.hints, exitStyle: '', targetHex: '#FF9F45', arrowRot: 0, boardBg: App.boardBackground(App.data.theme), muted: this.isMuted(), unmuted: !this.isMuted() };
    var st = this.state;
    var lv = App.getLevel(st.levelIndex);
    var colors = App.levelColors(lv, App.data.theme);
    var arrowRot = { right: 0, bottom: 90, left: 180, top: 270 }[lv.exit.side];
    var arrowColor = App.isDark(colors.target.bg) ? '#FFFFFF' : '#171A36';
    var blocks = st.blocks.map(function (b) {
      var hinted = st.hintInfo && st.hintInfo.id === b.id;
      var wobble = self._wobbleId === b.id;
      return Object.assign({}, b, {
        style: self.blockStyle(b, hinted, colors), cls: hinted ? 'hint-pulse' : (wobble ? 'jelly-wobble' : ''),
        wall: !!b.wall, arrowRot: arrowRot, arrowColor: arrowColor
      });
    });
    return {
      levelIndex: st.levelIndex, moves: st.moves, par: st.par,
      timeLabel: App.fmtTime(st.elapsedSec), hints: App.data.hints,
      exitStyle: this.exitStyle(lv, colors.target.bg),
      targetHex: colors.target.bg, arrowRot: arrowRot,
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
    if (!moving || moving.wall) return;
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
    var won = App.isSolved(this.state.levelIndex, newBlocks);
    this.setState({ blocks: newBlocks, moves: moves, history: history, hintInfo: null, won: won });
    if (won) {
      App.sfx('win'); App.vibrate([40, 60, 40, 60, 120]);
      this.slideOut();
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
  // The arrow block glides out through the exit before the win screen.
  slideOut() {
    var lv = App.getLevel(this.state.levelIndex);
    var t = this.state.blocks.filter(function (b) { return b.target; })[0];
    var box = window.__views && window.__views.Game && window.__views.Game.box;
    var el = box && box.querySelector('[data-id="' + t.id + '"]');
    if (!el) return;
    var d = { right: [1, 0], left: [-1, 0], top: [0, -1], bottom: [0, 1] }[lv.exit.side];
    el.style.transition = 'transform .32s cubic-bezier(.5,0,.9,.6), opacity .32s ease-in';
    el.style.transform = 'translate(' + d[0] * 140 + 'px,' + d[1] * 140 + 'px)';
    el.style.opacity = '0';
  }
  // Short heads-up the first time a level uses a new exit side or walls.
  introduce(lv) {
    var seen = App.data.seenIntro || (App.data.seenIntro = {});
    var msg = null;
    var SIDE_MSG = { left: 'Bu sefer çıkış solda!', top: 'Bu sefer çıkış yukarıda!', bottom: 'Bu sefer çıkış aşağıda!' };
    if (lv.blocks.some(function (b) { return b.wall; }) && !seen.wall) { seen.wall = true; msg = 'Yeni: Gri duvarlar hiç kımıldamaz!'; }
    else if (SIDE_MSG[lv.exit.side] && !seen[lv.exit.side]) { seen[lv.exit.side] = true; msg = SIDE_MSG[lv.exit.side]; }
    if (msg) { App.save(); setTimeout(function () { App.toast(App.t(msg), 2600); }, 350); }
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
      App.data.lastResult = { levelIndex: self.state.levelIndex, moves: moves, timeSec: self.state.elapsedSec, par: res.par, earnedStars: res.earnedStars, bestStars: res.bestStars, starsDelta: res.starsDelta + dailyBonus };
      App.save();
      window.go('Win');
    }, 420);
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
    var mv = App.solveNextMove(this.state.blocks, App.getLevel(this.state.levelIndex).exit);
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
