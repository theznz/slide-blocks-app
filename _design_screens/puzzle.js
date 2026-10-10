// ---- puzzle rules: one implementation shared by the game, the level generator and the tests ----
//
// Rules (Rush Hour family):
//  * The board is SIZE x SIZE. Every block is a straight 1xlen piece (len 2 or 3) that slides
//    only along its own axis: horizontal blocks left/right, vertical blocks up/down.
//  * Blocks never overlap, never pass through each other and never leave the board.
//  * Walls (`wall: true`, 1x1) never move.
//  * One move = sliding one block any number of free cells in one direction.
//  * The target block (`target: true`, drawn with an arrow) wins when it touches the exit:
//    a gap in one edge of the board (`exit.side` = right|left|top|bottom) at row/column
//    `exit.index`. The target is always parallel to the exit direction and in line with it.
//  * `par` is the minimum number of moves needed; star rating is measured against it.
(function (root) {
  var SIZE = 6;
  var SIDES = ['right', 'left', 'top', 'bottom'];

  function cellsOf(b) {
    var out = [];
    for (var k = 0; k < b.len; k++) out.push(b.orient === 'h' ? [b.row, b.col + k] : [b.row + k, b.col]);
    return out;
  }

  function buildGrid(blocks, excludeId) {
    var grid = [];
    for (var r = 0; r < SIZE; r++) { grid.push([]); for (var c = 0; c < SIZE; c++) grid[r].push(-1); }
    blocks.forEach(function (b) {
      if (b.id === excludeId) return;
      cellsOf(b).forEach(function (rc) { grid[rc[0]][rc[1]] = b.id; });
    });
    return grid;
  }

  function targetOf(blocks) { return blocks.filter(function (b) { return b.target; })[0]; }

  function isSolved(blocks, exit) {
    var t = targetOf(blocks);
    if (!t) return false;
    switch (exit.side) {
      case 'right': return t.orient === 'h' && t.row === exit.index && t.col + t.len === SIZE;
      case 'left': return t.orient === 'h' && t.row === exit.index && t.col === 0;
      case 'bottom': return t.orient === 'v' && t.col === exit.index && t.row + t.len === SIZE;
      case 'top': return t.orient === 'v' && t.col === exit.index && t.row === 0;
    }
    return false;
  }

  // Free positions (col for horizontal, row for vertical) the block can slide to.
  function range(blocks, id) {
    var b = blocks.filter(function (x) { return x.id === id; })[0];
    var pos = b.orient === 'h' ? b.col : b.row;
    if (b.wall) return { min: pos, max: pos };
    var grid = buildGrid(blocks, id);
    var min = pos, max = pos;
    if (b.orient === 'h') {
      for (var c = b.col - 1; c >= 0 && grid[b.row][c] === -1; c--) min = c;
      for (var c2 = b.col + b.len; c2 < SIZE && grid[b.row][c2] === -1; c2++) max = c2 - b.len + 1;
    } else {
      for (var r = b.row - 1; r >= 0 && grid[r][b.col] === -1; r--) min = r;
      for (var r2 = b.row + b.len; r2 < SIZE && grid[r2][b.col] === -1; r2++) max = r2 - b.len + 1;
    }
    return { min: min, max: max };
  }

  function moveTo(blocks, id, pos) {
    return blocks.map(function (b) {
      if (b.id !== id) return b;
      return b.orient === 'h' ? Object.assign({}, b, { col: pos }) : Object.assign({}, b, { row: pos });
    });
  }

  function moves(blocks) {
    var out = [];
    blocks.forEach(function (b) {
      if (b.wall) return;
      var rg = range(blocks, b.id);
      var from = b.orient === 'h' ? b.col : b.row;
      for (var p = rg.min; p <= rg.max; p++) if (p !== from) out.push({ id: b.id, from: from, to: p });
    });
    return out;
  }

  function key(blocks) { return blocks.map(function (b) { return b.orient === 'h' ? b.col : b.row; }).join(','); }

  // Breadth-first search for a shortest solution. Returns { par, path } or null if unsolvable
  // (or if more than `cap` states would have to be explored).
  function solve(blocks, exit, cap) {
    cap = cap || 400000;
    if (isSolved(blocks, exit)) return { par: 0, path: [] };
    var startKey = key(blocks);
    var seen = Object.create(null);
    seen[startKey] = { prev: null, move: null };
    var queue = [blocks], qi = 0, count = 1;
    while (qi < queue.length) {
      var cur = queue[qi++];
      var curKey = key(cur);
      var ms = moves(cur);
      for (var i = 0; i < ms.length; i++) {
        var next = moveTo(cur, ms[i].id, ms[i].to);
        var k = key(next);
        if (seen[k]) continue;
        seen[k] = { prev: curKey, move: ms[i] };
        if (isSolved(next, exit)) {
          var path = [];
          for (var at = k; seen[at].move; at = seen[at].prev) path.unshift(seen[at].move);
          return { par: path.length, path: path };
        }
        if (++count > cap) return null;
        queue.push(next);
      }
    }
    return null;
  }

  // Structural checks for a level object; returns a list of problems (empty when valid).
  function validate(level) {
    var errs = [];
    var blocks = level.blocks || [];
    var exit = level.exit || {};
    if (SIDES.indexOf(exit.side) === -1) errs.push('bad exit side ' + exit.side);
    if (!(exit.index >= 0 && exit.index < SIZE)) errs.push('bad exit index ' + exit.index);
    var ids = {};
    var occ = buildGrid([]);
    blocks.forEach(function (b) {
      if (ids[b.id]) errs.push('duplicate id ' + b.id);
      ids[b.id] = true;
      if (b.orient !== 'h' && b.orient !== 'v') errs.push('bad orient on ' + b.id);
      if (b.wall ? b.len !== 1 : (b.len < 2 || b.len > 3)) errs.push('bad len on ' + b.id);
      cellsOf(b).forEach(function (rc) {
        if (rc[0] < 0 || rc[0] >= SIZE || rc[1] < 0 || rc[1] >= SIZE) errs.push('block ' + b.id + ' off board');
        else if (occ[rc[0]][rc[1]] !== -1) errs.push('blocks ' + occ[rc[0]][rc[1]] + ' and ' + b.id + ' overlap');
        else occ[rc[0]][rc[1]] = b.id;
      });
    });
    var targets = blocks.filter(function (b) { return b.target; });
    if (targets.length !== 1) errs.push('expected exactly one target, got ' + targets.length);
    else {
      var t = targets[0];
      var horizontalExit = exit.side === 'left' || exit.side === 'right';
      if (t.wall) errs.push('target cannot be a wall');
      if ((t.orient === 'h') !== horizontalExit) errs.push('target not parallel to exit');
      if (horizontalExit ? t.row !== exit.index : t.col !== exit.index) errs.push('target not in line with exit');
      if (isSolved(blocks, exit)) errs.push('level starts solved');
    }
    return errs;
  }

  // Re-map a level onto another exit side by rotating / mirroring the whole board.
  // `fn` maps a cell [r, c] to its new [r, c]; blocks are rebuilt from their mapped cells.
  function mapLevel(level, fn) {
    var blocks = level.blocks.map(function (b) {
      var cells = cellsOf(b).map(fn);
      var rows = cells.map(function (x) { return x[0]; }), cols = cells.map(function (x) { return x[1]; });
      var row = Math.min.apply(null, rows), col = Math.min.apply(null, cols);
      var orient = b.len === 1 ? 'h' : (rows[0] === rows[1] ? 'h' : 'v');
      return Object.assign({}, b, { orient: orient, row: row, col: col });
    });
    var probe = fn(exitCell(level.exit));
    return Object.assign({}, level, { blocks: blocks, exit: cellToExit(probe) });
  }
  // Exits are represented by the virtual cell just outside the board.
  function exitCell(exit) {
    switch (exit.side) {
      case 'right': return [exit.index, SIZE];
      case 'left': return [exit.index, -1];
      case 'top': return [-1, exit.index];
      default: return [SIZE, exit.index];
    }
  }
  function cellToExit(rc) {
    if (rc[1] === SIZE) return { side: 'right', index: rc[0] };
    if (rc[1] === -1) return { side: 'left', index: rc[0] };
    if (rc[0] === -1) return { side: 'top', index: rc[1] };
    return { side: 'bottom', index: rc[1] };
  }
  var M = SIZE - 1;
  var TRANSFORMS = {
    mirrorH: function (rc) { return [rc[0], M - rc[1]]; },        // right <-> left
    mirrorV: function (rc) { return [M - rc[0], rc[1]]; },        // top <-> bottom
    rotateCCW: function (rc) { return [M - rc[1], rc[0]]; },      // right -> top
    rotateCW: function (rc) { return [rc[1], M - rc[0]]; }        // right -> bottom
  };

  var Puzzle = {
    SIZE: SIZE, SIDES: SIDES,
    cellsOf: cellsOf, buildGrid: buildGrid, targetOf: targetOf, isSolved: isSolved,
    range: range, moveTo: moveTo, moves: moves, key: key, solve: solve, validate: validate,
    mapLevel: mapLevel, TRANSFORMS: TRANSFORMS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Puzzle;
  else root.Puzzle = Puzzle;
})(typeof window !== 'undefined' ? window : this);
