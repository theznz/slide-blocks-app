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

  // Soft colour field shown behind glass blocks so there is something for the glass to refract.
  var GLASS_WALL = 'radial-gradient(circle at 18% 22%, rgba(108,140,255,.9) 0, rgba(108,140,255,0) 42%), ' +
    'radial-gradient(circle at 82% 28%, rgba(255,122,198,.85) 0, rgba(255,122,198,0) 40%), ' +
    'radial-gradient(circle at 30% 82%, rgba(61,214,195,.85) 0, rgba(61,214,195,0) 42%), ' +
    'radial-gradient(circle at 80% 80%, rgba(255,211,92,.8) 0, rgba(255,211,92,0) 40%), ' +
    'linear-gradient(135deg, #2B2F6B, #3B2A63)';

  var WALL_LAYERS = GLASS_WALL.split(/,\s*(?=(?:radial|linear)-gradient)/).length;
  var WALL_FILL = new Array(WALL_LAYERS + 1).join(', 100% 100%');
  var WALL_POS = new Array(WALL_LAYERS + 1).join(', 0 0');

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
    // Liquid-glass look: nearly clear body that blurs and saturates what is behind it,
    // bright specular rims, and the tint pooling toward the bottom edge like refracted light.
    glass: function (c, opts) {
      var tint = rgba(c.bg, c.target ? 0.55 : 0.16);
      tint = 'linear-gradient(' + tint + ', ' + tint + ')';
      var layers = 'radial-gradient(120% 70% at 30% 0%, rgba(255,255,255,.42) 0%, rgba(255,255,255,.1) 45%, rgba(255,255,255,0) 60%), ' +
        'linear-gradient(180deg, rgba(255,255,255,0) 55%, ' + rgba(c.bg, c.target ? 0.45 : 0.28) + ' 100%), ' + tint;
      return {
        background: layers + (opts && opts.preview ? ', ' + GLASS_WALL : ''),
        shadow: 'inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.5), inset 1.5px 0 0 rgba(255,255,255,.35), ' +
          'inset -1.5px 0 0 rgba(255,255,255,.25), inset 0 0 14px rgba(255,255,255,.2), 0 10px 24px rgba(0,0,0,.3)',
        extra: 'border: 1px solid rgba(255,255,255,.3); -webkit-backdrop-filter: blur(7px) saturate(190%) brightness(1.08); backdrop-filter: blur(7px) saturate(190%) brightness(1.08);'
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

  App.finishOf = function (themeId) {
    var t = App.THEMES.filter(function (x) { return x.id === themeId; })[0];
    return (t && t.finish) || 'flat';
  };

  App.blockSkin = function (themeId, color, opts) {
    return (FINISH[App.finishOf(themeId)] || FINISH.flat)(color, opts);
  };

  var DOTS = 'radial-gradient(circle, #3A4080 3px, transparent 4px)';
  App.boardBackground = function (themeId) {
    if (App.finishOf(themeId) === 'glass') {
      return 'background-color: #232750; background-image: radial-gradient(circle, rgba(255,255,255,.35) 3px, transparent 4px), ' + GLASS_WALL +
        '; background-size: 56px 56px' + WALL_FILL + '; background-position: 7px 7px' + WALL_POS + ';';
    }
    return 'background-color: #232750; background-image: ' + DOTS + '; background-size: 56px 56px; background-position: 7px 7px;';
  };

  // Full inline style for a static preview tile.
  App.skinStyle = function (themeId, color, radius) {
    var s = App.blockSkin(themeId, color, { preview: true });
    return 'background: ' + s.background + '; box-shadow: ' + s.shadow.replace(/-6px/g, '-5px') + '; border-radius: ' + (radius || 10) + 'px; box-sizing: border-box; ' + s.extra;
  };

  var css = document.createElement('style');
  css.textContent =
    '@keyframes jelly-wobble{0%{transform:scale(1,1)}25%{transform:scale(1.08,.9)}50%{transform:scale(.95,1.06)}75%{transform:scale(1.03,.98)}100%{transform:scale(1,1)}}' +
    '.jelly-wobble{animation:jelly-wobble .42s ease-out}';
  document.head.appendChild(css);
})(window.App);
