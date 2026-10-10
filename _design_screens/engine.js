(function () {
  var data = JSON.parse(document.getElementById('screens').textContent);
  var stage = document.getElementById('stage');
  var HOLE = /\{\{([^}]+)\}\}/g;
  var WHOLE = /^\s*\{\{([^}]+)\}\}\s*$/;

  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    var o = scope, parts = path.split('.');
    for (var i = 0; i < parts.length; i++) { if (o == null) return undefined; o = o[parts[i]]; }
    return o;
  }
  function fill(str, scope) {
    return str.replace(HOLE, function (m, p) { var v = lookup(scope, p); return v == null ? '' : v; });
  }
  // Translate literal markup text (before holes are filled) into the active language.
  var TX_ATTRS = { 'aria-label': 1, placeholder: 1, title: 1, alt: 1 };
  function tx(str) {
    var k = str.trim();
    if (!k) return str;
    var v = App.tr(k);
    return v === k ? str : str.replace(k, function () { return v; });
  }
  function kids(node, scope, out) {
    for (var c = node.firstChild; c; c = c.nextSibling) render(c, scope, out);
  }
  function render(node, scope, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(fill(tx(node.nodeValue), scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName, m;
    if (tag === 'sc-if') {
      m = WHOLE.exec(node.getAttribute('value') || '');
      if (m && lookup(scope, m[1])) kids(node, scope, out);
      return;
    }
    if (tag === 'sc-for') {
      m = WHOLE.exec(node.getAttribute('list') || '');
      var list = (m && lookup(scope, m[1])) || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (it, i) {
        var s = Object.create(scope); s[as] = it; s.$index = i;
        kids(node, s, out);
      });
      return;
    }
    var el = node.cloneNode(false);
    Array.prototype.slice.call(node.attributes).forEach(function (a) {
      var lname = a.name.toLowerCase();
      var val = TX_ATTRS[lname] ? tx(a.value) : a.value;
      var w = WHOLE.exec(val);
      if (lname.indexOf('on') === 0 && lname.length > 2) {
        el.removeAttribute(a.name);
        var fn = w && lookup(scope, w[1]);
        if (typeof fn === 'function') el.addEventListener(lname.slice(2), fn);
      } else if (w) {
        var v = lookup(scope, w[1]);
        el.setAttribute(a.name, v == null ? '' : v);
      } else if (val.indexOf('{{') !== -1) {
        el.setAttribute(a.name, fill(val, scope));
      } else if (val !== a.value) {
        el.setAttribute(a.name, val);
      }
    });
    kids(node, scope, el);
    out.appendChild(el);
  }

  // Flexbox `gap` needs Chrome 84+ / Safari 14.1+. Older phones (e.g. a never-updated Chrome)
  // ignore it, so there the gaps are rebuilt as margins after every render.
  var flexGap = !window.__forceGapPolyfill && (function () {
    var d = document.createElement('div');
    d.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden';
    d.appendChild(document.createElement('div'));
    d.appendChild(document.createElement('div'));
    document.body.appendChild(d);
    var ok = d.scrollHeight === 1;
    document.body.removeChild(d);
    return ok;
  })();
  function polyfillGap(root) {
    if (flexGap) return;
    Array.prototype.forEach.call(root.querySelectorAll('[style*="gap"]'), function (el) {
      var cs = getComputedStyle(el);
      if (cs.display !== 'flex' && cs.display !== 'inline-flex') return;
      var col = cs.flexDirection.indexOf('column') === 0;
      var g = parseFloat(col ? (el.style.rowGap || el.style.gap) : (el.style.columnGap || el.style.gap.split(' ').pop())) || 0;
      if (!g) return;
      // loose text is a flex item too; wrap it so it can carry a margin
      Array.prototype.slice.call(el.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim()) { var sp = document.createElement('span'); el.replaceChild(sp, n); sp.appendChild(n); }
      });
      var side = col ? 'marginTop' : 'marginLeft', before = col ? 'marginBottom' : 'marginRight', prev = null;
      Array.prototype.forEach.call(el.children, function (c) {
        var ccs = getComputedStyle(c);
        if (ccs.position === 'absolute' || ccs.position === 'fixed' || ccs.display === 'none') return;
        if (prev) {
          // an auto margin pushes this item away; put the gap on the item before it instead
          if (c.style[side] === 'auto') prev.style[before] = ((parseFloat(prev.style[before]) || 0) + g) + 'px';
          else c.style[side] = ((parseFloat(c.style[side]) || 0) + g) + 'px';
        }
        prev = c;
      });
    });
  }

  // iPhone haptics: an invisible switch inside each button/link catches the real tap (see audio.js).
  // The switch's own forwarded click is stopped so the button still runs exactly once.
  function stopForwarded(e) { e.stopPropagation(); }
  function addHapticSwitches(root) {
    if (!App.hapticOverlay || !App.data.settings.titresim) return;
    Array.prototype.forEach.call(root.querySelectorAll('button, a[href]'), function (el) {
      if (el.querySelector('input')) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      var label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:absolute;top:0;right:0;bottom:0;left:0;opacity:0;margin:0;z-index:5;cursor:inherit;-webkit-tap-highlight-color:transparent';
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      input.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;margin:0';
      input.addEventListener('click', stopForwarded);
      label.appendChild(input);
      el.appendChild(label);
    });
  }

  var views = {};
  Object.keys(data).forEach(function (name) {
    var tpl = document.createElement('template');
    tpl.innerHTML = data[name].markup;
    var box = document.createElement('div');
    box.className = 'screen';
    stage.appendChild(box);
    var view = { box: box };
    function DCLogic() { this.props = {}; this.state = null; }
    DCLogic.prototype.setState = function (patch) {
      this.state = Object.assign({}, this.state, patch);
      view.draw();
    };
    DCLogic.prototype.forceUpdate = function () { view.draw(); };
    DCLogic.prototype.onShow = function () {};
    DCLogic.prototype.onHide = function () {};
    var Component = new Function('DCLogic', data[name].code + '\nreturn Component;')(DCLogic);
    var inst = new Component();
    view.inst = inst;
    view.draw = function () {
      var keep = [];
      Array.prototype.forEach.call(box.querySelectorAll('[style*="overflow-x"],[style*="overflow-y"]'), function (e) { keep.push([e.scrollLeft, e.scrollTop]); });
      var frag = document.createDocumentFragment();
      var vals;
      try { vals = inst.renderVals() || {}; } catch (err) { console.error('renderVals error in', name, err); vals = {}; }
      kids(tpl.content, vals, frag);
      box.textContent = '';
      box.appendChild(frag);
      polyfillGap(box);
      addHapticSwitches(box);
      Array.prototype.forEach.call(box.querySelectorAll('[style*="overflow-x"],[style*="overflow-y"]'), function (e, i) { if (keep[i]) { e.scrollLeft = keep[i][0]; e.scrollTop = keep[i][1]; } });
    };
    view.draw();
    views[name] = view;
  });

  var activeName = null;
  function go(name) {
    if (!views[name]) return;
    if (activeName && views[activeName] && views[activeName].inst.onHide) {
      try { views[activeName].inst.onHide(); } catch (e) { console.error(e); }
    }
    Object.keys(views).forEach(function (n) { views[n].box.classList.toggle('on', n === name); });
    if (views[name].inst.onShow) {
      try { views[name].inst.onShow(); } catch (e) { console.error(e); }
    }
    views[name].draw();
    activeName = name;
  }
  window.go = go;
  window.__views = views;

  // Haptic tick for buttons on finger lift (pointerup), the earliest moment phones allow it.
  stage.addEventListener('pointerup', function (e) {
    if (!App.hapticOnClick && e.target.closest && e.target.closest('button, a[href]')) App.vibrate(App.HAPTIC.tap);
  });
  stage.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('button, a[href]')) {
      App.sfx('tap');
      if (App.hapticOnClick) App.vibrate(App.HAPTIC.tap);
    }
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    e.preventDefault();
    var m = /([A-Za-z0-9_-]+)\.dc\.html$/.exec(a.getAttribute('href'));
    if (m) go(m[1]);
  });

  // Layout: screens are designed 390 units wide. On phones the app fills the whole width and
  // its height stretches to the screen (between MIN_H and MAX_H units), keeping clear of the
  // notch / home indicator via --sat / --sab. On tablets and desktops it is shown as a framed
  // 390x844 phone. Sizes come from the visible viewport, never innerWidth, which mobile
  // browsers inflate when anything overflows.
  var MIN_H = 720, MAX_H = 980;
  var probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  document.body.appendChild(probe);
  function fit() {
    var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
    var k, H, framed = w / h > 0.68;
    if (framed) {
      H = 844;
      k = Math.min(w / 390, (h - 32) / H);
    } else {
      k = w / 390;
      H = h / k;
      if (H < MIN_H) { k = h / MIN_H; H = MIN_H; }
      if (H > MAX_H) H = MAX_H;
    }
    var cs = getComputedStyle(probe);
    stage.style.setProperty('--sat', framed ? '0px' : (parseFloat(cs.paddingTop) || 0) / k + 'px');
    stage.style.setProperty('--sab', framed ? '0px' : (parseFloat(cs.paddingBottom) || 0) / k + 'px');
    stage.classList.toggle('framed', framed);
    stage.style.height = H + 'px';
    stage.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
    window.App._scale = k;
  }
  window.addEventListener('resize', fit);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  fit();

  // ---- toast ----
  var toastEl = document.createElement('div');
  toastEl.style.cssText = 'position:absolute;left:20px;right:20px;bottom:28px;padding:14px 18px;background:#232750;color:#FFFFFF;border-radius:16px;font-family:Fredoka,system-ui,sans-serif;font-size:15px;font-weight:500;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.4);opacity:0;transform:translateY(10px);transition:opacity .2s,transform .2s;pointer-events:none;z-index:9999';
  stage.appendChild(toastEl);
  var toastTimer = null;
  window.App.toast = function (msg, ms) {
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateY(0)';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(10px)';
    }, ms || 2000);
  };

  go('Splash');
})();
