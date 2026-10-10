window.App = (function () {
  var LEVELS = __LEVELS_JSON__;
  var SAVE_KEY = 'sbp_save_v1';
  var LEVELS_VERSION = 2;

  var TIERS = (function () {
    var out = [], cur = null;
    LEVELS.forEach(function (lv) {
      if (!cur || cur.name !== lv.tier) { cur = { name: lv.tier, from: lv.n, to: lv.n }; out.push(cur); }
      else cur.to = lv.n;
    });
    return out;
  })();

  var THEMES = [
    { id: 'seker', name: 'Şeker', c1: '#FF9F45', c2: '#3DD6C3', c3: '#6C8CFF', cost: 0 },
    { id: 'ahsap', name: 'Ahşap', c1: '#E0A76A', c2: '#B47A45', c3: '#8A5A33', cost: 0 },
    { id: 'neon', name: 'Neon', c1: '#F9F871', c2: '#00F5D4', c3: '#F15BB5', cost: 40 },
    { id: 'pastel', name: 'Pastel', c1: '#FFC8DD', c2: '#BDE0FE', c3: '#CDEAC0', cost: 40 },
    { id: 'okyanus', name: 'Okyanus', c1: '#90E0EF', c2: '#48CAE4', c3: '#0096C7', cost: 60 },
    { id: 'gece', name: 'Gece', c1: '#9D8DF1', c2: '#6F72E0', c3: '#48BFE3', cost: 60 },
    { id: 'jole', name: 'Jöle', c1: '#FF5FA2', c2: '#4FD1FF', c3: '#9BE15D', cost: 80, finish: 'jelly' },
    { id: 'kadife', name: 'Kadife', c1: '#9B2C4B', c2: '#1F6F5C', c3: '#3A4BA8', cost: 80, finish: 'velvet' },
    { id: 'cam', name: 'Cam', c1: '#8C6FEA', c2: '#4FD1BA', c3: '#F08CC4', cost: 100, finish: 'glass' },
    { id: 'metalik', name: 'Metalik', c1: '#C0C7D1', c2: '#D9A441', c3: '#B87333', cost: 100, finish: 'metal' },
    { id: 'simli', name: 'Simli', c1: '#FF7AC6', c2: '#7AD7FF', c3: '#FFD36E', cost: 120, finish: 'glitter' },
    { id: 'tuy', name: 'Tüy', c1: '#FFB3CF', c2: '#B5D3FF', c3: '#FFE680', cost: 120, finish: 'fluffy' }
  ];

  var GAME_PALETTE = {
    seker: [{ bg: '#3DD6C3', sh: '#25A898' }, { bg: '#6C8CFF', sh: '#4865D6' }, { bg: '#FFD35C', sh: '#D9A92F' }, { bg: '#FF7AA8', sh: '#D4527F' }],
    ahsap: [{ bg: '#E0A76A', sh: '#B47A45' }, { bg: '#8A5A33', sh: '#6B4323' }, { bg: '#C9915A', sh: '#A06B3A' }, { bg: '#F0C48A', sh: '#C99A5E' }],
    neon: [{ bg: '#F9F871', sh: '#C9C83A' }, { bg: '#00F5D4', sh: '#00B89D' }, { bg: '#F15BB5', sh: '#C22E86' }, { bg: '#9B5DE5', sh: '#6E33B0' }],
    pastel: [{ bg: '#FFC8DD', sh: '#E59FB8' }, { bg: '#BDE0FE', sh: '#8FC2E8' }, { bg: '#CDEAC0', sh: '#A3CD92' }, { bg: '#FFF1A6', sh: '#E8D679' }],
    okyanus: [{ bg: '#90E0EF', sh: '#5FC2D6' }, { bg: '#48CAE4', sh: '#2A9FBA' }, { bg: '#0096C7', sh: '#00729A' }, { bg: '#ADE8F4', sh: '#7FC9DB' }],
    gece: [{ bg: '#9D8DF1', sh: '#6F5DCB' }, { bg: '#6F72E0', sh: '#4A4DB8' }, { bg: '#48BFE3', sh: '#2A97BA' }, { bg: '#C9A6FF', sh: '#9E75E0' }],
    jole: [{ bg: '#FF5FA2', sh: '#C93A78' }, { bg: '#4FD1FF', sh: '#2399C7' }, { bg: '#9BE15D', sh: '#6DAD34' }, { bg: '#B98CFF', sh: '#8A5ED6' }],
    kadife: [{ bg: '#9B2C4B', sh: '#6E1C34' }, { bg: '#1F6F5C', sh: '#124A3D' }, { bg: '#3A4BA8', sh: '#26337A' }, { bg: '#C08A2E', sh: '#8C6219' }],
    cam: [{ bg: '#8C6FEA', sh: '#6A4FC7' }, { bg: '#4FD1BA', sh: '#33A893' }, { bg: '#F08CC4', sh: '#C9649D' }, { bg: '#6FB4F2', sh: '#4A8CCB' }],
    metalik: [{ bg: '#C0C7D1', sh: '#8A939F' }, { bg: '#D9A441', sh: '#A67822' }, { bg: '#B87333', sh: '#86501F' }, { bg: '#6F8FAF', sh: '#4C6A88' }],
    simli: [{ bg: '#FF7AC6', sh: '#D44E9C' }, { bg: '#7AD7FF', sh: '#45A9D6' }, { bg: '#FFD36E', sh: '#D6A93F' }, { bg: '#C59BFF', sh: '#9A6CDB' }],
    tuy: [{ bg: '#FFA8C8', sh: '#E07FA6' }, { bg: '#A9C8FF', sh: '#7FA1E0' }, { bg: '#FFE06E', sh: '#E0BC3F' }, { bg: '#B8E6C4', sh: '#8CC49C' }]
  };

  var SKINS = [
    { hex: '#FFDBB4', shade: '#E3B58A' }, { hex: '#F1C27D', shade: '#D49F58' }, { hex: '#E0AC69', shade: '#BF8742' },
    { hex: '#C68642', shade: '#A1682B' }, { hex: '#8D5524', shade: '#6C3D15' }
  ];
  var HAIRS = [
    { name: 'Siyah', hex: '#2B1B12' }, { name: 'Kahverengi', hex: '#6B4226' }, { name: 'Sarı', hex: '#D9A441' },
    { name: 'Kızıl', hex: '#B5452A' }, { name: 'Gri', hex: '#9AA0A6' }
  ];
  var EYES = [
    { name: 'Kahverengi', hex: '#5B3A1E' }, { name: 'Yeşil', hex: '#2E7D5B' }, { name: 'Mavi', hex: '#3B7DD8' },
    { name: 'Gri', hex: '#6F7F8C' }, { name: 'Ela', hex: '#A87B2D' }
  ];
  var FACES = {
    yuvarlak: { x: 52, y: 48, w: 96, h: 100, r: 48 }, oval: { x: 56, y: 44, w: 88, h: 112, r: 44 }, koseli: { x: 54, y: 50, w: 92, h: 100, r: 28 }
  };
  var EYE_SHAPES = { yuvarlak: [8, 8, 4.5], badem: [10, 6, 4.5], iri: [10, 10, 6], kirpikli: [8, 8, 4.5] };
  var NOSE_SHAPES = {
    duz: { d: 'M100 106v9q0 4-5 4', sw: 3 },
    kalkik: { d: 'M100 106v8q0 4 5 3', sw: 3 },
    genis: { d: 'M100 105v10q0 5-6 5', sw: 5 }
  };
  var LIP_SHAPES = {
    ince: { d: 'M89 129q11 8 22 0', fill: 'none', stroke: '#7A2E2E', sw: 3.500 },
    dolgun: { d: 'M84 127q16 13 32 0q-4 7-16 7q-12 0-16-7z', fill: '#8A3A3A', stroke: 'none', sw: 0 },
    genis: { d: 'M81 126q19 16 38 0', fill: 'none', stroke: '#7A2E2E', sw: 4 }
  };
  var BROW_SHAPES = {
    dogal: { d: 'M70 84q10-6 20 0M110 84q10-6 20 0', sw: 3.500 },
    kalin: { d: 'M70 84q10-6 20 0M110 84q10-6 20 0', sw: 5.500 },
    cati: { d: 'M70 88l20-8M110 80l20 8', sw: 3.500 }
  };
  var FRAME_COLORS = [
    { name: 'Siyah', hex: '#171A36' }, { name: 'Kahve', hex: '#6B4226' }, { name: 'Kırmızı', hex: '#B5452A' },
    { name: 'Mavi', hex: '#3B7DD8' }, { name: 'Altın', hex: '#D9A441' }
  ];
  var PETS = [
    { id: 'yok', name: 'Yok', emoji: null },
    { id: 'kedi_siyah', name: 'Siyah Kedi', emoji: '🐈‍⬛' },
    { id: 'kedi_beyaz', name: 'Beyaz Kedi', emoji: '🐱' },
    { id: 'kedi_kahve', name: 'Kahve Kedi', emoji: '😸' },
    { id: 'kopek_yavru', name: 'Köpek', emoji: '🐶' },
    { id: 'kopek_puduli', name: 'Poodle', emoji: '🐩' },
    { id: 'kopek_golden', name: 'Golden', emoji: '🐕' },
    { id: 'pati', name: 'Pati', emoji: '🐾' },
    { id: 'kus_papagan', name: 'Papağan', emoji: '🦜' },
    { id: 'kus_baykus', name: 'Baykuş', emoji: '🦉' },
    { id: 'kus_penguen', name: 'Penguen', emoji: '🐧' },
    { id: 'tavsan', name: 'Tavşan', emoji: '🐰' }
  ];
  var BADGE_COLORS = [
    { name: 'Turuncu', hex: '#FF9F45' }, { name: 'Teal', hex: '#3DD6C3' }, { name: 'Mavi', hex: '#6C8CFF' },
    { name: 'Pembe', hex: '#FF7AA8' }, { name: 'Sarı', hex: '#FFD35C' }, { name: 'Mor', hex: '#9D8DF1' },
    { name: 'Beyaz', hex: '#FFFFFF' }
  ];
  var BG_COLORS = [
    { name: 'Lacivert', hex: '#2E3366' }, { name: 'Mor', hex: '#4A3B6B' }, { name: 'Bordo', hex: '#5C2E3F' },
    { name: 'Koyu yeşil', hex: '#2C4A3E' }, { name: 'Kahve', hex: '#4A3626' }, { name: 'Gri', hex: '#3A3F4D' }, { name: 'Siyah', hex: '#15171F' }
  ];

  function resolveColor(list, val, fallbackIdx) {
    if (typeof val === 'string' && val.charAt(0) === '#') return val;
    var item = list[val];
    return (item || list[fallbackIdx || 0]).hex;
  }
  function darkenHex(hex, amt) {
    amt = amt == null ? 0.22 : amt;
    var n = parseInt(hex.replace('#', ''), 16);
    var r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amt)));
    var g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amt)));
    var b = Math.max(0, Math.round((n & 255) * (1 - amt)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  function avatarLook(v) {
    v = v || {};
    var customSkin = typeof v.skin === 'string';
    var skin = customSkin ? { hex: v.skin, shade: darkenHex(v.skin, 0.18) } : (SKINS[v.skin] || SKINS[1]);
    var f = FACES[v.face] || FACES.yuvarlak;
    var e = EYE_SHAPES[v.eye] || EYE_SHAPES.yuvarlak;
    var n = NOSE_SHAPES[v.nose] || NOSE_SHAPES.duz;
    var l = LIP_SHAPES[v.lip] || LIP_SHAPES.ince;
    var earBig = v.ear === 'buyuk';
    var earSivri = v.ear === 'sivri';
    var b = BROW_SHAPES[v.brow] || BROW_SHAPES.dogal;
    var roundG = v.glasses === 'yuvarlak';
    var sun = v.glasses === 'gunes';
    var pet = PETS.filter(function (p) { return p.id === v.pet; })[0] || PETS[0];
    return {
      skinHex: skin.hex, skinShade: skin.shade,
      hairHex: resolveColor(HAIRS, v.hairColor), eyeHex: resolveColor(EYES, v.eyeColor),
      pet: pet.id, hasPet: pet.id !== 'yok', petEmoji: pet.emoji, petColor: resolveColor(BADGE_COLORS, v.petColor),
      bgColor: resolveColor(BG_COLORS, v.bgColor),
      faceX: f.x, faceY: f.y, faceW: f.w, faceH: f.h, faceR: f.r,
      eyeRx: e[0], eyeRy: e[1], irisR: e[2],
      noseD: n.d, noseSw: n.sw,
      lipD: l.d, lipFill: l.fill, lipStroke: l.stroke, lipSw: l.sw,
      earR: earBig ? 13 : 9, earSivri: earSivri, notEarSivri: !earSivri,
      hairLong: v.hair === 'uzun', hairBun: v.hair === 'topuz',
      hairWavyLong: v.hair === 'dalgali_uzun', hairWavyShort: v.hair === 'dalgali_kisa',
      hairPonytail: v.hair === 'atkuyrugu',
      hairCap: v.hair === 'kisa' || v.hair === 'uzun' || v.hair === 'topuz' || v.hair === 'dalgali_uzun' || v.hair === 'dalgali_kisa' || v.hair === 'atkuyrugu',
      hairCurly: v.hair === 'kivircik', hairCurlyShort: v.hair === 'kivircik_kisa', lashes: v.lash === 'var',
      browD: b.d, browSw: b.sw,
      showMoustache: v.facial === 'biyik' || v.facial === 'sakal',
      showBeard: v.facial === 'sakal' || v.facial === 'kirli',
      beardOpacity: v.facial === 'kirli' ? 0.35 : 1,
      showGlasses: v.glasses !== 'yok',
      gX1: roundG ? 66 : 63, gX2: roundG ? 106 : 105, gY: roundG ? 86 : 88,
      gW: roundG ? 28 : 32, gH: roundG ? 28 : 24, gR: roundG ? 14 : 6,
      gFill: sun ? '#171A36' : '#FFFFFF', gFillOpacity: sun ? 0.9 : 0.12,
      gFrame: resolveColor(FRAME_COLORS, v.glassesColor),
      clothHex: resolveColor(BADGE_COLORS, v.clothColor),
      hasEarring: v.earring === 'var', hasNecklace: v.necklace === 'var', hasPiercing: v.piercing === 'var',
      hasClip: v.clip === 'var', hasHat: v.hat === 'var', hasScarf: v.scarf === 'var', hasHeadphones: v.headphones === 'var'
    };
  }

  function defaultState() {
    return {
      onboarded: false, guest: false, levelsVersion: 2, seenIntro: {},
      stars: 0,
      hints: 3,
      adsRemoved: false,
      levels: {},
      unlockedLevel: 1,
      currentLevelIndex: 1,
      pendingRestart: false,
      theme: 'seker',
      themesOwned: ['seker', 'ahsap'],
      avatar: { tab: 'yuz', skin: 1, face: 'yuvarlak', nose: 'duz', lip: 'ince', ear: 'normal', hair: 'uzun', hairColor: 1, eye: 'yuvarlak', eyeColor: 0, brow: 'dogal', lash: 'yok', facial: 'yok', glasses: 'yok', glassesColor: 0, earring: 'yok', necklace: 'yok', piercing: 'yok', clothColor: 0, clip: 'yok', hat: 'yok', scarf: 'yok', headphones: 'yok', pet: 'yok', petColor: 0, bgColor: 0 },
      settings: { ses: true, muzik: true, titresim: false, bildirim: true, dil: 'tr' },
      daily: { lastPlayedDate: null, streak: 0, claimed: {} },
      lastResult: null,
      gameState: null
    };
  }

  function load() {
    var def = defaultState();
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return def;
      var saved = JSON.parse(raw);
      var merged = Object.assign({}, def, saved);
      merged.avatar = Object.assign({}, def.avatar, saved.avatar || {});
      merged.settings = Object.assign({}, def.settings, saved.settings || {});
      merged.daily = Object.assign({}, def.daily, saved.daily || {});
      merged.levels = saved.levels || {};
      merged.themesOwned = saved.themesOwned || def.themesOwned.slice();
      // Level set v2 (100 levels, exits on every side): drop a half-played board from the old set.
      if (saved.levelsVersion !== LEVELS_VERSION) {
        merged.gameState = null;
        merged.pendingRestart = true;
        merged.unlockedLevel = Math.min(merged.unlockedLevel || 1, LEVELS.length);
        merged.currentLevelIndex = Math.min(merged.currentLevelIndex || 1, LEVELS.length);
      }
      merged.levelsVersion = LEVELS_VERSION;
      return merged;
    } catch (e) { return def; }
  }

  var App = {};
  App.LEVELS = LEVELS;
  App.TIERS = TIERS;
  App.PETS = PETS;
  App.BADGE_COLORS = BADGE_COLORS;
  App.resolveColor = resolveColor;
  App.darken = darkenHex;
  App.BG_COLORS = BG_COLORS;
  App.THEMES = THEMES;
  App.data = load();

  App.save = function () {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(App.data)); } catch (e) {}
  };

  App.getLevel = function (n) { return LEVELS[n - 1]; };

  App.tierOf = function (n) {
    for (var i = 0; i < TIERS.length; i++) if (n >= TIERS[i].from && n <= TIERS[i].to) return TIERS[i];
    return TIERS[0];
  };

  App.totalPossibleStars = function () { return LEVELS.length * 3; };

  App.earnedStarsTotal = function () {
    var sum = 0;
    Object.keys(App.data.levels).forEach(function (k) { sum += App.data.levels[k].bestStars || 0; });
    return sum;
  };

  App.completedCount = function () {
    var c = 0;
    Object.keys(App.data.levels).forEach(function (k) { if ((App.data.levels[k].bestStars || 0) > 0) c++; });
    return c;
  };

  App.packageProgress = function (tierName) {
    var t = null;
    for (var i = 0; i < TIERS.length; i++) if (TIERS[i].name === tierName) t = TIERS[i];
    if (!t) return { done: 0, total: 0 };
    var done = 0;
    for (var n = t.from; n <= t.to; n++) {
      var rec = App.data.levels[n];
      if (rec && (rec.bestStars || 0) > 0) done++;
    }
    return { done: done, total: t.to - t.from + 1 };
  };

  App.starsForMoves = function (par, moves) {
    if (moves <= par) return 3;
    if (moves <= Math.ceil(par * 1.5) + 1) return 2;
    return 1;
  };

  App.recordResult = function (n, moves, timeSec, hintUsed) {
    var lv = App.getLevel(n);
    var par = lv.par;
    var earnedStars = App.starsForMoves(par, moves);
    var prev = App.data.levels[n] || { bestStars: 0, bestMoves: null, bestTimeSec: null, noHintClean: false };
    var delta = Math.max(0, earnedStars - (prev.bestStars || 0));
    var rec = {
      bestStars: Math.max(prev.bestStars || 0, earnedStars),
      bestMoves: prev.bestMoves == null ? moves : Math.min(prev.bestMoves, moves),
      bestTimeSec: prev.bestTimeSec == null ? timeSec : Math.min(prev.bestTimeSec, timeSec),
      noHintClean: !!prev.noHintClean || !hintUsed
    };
    App.data.levels[n] = rec;
    App.data.stars += delta;
    var unlockedNext = false;
    if (n === App.data.unlockedLevel && n < LEVELS.length) { App.data.unlockedLevel = n + 1; unlockedNext = true; }
    App.save();
    return { starsDelta: delta, starsNow: App.data.stars, bestStars: rec.bestStars, par: par, unlockedNext: unlockedNext };
  };

  App.paletteFor = function (themeId) { return GAME_PALETTE[themeId] || GAME_PALETTE.seker; };

  App.avatarLook = function (v) { return avatarLook(v || App.data.avatar); };

  App.fmtTime = function (sec) {
    sec = Math.max(0, sec | 0);
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  };

  App.dateKey = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  App.dailyLevelIndex = function () {
    var d = new Date();
    var dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    return (dayOfYear % LEVELS.length) + 1;
  };

  App.claimDaily = function () {
    var key = App.dateKey();
    if (App.data.daily.claimed[key]) return { already: true };
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yKey = App.dateKey(y);
    App.data.daily.streak = App.data.daily.claimed[yKey] ? (App.data.daily.streak + 1) : 1;
    App.data.daily.claimed[key] = true;
    App.data.daily.lastPlayedDate = key;
    var reward = 3 + Math.min(7, App.data.daily.streak);
    App.data.stars += reward;
    App.save();
    return { already: false, streak: App.data.daily.streak, reward: reward };
  };

  App.computeBadges = function () {
    var completed = App.completedCount();
    var anyThreeStar = Object.keys(App.data.levels).some(function (k) { return App.data.levels[k].bestStars === 3; });
    var fastest = null;
    Object.keys(App.data.levels).forEach(function (k) {
      var t = App.data.levels[k].bestTimeSec;
      if (t != null && (fastest == null || t < fastest)) fastest = t;
    });
    var noHintCount = Object.keys(App.data.levels).filter(function (k) { return App.data.levels[k].noHintClean; }).length;
    var perfectTier = TIERS.some(function (t) {
      for (var n = t.from; n <= t.to; n++) { var r = App.data.levels[n]; if (!r || r.bestStars !== 3) return false; }
      return true;
    });
    var defs = [
      { name: App.t('İlk çıkış'), how: App.t('İlk seviyeyi bitir'), icon: 'check', earned: completed >= 1, status: completed >= 1 ? null : '0 / 1' },
      { name: App.t('Üç yıldız'), how: App.t('Bir seviyeyi 3 yıldızla bitir'), icon: 'star', earned: anyThreeStar, status: anyThreeStar ? null : '0 / 1' },
      { name: App.t('Hızlı çözüm'), how: App.t('30 saniyenin altında bitir'), icon: 'bolt', earned: fastest != null && fastest < 30, status: (fastest != null && fastest < 30) ? null : '0 / 1' },
      { name: App.t('İpucusuz 10'), how: App.t('10 seviyeyi ipucusuz bitir'), icon: 'bulb', earned: noHintCount >= 10, status: noHintCount >= 10 ? null : (noHintCount + ' / 10') },
      { name: App.t('Haftalık seri'), how: App.t('7 gün üst üste oyna'), icon: 'flame', earned: App.data.daily.streak >= 7, status: App.data.daily.streak >= 7 ? null : (App.data.daily.streak + ' / 7') },
      { name: App.t('{n} seviye', { n: LEVELS.length }), how: App.t('Tüm seviyeleri tamamla'), icon: 'flag', earned: completed >= LEVELS.length, status: completed >= LEVELS.length ? null : (completed + ' / ' + LEVELS.length) },
      { name: App.t('Kusursuz paket'), how: App.t('Bir paketi tam yıldızla bitir'), icon: 'crown', earned: perfectTier, status: perfectTier ? null : '0 / 1' },
      { name: App.t('Koleksiyoncu'), how: App.t('Tüm temaları aç'), icon: 'palette', earned: App.data.themesOwned.length >= THEMES.length, status: App.data.themesOwned.length >= THEMES.length ? null : (App.data.themesOwned.length + ' / ' + THEMES.length) },
      { name: App.t('Günlük usta'), how: App.t('30 günlük bulmaca çöz'), icon: 'cal', earned: Object.keys(App.data.daily.claimed).length >= 30, status: Object.keys(App.data.daily.claimed).length >= 30 ? null : (Object.keys(App.data.daily.claimed).length + ' / 30') }
    ];
    return defs;
  };

  App._scale = 1;

  App.goOnline = function (target) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      App.data.pendingOfflineTarget = target;
      window.go('Offline');
    } else {
      window.go(target);
    }
  };

  // ---- board helpers: the rules live in puzzle.js (shared with the generator and tests) ----
  App.cellsOf = Puzzle.cellsOf;
  App.computeRange = Puzzle.range;
  App.isSolved = function (n, blocks) { return Puzzle.isSolved(blocks, LEVELS[n - 1].exit); };

  // First move of a shortest solution from the current board, or null.
  App.solveNextMove = function (blocks, exit) {
    var sol = Puzzle.solve(blocks, exit, 300000);
    if (!sol || !sol.path.length) return null;
    var m = sol.path[0];
    var b = blocks.filter(function (x) { return x.id === m.id; })[0];
    return { id: m.id, orient: b.orient, fromPos: m.from, toPos: m.to };
  };

  // Target colour per level: 0 = classic orange, 1-4 = one of the theme's colours, which the
  // other blocks then avoid so the arrow block is always the only one in its colour.
  var TARGET_ORANGE = { bg: '#FF9F45', sh: '#D9772A' };
  App.levelColors = function (lv, themeId) {
    var pal = App.paletteFor(themeId);
    var tc = (lv && lv.targetColor) || 0;
    if (!tc) return { target: TARGET_ORANGE, others: pal };
    var k = (tc - 1) % pal.length;
    return { target: pal[k], others: pal.filter(function (c, i) { return i !== k; }) };
  };

  return App;
})();
