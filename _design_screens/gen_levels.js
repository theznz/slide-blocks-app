// Generates validated Rush-Hour style "Sliding Block Puzzle" levels for a 6x6 board.
// IMPORTANT: the true win condition is "target vehicle reaches col===4" in ANY board
// configuration (other vehicles can end up anywhere). So the minimum-moves ("par") for a
// candidate board MUST be computed by a forward solve() that accepts the FIRST state where
// target.col===4 -- NOT by measuring reverse-BFS distance back to one specific solved
// layout (many different configurations satisfy the win condition, so that distance is
// usually much larger than the true par). We use a reverse BFS from one solved layout only
// to cheaply generate a large diverse pool of candidate boards, then re-validate every
// candidate's real par with an authoritative forward solve().

const SIZE = 6;
const EXIT_ROW = 2;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cellsOf(v) {
  const out = [];
  for (let k = 0; k < v.len; k++) out.push(v.orient === 'h' ? [v.row, v.col + k] : [v.row + k, v.col]);
  return out;
}
function inBounds(r, c) { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }
function buildGrid(vehicles) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(-1));
  vehicles.forEach((v, i) => cellsOf(v).forEach(([r, c]) => { grid[r][c] = i; }));
  return grid;
}

function tryPlace(vehicles, orient, len, rng, maxAttempts) {
  const grid = buildGrid(vehicles);
  for (let a = 0; a < maxAttempts; a++) {
    const row = Math.floor(rng() * SIZE);
    const col = Math.floor(rng() * SIZE);
    const v = { orient, len, row, col };
    const cells = cellsOf(v);
    if (!cells.every(([r, c]) => inBounds(r, c))) continue;
    if (!cells.every(([r, c]) => grid[r][c] === -1)) continue;
    return v;
  }
  return null;
}

function genSolvedLayout(rng, extraCount) {
  const vehicles = [{ orient: 'h', len: 2, row: EXIT_ROW, col: 4, isTarget: true }];
  let placed = 0, guard = 0;
  while (placed < extraCount && guard < extraCount * 60) {
    guard++;
    const orient = rng() < 0.5 ? 'h' : 'v';
    const len = rng() < 0.65 ? 2 : 3;
    const v = tryPlace(vehicles, orient, len, rng, 30);
    if (v) { vehicles.push(v); placed++; }
  }
  return vehicles;
}

function stateKey(vehicles) { return vehicles.map((v) => v.row * SIZE + v.col).join(','); }
function isWin(vehicles) { return vehicles[0].col === SIZE - vehicles[0].len; }

function neighbors(vehicles) {
  const grid = buildGrid(vehicles);
  const out = [];
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.orient === 'h') {
      for (let nc = v.col - 1; nc >= 0 && grid[v.row][nc] === -1; nc--) { const nv = vehicles.slice(); nv[i] = { ...v, col: nc }; out.push(nv); }
      for (let nc = v.col + 1; nc + v.len - 1 < SIZE && grid[v.row][nc + v.len - 1] === -1; nc++) { const nv = vehicles.slice(); nv[i] = { ...v, col: nc }; out.push(nv); }
    } else {
      for (let nr = v.row - 1; nr >= 0 && grid[nr][v.col] === -1; nr--) { const nv = vehicles.slice(); nv[i] = { ...v, row: nr }; out.push(nv); }
      for (let nr = v.row + 1; nr + v.len - 1 < SIZE && grid[nr + v.len - 1][v.col] === -1; nr++) { const nv = vehicles.slice(); nv[i] = { ...v, row: nr }; out.push(nv); }
    }
  }
  return out;
}

// Authoritative: minimum moves from `vehicles` to ANY state where the target has exited.
function solvePar(vehicles, cap) {
  if (isWin(vehicles)) return 0;
  const visited = new Set([stateKey(vehicles)]);
  let frontier = [vehicles];
  let depth = 0;
  while (frontier.length) {
    depth++;
    const next = [];
    for (const st of frontier) {
      for (const n of neighbors(st)) {
        if (isWin(n)) return depth;
        const k = stateKey(n);
        if (!visited.has(k)) { visited.add(k); next.push(n); }
      }
    }
    frontier = next;
    if (visited.size > cap) return null;
  }
  return null;
}

// Cheap diverse-candidate harvesting via reverse BFS from one solved layout.
// The recorded "reverseDepth" is only a rough diversity signal, NOT the real par.
function harvestCandidates(startVehicles, capStates, perLayoutCap) {
  const startKey = stateKey(startVehicles);
  const visited = new Set([startKey]);
  let frontier = [startVehicles];
  let depth = 0;
  const out = [];
  while (frontier.length && out.length < perLayoutCap) {
    depth++;
    const next = [];
    for (const state of frontier) {
      for (const n of neighbors(state)) {
        const k = stateKey(n);
        if (visited.has(k)) continue;
        visited.add(k);
        next.push(n);
        if (!isWin(n)) out.push({ vehicles: n, reverseDepth: depth });
        if (visited.size >= capStates || out.length >= perLayoutCap) break;
      }
      if (visited.size >= capStates || out.length >= perLayoutCap) break;
    }
    frontier = next;
  }
  return out;
}

const poolByPar = new Map();
const seenKeys = new Set();
let seed = 777;
const deadline = Date.now() + 150000;
let round = 0;
let validated = 0;
let maxParSeen = 0;
while (Date.now() < deadline && round < 400) {
  round++;
  seed += 101;
  const rng = mulberry32(seed);
  const extra = 9 + Math.floor(rng() * 6); // 9..14
  const layout = genSolvedLayout(rng, extra);
  const candidates = harvestCandidates(layout, 150000, 600);
  // prioritize higher reverseDepth first (more likely to be genuinely hard once validated)
  candidates.sort((a, b) => b.reverseDepth - a.reverseDepth);
  let checked = 0;
  for (const cand of candidates) {
    if (checked >= 300) break; // cap validation work per layout
    checked++;
    const k = stateKey(cand.vehicles);
    if (seenKeys.has(k)) continue;
    seenKeys.add(k);
    const par = solvePar(cand.vehicles, 80000);
    validated++;
    if (par == null || par === 0) continue;
    if (par > maxParSeen) maxParSeen = par;
    if (!poolByPar.has(par)) poolByPar.set(par, []);
    const bucket = poolByPar.get(par);
    if (bucket.length < 8) bucket.push(cand.vehicles);
  }
  if (round % 10 === 0) {
    console.error('round', round, 'validated', validated, 'maxPar', maxParSeen, 'par keys so far', [...poolByPar.keys()].sort((a, b) => a - b).join(','));
  }
}
console.error('FINAL par keys:', [...poolByPar.keys()].sort((a, b) => a - b).join(','));

const TOTAL = 32;
const TIER_NAMES = ['Kolay', 'Orta', 'Zor', 'Uzman'];
const parKeysAvailable = [...poolByPar.keys()].sort((a, b) => a - b);
const minPar = parKeysAvailable[0];
const maxPar = parKeysAvailable[parKeysAvailable.length - 1];
console.error('Assigning', TOTAL, 'levels across real par range', minPar, '..', maxPar);

function pickFromPool(par) {
  const bucket = poolByPar.get(par);
  if (bucket && bucket.length) return bucket.shift();
  return null;
}

const levels = [];
for (let i = 0; i < TOTAL; i++) {
  const wantPar = minPar + Math.round(((maxPar - minPar) * i) / (TOTAL - 1));
  let found = null, foundPar = null;
  for (let d = 0; d <= (maxPar - minPar) + 5 && !found; d++) {
    for (const cand of [wantPar + d, wantPar - d]) {
      if (cand < minPar || cand > maxPar) continue;
      const got = pickFromPool(cand);
      if (got) { found = got; foundPar = cand; break; }
    }
  }
  if (!found) {
    const keys = [...poolByPar.keys()].sort((a, b) => b - a);
    for (const p of keys) { const got = pickFromPool(p); if (got) { found = got; foundPar = p; break; } }
  }
  if (found) {
    const tierName = TIER_NAMES[Math.min(3, Math.floor(i / 8))];
    levels.push({
      n: i + 1, tier: tierName, par: foundPar, exitRow: EXIT_ROW, size: SIZE,
      blocks: found.map((v, idx) => ({ id: idx, orient: v.orient, len: v.len, row: v.row, col: v.col, target: !!v.isTarget })),
    });
  } else {
    console.error('MISSING level slot', i + 1, '(pool exhausted)');
  }
}

console.log(JSON.stringify(levels));
console.error('Generated', levels.length, 'levels. Pars:', levels.map((l) => l.par).join(','));
