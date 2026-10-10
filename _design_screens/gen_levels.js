// Generates the level set: node gen_levels.js [seconds] > levels.json
//
// Method (cluster search, as used for hard Rush Hour sets):
//  1. Build a random board in a canonical orientation (exit on the right).
//  2. Explore every state reachable from it (moves are reversible, so this is the
//     whole connected cluster).
//  3. Breadth-first search backwards from every solved state in the cluster gives each
//     state its exact minimum number of moves to win ("par").
//  4. Keep the hardest state of the cluster plus, for sparse boards, an easier one, but only
//     if its shortest solution moves several different blocks (no "same move again" puzzles).
//  5. Fill 100 level slots along a difficulty curve, then rotate/mirror each board so the
//     exit lands on the side the schedule asks for. Rotation keeps par unchanged.
// Every level is re-validated with puzzle.js (an independent forward solver) in test_levels.js.

const Puzzle = require('./puzzle.js');
const SIZE = 6;
const SECONDS = Number(process.argv[2] || 240);

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20261010);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

// ---------- fast cluster search on a compact representation ----------
// spec[i] = { orient, len, fixed, wall, target }; a state is the array of each block's
// variable coordinate (col for horizontal blocks, row for vertical ones).
function occupancy(spec, st) {
  const occ = new Int8Array(SIZE * SIZE).fill(-1);
  for (let i = 0; i < spec.length; i++) {
    const s = spec[i], p = st[i];
    for (let k = 0; k < s.len; k++) occ[s.orient === 'h' ? s.fixed * SIZE + p + k : (p + k) * SIZE + s.fixed] = i;
  }
  return occ;
}
function neighbours(spec, st, out) {
  out.length = 0;
  const occ = occupancy(spec, st);
  for (let i = 0; i < spec.length; i++) {
    const s = spec[i];
    if (s.wall) continue;
    const p = st[i];
    const at = (q) => (s.orient === 'h' ? s.fixed * SIZE + q : q * SIZE + s.fixed);
    for (let q = p - 1; q >= 0 && occ[at(q)] === -1; q--) { const n = st.slice(); n[i] = q; out.push(n); }
    for (let q = p + 1; q + s.len - 1 < SIZE && occ[at(q + s.len - 1)] === -1; q++) { const n = st.slice(); n[i] = q; out.push(n); }
  }
  return out;
}
const keyOf = (st) => String.fromCharCode.apply(null, st);

function explore(spec, start, cap) {
  const states = [start];
  const index = new Map([[keyOf(start), 0]]);
  const buf = [];
  for (let qi = 0; qi < states.length; qi++) {
    for (const n of neighbours(spec, states[qi], buf)) {
      const k = keyOf(n);
      if (index.has(k)) continue;
      if (states.length >= cap) return null;
      index.set(k, states.length);
      states.push(n);
    }
  }
  const t = spec.findIndex((s) => s.target);
  const dist = new Int16Array(states.length).fill(-1);
  const queue = [];
  states.forEach((st, i) => { if (st[t] + spec[t].len === SIZE) { dist[i] = 0; queue.push(i); } });
  if (!queue.length) return null;
  for (let qi = 0; qi < queue.length; qi++) {
    const i = queue[qi];
    for (const n of neighbours(spec, states[i], buf)) {
      const j = index.get(keyOf(n));
      if (dist[j] === -1) { dist[j] = dist[i] + 1; queue.push(j); }
    }
  }
  return { states, index, dist };
}

// Walk one shortest solution and report which blocks it moves.
function solutionStats(spec, cl, i) {
  const buf = [];
  const moved = new Set();
  let targetMoves = 0;
  while (cl.dist[i] > 0) {
    const st = cl.states[i];
    let nextI = -1;
    for (const n of neighbours(spec, st, buf)) {
      const j = cl.index.get(keyOf(n));
      if (cl.dist[j] === cl.dist[i] - 1) { nextI = j; break; }
    }
    const nx = cl.states[nextI];
    for (let b = 0; b < spec.length; b++) if (nx[b] !== st[b]) { moved.add(b); if (spec[b].target) targetMoves++; }
    i = nextI;
  }
  return { distinct: moved.size, targetMoves };
}

// ---------- random boards ----------
function randomBoard(o) {
  const spec = [], st = [];
  const occ = new Int8Array(SIZE * SIZE).fill(-1);
  const fits = (orient, len, fixed, p) => {
    if (p < 0 || p + len > SIZE) return false;
    for (let k = 0; k < len; k++) if (occ[orient === 'h' ? fixed * SIZE + p + k : (p + k) * SIZE + fixed] !== -1) return false;
    return true;
  };
  const put = (s, p) => {
    spec.push(s); st.push(p);
    for (let k = 0; k < s.len; k++) occ[s.orient === 'h' ? s.fixed * SIZE + p + k : (p + k) * SIZE + s.fixed] = spec.length - 1;
  };
  const row = pick([0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5]);
  const tcol = Math.floor(rng() * (SIZE - o.targetLen)); // never already touching the exit
  put({ orient: 'h', len: o.targetLen, fixed: row, target: true }, tcol);
  for (let w = 0; w < o.walls; w++) {
    for (let a = 0; a < 40; a++) {
      const r = Math.floor(rng() * SIZE), c = Math.floor(rng() * SIZE);
      if (r === row) continue; // a wall in the exit row could block the exit forever
      if (fits('h', 1, r, c)) { put({ orient: 'h', len: 1, fixed: r, wall: true }, c); break; }
    }
  }
  let guard = 0;
  while (spec.length - 1 - o.walls < o.blocks && guard++ < 400) {
    const orient = rng() < 0.5 ? 'h' : 'v';
    const len = rng() < 0.3 ? 3 : 2;
    const fixed = Math.floor(rng() * SIZE);
    if (orient === 'h' && fixed === row) continue; // keep other horizontals out of the exit lane
    const p = Math.floor(rng() * (SIZE - len + 1));
    if (fits(orient, len, fixed, p)) put({ orient, len, fixed }, p);
  }
  return { spec, st };
}

function toLevel(spec, st) {
  return {
    exit: { side: 'right', index: spec[0].fixed },
    blocks: spec.map((s, i) => ({
      id: i, orient: s.orient, len: s.len,
      row: s.orient === 'h' ? s.fixed : st[i], col: s.orient === 'h' ? st[i] : s.fixed,
      target: !!s.target, wall: !!s.wall
    }))
  };
}

// ---------- harvest a pool of candidate puzzles ----------
const pool = [];
const seen = new Set();
const deadline = Date.now() + SECONDS * 1000;
let tries = 0;
function consider(spec, cl, i, meta) {
  const par = cl.dist[i];
  if (par < 2) return;
  const sol = solutionStats(spec, cl, i);
  const needDistinct = par >= 6 ? 4 : Math.min(par, 3);
  if (sol.distinct < needDistinct) return;
  const lvl = toLevel(spec, cl.states[i]);
  const sig = Puzzle.key(lvl.blocks) + '|' + lvl.blocks.map((b) => b.orient + b.len + (b.orient === 'h' ? b.row : b.col)).join('');
  if (seen.has(sig)) return;
  seen.add(sig);
  pool.push(Object.assign({ par, distinct: sol.distinct, level: lvl }, meta));
}
while (Date.now() < deadline) {
  tries++;
  const sparse = rng() < 0.35;
  const o = {
    blocks: sparse ? 4 + Math.floor(rng() * 5) : 10 + Math.floor(rng() * 5),
    walls: rng() < 0.3 ? 1 + Math.floor(rng() * 2) : 0,
    targetLen: rng() < 0.2 ? 3 : 2
  };
  const b = randomBoard(o);
  const cl = explore(b.spec, b.st, 250000);
  if (!cl) continue;
  let best = 0;
  for (let i = 1; i < cl.dist.length; i++) if (cl.dist[i] > cl.dist[best]) best = i;
  const meta = { blocks: b.spec.length - 1 - b.spec.filter((s) => s.wall).length, walls: b.spec.filter((s) => s.wall).length, targetLen: o.targetLen };
  consider(b.spec, cl, best, meta);
  if (sparse && cl.dist[best] >= 6) {
    // also offer an easier mid-cluster state from roomy boards for the early levels
    const want = 3 + Math.floor(rng() * Math.min(7, cl.dist[best] - 2));
    const ids = [];
    for (let i = 0; i < cl.dist.length; i++) if (cl.dist[i] === want) ids.push(i);
    if (ids.length) consider(b.spec, cl, pick(ids), meta);
  }
  if (tries % 500 === 0) {
    const top = pool.map((p) => p.par).sort((a, c) => c - a).slice(0, 5);
    console.error(`tries ${tries} pool ${pool.length} top pars ${top.join(',')}`);
  }
}

// ---------- fill the level slots ----------
const TIERS = [
  { name: 'Kolay', from: 1, to: 20 }, { name: 'Orta', from: 21, to: 40 }, { name: 'Zor', from: 41, to: 60 },
  { name: 'Uzman', from: 61, to: 80 }, { name: 'Efsane', from: 81, to: 100 }
];
const TOTAL = 100;
const maxPar = Math.max.apply(null, pool.map((p) => p.par));
// The last tier ("Efsane") gets the 20 hardest distinct puzzles found, easiest of them first.
const LEGEND_FROM = 81;
const legend = pool.map((p, i) => i).sort((a, b) => pool[b].par - pool[a].par).slice(0, TOTAL - LEGEND_FROM + 1).reverse();
const legendFloor = pool[legend[0]].par;
// Levels 1-80: 3 moves rising to just below the legend tier, with a breather every 5th level.
function wantPar(n) {
  const x = (n - 1) / (LEGEND_FROM - 2);
  const top = Math.max(legendFloor - 1, 12);
  let p = Math.round(3 + (top - 3) * Math.pow(x, 1.1));
  if (n % 5 === 0 && n > 5) p = Math.max(3, p - 2 - Math.floor(n / 40));
  return p;
}
function constraintsFor(n) {
  return {
    walls: n >= 15,             // walls appear from level 15 on
    target3: n >= 21,           // long target from the second tier on
    maxBlocks: n <= 10 ? 7 : (n <= 20 ? 9 : 99)
  };
}

const SIDE_TRANSFORM = {
  right: (l) => l,
  left: (l) => Puzzle.mapLevel(l, Puzzle.TRANSFORMS.mirrorH),
  top: (l) => Puzzle.mapLevel(l, Puzzle.TRANSFORMS.rotateCCW),
  bottom: (l) => Puzzle.mapLevel(l, Puzzle.TRANSFORMS.rotateCW)
};
// Exit sides: start on the right, introduce left, top and bottom one by one, then mix
// without ever repeating a side three times in a row.
function sideFor(n, prev) {
  const intro = { 1: 'right', 2: 'right', 3: 'left', 5: 'top', 7: 'bottom' };
  if (intro[n]) return intro[n];
  let s;
  do { s = pick(Puzzle.SIDES); } while (prev.length >= 2 && prev[prev.length - 1] === s && prev[prev.length - 2] === s);
  return s;
}

const used = new Set(legend);
const levels = [];
const sides = [];
let prevColor = -1;
for (let n = 1; n <= TOTAL; n++) {
  const want = wantPar(n);
  const c = constraintsFor(n);
  const ok = (p, i) => !used.has(i) && (c.walls || p.walls === 0) && (c.target3 || p.targetLen === 2) && p.blocks <= c.maxBlocks;
  let choice = n >= LEGEND_FROM ? legend[n - LEGEND_FROM] : -1;
  for (let d = 0; d <= maxPar && choice === -1; d++) {
    for (const target of d === 0 ? [want] : [want - d, want + d]) {
      const ids = [];
      pool.forEach((p, i) => { if (p.par === target && ok(p, i)) ids.push(i); });
      // a wall level should actually show walls once they are introduced
      if (n === 15) { const w = ids.filter((i) => pool[i].walls > 0); if (w.length) { choice = pick(w); break; } }
      if (ids.length) { choice = pick(ids); break; }
    }
  }
  if (choice === -1) { console.error('could not fill level', n); process.exit(1); }
  used.add(choice);
  const p = pool[choice];
  const side = sideFor(n, sides);
  sides.push(side);
  let lvl = SIDE_TRANSFORM[side](p.level);
  // extra mirror across the exit axis so the same shape never repeats visually
  if (rng() < 0.5) lvl = Puzzle.mapLevel(lvl, side === 'left' || side === 'right' ? Puzzle.TRANSFORMS.mirrorV : Puzzle.TRANSFORMS.mirrorH);
  let tc;
  do { tc = n === 1 ? 0 : Math.floor(rng() * 5); } while (tc === prevColor);
  prevColor = tc;
  const tier = TIERS.filter((t) => n >= t.from && n <= t.to)[0].name;
  levels.push({
    n, tier, par: p.par, size: SIZE, exit: lvl.exit, targetColor: tc,
    blocks: lvl.blocks.map((b) => {
      const o = { id: b.id, orient: b.orient, len: b.len, row: b.row, col: b.col };
      if (b.target) o.target = true;
      if (b.wall) o.wall = true;
      return o;
    })
  });
}

console.log(JSON.stringify(levels));
console.error(`tries ${tries}, pool ${pool.length}, max par ${maxPar}`);
console.error('pars:', levels.map((l) => l.par).join(','));
console.error('sides:', levels.map((l) => l.exit.side[0]).join(''));
