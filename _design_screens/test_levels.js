// Rule and level tests: node test_levels.js
// Part 1 checks puzzle.js against hand-built boards with known answers.
// Part 2 re-solves every level in levels.json with the forward solver (independent of the
// generator's backward cluster search) and checks structure, par and variety.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const P = require('./puzzle.js');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; } catch (e) { failed++; console.log('FAIL', name, '\n   ', e.message); }
}
const B = (id, orient, len, row, col, extra) => Object.assign({ id, orient, len, row, col }, extra || {});
const RIGHT2 = { side: 'right', index: 2 };

// ---------- Part 1: rules ----------
test('clear lane solves in one move', () => {
  const blocks = [B(0, 'h', 2, 2, 0, { target: true })];
  assert.strictEqual(P.solve(blocks, RIGHT2).par, 1);
});
test('a movable blocker costs one extra move', () => {
  const blocks = [B(0, 'h', 2, 2, 0, { target: true }), B(1, 'v', 2, 1, 4)];
  assert.strictEqual(P.solve(blocks, RIGHT2).par, 2);
});
test('a wall in the lane makes the board unsolvable', () => {
  const blocks = [B(0, 'h', 2, 2, 0, { target: true }), B(1, 'h', 1, 2, 4, { wall: true })];
  assert.strictEqual(P.solve(blocks, RIGHT2), null);
});
test('a blocker that cannot clear the lane makes it unsolvable', () => {
  // vertical 3-long block in rows 0-2 of col 4 with a wall under it at row 3: it can only go up
  // to rows 0-2 and always covers row 2.
  const blocks = [B(0, 'h', 2, 2, 0, { target: true }), B(1, 'v', 3, 0, 4), B(2, 'h', 1, 3, 4, { wall: true })];
  assert.strictEqual(P.solve(blocks, RIGHT2), null);
});
test('range stops at edges, blocks and walls', () => {
  const blocks = [B(0, 'h', 2, 2, 2, { target: true }), B(1, 'h', 1, 2, 0, { wall: true }), B(2, 'v', 2, 1, 5)];
  assert.deepStrictEqual(P.range(blocks, 0), { min: 1, max: 3 });
  assert.deepStrictEqual(P.range(blocks, 1), { min: 0, max: 0 });
  assert.deepStrictEqual(P.range(blocks, 2), { min: 0, max: 4 });
});
test('blocks only slide along their own axis', () => {
  const blocks = [B(0, 'h', 2, 2, 2, { target: true }), B(1, 'v', 2, 0, 0)];
  P.moves(blocks).forEach((m) => {
    const b = blocks.find((x) => x.id === m.id);
    const after = P.moveTo(blocks, m.id, m.to).find((x) => x.id === m.id);
    if (b.orient === 'h') assert.strictEqual(after.row, b.row); else assert.strictEqual(after.col, b.col);
  });
});
test('walls never appear in the move list', () => {
  const blocks = [B(0, 'h', 2, 2, 0, { target: true }), B(1, 'h', 1, 0, 0, { wall: true })];
  assert.ok(P.moves(blocks).every((m) => m.id !== 1));
});
test('a long drag counts as one move', () => {
  const blocks = [B(0, 'h', 2, 2, 0, { target: true })];
  const sol = P.solve(blocks, RIGHT2);
  assert.deepStrictEqual(sol.path, [{ id: 0, from: 0, to: 4 }]);
});
test('win detection for every side', () => {
  assert.ok(P.isSolved([B(0, 'h', 2, 3, 4, { target: true })], { side: 'right', index: 3 }));
  assert.ok(P.isSolved([B(0, 'h', 3, 1, 0, { target: true })], { side: 'left', index: 1 }));
  assert.ok(P.isSolved([B(0, 'v', 2, 0, 5, { target: true })], { side: 'top', index: 5 }));
  assert.ok(P.isSolved([B(0, 'v', 2, 4, 0, { target: true })], { side: 'bottom', index: 0 }));
  assert.ok(!P.isSolved([B(0, 'h', 2, 3, 4, { target: true })], { side: 'right', index: 2 }));
  assert.ok(!P.isSolved([B(0, 'v', 2, 3, 5, { target: true })], { side: 'top', index: 5 }));
});
test('validate catches broken boards', () => {
  const lvl = (blocks, exit) => ({ blocks, exit: exit || RIGHT2 });
  assert.ok(P.validate(lvl([B(0, 'h', 2, 2, 0, { target: true }), B(1, 'v', 2, 1, 1)])).some((e) => /overlap/.test(e)));
  assert.ok(P.validate(lvl([B(0, 'h', 2, 2, 5, { target: true })])).some((e) => /off board/.test(e)));
  assert.ok(P.validate(lvl([B(0, 'v', 2, 2, 0, { target: true })])).some((e) => /parallel/.test(e)));
  assert.ok(P.validate(lvl([B(0, 'h', 2, 3, 0, { target: true })])).some((e) => /in line/.test(e)));
  assert.ok(P.validate(lvl([B(0, 'h', 2, 2, 4, { target: true })])).some((e) => /starts solved/.test(e)));
  assert.deepStrictEqual(P.validate(lvl([B(0, 'h', 2, 2, 0, { target: true }), B(1, 'v', 2, 1, 4)])), []);
});
test('rotating or mirroring a board keeps it valid and keeps par', () => {
  const base = { exit: RIGHT2, blocks: [B(0, 'h', 2, 2, 0, { target: true }), B(1, 'v', 3, 0, 3), B(2, 'h', 2, 4, 2), B(3, 'h', 1, 5, 5, { wall: true }), B(4, 'v', 2, 1, 5)] };
  const par = P.solve(base.blocks, base.exit).par;
  const expectSide = { mirrorH: 'left', mirrorV: 'right', rotateCCW: 'top', rotateCW: 'bottom' };
  Object.keys(P.TRANSFORMS).forEach((name) => {
    const m = P.mapLevel(base, P.TRANSFORMS[name]);
    assert.deepStrictEqual(P.validate(m), [], name);
    assert.strictEqual(m.exit.side, expectSide[name], name);
    assert.strictEqual(P.solve(m.blocks, m.exit).par, par, name);
  });
});

// ---------- Part 2: the shipped levels ----------
const levels = JSON.parse(fs.readFileSync(path.join(__dirname, 'levels.json'), 'utf8'));
const TIERS = { Kolay: [1, 20], Orta: [21, 40], Zor: [41, 60], Uzman: [61, 80], Efsane: [81, 100] };

test('100 levels, numbered in order, in the right tiers', () => {
  assert.strictEqual(levels.length, 100);
  levels.forEach((l, i) => {
    assert.strictEqual(l.n, i + 1);
    const t = TIERS[l.tier];
    assert.ok(t && l.n >= t[0] && l.n <= t[1], 'level ' + l.n + ' tier ' + l.tier);
  });
});

const solutions = {};
levels.forEach((l) => {
  test('level ' + l.n + ' is well formed', () => assert.deepStrictEqual(P.validate(l), []));
  test('level ' + l.n + ' par is the true minimum', () => {
    const sol = P.solve(l.blocks, l.exit, 2000000);
    assert.ok(sol, 'unsolvable');
    assert.strictEqual(sol.par, l.par);
    solutions[l.n] = sol;
  });
  test('level ' + l.n + ' solution replays move by move', () => {
    const sol = solutions[l.n];
    if (!sol) throw new Error('no solution');
    let blocks = l.blocks;
    sol.path.forEach((m) => {
      const rg = P.range(blocks, m.id);
      assert.ok(m.to >= rg.min && m.to <= rg.max, 'illegal move ' + JSON.stringify(m));
      blocks = P.moveTo(blocks, m.id, m.to);
    });
    assert.ok(P.isSolved(blocks, l.exit));
  });
});

test('no two levels share a layout', () => {
  const sigs = new Set();
  levels.forEach((l) => {
    const sig = l.blocks.map((b) => [b.orient, b.len, b.row, b.col, b.target ? 1 : 0, b.wall ? 1 : 0].join('')).sort().join('|');
    assert.ok(!sigs.has(sig), 'duplicate layout at level ' + l.n);
    sigs.add(sig);
  });
});
test('shortest solutions use several different blocks', () => {
  levels.forEach((l) => {
    const sol = solutions[l.n];
    if (!sol) return;
    const distinct = new Set(sol.path.map((m) => m.id)).size;
    assert.ok(distinct >= Math.min(3, l.par), 'level ' + l.n + ' only moves ' + distinct + ' blocks');
  });
});
test('every tier uses at least three exit sides', () => {
  Object.keys(TIERS).forEach((name) => {
    const sides = new Set(levels.filter((l) => l.tier === name).map((l) => l.exit.side));
    assert.ok(sides.size >= 3, name + ' only has ' + [...sides].join(','));
  });
});
test('the exit side never repeats three times in a row', () => {
  for (let i = 2; i < levels.length; i++) {
    const s = levels[i].exit.side;
    assert.ok(!(levels[i - 1].exit.side === s && levels[i - 2].exit.side === s), 'levels ' + (i - 1) + '-' + (i + 1));
  }
});
test('target colour changes every level', () => {
  levels.forEach((l, i) => {
    assert.ok(l.targetColor >= 0 && l.targetColor <= 4);
    if (i) assert.notStrictEqual(l.targetColor, levels[i - 1].targetColor, 'level ' + l.n);
  });
});
test('difficulty rises from tier to tier', () => {
  const avg = Object.keys(TIERS).map((name) => {
    const ps = levels.filter((l) => l.tier === name).map((l) => l.par);
    return ps.reduce((a, b) => a + b, 0) / ps.length;
  });
  for (let i = 1; i < avg.length; i++) assert.ok(avg[i] > avg[i - 1], 'tier averages ' + avg.map((a) => a.toFixed(1)).join(' < '));
});
test('the first levels are gentle and walls arrive later', () => {
  levels.slice(0, 5).forEach((l) => assert.ok(l.par >= 2 && l.par <= 5, 'level ' + l.n + ' par ' + l.par));
  levels.slice(0, 14).forEach((l) => assert.ok(!l.blocks.some((b) => b.wall), 'wall at level ' + l.n));
});

console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
