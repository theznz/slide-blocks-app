// ---- sound effects, background music and haptics (all synthesized, no audio files) ----
(function (App) {
  var ctx = null, master = null, sfxBus = null, musicBus = null;

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    return ctx;
  }

  function tone(freq, start, dur, opts) {
    opts = opts || {};
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(freq, start);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, start + dur);
    var peak = opts.vol == null ? 0.5 : opts.vol;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + (opts.attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(opts.bus || sfxBus);
    o.start(start); o.stop(start + dur + 0.02);
  }

  var SFX = {
    tap: function (t) { tone(660, t, 0.06, { type: 'triangle', vol: 0.25 }); },
    slide: function (t) { tone(220, t, 0.09, { type: 'triangle', to: 330, vol: 0.45 }); tone(440, t + 0.02, 0.05, { type: 'sine', vol: 0.15 }); },
    undo: function (t) { tone(392, t, 0.09, { type: 'triangle', to: 262, vol: 0.4 }); },
    error: function (t) { tone(180, t, 0.12, { type: 'square', vol: 0.12 }); tone(150, t + 0.1, 0.16, { type: 'square', vol: 0.12 }); },
    hint: function (t) { [784, 988, 1175].forEach(function (f, i) { tone(f, t + i * 0.07, 0.18, { vol: 0.25 }); }); },
    coin: function (t) { tone(988, t, 0.08, { type: 'square', vol: 0.12 }); tone(1319, t + 0.07, 0.22, { type: 'square', vol: 0.12 }); },
    win: function (t) {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.1, 0.3, { type: 'triangle', vol: 0.4 }); });
      tone(1568, t + 0.42, 0.5, { vol: 0.2 });
    }
  };

  App.sfx = function (name) {
    if (!App.data.settings.ses || !SFX[name]) return;
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    SFX[name](ctx.currentTime + 0.005);
  };

  App.vibrate = function (pattern) {
    if (!App.data.settings.titresim) return;
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
  };

  // Gentle looping pentatonic arpeggio over a I–vi–IV–V progression, scheduled ahead of time.
  var BPM = 96, STEP = 60 / BPM / 2;
  var CHORDS = [[261.63, 329.63, 392.0], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66]];
  var PATTERN = [0, 1, 2, 1, 2, 1, 0, 2];
  var musicTimer = null, nextTime = 0, stepIdx = 0;

  function scheduleMusic() {
    while (nextTime < ctx.currentTime + 0.25) {
      var chord = CHORDS[Math.floor(stepIdx / 8) % CHORDS.length];
      var n = stepIdx % 8;
      tone(chord[PATTERN[n]] * 2, nextTime, STEP * 1.8, { type: 'triangle', vol: 0.16, attack: 0.02, bus: musicBus });
      if (n === 0) tone(chord[0] / 2, nextTime, STEP * 7.5, { type: 'sine', vol: 0.22, attack: 0.05, bus: musicBus });
      nextTime += STEP; stepIdx++;
    }
  }

  function musicShouldPlay() { return !!App.data.settings.muzik && !document.hidden && unlocked; }

  var unlocked = false;
  App.syncMusic = function () {
    if (!musicShouldPlay()) {
      if (musicTimer) {
        clearInterval(musicTimer); musicTimer = null;
        musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      }
      return;
    }
    if (musicTimer || !ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume();
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(0.5, ctx.currentTime, 0.4);
    nextTime = ctx.currentTime + 0.05;
    scheduleMusic();
    musicTimer = setInterval(scheduleMusic, 80);
  };

  // Browsers only allow audio after a user gesture, so music starts on the first touch.
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (ensureCtx() && ctx.state === 'suspended') ctx.resume();
    App.syncMusic();
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  }
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
  document.addEventListener('visibilitychange', function () { if (unlocked) App.syncMusic(); });
})(window.App);
