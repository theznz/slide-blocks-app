// ---- block materials ("finish") per theme: flat, jelly, velvet, glass, metal, glitter ----
// App.blockSkin(themeId, { bg, sh }, radius?) returns { background, shadow, extra } CSS fragments
// shared by the game board and the theme previews, so a theme looks the same everywhere.
(function (App) {
  function rgb(hex) {
    var n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function lighten(hex, amt) {
    var c = rgb(hex).map(function (v) { return Math.round(v + (255 - v) * amt); });
    return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1).toUpperCase();
  }

  var NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  var SPARKLE = 'radial-gradient(circle at 20% 30%, rgba(255,255,255,.95) 0 1.2px, transparent 2px), ' +
    'radial-gradient(circle at 70% 20%, rgba(255,255,255,.8) 0 1px, transparent 1.8px), ' +
    'radial-gradient(circle at 45% 70%, rgba(255,255,255,.9) 0 1.4px, transparent 2.2px), ' +
    'radial-gradient(circle at 85% 80%, rgba(255,255,255,.7) 0 1px, transparent 1.8px), ' +
    'radial-gradient(circle at 10% 85%, rgba(255,255,255,.75) 0 .9px, transparent 1.6px)';

  // Realistic fur strands (tex/fur.png, made by gen_fur.py; inlined by assemble.py): white highlights over a
  // plum undercoat, tileable, so it takes the colour of whatever sits under it.
  var FUR = 'url("__FUR_PNG__")';

  // Image finish: hand-made block art in blocks/<theme>/<colour>_<shape>.webp, one file per
  // colour and shape (sq = 1x1, h2/h3 horizontal, v2/v3 vertical). Colours map to files by name.
  var IMAGE_SETS = {
    sekerleme: { '#EC3547': 'kirmizi', '#9A62F0': 'mor', '#3E74F0': 'mavi', '#F94782': 'pembe', '#F9C935': 'sari', '#30CCB5': 'turkuaz', '#FA7F2C': 'turuncu', '#F8972E': 'gunbatimi', '#FF9F45': 'gunbatimi' },
    balon: { '#EF4646': 'kirmizi', '#9E6EEF': 'mor', '#4574EC': 'mavi', '#F774A6': 'pembe', '#FBD646': 'sari', '#5DD0B0': 'turkuaz', '#F88931': 'turuncu', '#FF9F45': 'turuncu' }
  };
  function shapeKey(shape) {
    if (!shape || shape.len === 1) return 'sq';
    return (shape.orient === 'v' ? 'v' : 'h') + Math.min(3, Math.max(2, shape.len));
  }

  var FINISH = {
    flat: function (c) {
      return { background: c.bg, shadow: 'inset 0 -6px 0 ' + c.sh, extra: '' };
    },
    jelly: function (c) {
      return {
        background: 'linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.08) 34%, rgba(255,255,255,0) 50%), ' +
          'radial-gradient(ellipse at 50% 115%, rgba(255,255,255,.45), transparent 55%), ' + rgba(c.bg, c.target ? 0.92 : 0.84),
        shadow: 'inset 0 -6px 0 ' + rgba(c.sh, 0.75) + ', inset 0 2px 0 rgba(255,255,255,.7), 0 4px 12px ' + rgba(c.bg, 0.45),
        extra: 'border: 1px solid rgba(255,255,255,.35);'
      };
    },
    velvet: function (c) {
      return {
        background: NOISE + ', radial-gradient(ellipse at 30% 15%, ' + lighten(c.bg, 0.22) + ' 0%, ' + c.bg + ' 45%, ' + App.darken(c.bg, 0.22) + ' 100%)',
        shadow: 'inset 0 -5px 0 ' + App.darken(c.bg, 0.38) + ', inset 0 0 6px rgba(0,0,0,.25), 0 2px 0 rgba(0,0,0,.18)',
        extra: ''
      };
    },
    // Thick, glossy coloured glass (like acrylic candy buttons): saturated translucent body,
    // soft white sheen on top, a lighter refracted band along the bottom edge, white rims,
    // and a glow in the block's own colour cast down and to the right.
    glass: function (c) {
      var top = lighten(c.bg, 0.42), mid = c.bg, low = App.darken(c.bg, 0.06);
      return {
        background: 'radial-gradient(90% 55% at 50% 0%, rgba(255,255,255,.55) 0%, rgba(255,255,255,.12) 55%, rgba(255,255,255,0) 75%), ' +
          'linear-gradient(180deg, ' + rgba(top, 0.92) + ' 0%, ' + rgba(mid, 0.9) + ' 48%, ' + rgba(low, 0.9) + ' 82%, ' + rgba(lighten(c.bg, 0.3), 0.95) + ' 100%)',
        shadow: 'inset 0 2px 1px rgba(255,255,255,.85), inset 0 -2px 1px rgba(255,255,255,.55), inset 0 -7px 10px ' + rgba(lighten(c.bg, 0.45), 0.55) +
          ', inset 0 0 0 1px rgba(255,255,255,.28), 7px 9px 16px ' + rgba(c.bg, 0.5) + ', 0 2px 4px rgba(0,0,0,.22)',
        extra: '-webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);'
      };
    },
    // Fluffy pastel fur sealed under a clear glass dome (like the plush glass buttons): a soft
    // colour pooled in the middle fading to white fuzz at the edges, fine fur strands over it,
    // a bright glass rim and a curved window highlight.
    fluffy: function (c) {
      return {
        background: 'radial-gradient(70% 38% at 50% 12%, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 100%), ' +
          FUR + ', ' +
          'radial-gradient(ellipse at 50% 46%, ' + c.bg + ' 0%, ' + c.bg + ' 62%, ' + lighten(c.bg, 0.4) + ' 100%)',
        shadow: 'inset 0 0 0 2px rgba(255,255,255,.75), inset 0 3px 3px rgba(255,255,255,.9), inset 0 -3px 5px rgba(255,255,255,.7), ' +
          'inset 0 0 10px rgba(255,255,255,.55), 0 7px 12px ' + rgba(c.bg, 0.45) + ', 0 1px 2px rgba(0,0,0,.18)',
        extra: 'border: 1px solid rgba(255,255,255,.55); background-size: 100% 100%, 110px 110px, 100% 100%;'
      };
    },
    metal: function (c) {
      return {
        background: 'repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, rgba(0,0,0,.04) 1px 3px), ' +
          'linear-gradient(180deg, ' + lighten(c.bg, 0.55) + ' 0%, ' + c.bg + ' 42%, ' + App.darken(c.bg, 0.2) + ' 56%, ' + lighten(c.bg, 0.18) + ' 100%)',
        shadow: 'inset 0 -5px 0 ' + App.darken(c.bg, 0.42) + ', inset 0 1px 0 rgba(255,255,255,.9), 0 3px 6px rgba(0,0,0,.3)',
        extra: ''
      };
    },
    glitter: function (c) {
      return {
        background: SPARKLE + ', linear-gradient(160deg, ' + lighten(c.bg, 0.25) + ', ' + c.bg + ' 60%, ' + App.darken(c.bg, 0.12) + ')',
        shadow: 'inset 0 -6px 0 ' + c.sh + ', 0 0 10px ' + rgba(c.bg, 0.55),
        extra: 'background-size: 26px 26px, 22px 22px, 30px 30px, 24px 24px, 28px 28px, 100% 100%;'
      };
    }
  };

  App.isDark = function (hex) {
    var c = rgb(hex);
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) < 150;
  };

  App.finishOf = function (themeId) {
    var t = App.THEMES.filter(function (x) { return x.id === themeId; })[0];
    return (t && t.finish) || 'flat';
  };

  App.blockSkin = function (themeId, color, shape) {
    if (App.finishOf(themeId) === 'image') {
      var set = IMAGE_SETS[themeId] || {};
      var name = color.img || set[String(color.bg).toUpperCase()] || (color.target ? 'turuncu' : 'mavi');
      return {
        background: 'url(blocks/' + themeId + '/' + name + '_' + shapeKey(shape) + '.webp) center / 100% 100% no-repeat',
        shadow: '0 0 0 0 transparent',
        extra: 'padding-bottom: 0;'
      };
    }
    return (FINISH[App.finishOf(themeId)] || FINISH.flat)(color);
  };

  var DOTS = 'radial-gradient(circle, #3A4080 3px, transparent 4px)';
  App.boardBackground = function (themeId) {
    return 'background-color: #232750; background-image: ' + DOTS + '; background-size: 56px 56px; background-position: 7px 7px;';
  };

  // Full inline style for a static preview tile.
  App.skinStyle = function (themeId, color, radius, shape) {
    var s = App.blockSkin(themeId, color, shape);
    return 'background: ' + s.background + '; box-shadow: ' + s.shadow.replace(/-6px/g, '-5px') + '; border-radius: ' + (radius || 10) + 'px; box-sizing: border-box; ' + s.extra;
  };

  // Confetti burst over the whole app (used on the win screen for a par-or-better solve).
  // Two cannons fire from the bottom corners high up toward the top of the screen.
  App.confetti = function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var stage = document.getElementById('stage');
    var W = stage.offsetWidth, H = stage.offsetHeight;
    var dpr = (window.devicePixelRatio || 1) * (App._scale || 1);
    var cv = document.createElement('canvas');
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.cssText = 'position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;pointer-events:none;z-index:9998';
    stage.appendChild(cv);
    var g = cv.getContext('2d');
    g.scale(dpr, dpr);
    var COLORS = ['#FFD35C', '#FF7AA8', '#3DD6C3', '#6C8CFF', '#FF9F45', '#9D8DF1', '#FFFFFF'];
    var parts = [];
    function add(x, y, angle, spread, speed, n) {
      for (var i = 0; i < n; i++) {
        var a = angle + (Math.random() - 0.5) * spread, v = speed * (0.75 + Math.random() * 0.35);
        parts.push({
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, round: Math.random() < 0.3,
          rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, tilt: Math.random() * 6.28,
          color: COLORS[(Math.random() * COLORS.length) | 0]
        });
      }
    }
    // launch speed tuned so about half the pieces climb ~90% of the screen and the fastest reach
    // the top; scaled with screen height so tall phones get the same arc
    var speed = 30 * Math.sqrt(H / 844), steep = 72 * Math.PI / 180;
    add(0, H, -steep, 0.35, speed, 110);
    add(W, H, -Math.PI + steep, 0.35, speed, 110);
    var start = performance.now();
    (function frame(now) {
      g.clearRect(0, 0, W, H);
      var alive = 0;
      parts.forEach(function (p) {
        p.vy += 0.3; p.vx *= 0.992; p.vy *= 0.992;
        p.x += p.vx + Math.sin(p.tilt) * 0.6; p.y += p.vy;
        p.rot += p.vr; p.tilt += 0.08;
        if (p.y > H + 20) return;
        alive++;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.scale(1, Math.cos(p.tilt));
        g.fillStyle = p.color;
        if (p.round) { g.beginPath(); g.arc(0, 0, p.w / 2.4, 0, 6.28); g.fill(); }
        else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        g.restore();
      });
      if ((alive || now - start < 600) && now - start < 6000) requestAnimationFrame(frame);
      else cv.remove();
    })(start);
  };

  var css = document.createElement('style');
  css.textContent =
    '@keyframes jelly-wobble{0%{transform:scale(1,1)}25%{transform:scale(1.08,.9)}50%{transform:scale(.95,1.06)}75%{transform:scale(1.03,.98)}100%{transform:scale(1,1)}}' +
    '.jelly-wobble{animation:jelly-wobble .42s ease-out}' +
    '@keyframes hint-pulse{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.07);filter:brightness(1.25)}}' +
    '.hint-pulse{animation:hint-pulse 1s ease-in-out infinite;z-index:4 !important}';
  document.head.appendChild(css);
})(window.App);
