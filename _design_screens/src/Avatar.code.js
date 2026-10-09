
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var saved = App.data.avatar;
    var defaults = { tab: 'ten', skin: 1, face: 'yuvarlak', hair: 'uzun', hairColor: 1, eye: 'yuvarlak', eyeColor: 0, facial: 'yok', glasses: 'yok', pet: 'yok', petColor: 0 };
    var st = this.state || {};
    var s = {};
    Object.keys(defaults).forEach(function (k) { s[k] = st[k] !== undefined ? st[k] : (saved[k] !== undefined ? saved[k] : defaults[k]); });
    function set(o) { return function () { self.setState(o); }; }

    var skins = [
      { hex: '#FFDBB4', shade: '#E3B58A' },
      { hex: '#F1C27D', shade: '#D49F58' },
      { hex: '#E0AC69', shade: '#BF8742' },
      { hex: '#C68642', shade: '#A1682B' },
      { hex: '#8D5524', shade: '#6C3D15' }
    ];
    var hairs = [
      { name: 'Siyah', hex: '#2B1B12' },
      { name: 'Kahverengi', hex: '#6B4226' },
      { name: 'Sarı', hex: '#D9A441' },
      { name: 'Kızıl', hex: '#B5452A' },
      { name: 'Gri', hex: '#9AA0A6' }
    ];
    var eyes = [
      { name: 'Kahverengi', hex: '#5B3A1E' },
      { name: 'Yeşil', hex: '#2E7D5B' },
      { name: 'Mavi', hex: '#3B7DD8' },
      { name: 'Gri', hex: '#6F7F8C' },
      { name: 'Ela', hex: '#A87B2D' }
    ];
    var faces = {
      yuvarlak: { x: 52, y: 48, w: 96, h: 100, r: 48 },
      oval: { x: 56, y: 44, w: 88, h: 112, r: 44 },
      koseli: { x: 54, y: 50, w: 92, h: 100, r: 28 }
    };
    var eyeShapes = { yuvarlak: [8, 8, 4.5], badem: [10, 6, 4.5], iri: [10, 10, 6], kirpikli: [8, 8, 4.5] };

    function look(v) {
      var f = faces[v.face] || faces.yuvarlak;
      var e = eyeShapes[v.eye] || eyeShapes.yuvarlak;
      var roundG = v.glasses === 'yuvarlak';
      var sun = v.glasses === 'gunes';
      return {
        skinHex: skins[v.skin].hex,
        skinShade: skins[v.skin].shade,
        hairHex: App.resolveColor(hairs, v.hairColor),
        eyeHex: App.resolveColor(eyes, v.eyeColor),
        faceX: f.x, faceY: f.y, faceW: f.w, faceH: f.h, faceR: f.r,
        eyeRx: e[0], eyeRy: e[1], irisR: e[2],
        hairLong: v.hair === 'uzun',
        hairBun: v.hair === 'topuz',
        hairCap: v.hair === 'kisa' || v.hair === 'uzun' || v.hair === 'topuz',
        hairCurly: v.hair === 'kivircik',
        lashes: v.eye === 'kirpikli',
        showMoustache: v.facial === 'biyik' || v.facial === 'sakal',
        showBeard: v.facial === 'sakal' || v.facial === 'kirli',
        beardOpacity: v.facial === 'kirli' ? 0.35 : 1,
        showGlasses: v.glasses !== 'yok',
        gX1: roundG ? 66 : 63, gX2: roundG ? 106 : 105,
        gY: roundG ? 86 : 88, gW: roundG ? 28 : 32, gH: roundG ? 28 : 24, gR: roundG ? 14 : 6,
        gFill: sun ? '#171A36' : '#FFFFFF',
        gFillOpacity: sun ? 0.9 : 0.12
      };
    }

    var tabDefs = [
      ['ten', 'Ten'], ['yuz', 'Yüz'], ['sac', 'Saç'], ['goz', 'Göz'], ['biyik', 'Bıyık'], ['gozluk', 'Gözlük'], ['pet', 'Pet']
    ];
    var pets = App.PETS;
    var badgeColors = App.BADGE_COLORS;
    var optionDefs = {
      ten: { label: 'Ten rengi', key: 'skin', vb: '30 24 140 140', list: [[0, 'Açık'], [1, 'Buğday'], [2, 'Esmer'], [3, 'Bronz'], [4, 'Koyu']] },
      yuz: { label: 'Yüz şekli', key: 'face', vb: '30 24 140 140', list: [['yuvarlak', 'Yuvarlak'], ['oval', 'Oval'], ['koseli', 'Köşeli']] },
      sac: { label: 'Saç modeli', key: 'hair', vb: '20 6 160 160', list: [['kisa', 'Kısa'], ['uzun', 'Uzun'], ['kivircik', 'Kıvırcık'], ['topuz', 'Topuz'], ['kel', 'Kel']] },
      goz: { label: 'Göz şekli', key: 'eye', vb: '58 78 84 44', list: [['yuvarlak', 'Yuvarlak'], ['badem', 'Badem'], ['iri', 'İri'], ['kirpikli', 'Kirpikli']] },
      biyik: { label: 'Bıyık ve sakal', key: 'facial', vb: '50 92 100 66', list: [['yok', 'Yok'], ['biyik', 'Bıyık'], ['sakal', 'Sakal'], ['kirli', 'Kirli']] },
      gozluk: { label: 'Gözlük', key: 'glasses', vb: '46 72 108 56', list: [['yok', 'Yok'], ['yuvarlak', 'Yuvarlak'], ['koseli', 'Köşeli'], ['gunes', 'Güneş']] }
    };
    var colorDefs = {
      sac: { label: 'Saç rengi', key: 'hairColor', list: hairs },
      biyik: { label: 'Saç ve sakal rengi', key: 'hairColor', list: hairs },
      goz: { label: 'Göz rengi', key: 'eyeColor', list: eyes },
      pet: { label: 'Rozet rengi', key: 'petColor', list: badgeColors }
    };

    var tabs = tabDefs.map(function (t) {
      var on = t[0] === s.tab;
      return { label: t[1], pick: set({ tab: t[0] }), pressed: on ? 'true' : 'false', bg: on ? '#3DD6C3' : '#232750', fg: on ? '#171A36' : '#FFFFFF' };
    });
    var od = optionDefs[s.tab] || optionDefs.ten;
    var options = od.list.map(function (o) {
      var on = s[od.key] === o[0];
      var patch = o[2];
      if (!patch) { patch = {}; patch[od.key] = o[0]; }
      var item = look(Object.assign({}, s, patch));
      item.label = o[1];
      item.vb = od.vb;
      item.pick = set(patch);
      item.pressed = on ? 'true' : 'false';
      item.ring = on ? '0 0 0 3px #3DD6C3' : 'none';
      return item;
    });
    var isPet = s.tab === 'pet';
    var cd = colorDefs[s.tab];
    function addPick(key) {
      return function (e) {
        var patch = {}; patch[key] = e.target.value;
        self.setState(patch);
      };
    }
    var ROLE_BY_KEY = { hairColor: 'hair', eyeColor: 'eye', petColor: 'pet' };
    function liveColor(role) {
      return function (e) {
        var hex = e.target.value;
        Array.prototype.forEach.call(document.querySelectorAll('[data-color-fill="' + role + '"]'), function (el) { el.setAttribute('fill', hex); });
        Array.prototype.forEach.call(document.querySelectorAll('[data-color-stroke="' + role + '"]'), function (el) { el.setAttribute('stroke', hex); });
        Array.prototype.forEach.call(document.querySelectorAll('[data-color-bg="' + role + '"]'), function (el) { el.style.background = hex; });
      };
    }
    var colors = cd ? [{
      isAdd: true, isPreset: false,
      role: ROLE_BY_KEY[cd.key] || '',
      addValue: typeof s[cd.key] === 'string' ? s[cd.key] : '#ffffff',
      addBg: typeof s[cd.key] === 'string' ? s[cd.key] : '#FFFFFF',
      addRing: typeof s[cd.key] === 'string' ? '0 0 0 3px #232750, 0 0 0 6px #FFFFFF' : 'none',
      hasCustom: typeof s[cd.key] === 'string',
      noCustom: typeof s[cd.key] !== 'string',
      pick: addPick(cd.key),
      liveInput: ROLE_BY_KEY[cd.key] ? liveColor(ROLE_BY_KEY[cd.key]) : function () {}
    }].concat(cd.list.map(function (c, i) {
      var on = s[cd.key] === i;
      var patch = {}; patch[cd.key] = i;
      return { isAdd: false, isPreset: true, name: c.name, hex: c.hex, pick: set(patch), pressed: on ? 'true' : 'false', ring: on ? '0 0 0 3px #232750, 0 0 0 6px #FFFFFF' : 'none' };
    })) : [];

    function rnd(n) { return Math.floor(Math.random() * n); }
    function pickKey(def) { return def.list[rnd(def.list.length)][0]; }

    var currentPet = pets.filter(function (p) { return p.id === s.pet; })[0] || pets[0];
    var currentBadgeColor = App.resolveColor(badgeColors, s.petColor);
    var petOptions = pets.map(function (p) {
      var on = s.pet === p.id;
      return {
        id: p.id, name: p.name, emoji: p.emoji, isYok: p.id === 'yok', notYok: p.id !== 'yok', circleColor: p.id === 'yok' ? '#171A36' : currentBadgeColor,
        pick: set({ pet: p.id }), pressed: on ? 'true' : 'false', ring: on ? '0 0 0 3px #3DD6C3' : 'none'
      };
    });

    var out = look(s);
    out.tabs = tabs;
    out.isPet = isPet;
    out.isFace = !isPet;
    out.options = options;
    out.optionLabel = od.label;
    out.colors = colors;
    out.hasColors = !isPet && colors.length > 1;
    out.showPetColors = isPet && s.pet !== 'yok' && colors.length > 1;
    out.colorLabel = cd ? cd.label : '';
    out.petOptions = petOptions;
    out.pet = s.pet;
    out.hasPet = s.pet !== 'yok';
    out.petEmoji = currentPet.emoji;
    out.petColor = currentBadgeColor;
    out.randomize = function () {
      self.setState({
        skin: rnd(skins.length), face: pickKey(optionDefs.yuz),
        hair: pickKey(optionDefs.sac), hairColor: rnd(hairs.length), eye: pickKey(optionDefs.goz),
        eyeColor: rnd(eyes.length), facial: pickKey(optionDefs.biyik), glasses: pickKey(optionDefs.gozluk)
      });
    };
    out.save = function () {
      App.data.avatar = s;
      App.save();
      window.go('Profile');
    };
    return out;
  }
}
