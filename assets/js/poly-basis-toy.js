/**
 * Interactive toy: real plane curves through N-1 points, built from a
 * user-chosen basis of N polynomials p_i(x,y).
 *
 * Given the basis {p_1, ..., p_N} and points pt_1, ..., pt_{N-1}, the curve
 * is the zero set of
 *
 *   f(x,y) = det [ p_i(x,y) ; p_i(pt_1) ; ... ; p_i(pt_{N-1}) ]
 *          = sum_i c_i p_i(x,y),
 *
 * where c_i are the cofactors along the first row.
 *
 * Polynomials are stored as sparse maps from "i,j" (powers of x and y) to
 * real coefficients.
 */
(function(root) {

  "use strict";

  /******************************************************************
   * Sparse bivariate polynomials
   ******************************************************************/

  class Poly {
    constructor(terms) {
      // terms: Map from "i,j" -> coefficient
      this.terms = terms || new Map();
    }

    static constant(c) {
      const m = new Map();
      if (c !== 0) m.set("0,0", c);
      return new Poly(m);
    }

    static monomial(i, j, c = 1) {
      const m = new Map();
      if (c !== 0) m.set(i + "," + j, c);
      return new Poly(m);
    }

    static key(i, j) { return i + "," + j; }

    static unkey(k) {
      const [i, j] = k.split(",");
      return [parseInt(i, 10), parseInt(j, 10)];
    }

    clone() { return new Poly(new Map(this.terms)); }

    isZero() { return this.terms.size === 0; }

    // If this is a constant polynomial, return its value; else null
    constantValue() {
      if (this.terms.size === 0) return 0;
      if (this.terms.size === 1 && this.terms.has("0,0"))
        return this.terms.get("0,0");
      return null;
    }

    addScaled(other, s) {
      const m = new Map(this.terms);
      for (const [k, c] of other.terms) {
        const v = (m.get(k) || 0) + s * c;
        if (v === 0) m.delete(k); else m.set(k, v);
      }
      return new Poly(m);
    }

    add(other) { return this.addScaled(other, 1); }
    sub(other) { return this.addScaled(other, -1); }

    scale(s) {
      if (s === 0) return new Poly();
      const m = new Map();
      for (const [k, c] of this.terms) m.set(k, s * c);
      return new Poly(m);
    }

    mul(other) {
      const m = new Map();
      for (const [k1, c1] of this.terms) {
        const [i1, j1] = Poly.unkey(k1);
        for (const [k2, c2] of other.terms) {
          const [i2, j2] = Poly.unkey(k2);
          const k = Poly.key(i1 + i2, j1 + j2);
          const v = (m.get(k) || 0) + c1 * c2;
          if (v === 0) m.delete(k); else m.set(k, v);
        }
      }
      return new Poly(m);
    }

    pow(n) {
      let result = Poly.constant(1);
      for (let i = 0; i < n; i++) result = result.mul(this);
      return result;
    }

    // Partial derivative; v = 0 for x, 1 for y
    derive(v) {
      const m = new Map();
      for (const [k, c] of this.terms) {
        const [i, j] = Poly.unkey(k);
        if (v === 0 && i > 0) m.set(Poly.key(i - 1, j), c * i);
        if (v === 1 && j > 0) m.set(Poly.key(i, j - 1), c * j);
      }
      return new Poly(m);
    }

    degree() {
      let d = -Infinity;
      for (const k of this.terms.keys()) {
        const [i, j] = Poly.unkey(k);
        d = Math.max(d, i + j);
      }
      return d;
    }

    /**
     * Compile into a fast evaluator (x, y) => number.
     */
    compile() {
      const ts = [];
      let maxI = 0, maxJ = 0;
      for (const [k, c] of this.terms) {
        const [i, j] = Poly.unkey(k);
        ts.push([i, j, c]);
        maxI = Math.max(maxI, i);
        maxJ = Math.max(maxJ, j);
      }
      const n = ts.length;
      const xp = new Float64Array(maxI + 1), yp = new Float64Array(maxJ + 1);
      return function(x, y) {
        xp[0] = 1; yp[0] = 1;
        for (let i = 1; i <= maxI; i++) xp[i] = xp[i - 1] * x;
        for (let j = 1; j <= maxJ; j++) yp[j] = yp[j - 1] * y;
        let s = 0;
        for (let t = 0; t < n; t++) s += ts[t][2] * xp[ts[t][0]] * yp[ts[t][1]];
        return s;
      };
    }

    /**
     * Compile the "magnitude" sum_ij |c_ij| |x|^i |y|^j, a natural scale
     * against which to judge whether a value of this polynomial is ~0.
     */
    compileAbs() {
      const m = new Map();
      for (const [k, c] of this.terms) m.set(k, Math.abs(c));
      const f = new Poly(m).compile();
      return (x, y) => f(Math.abs(x), Math.abs(y));
    }

    /**
     * Terms sorted by descending total degree, then descending power of x.
     */
    sortedTerms() {
      return Array.from(this.terms, ([k, c]) => {
        const [i, j] = Poly.unkey(k);
        return [i, j, c];
      }).sort((a, b) => (b[0] + b[1]) - (a[0] + a[1]) || b[0] - a[0]);
    }

    /**
     * HTML rendering with exact-ish coefficients (for displaying the basis).
     */
    toHTML() {
      const ts = this.sortedTerms();
      if (ts.length === 0) return "0";
      let s = "";
      ts.forEach(([i, j, c], idx) => {
        const neg = c < 0;
        const a = Math.abs(c);
        const mono = monomialHTML(i, j);
        let coeff = (a === 1 && mono !== "") ? "" : fmtNum(a);
        if (idx === 0) s += neg ? "−" : "";
        else s += neg ? " − " : " + ";
        s += coeff + mono;
      });
      return s;
    }
  }

  function monomialHTML(i, j) {
    const v = (name, p) => p === 0 ? "" : (p === 1 ? name : name + "<sup>" + p + "</sup>");
    return v("<i>x</i>", i) + v("<i>y</i>", j);
  }

  function fmtNum(a) {
    // Up to 4 significant decimals, trailing zeros stripped
    if (Number.isInteger(a)) return String(a);
    return String(parseFloat(a.toPrecision(4)));
  }

  /******************************************************************
   * Parser: string -> Poly
   *
   * Grammar:
   *   expr   := term (('+' | '-') term)*
   *   term   := unary (('*' | '/') unary | <implicit> power)*
   *   unary  := ('+' | '-') unary | power
   *   power  := atom ('^' INT)?
   *   atom   := NUMBER | 'x' | 'y' | '(' expr ')'
   * Implicit multiplication happens when a term is followed directly by
   * a number, variable, or '('.  Division is only allowed by constants.
   ******************************************************************/

  function tokenize(str) {
    const toks = [];
    const re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([xyXY])|(\*\*|[-+*/^()]))/y;
    let pos = 0;
    while (pos < str.length) {
      if (/^\s*$/.test(str.slice(pos))) break;
      re.lastIndex = pos;
      const m = re.exec(str);
      if (!m) {
        const bad = str.slice(pos).trim()[0];
        throw new Error("Unexpected character '" + bad + "'");
      }
      if (m[1] !== undefined) toks.push({type: "num", value: parseFloat(m[1])});
      else if (m[2] !== undefined) toks.push({type: "var", value: m[2].toLowerCase()});
      else toks.push({type: "op", value: m[3] === "**" ? "^" : m[3]});
      pos = re.lastIndex;
    }
    return toks;
  }

  function parsePoly(str) {
    const toks = tokenize(str);
    let pos = 0;

    const peek = () => toks[pos];
    const isOp = (t, v) => t && t.type === "op" && t.value === v;
    const expectOp = (v) => {
      if (!isOp(peek(), v)) throw new Error("Expected '" + v + "'");
      pos++;
    };

    function expr() {
      let p = term();
      for (;;) {
        const t = peek();
        if (isOp(t, "+")) { pos++; p = p.add(term()); }
        else if (isOp(t, "-")) { pos++; p = p.sub(term()); }
        else return p;
      }
    }

    function term() {
      let p = unary();
      for (;;) {
        const t = peek();
        if (isOp(t, "*")) { pos++; p = p.mul(unary()); }
        else if (isOp(t, "/")) {
          pos++;
          const d = unary().constantValue();
          if (d === null) throw new Error("Can only divide by constants");
          if (d === 0) throw new Error("Division by zero");
          p = p.scale(1 / d);
        }
        else if (t && (t.type === "num" || t.type === "var" || isOp(t, "("))) {
          p = p.mul(power());
        }
        else return p;
      }
    }

    function unary() {
      const t = peek();
      if (isOp(t, "-")) { pos++; return unary().scale(-1); }
      if (isOp(t, "+")) { pos++; return unary(); }
      return power();
    }

    function power() {
      const base = atom();
      if (isOp(peek(), "^")) {
        pos++;
        const t = peek();
        if (!t || t.type !== "num" || !Number.isInteger(t.value))
          throw new Error("Exponents must be non-negative integers");
        pos++;
        if (t.value > 20) throw new Error("Exponent too large");
        return base.pow(t.value);
      }
      return base;
    }

    function atom() {
      const t = peek();
      if (!t) throw new Error("Unexpected end of expression");
      if (t.type === "num") { pos++; return Poly.constant(t.value); }
      if (t.type === "var") {
        pos++;
        return t.value === "x" ? Poly.monomial(1, 0) : Poly.monomial(0, 1);
      }
      if (isOp(t, "(")) {
        pos++;
        const p = expr();
        expectOp(")");
        return p;
      }
      throw new Error("Unexpected '" + t.value + "'");
    }

    if (toks.length === 0) throw new Error("Empty expression");
    const result = expr();
    if (pos < toks.length) throw new Error("Unexpected '" + toks[pos].value + "'");
    return result;
  }

  /**
   * Render a (successfully parsed, hence only containing safe characters)
   * source string as HTML, preserving the user's term order.
   */
  function sourceToHTML(s) {
    return s.replace(/\*\*/g, "^")
      .replace(/\s+/g, " ")
      .replace(/([xyXY])/g, (m) => "<i>" + m.toLowerCase() + "</i>")
      .replace(/\^\s*(\d+)/g, "<sup>$1</sup>")
      .replace(/\s*\*\s*/g, "\u2009")
      .replace(/\s*-\s*/g, (m, off) => off === 0 ? "\u2212" : " \u2212 ")
      .replace(/\s*\+\s*/g, (m, off) => off === 0 ? "" : " + ");
  }

  /**
   * Rank of a dense matrix (array of rows) by Gaussian elimination.
   */
  function rank(A, relTol = 1e-10) {
    const M = A.map(r => r.slice());
    const rows = M.length, cols = rows ? M[0].length : 0;
    let scale = 0;
    for (const r of M) for (const v of r) scale = Math.max(scale, Math.abs(v));
    const tol = relTol * (scale || 1);
    let rk = 0;
    for (let c = 0; c < cols && rk < rows; c++) {
      let piv = rk;
      for (let r = rk + 1; r < rows; r++)
        if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      if (Math.abs(M[piv][c]) <= tol) continue;
      [M[rk], M[piv]] = [M[piv], M[rk]];
      for (let r = rk + 1; r < rows; r++) {
        const f = M[r][c] / M[rk][c];
        for (let k = c; k < cols; k++) M[r][k] -= f * M[rk][k];
      }
      rk++;
    }
    return rk;
  }

  /**
   * Parse a comma-separated basis.  Returns an array of Poly.
   * Throws on parse errors or linearly dependent bases.
   */
  function parseBasis(str, maxN = 21) {
    const parts = str.split(",").map(s => s.trim());
    if (parts.length === 1 && parts[0] === "")
      throw new Error("Empty basis");
    const basis = parts.map((s, idx) => {
      try {
        const p = parsePoly(s);
        p.label = sourceToHTML(s);
        return p;
      } catch (e) {
        throw new Error("Basis element " + (idx + 1) + " (“" + s + "”): " + e.message);
      }
    });
    if (basis.length < 2)
      throw new Error("Need at least 2 basis polynomials");
    if (basis.length > maxN)
      throw new Error("At most " + maxN + " basis polynomials, please");
    basis.forEach((p, idx) => {
      if (p.isZero()) throw new Error("Basis element " + (idx + 1) + " is zero");
    });

    // Check linear independence via the coefficient matrix
    const keys = Array.from(new Set(basis.flatMap(p => Array.from(p.terms.keys()))));
    const A = basis.map(p => keys.map(k => p.terms.get(k) || 0));
    if (rank(A) < basis.length)
      throw new Error("Basis polynomials are linearly dependent");

    return basis;
  }

  /******************************************************************
   * Linear algebra: SysDet
   ******************************************************************/

  /**
   * Determinant of a square matrix (array of rows), by Gaussian
   * elimination with partial pivoting.  Destroys its input.
   */
  function detInPlace(M) {
    const n = M.length;
    let det = 1;
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++)
        if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      if (M[piv][c] === 0) return 0;
      if (piv !== c) { [M[c], M[piv]] = [M[piv], M[c]]; det = -det; }
      det *= M[c][c];
      for (let r = c + 1; r < n; r++) {
        const f = M[r][c] / M[c][c];
        for (let k = c + 1; k < n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return det;
  }

  /**
   * Numerical version of SysDet[Ps, pts].
   *
   * Fs: array of N functions (x, y) => number
   * pts: array of N-1 points [x, y]
   *
   * Returns {coeffs, degenerate}: coeffs[i] is the cofactor of p_i(x,y)
   * in the first row of the determinant, normalized so max |coeff| = 1.
   * degenerate is true if the points are (numerically) not in general
   * position, i.e. all cofactors vanish.
   */
  function sysDetCoeffs(Fs, pts, relTol = 1e-10) {
    const N = Fs.length;
    if (pts.length !== N - 1)
      throw new Error("Need exactly " + (N - 1) + " points");

    const M = pts.map(([x, y]) => Fs.map(F => F(x, y)));

    // Hadamard bound on any minor, for a relative degeneracy test
    let bound = 1;
    for (const row of M)
      bound *= Math.hypot(...row) || 1;

    const coeffs = new Array(N);
    let maxAbs = 0;
    for (let i = 0; i < N; i++) {
      const minor = M.map(row => row.filter((_, j) => j !== i));
      const d = detInPlace(minor);
      coeffs[i] = (i % 2 === 0) ? d : -d;
      maxAbs = Math.max(maxAbs, Math.abs(coeffs[i]));
    }

    const degenerate = !(maxAbs > relTol * bound);
    if (!degenerate)
      for (let i = 0; i < N; i++) coeffs[i] /= maxAbs;

    return {coeffs, degenerate};
  }

  /******************************************************************
   * Singular locus
   *
   * Fix all points but the one being dragged (call it a).  The curves
   * through the N-2 fixed points form a pencil, lambda g1 + mu g2, and the
   * curve through a is the member  g2(a) g1 - g1(a) g2.  A generic pencil
   * has finitely many singular members; the locus of a which makes the
   * curve singular is the union of those members (each viewed as a curve
   * in the a-plane).
   *
   * A member is singular at s iff (g1, g1_x, g1_y) || (g2, g2_x, g2_y) at s,
   * i.e. h1 = g1 g2_x - g2 g1_x = 0 and h2 = g1 g2_y - g2 g1_y = 0, away
   * from base points (g1 = g2 = 0).  We find real solutions by tracing
   * h1 = 0, looking for sign changes of h2 along it, and polishing with
   * Newton's method.  The singular member is then  g2(s) g1 - g1(s) g2.
   ******************************************************************/

  /**
   * Orthonormal basis of the null space of M (array of rows, each of
   * length n).  Returns an array of vectors.
   */
  function nullSpace(M, n, relTol = 1e-9) {
    // Normalize rows for conditioning
    const A = M.map(r => {
      const nr = Math.hypot(...r) || 1;
      return r.map(v => v / nr);
    });
    const rows = A.length;
    const pivCols = [];
    let rk = 0;
    for (let c = 0; c < n && rk < rows; c++) {
      let piv = rk;
      for (let r = rk + 1; r < rows; r++)
        if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      if (Math.abs(A[piv][c]) <= relTol) continue;
      [A[rk], A[piv]] = [A[piv], A[rk]];
      const pv = A[rk][c];
      for (let k = c; k < n; k++) A[rk][k] /= pv;
      for (let r = 0; r < rows; r++) {
        if (r === rk) continue;
        const f = A[r][c];
        if (f === 0) continue;
        for (let k = c; k < n; k++) A[r][k] -= f * A[rk][k];
      }
      pivCols.push(c);
      rk++;
    }
    const free = [];
    for (let c = 0; c < n; c++) if (!pivCols.includes(c)) free.push(c);

    // One basis vector per free column, from the RREF
    const vecs = free.map(fc => {
      const v = new Array(n).fill(0);
      v[fc] = 1;
      pivCols.forEach((pc, r) => { v[pc] = -A[r][fc]; });
      return v;
    });

    // Gram-Schmidt
    const out = [];
    for (let v of vecs) {
      for (const u of out) {
        const d = v.reduce((s, vi, i) => s + vi * u[i], 0);
        v = v.map((vi, i) => vi - d * u[i]);
      }
      const nv = Math.hypot(...v);
      if (nv > relTol) out.push(v.map(vi => vi / nv));
    }
    return out;
  }

  const IMPLICIT_PLOT_DEFAULTS = {
    resolution_out: 20, resolution_in: 20, max_steps: 4096,
    alpha_0: 0.05, tol_newton: 1e-7, tol_cusp: 0.05,
    tol_progress: 1e-4, qdt_box: 0.2, kappa_0: 0.2, delta_0: 0.05,
    h_initial: 0.1, h_critical: 0.001, h_max: 0.5,
    loop_dist: 0.09, loop_dir: 0.99, loop_detection: true,
    unitX: 100, unitY: 100,
  };

  /**
   * Trace the real zero set of the Poly p inside box = [xmin, ymax, xmax, ymin],
   * returning a list of polyline pieces (arrays of [x, y]).
   */
  function traceZeroSet(p, box, plotOpts) {
    const JX = (typeof JXG !== "undefined") ? JXG : root.JXG;
    const IP = JX && JX.Math && JX.Math.ImplicitPlot;
    if (!IP) throw new Error("JSXGraph ImplicitPlot not available");
    const opts = Object.assign({tol_u0: JX.Math.eps}, IMPLICIT_PLOT_DEFAULTS, plotOpts);
    const ip = new IP(box, opts, p.compile(), p.derive(0).compile(), p.derive(1).compile());
    const [X, Y] = ip.plot();
    const pieces = [];
    let cur = [];
    for (let i = 0; i < X.length; i++) {
      if (isNaN(X[i]) || isNaN(Y[i])) {
        if (cur.length) pieces.push(cur);
        cur = [];
      } else {
        cur.push([X[i], Y[i]]);
      }
    }
    if (cur.length) pieces.push(cur);
    return pieces;
  }

  /**
   * Polish a common zero of h1, h2 with Newton's method.
   * hs = {h1, h2, h1x, h1y, h2x, h2y, m1, m2} (compiled functions;
   * m1, m2 are magnitude functions).  Returns [x, y] or null.
   */
  function newton2(hs, x, y, maxIter = 30) {
    for (let it = 0; it < maxIter; it++) {
      const f1 = hs.h1(x, y), f2 = hs.h2(x, y);
      const a = hs.h1x(x, y), b = hs.h1y(x, y);
      const c = hs.h2x(x, y), d = hs.h2y(x, y);
      const det = a * d - b * c;
      if (!isFinite(det) || det === 0) break;
      const dx = ( d * f1 - b * f2) / det;
      const dy = (-c * f1 + a * f2) / det;
      x -= dx; y -= dy;
      if (!isFinite(x) || !isFinite(y)) return null;
      if (Math.hypot(dx, dy) < 1e-13 * (1 + Math.hypot(x, y))) break;
    }
    const tol = 1e-8;
    if (Math.abs(hs.h1(x, y)) <= tol * (hs.m1(x, y) || 1) &&
        Math.abs(hs.h2(x, y)) <= tol * (hs.m2(x, y) || 1))
      return [x, y];
    return null;
  }

  /**
   * Compute the singular members of the pencil of curves (from basis)
   * through fixedPts.
   *
   * basis: array of Poly; fixedPts: array of [x, y] (length N-2);
   * box: search region [xmin, ymax, xmax, ymin] for singular points.
   *
   * Returns {members: [{poly, singPts: [[x,y], ...]}], basePts: [...]}
   * or null if the fixed points don't determine a pencil.
   */
  function singularMembers(basis, fixedPts, box, plotOpts = {}) {
    const N = basis.length;
    const Fs = basis.map(p => p.compile());
    const M = fixedPts.map(([x, y]) => Fs.map(F => F(x, y)));
    const ns = nullSpace(M, N);
    if (ns.length !== 2) return null;

    const combine = v => {
      let g = new Poly();
      basis.forEach((p, i) => { g = g.addScaled(p, v[i]); });
      return g;
    };
    const g1 = combine(ns[0]), g2 = combine(ns[1]);
    const g1x = g1.derive(0), g1y = g1.derive(1);
    const g2x = g2.derive(0), g2y = g2.derive(1);

    const h1 = g1.mul(g2x).sub(g2.mul(g1x));
    const h2 = g1.mul(g2y).sub(g2.mul(g1y));
    if (h1.isZero() || h2.isZero()) return null;

    // Magnitude scales for relative zero tests
    const absSum = (a, b) => {
      const fa = a.compileAbs(), fb = b.compileAbs();
      return (x, y) => fa(x, y) + fb(x, y);
    };
    const hs = {
      h1: h1.compile(), h2: h2.compile(),
      h1x: h1.derive(0).compile(), h1y: h1.derive(1).compile(),
      h2x: h2.derive(0).compile(), h2y: h2.derive(1).compile(),
      m1: absSum(g1.mul(g2x), g2.mul(g1x)),
      m2: absSum(g1.mul(g2y), g2.mul(g1y)),
    };
    const G1 = g1.compile(), G2 = g2.compile();
    const G1m = g1.compileAbs(), G2m = g2.compileAbs();
    const dG = {
      g1x: g1x.compile(), g1y: g1y.compile(), g2x: g2x.compile(), g2y: g2y.compile(),
      g1xm: g1x.compileAbs(), g1ym: g1y.compileAbs(),
      g2xm: g2x.compileAbs(), g2ym: g2y.compileAbs(),
    };

    // Candidate singular points (Newton seeds) come from several sources,
    // since any one of them can miss solutions:
    //  1. sign changes of h2 along the traced curve h1 = 0, and vice versa;
    //  2. a coarse grid over the search box;
    //  3. small rings around base points (all the fixed points are base
    //     points, where h1 = h2 = 0 too; singular points close to a base
    //     point are easily stepped over by the tracer).
    const cands = [];
    const signChanges = (hTrace, fOther) => {
      for (const piece of traceZeroSet(hTrace, box, plotOpts)) {
        let prev = null, hPrev = 0;
        for (const pt of piece) {
          const hv = fOther(pt[0], pt[1]);
          if (prev !== null && (hv === 0 || hPrev * hv < 0)) {
            const t = hv === hPrev ? 0.5 : hPrev / (hPrev - hv);
            cands.push([prev[0] + t * (pt[0] - prev[0]), prev[1] + t * (pt[1] - prev[1])]);
          }
          prev = pt; hPrev = hv;
        }
      }
    };
    signChanges(h1, hs.h2);
    signChanges(h2, hs.h1);

    const nGrid = 40;
    for (let i = 0; i <= nGrid; i++)
      for (let j = 0; j <= nGrid; j++)
        cands.push([box[0] + (box[2] - box[0]) * i / nGrid,
                    box[3] + (box[1] - box[3]) * j / nGrid]);

    const ringSeeds = (p) => {
      const out = [];
      for (const r of [1e-3, 3e-3, 1e-2, 3e-2, 0.1])
        for (let k = 0; k < 8; k++) {
          const a = 2 * Math.PI * (k + 0.5) / 8;
          out.push([p[0] + r * Math.cos(a), p[1] + r * Math.sin(a)]);
        }
      return out;
    };
    for (const p of fixedPts) cands.push(...ringSeeds(p));

    const members = [];
    const basePts = [];
    const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6 * (1 + Math.hypot(...p));
    const ringed = fixedPts.slice();

    for (let ci = 0; ci < cands.length; ci++) {
      const c = cands[ci];
      const s = newton2(hs, c[0], c[1]);
      if (!s) continue;
      const [x, y] = s;
      if (x < box[0] || x > box[2] || y < box[3] || y > box[1]) continue;

      const a1 = G1(x, y), a2 = G2(x, y);
      const isBase = Math.abs(a1) <= 1e-7 * (G1m(x, y) || 1) &&
                     Math.abs(a2) <= 1e-7 * (G2m(x, y) || 1);
      if (isBase) {
        if (!basePts.some(b => near(b, s))) basePts.push(s);
        // Base points other than the fixed points (e.g. the 9th point of
        // a pencil of cubics) get their own ring of seeds
        if (!ringed.some(b => Math.hypot(b[0] - x, b[1] - y) < 1e-6)) {
          ringed.push(s);
          cands.push(...ringSeeds(s));
        }
        continue;
      }

      // Member through s: a2 g1 - a1 g2, i.e. pencil coordinates
      // (a2, -a1).  Identify members by their angle mod pi.
      let theta = Math.atan2(-a1, a2);
      if (theta < 0) theta += Math.PI;
      if (theta >= Math.PI) theta -= Math.PI;

      // Directly verify the member is singular at s (guards against
      // spurious near-solutions close to base points)
      {
        const nrm = Math.hypot(a1, a2);
        const c1 = a2 / nrm, c2 = -a1 / nrm;
        const gx = c1 * dG.g1x(x, y) + c2 * dG.g2x(x, y);
        const gy = c1 * dG.g1y(x, y) + c2 * dG.g2y(x, y);
        const mx = Math.abs(c1) * dG.g1xm(x, y) + Math.abs(c2) * dG.g2xm(x, y);
        const my = Math.abs(c1) * dG.g1ym(x, y) + Math.abs(c2) * dG.g2ym(x, y);
        if (Math.abs(gx) > 1e-6 * (mx || 1) || Math.abs(gy) > 1e-6 * (my || 1))
          continue;
      }

      let mem = members.find(m => {
        const d = Math.abs(m.theta - theta);
        return Math.min(d, Math.PI - d) < 1e-6;
      });
      if (!mem) {
        const nrm = Math.hypot(a1, a2);
        const poly = g1.scale(a2 / nrm).sub(g2.scale(a1 / nrm));
        mem = {theta, poly, singPts: []};
        members.push(mem);
      }
      if (!mem.singPts.some(q => near(q, s))) mem.singPts.push(s);
    }

    return {members, basePts, pencil: [g1, g2]};
  }

  /******************************************************************
   * Presets
   ******************************************************************/

  const PRESETS = [
    {name: "Lines",                           basis: "1, x, y"},
    {name: "Circles",                         basis: "x^2+y^2, x, y, 1"},
    {name: "General conic sections",          basis: "1, x, y, x^2, x y, y^2"},
    {name: "Elliptic curves, standard form",  basis: "1, x, y^2-x^3"},
    {name: "Elliptic curves, relaxed form",   basis: "1, x, y^2, x^3"},
    {name: "Elliptic curves, more relaxed",   basis: "y^2-x^3, x y, y, x^2, x, 1"},
    {name: "General cubics",                  basis: "1, x, y, x^2, x y, y^2, x^3, x^2 y, x y^2, y^3"},
  ];

  /******************************************************************
   * Controller
   ******************************************************************/

  class PolyBasisController {
    /**
     * ids: {board, preset, basisInput, basisForm, randomize, equation, message}
     */
    constructor(ids, opts = {}) {
      this.ids = ids;
      this.bnd = opts.bound || 2;
      this.initialPreset = opts.preset !== undefined ? opts.preset : 3;

      this.basis = [];        // array of Poly
      this.basisFns = [];     // compiled evaluators
      this.points = [];       // JSXGraph points
      this.singularElems = [];  // singular locus overlay elements
      this.coeffs = [];
      this.degenerate = true;

      this.f = () => 1;       // current curve function
      this.dfx = () => 0;
      this.dfy = () => 0;

      this.setupBoard();
      this.setupControls();

      const sel = this.presetSelect;
      sel.selectedIndex = this.initialPreset;
      this.basisInput.value = PRESETS[this.initialPreset].basis;
      this.applyBasis();
    }

    setupBoard() {
      const b = this.bnd;
      this.board = JXG.JSXGraph.initBoard(this.ids.board, {
        boundingbox: [-b, b, b, -b],
        keepaspectratio: true,
        axis: false,
        grid: true,
        pan: {enabled: false},
        zoom: {enabled: false},
        showNavigation: false,
        showCopyright: false,
      });

      this.board.create('axis', [[0, 0], [1, 0]], {
        name: 'x', withLabel: true,
        ticks: {minorTicks: 1, majorHeight: 10, minorHeight: 4},
        label: {position: 'rt', offset: [-15, 15]},
      });
      this.board.create('axis', [[0, 0], [0, 1]], {
        name: 'y', withLabel: true,
        ticks: {minorTicks: 1, majorHeight: 10, minorHeight: 4},
        label: {position: 'rt', offset: [15, -5]},
      });

      const ctrl = this;
      // NB: JSXGraph interprets 3 parents [f, a, b] as [f, rangex, rangey],
      // so to supply analytic derivatives we must use the 5-parent form
      // [f, dfx, dfy, rangex, rangey].  The ranges track the visible board
      // (plus a small margin), like the default domain does.
      const margin = 0.5;
      const bbox = () => this.board.getBoundingBox();
      this.curve = this.board.create('implicitcurve', [
        (x, y) => ctrl.f(x, y),
        (x, y) => ctrl.dfx(x, y),
        (x, y) => ctrl.dfy(x, y),
        () => { const b = bbox(); return [b[0] - margin, b[2] + margin]; },
        () => { const b = bbox(); return [b[3] - margin, b[1] + margin]; },
      ], {
        strokeColor: '#1f5fbf',
        strokeWidth: 2.5,
        highlight: false,
        fixed: true,
        resolution_outer: 20,
        resolution_inner: 20,
      });

      // Recompute the polynomial right before the curve is re-traced,
      // so the curve always reflects the current point positions.
      const origUpdate = this.curve.updateDataArray;
      this.curve.updateDataArray = function() {
        ctrl.recompute();
        origUpdate.call(this);
      };
    }

    setupControls() {
      const $ = id => document.getElementById(id);
      this.presetSelect = $(this.ids.preset);
      this.basisInput = $(this.ids.basisInput);
      this.basisForm = $(this.ids.basisForm);
      this.randomizeBtn = $(this.ids.randomize);
      this.equationDiv = $(this.ids.equation);
      this.messageDiv = $(this.ids.message);

      this.presetSelect.innerHTML = "";
      PRESETS.forEach((p, i) => {
        const o = document.createElement("option");
        o.value = i;
        o.textContent = p.name;
        this.presetSelect.appendChild(o);
      });
      const custom = document.createElement("option");
      custom.value = "custom";
      custom.textContent = "Custom";
      this.presetSelect.appendChild(custom);

      this.presetSelect.addEventListener("change", () => {
        const v = this.presetSelect.value;
        if (v === "custom") {
          this.basisInput.focus();
          return;
        }
        this.basisInput.value = PRESETS[+v].basis;
        this.applyBasis();
      });

      this.basisForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const i = PRESETS.findIndex(p => p.basis === this.basisInput.value.trim());
        this.presetSelect.value = i >= 0 ? String(i) : "custom";
        this.applyBasis();
      });

      this.randomizeBtn.addEventListener("click", () => this.randomizePoints());

      this.singularCheckbox = this.ids.singular ? $(this.ids.singular) : null;
    }

    setMessage(msg) {
      this.messageDiv.textContent = msg || "";
      this.messageDiv.style.display = msg ? "" : "none";
    }

    applyBasis() {
      let basis;
      try {
        basis = parseBasis(this.basisInput.value);
      } catch (e) {
        this.setMessage(e.message);
        return;
      }
      this.setMessage("");

      this.basis = basis;
      this.basisFns = basis.map(p => p.compile());

      this.board.suspendUpdate();
      this.teardownPoints();
      this.setupPoints(basis.length - 1);
      this.board.unsuspendUpdate();
    }

    randomCoord() {
      return 2 * Math.random() - 1;
    }

    setupPoints(n) {
      for (let k = 0; k < n; k++) {
        const p = this.board.create('point', [this.randomCoord(), this.randomCoord()], {
          name: "", size: 4, strokeColor: '#c00', fillColor: '#e33',
          showInfobox: false,
        });
        p.on('down', () => this.showSingularLocus(p));
        p.on('up', () => this.clearSingularLocus());
        this.points.push(p);
      }
    }

    teardownPoints() {
      this.clearSingularLocus();
      for (const p of this.points) this.board.removeObject(p);
      this.points = [];
    }

    randomizePoints() {
      this.clearSingularLocus();
      this.board.suspendUpdate();
      for (const p of this.points)
        p.setPosition(JXG.COORDS_BY_USER, [this.randomCoord(), this.randomCoord()]);
      this.board.unsuspendUpdate();
    }

    /**
     * While point p is grabbed, show the locus of positions for p which
     * make the curve singular: the singular members of the pencil of
     * curves through the other points.  Also mark the singular points.
     */
    showSingularLocus(p) {
      this.clearSingularLocus();
      if (!this.singularCheckbox || !this.singularCheckbox.checked) return;

      const fixed = this.points.filter(q => q !== p).map(q => [q.X(), q.Y()]);
      const bb = this.board.getBoundingBox();
      const w = bb[2] - bb[0], h = bb[1] - bb[3];
      // Search for singular points in a region larger than the view
      const searchBox = [bb[0] - w, bb[1] + h, bb[2] + w, bb[3] - h];
      // Trace the members slightly beyond the view
      const m = 0.05 * w;
      const viewBox = [bb[0] - m, bb[1] + m, bb[2] + m, bb[3] - m];
      const plotOpts = {unitX: this.board.unitX, unitY: this.board.unitY};

      let res;
      const t0 = performance.now();
      try {
        res = singularMembers(this.basis, fixed, searchBox, plotOpts);
      } catch (e) {
        console.warn("Singular locus computation failed:", e);
        return;
      }
      if (!res) return;

      this.board.suspendUpdate();
      for (const mem of res.members) {
        // Trace once; the member doesn't change while p is dragged
        const X = [], Y = [];
        for (const piece of traceZeroSet(mem.poly, viewBox, plotOpts)) {
          for (const [x, y] of piece) { X.push(x); Y.push(y); }
          X.push(NaN); Y.push(NaN);
        }
        this.singularElems.push(this.board.create('curve', [X, Y], {
          strokeColor: '#f08a8a', strokeWidth: 2, dash: 2,
          highlight: false, fixed: true, layer: 2,
        }));
        for (const [x, y] of mem.singPts) {
          if (x < bb[0] || x > bb[2] || y < bb[3] || y > bb[1]) continue;
          this.singularElems.push(this.board.create('point', [x, y], {
            name: "", face: "x", size: 4, strokeColor: '#d04040',
            fixed: true, highlight: false, showInfobox: false, layer: 2,
          }));
        }
      }
      this.board.unsuspendUpdate();
      console.log("Singular locus: " + res.members.length + " members in " +
                  (performance.now() - t0).toFixed(1) + "ms");
    }

    clearSingularLocus() {
      if (!this.singularElems.length) return;
      this.board.suspendUpdate();
      for (const el of this.singularElems) this.board.removeObject(el);
      this.singularElems = [];
      this.board.unsuspendUpdate();
    }

    /**
     * Recompute f = sum_i c_i p_i from the current points.
     */
    recompute() {
      if (this.basis.length === 0 || this.points.length !== this.basis.length - 1)
        return;

      const pts = this.points.map(p => [p.X(), p.Y()]);
      const {coeffs, degenerate} = sysDetCoeffs(this.basisFns, pts);
      this.coeffs = coeffs;
      this.degenerate = degenerate;

      if (degenerate) {
        this.f = () => 1;
        this.dfx = () => 0;
        this.dfy = () => 0;
      } else {
        let f = new Poly();
        this.basis.forEach((p, i) => { f = f.addScaled(p, coeffs[i]); });
        // Drop numerically-zero terms from cancellation between basis elements
        let maxC = 0;
        for (const c of f.terms.values()) maxC = Math.max(maxC, Math.abs(c));
        for (const [k, c] of f.terms) if (Math.abs(c) < 1e-13 * maxC) f.terms.delete(k);

        this.fPoly = f;
        this.f = f.compile();
        this.dfx = f.derive(0).compile();
        this.dfy = f.derive(1).compile();
      }

      this.updateEquation();
    }

    updateEquation() {
      if (!this.equationDiv) return;
      if (this.degenerate) {
        this.equationDiv.innerHTML =
          "<em>Points are not in general position: no unique curve.</em>";
        return;
      }
      let s = "";
      let first = true;
      this.basis.forEach((p, i) => {
        const c = this.coeffs[i];
        const neg = c < 0;
        const a = Math.abs(c).toFixed(2);
        if (first) s += neg ? "−" : "";
        else s += neg ? " − " : " + ";
        first = false;

        const cv = p.constantValue();
        if (cv === 1) {
          s += a;
        } else {
          const ph = p.label || p.toHTML();
          s += a + " " + (p.terms.size > 1 ? "(" + ph + ")" : ph);
        }
      });
      this.equationDiv.innerHTML = "0 = " + s;
    }
  }

  PolyBasisController.Poly = Poly;
  PolyBasisController.parsePoly = parsePoly;
  PolyBasisController.parseBasis = parseBasis;
  PolyBasisController.sourceToHTML = sourceToHTML;
  PolyBasisController.sysDetCoeffs = sysDetCoeffs;
  PolyBasisController.PRESETS = PRESETS;
  PolyBasisController.nullSpace = nullSpace;
  PolyBasisController.singularMembers = singularMembers;

  root['PolyBasisController'] = PolyBasisController;

})(this);
