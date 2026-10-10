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

  stage.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('button, a[href]')) App.sfx('tap');
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    e.preventDefault();
    var m = /([A-Za-z0-9_-]+)\.dc\.html$/.exec(a.getAttribute('href'));
    if (m) go(m[1]);
  });

  function fit() {
    var w = window.innerWidth, h = window.innerHeight;
    var k = Math.min(w / 390, h / 844);
    var framed = w > 390 * k + 24;
    if (framed) k = Math.min(k, (h - 32) / 844);
    stage.classList.toggle('framed', framed);
    stage.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
    window.App._scale = k;
  }
  window.addEventListener('resize', fit);
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
