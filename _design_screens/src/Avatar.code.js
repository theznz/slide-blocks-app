
class Component extends DCLogic {
  renderVals() {
    var self = this;
    var saved = App.data.avatar;
    var defaults = { tab: 'yuz', skin: 1, face: 'yuvarlak', nose: 'duz', lip: 'ince', ear: 'normal', hair: 'uzun', hairColor: 1, eye: 'yuvarlak', eyeColor: 0, brow: 'dogal', lash: 'yok', facial: 'yok', glasses: 'yok', glassesColor: 0, earring: 'yok', necklace: 'yok', piercing: 'yok', clothColor: 0, clip: 'yok', hat: 'yok', scarf: 'yok', headphones: 'yok', pet: 'yok', petColor: 0, bgColor: 0 };
    var st = this.state || {};
    var s = {};
    Object.keys(defaults).forEach(function (k) { s[k] = st[k] !== undefined ? st[k] : (saved[k] !== undefined ? saved[k] : defaults[k]); });
    function set(o) { return function () { self.setState(o); }; }

    var skins = [
      { name: 'Açık', hex: '#FFDBB4', shade: '#E3B58A' },
      { name: 'Buğday', hex: '#F1C27D', shade: '#D49F58' },
      { name: 'Esmer', hex: '#E0AC69', shade: '#BF8742' },
      { name: 'Bronz', hex: '#C68642', shade: '#A1682B' },
      { name: 'Koyu', hex: '#8D5524', shade: '#6C3D15' }
    ];
    var bgColors = App.BG_COLORS;
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
    var eyeShapes = { yuvarlak: [8, 8, 4.5], badem: [10, 6, 4.5], iri: [10, 10, 6] };
    var browShapes = {
      dogal: { d: 'M70 84q10-6 20 0M110 84q10-6 20 0', sw: 3.500 },
      kalin: { d: 'M70 84q10-6 20 0M110 84q10-6 20 0', sw: 5.500 },
      cati: { d: 'M70 88l20-8M110 80l20 8', sw: 3.500 }
    };
    var frameColors = [
      { name: 'Siyah', hex: '#171A36' },
      { name: 'Kahve', hex: '#6B4226' },
      { name: 'Kırmızı', hex: '#B5452A' },
      { name: 'Mavi', hex: '#3B7DD8' },
      { name: 'Altın', hex: '#D9A441' }
    ];
    var noseShapes = {
      duz: { d: 'M100 106v9q0 4-5 4', sw: 3 },
      kalkik: { d: 'M100 106v8q0 4 5 3', sw: 3 },
      genis: { d: 'M100 105v10q0 5-6 5', sw: 5 }
    };
    var lipShapes = {
      ince: { d: 'M89 129q11 8 22 0', fill: 'none', stroke: '#7A2E2E', sw: 3.500 },
      dolgun: { d: 'M84 127q16 13 32 0q-4 7-16 7q-12 0-16-7z', fill: '#8A3A3A', stroke: 'none', sw: 0 },
      genis: { d: 'M81 126q19 16 38 0', fill: 'none', stroke: '#7A2E2E', sw: 4 }
    };

    function look(v) {
      var f = faces[v.face] || faces.yuvarlak;
      var e = eyeShapes[v.eye] || eyeShapes.yuvarlak;
      var n = noseShapes[v.nose] || noseShapes.duz;
      var l = lipShapes[v.lip] || lipShapes.ince;
      var earBig = v.ear === 'buyuk';
      var earSivri = v.ear === 'sivri';
      var b = browShapes[v.brow] || browShapes.dogal;
      var roundG = v.glasses === 'yuvarlak';
      var sun = v.glasses === 'gunes';
      var customSkin = typeof v.skin === 'string';
      var skinObj = customSkin ? { hex: v.skin, shade: App.darken(v.skin, 0.18) } : (skins[v.skin] || skins[1]);
      return {
        skinHex: skinObj.hex,
        skinShade: skinObj.shade,
        hairHex: App.resolveColor(hairs, v.hairColor),
        eyeHex: App.resolveColor(eyes, v.eyeColor),
        faceX: f.x, faceY: f.y, faceW: f.w, faceH: f.h, faceR: f.r,
        eyeRx: e[0], eyeRy: e[1], irisR: e[2],
        noseD: n.d, noseSw: n.sw,
        lipD: l.d, lipFill: l.fill, lipStroke: l.stroke, lipSw: l.sw,
        earR: earBig ? 13 : 9, earSivri: earSivri, notEarSivri: !earSivri,
        hairLong: v.hair === 'uzun',
        hairWavyLong: v.hair === 'dalgali_uzun',
        hairWavyShort: v.hair === 'dalgali_kisa',
        hairPonytail: v.hair === 'atkuyrugu',
        hairBun: v.hair === 'topuz',
        hairCap: v.hair === 'kisa' || v.hair === 'uzun' || v.hair === 'topuz' || v.hair === 'dalgali_uzun' || v.hair === 'dalgali_kisa' || v.hair === 'atkuyrugu',
        hairCurly: v.hair === 'kivircik',
        hairCurlyShort: v.hair === 'kivircik_kisa',
        lashes: v.lash === 'var',
        browD: b.d, browSw: b.sw,
        showMoustache: v.facial === 'biyik' || v.facial === 'sakal',
        showBeard: v.facial === 'sakal' || v.facial === 'kirli',
        beardOpacity: v.facial === 'kirli' ? 0.35 : 1,
        showGlasses: v.glasses !== 'yok',
        gX1: roundG ? 66 : 63, gX2: roundG ? 106 : 105,
        gY: roundG ? 86 : 88, gW: roundG ? 28 : 32, gH: roundG ? 28 : 24, gR: roundG ? 14 : 6,
        gFill: sun ? '#171A36' : '#FFFFFF',
        gFillOpacity: sun ? 0.9 : 0.12,
        gFrame: App.resolveColor(frameColors, v.glassesColor),
        clothHex: App.resolveColor(badgeColors, v.clothColor),
        hasEarring: v.earring === 'var',
        hasNecklace: v.necklace === 'var',
        hasPiercing: v.piercing === 'var',
        hasClip: v.clip === 'var',
        hasHat: v.hat === 'var',
        hasScarf: v.scarf === 'var',
        hasHeadphones: v.headphones === 'var'
      };
    }

    var tabDefs = [
      ['temel', 'Temel'], ['sac', 'Saç'], ['goz', 'Göz'], ['biyik', 'Bıyık'], ['gozluk', 'Gözlük'], ['aksesuar', 'Aksesuar'], ['pet', 'Pet']
    ];
    if (!tabDefs.some(function (t) { return t[0] === s.tab; })) { s.tab = 'temel'; }
    var pets = App.PETS;
    var badgeColors = App.BADGE_COLORS;
    var optionDefs = {
      temel: { label: 'Yüz şekli', key: 'face', vb: '30 24 140 140', list: [['yuvarlak', 'Yuvarlak'], ['oval', 'Oval'], ['koseli', 'Köşeli']] },
      burun: { label: 'Burun şekli', key: 'nose', vb: '30 24 140 140', list: [['duz', 'Düz'], ['kalkik', 'Kalkık'], ['genis', 'Geniş']] },
      dudak: { label: 'Dudak şekli', key: 'lip', vb: '30 24 140 140', list: [['ince', 'İnce'], ['dolgun', 'Dolgun'], ['genis', 'Geniş gülümseme']] },
      kulak: { label: 'Kulak şekli', key: 'ear', vb: '30 24 140 140', list: [['normal', 'Normal'], ['buyuk', 'Büyük'], ['sivri', 'Sivri']] },
      sac: { label: 'Saç modeli', key: 'hair', vb: '20 6 160 160', list: [['kisa', 'Kısa'], ['uzun', 'Uzun'], ['dalgali_uzun', 'Dalgalı uzun'], ['dalgali_kisa', 'Dalgalı kısa'], ['kivircik', 'Kıvırcık uzun'], ['kivircik_kisa', 'Kıvırcık kısa'], ['atkuyrugu', 'At kuyruğu'], ['topuz', 'Topuz'], ['kel', 'Kel']] },
      goz: { label: 'Göz şekli', key: 'eye', vb: '58 78 84 44', list: [['yuvarlak', 'Yuvarlak'], ['badem', 'Badem'], ['iri', 'İri']] },
      kas: { label: 'Kaş şekli', key: 'brow', vb: '30 24 140 140', list: [['dogal', 'Doğal'], ['kalin', 'Kalın'], ['cati', 'Çatık']] },
      kirpik: { label: 'Kirpik', key: 'lash', vb: '30 24 140 140', list: [['yok', 'Yok'], ['var', 'Var']] },
      biyik: { label: 'Bıyık ve sakal', key: 'facial', vb: '50 92 100 66', list: [['yok', 'Yok'], ['biyik', 'Bıyık'], ['sakal', 'Sakal'], ['kirli', 'Kirli']] },
      gozluk: { label: 'Gözlük', key: 'glasses', vb: '46 72 108 56', list: [['yok', 'Yok'], ['yuvarlak', 'Yuvarlak'], ['koseli', 'Köşeli'], ['gunes', 'Güneş']] },
      kupe: { label: 'Küpe', key: 'earring', vb: '30 24 140 140', list: [['yok', 'Yok'], ['var', 'Var']] },
      kolye: { label: 'Kolye', key: 'necklace', vb: '30 24 140 140', list: [['yok', 'Yok'], ['var', 'Var']] },
      piercing: { label: 'Piercing', key: 'piercing', vb: '30 24 140 140', list: [['yok', 'Yok'], ['var', 'Var']] },
      toka: { label: 'Toka', key: 'clip', vb: '30 24 140 140', list: [['yok', 'Yok'], ['var', 'Var']] },
      sapka: { label: 'Şapka', key: 'hat', vb: '30 24 140 140', list: [['yok', 'Yok'], ['var', 'Var']] },
      atki: { label: 'Atkı', key: 'scarf', vb: '30 24 140 140', list: [['yok', 'Yok'], ['var', 'Var']] },
      kulaklik: { label: 'Kulaklık', key: 'headphones', vb: '30 24 140 140', list: [['yok', 'Yok'], ['var', 'Var']] }
    };
    var colorDefs = {
      sac: { label: 'Saç rengi', key: 'hairColor', list: hairs },
      biyik: { label: 'Saç ve sakal rengi', key: 'hairColor', list: hairs },
      goz: { label: 'Göz rengi', key: 'eyeColor', list: eyes },
      gozluk: { label: 'Gözlük rengi', key: 'glassesColor', list: frameColors },
      aksesuar: { label: 'Kıyafet rengi', key: 'clothColor', list: badgeColors },
      pet: { label: 'Rozet rengi', key: 'petColor', list: badgeColors }
    };

    var tabs = tabDefs.map(function (t) {
      var on = t[0] === s.tab;
      return { label: t[1], pick: set({ tab: t[0] }), pressed: on ? 'true' : 'false', bg: on ? '#3DD6C3' : '#232750', fg: on ? '#171A36' : '#FFFFFF' };
    });
    function buildOptions(def) {
      return def.list.map(function (o) {
        var on = s[def.key] === o[0];
        var patch = o[2];
        if (!patch) { patch = {}; patch[def.key] = o[0]; }
        var item = look(Object.assign({}, s, patch));
        item.label = o[1];
        item.vb = def.vb;
        item.pick = set(patch);
        item.pressed = on ? 'true' : 'false';
        item.ring = on ? '0 0 0 3px #3DD6C3' : 'none';
        return item;
      });
    }
    var od = optionDefs[s.tab] || optionDefs.temel;
    var options = buildOptions(od);
    var isPet = s.tab === 'pet';
    var isTemel = s.tab === 'temel';
    var isGoz = s.tab === 'goz';
    var isAksesuar = s.tab === 'aksesuar';
    var cd = colorDefs[s.tab];
    function addPick(key) {
      return function (e) {
        var patch = {}; patch[key] = e.target.value;
        self.setState(patch);
      };
    }
    var ROLE_BY_KEY = { hairColor: 'hair', eyeColor: 'eye', petColor: 'pet', skin: 'skin', bgColor: 'avatarbg', glassesColor: 'glasses' };
    function liveColor(role) {
      return function (e) {
        var hex = e.target.value;
        Array.prototype.forEach.call(document.querySelectorAll('[data-color-fill="' + role + '"]'), function (el) { el.setAttribute('fill', hex); });
        Array.prototype.forEach.call(document.querySelectorAll('[data-color-stroke="' + role + '"]'), function (el) { el.setAttribute('stroke', hex); });
        Array.prototype.forEach.call(document.querySelectorAll('[data-color-bg="' + role + '"]'), function (el) { el.style.background = hex; });
      };
    }
    function buildColorList(key, list) {
      return [{
        isAdd: true, isPreset: false,
        role: ROLE_BY_KEY[key] || '',
        addValue: typeof s[key] === 'string' ? s[key] : '#ffffff',
        addBg: typeof s[key] === 'string' ? s[key] : '#FFFFFF',
        addRing: typeof s[key] === 'string' ? '0 0 0 3px #232750, 0 0 0 6px #FFFFFF' : 'none',
        hasCustom: typeof s[key] === 'string',
        noCustom: typeof s[key] !== 'string',
        pick: addPick(key),
        liveInput: ROLE_BY_KEY[key] ? liveColor(ROLE_BY_KEY[key]) : function () {}
      }].concat(list.map(function (c, i) {
        var on = s[key] === i;
        var patch = {}; patch[key] = i;
        return { isAdd: false, isPreset: true, name: c.name, hex: c.hex, pick: set(patch), pressed: on ? 'true' : 'false', ring: on ? '0 0 0 3px #232750, 0 0 0 6px #FFFFFF' : 'none' };
      }));
    }
    var colors = cd ? buildColorList(cd.key, cd.list) : [];
    var skinColors = buildColorList('skin', skins);
    var avatarBgColors = buildColorList('bgColor', bgColors);

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
    out.isTemel = isTemel;
    out.isGoz = isGoz;
    out.isAksesuar = isAksesuar;
    out.isFace = !isPet && !isAksesuar;
    out.options = options;
    out.optionLabel = od.label;
    out.colors = colors;
    out.hasColors = !isPet && !isTemel && colors.length > 1;
    out.showPetColors = isPet && s.pet !== 'yok' && colors.length > 1;
    out.colorLabel = cd ? cd.label : '';
    out.skinColors = skinColors;
    out.avatarBgColors = avatarBgColors;
    out.noseOptions = isTemel ? buildOptions(optionDefs.burun) : [];
    out.lipOptions = isTemel ? buildOptions(optionDefs.dudak) : [];
    out.earOptions = isTemel ? buildOptions(optionDefs.kulak) : [];
    out.browOptions = isGoz ? buildOptions(optionDefs.kas) : [];
    out.lashOptions = isGoz ? buildOptions(optionDefs.kirpik) : [];
    out.earringOptions = isAksesuar ? buildOptions(optionDefs.kupe) : [];
    out.necklaceOptions = isAksesuar ? buildOptions(optionDefs.kolye) : [];
    out.piercingOptions = isAksesuar ? buildOptions(optionDefs.piercing) : [];
    out.clipOptions = isAksesuar ? buildOptions(optionDefs.toka) : [];
    out.hatOptions = isAksesuar ? buildOptions(optionDefs.sapka) : [];
    out.scarfOptions = isAksesuar ? buildOptions(optionDefs.atki) : [];
    out.headphonesOptions = isAksesuar ? buildOptions(optionDefs.kulaklik) : [];
    out.petOptions = petOptions;
    out.pet = s.pet;
    out.hasPet = s.pet !== 'yok';
    out.petEmoji = currentPet.emoji;
    out.petColor = currentBadgeColor;
    out.bgColor = App.resolveColor(bgColors, s.bgColor);
    out.randomize = function () {
      self.setState({
        skin: rnd(skins.length), face: pickKey(optionDefs.temel),
        nose: pickKey(optionDefs.burun), lip: pickKey(optionDefs.dudak), ear: pickKey(optionDefs.kulak),
        hair: pickKey(optionDefs.sac), hairColor: rnd(hairs.length), eye: pickKey(optionDefs.goz),
        eyeColor: rnd(eyes.length), brow: pickKey(optionDefs.kas), lash: pickKey(optionDefs.kirpik),
        facial: pickKey(optionDefs.biyik), glasses: pickKey(optionDefs.gozluk), glassesColor: rnd(frameColors.length),
        earring: pickKey(optionDefs.kupe), necklace: pickKey(optionDefs.kolye), piercing: pickKey(optionDefs.piercing),
        clothColor: rnd(badgeColors.length), clip: pickKey(optionDefs.toka), hat: pickKey(optionDefs.sapka),
        scarf: pickKey(optionDefs.atki), headphones: pickKey(optionDefs.kulaklik)
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
