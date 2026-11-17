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

  /******************************************************************
   * Dual curve
   *
   * We draw the dual in the same plane via polar reciprocity in the unit
   * circle: the point (a, b) represents the line  a x + b y = 1.
   *
   * Parametrize that line projectively as  X(s,t) = s A + t B  with
   * A = (a, b, a^2+b^2) (the foot of the perpendicular from the origin)
   * and B = (-b, a, 0) (its point at infinity).  Restricting the degree-d
   * homogenization of f gives a binary form Q(s,t) of degree d, and the
   * line is tangent iff Q has a repeated root, i.e. iff
   *   Disc(Q)  ~  Res(Q_s, Q_t) = 0 .
   * Working with binary forms (formal degree d) means lines in asymptotic
   * directions, where the affine restriction drops degree, are handled
   * correctly.  We divide by a positive normalization (|q|^2)^(d-1) so
   * the function stays O(1); this doesn't change its zero set or signs.
   ******************************************************************/

  const BINOM = (() => {
    const B = [[1]];
    for (let n = 1; n <= 40; n++) {
      B.push([1]);
      for (let k = 1; k < n; k++) B[n].push(B[n - 1][k - 1] + B[n - 1][k]);
      B[n].push(1);
    }
    return B;
  })();

  /**
   * Coefficients q[0..d] of Q(1, t) = sum_k q_k t^k for the line (a, b),
   * where terms = [[i, j, c], ...] are the terms of f, of degree <= d.
   */
  function lineRestriction(terms, d, a, b, q) {
    q.fill(0);
    const r = a * a + b * b;
    const u = new Float64Array(d + 1), w = new Float64Array(d + 1);
    for (const [i, j, c] of terms) {
      // (a - b t)^i
      for (let k = 0; k <= i; k++)
        u[k] = BINOM[i][k] * Math.pow(a, i - k) * Math.pow(-b, k);
      // (b + a t)^j
      for (let l = 0; l <= j; l++)
        w[l] = BINOM[j][l] * Math.pow(b, j - l) * Math.pow(a, l);
      const cz = c * Math.pow(r, d - i - j);
      for (let k = 0; k <= i; k++)
        for (let l = 0; l <= j; l++)
          q[k + l] += cz * u[k] * w[l];
    }
    return q;
  }

  /**
   * Value of the dual function given the coefficients q[0..d] of Q.
   * S is scratch space: an array of 2m Float64Arrays of length 2m.
   */
  function dualFromQ(q, d, S) {
    const m = d - 1;
    let norm = 0;
    for (let k = 0; k <= d; k++) norm += q[k] * q[k];
    if (norm === 0) return 1;
    // Sylvester matrix of Q_s and Q_t, as forms of degree m
    // (coefficients of s^(m-k) t^k)
    for (let i = 0; i < 2 * m; i++) S[i].fill(0);
    for (let i = 0; i < m; i++)
      for (let k = 0; k <= m; k++) {
        S[i][i + k] = (d - k) * q[k];
        S[m + i][i + k] = (k + 1) * q[k + 1];
      }
    return detInPlace(S) / Math.pow(norm, m);
  }

  function sylvesterScratch(d) {
    const n = 2 * (d - 1);
    return Array.from({length: n}, () => new Float64Array(n));
  }

  /**
   * Straightforward version of dualFunction (expands Q at each (a, b)).
   * Kept as a reference for testing.
   */
  function dualFunctionDirect(f) {
    const d = f.degree();
    if (!(d >= 2)) return null;
    const terms = f.sortedTerms();
    const q = new Float64Array(d + 1), S = sylvesterScratch(d);
    return (a, b) => dualFromQ(lineRestriction(terms, d, a, b, q), d, S);
  }

  /**
   * Return a function (a, b) => value whose zero set is the dual of the
   * curve f = 0 (in the polar-reciprocal picture), or null if deg f < 2.
   *
   * For speed, each coefficient q_k of Q is expanded once as a polynomial
   * in (a, b) (stored in a Poly, with a, b in the x, y slots).
   */
  function dualFunction(f) {
    const d = f.degree();
    if (!(d >= 2)) return null;

    const qPolys = Array.from({length: d + 1}, () => new Poly());
    const r = Poly.monomial(2, 0).add(Poly.monomial(0, 2));   // a^2 + b^2
    const rPow = [Poly.constant(1)];
    for (let p = 1; p <= d; p++) rPow.push(rPow[p - 1].mul(r));

    for (const [i, j, c] of f.sortedTerms()) {
      for (let k = 0; k <= i; k++) {
        // (a - b t)^i  ->  C(i,k) a^(i-k) (-b)^k t^k
        const ck = BINOM[i][k] * (k % 2 ? -1 : 1);
        for (let l = 0; l <= j; l++) {
          // (b + a t)^j  ->  C(j,l) b^(j-l) a^l t^l
          const coef = c * ck * BINOM[j][l];
          const mono = Poly.monomial(i - k + l, k + j - l, coef);
          qPolys[k + l] = qPolys[k + l].add(mono.mul(rPow[d - i - j]));
        }
      }
    }

    const qFns = qPolys.map(p => p.compile());
    const q = new Float64Array(d + 1), S = sylvesterScratch(d);
    return function(a, b) {
      for (let k = 0; k <= d; k++) q[k] = qFns[k](a, b);
      return dualFromQ(q, d, S);
    };
  }

  /**
   * Map a traced curve f = 0 (polyline X, Y with NaN separators) to its
   * dual, point by point:  p  ->  grad f(p) / (p . grad f(p)),  the pole
   * of the tangent line at p.  Segments whose images are longer than tol
   * are subdivided, projecting midpoints back onto the curve.  This draws
   * cusps of the dual (images of inflection points) sharply, which a grid
   * method can't.  Pieces are broken where the image leaves the clip
   * region |a|, |b| < clip (tangent lines near the origin) or at singular
   * points of the curve.  view is the half-width of the visible region;
   * outside it the subdivision tolerance is relaxed.
   */
  function dualOfTracedCurve(X, Y, F, Fx, Fy, view, clip, tol = 0.01, maxDepth = 12) {
    const project = (x, y) => {
      for (let it = 0; it < 4; it++) {
        const gx = Fx(x, y), gy = Fy(x, y), n = gx * gx + gy * gy;
        if (!(n > 0)) break;
        const v = F(x, y) / n;
        x -= v * gx; y -= v * gy;
      }
      return [x, y];
    };
    // Dual image of p, or null if undefined / outside the clip region
    const img = (p) => {
      const gx = Fx(p[0], p[1]), gy = Fy(p[0], p[1]);
      const den = p[0] * gx + p[1] * gy;
      if (!(Math.hypot(gx, gy) > 1e-9) || den === 0) return null;
      const D = [gx / den, gy / den];
      if (!(Math.abs(D[0]) < clip && Math.abs(D[1]) < clip)) return null;
      return {D, s: Math.sign(den)};
    };

    const DX = [], DY = [];
    let open = false;   // is there an unfinished output polyline?
    const brk = () => { if (open) { DX.push(NaN); DY.push(NaN); open = false; } };
    const put = (D) => { DX.push(D[0]); DY.push(D[1]); open = true; };

    // Allowed chord length: tol inside the view, growing outside it
    const tolAt = (D) => {
      const r = Math.max(Math.abs(D[0]), Math.abs(D[1])) / view;
      return r <= 1 ? tol : tol * r * r * r;
    };

    // Emit the image of the curve segment p -> q (image of p already put)
    const segment = (p, q, ip, iq, depth) => {
      // Both ends outside the clip region (or undefined): nothing to draw
      if (!ip && !iq) { brk(); return; }
      const far = ip && iq && Math.hypot(ip.D[0] - iq.D[0], ip.D[1] - iq.D[1]) >
                  Math.min(tolAt(ip.D), tolAt(iq.D));
      const needSplit = !ip || !iq || ip.s !== iq.s || far;
      if (needSplit && depth < maxDepth &&
          Math.hypot(q[0] - p[0], q[1] - p[1]) > 1e-9) {
        const m = project(0.5 * (p[0] + q[0]), 0.5 * (p[1] + q[1]));
        const im = img(m);
        segment(p, m, ip, im, depth + 1);
        if (im && !open) put(im.D);
        segment(m, q, im, iq, depth + 1);
        return;
      }
      if (!ip || !iq || ip.s !== iq.s) { brk(); if (iq) put(iq.D); return; }
      if (!open) put(ip.D);
      put(iq.D);
    };

    let prev = null, iprev = null;
    for (let k = 0; k < X.length; k++) {
      if (isNaN(X[k]) || isNaN(Y[k])) { brk(); prev = null; continue; }
      const p = [X[k], Y[k]], ip = img(p);
      if (prev === null) {
        brk();
        if (ip) put(ip.D);
      } else {
        segment(prev, p, iprev, ip, 0);
      }
      prev = p; iprev = ip;
    }
    brk();
    return [DX, DY];
  }

  /**
   * Marching squares: the zero set of F over box = [xmin, ymax, xmax, ymin]
   * on an nx-by-ny grid of cells, as line segments [X, Y] separated by
   * NaNs.  Edge crossings are refined with a few steps of regula falsi.
   */
  function marchingSquares(F, box, nx, ny) {
    const [x0, y1, x1, y0] = box;
    const hx = (x1 - x0) / nx, hy = (y1 - y0) / ny;
    const V = new Float64Array((nx + 1) * (ny + 1));
    const idx = (i, j) => i * (ny + 1) + j;
    for (let i = 0; i <= nx; i++)
      for (let j = 0; j <= ny; j++)
        V[idx(i, j)] = F(x0 + i * hx, y0 + j * hy);

    // Root on the segment from p (value fp) to q (value fq)
    const root = (px, py, fp, qx, qy, fq) => {
      let a = 0, b = 1, fa = fp, fb = fq, side = 0;
      let t = fa / (fa - fb);
      for (let it = 0; it < 4; it++) {
        t = (a * fb - b * fa) / (fb - fa);
        const ft = F(px + t * (qx - px), py + t * (qy - py));
        if (ft === 0 || !isFinite(ft)) break;
        if (ft * fb > 0) { b = t; fb = ft; if (side === -1) fa /= 2; side = -1; }
        else { a = t; fa = ft; if (side === 1) fb /= 2; side = 1; }
      }
      return [px + t * (qx - px), py + t * (qy - py)];
    };

    const X = [], Y = [];
    const seg = (p, q) => { X.push(p[0], q[0], NaN); Y.push(p[1], q[1], NaN); };
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        const xa = x0 + i * hx, xb = xa + hx, ya = y0 + j * hy, yb = ya + hy;
        const f00 = V[idx(i, j)], f10 = V[idx(i + 1, j)];
        const f01 = V[idx(i, j + 1)], f11 = V[idx(i + 1, j + 1)];
        if (!(isFinite(f00) && isFinite(f10) && isFinite(f01) && isFinite(f11))) continue;
        // Crossings on the 4 edges: bottom, right, top, left
        const pts = [];
        if ((f00 < 0) !== (f10 < 0)) pts.push(root(xa, ya, f00, xb, ya, f10));
        if ((f10 < 0) !== (f11 < 0)) pts.push(root(xb, ya, f10, xb, yb, f11));
        if ((f11 < 0) !== (f01 < 0)) pts.push(root(xb, yb, f11, xa, yb, f01));
        if ((f01 < 0) !== (f00 < 0)) pts.push(root(xa, yb, f01, xa, ya, f00));
        if (pts.length === 2) {
          seg(pts[0], pts[1]);
        } else if (pts.length === 4) {
          // Saddle: decide the pairing by the sign at the center
          const fc = F(xa + 0.5 * hx, ya + 0.5 * hy);
          if ((fc < 0) === (f00 < 0)) { seg(pts[0], pts[1]); seg(pts[2], pts[3]); }
          else { seg(pts[0], pts[3]); seg(pts[1], pts[2]); }
        }
      }
    }
    return [X, Y];
  }

  /**
   * For a line f = 0 (degree 1), its dual point, or null if the line
   * passes through the origin (dual point at infinity).
   */
  function dualPointOfLine(f) {
    if (f.degree() !== 1) return null;
    const c0 = f.terms.get("0,0") || 0;
    const cx = f.terms.get("1,0") || 0, cy = f.terms.get("0,1") || 0;
    if (Math.abs(c0) <= 1e-12 * Math.hypot(cx, cy)) return null;
    return [-cx / c0, -cy / c0];
  }

  /**
   * All complex roots of the real polynomial sum_k c[k] t^k, by the
   * Durand-Kerner iteration.  Returns an array of [re, im].
   */
  function polyRoots(c) {
    let n = c.length - 1;
    let cmax = 0;
    for (const v of c) cmax = Math.max(cmax, Math.abs(v));
    while (n > 0 && Math.abs(c[n]) <= 1e-14 * cmax) n--;
    if (n < 1) return [];
    const a = [];
    for (let k = 0; k <= n; k++) a.push(c[k] / c[n]);   // monic
    // Initial guesses on a circle of the Cauchy bound radius
    let R = 0;
    for (let k = 0; k < n; k++) R = Math.max(R, Math.abs(a[k]));
    R = 1 + R;
    const zr = [], zi = [];
    for (let k = 0; k < n; k++) {
      const th = 2 * Math.PI * k / n + 0.4;
      zr.push(0.5 * R * Math.cos(th));
      zi.push(0.5 * R * Math.sin(th));
    }
    for (let it = 0; it < 500; it++) {
      let maxStep = 0;
      for (let k = 0; k < n; k++) {
        // p(z_k) by Horner
        let pr = 1, pi = 0;
        for (let m = n - 1; m >= 0; m--) {
          const tr = pr * zr[k] - pi * zi[k] + a[m];
          pi = pr * zi[k] + pi * zr[k];
          pr = tr;
        }
        // prod_{j != k} (z_k - z_j)
        let qr = 1, qi = 0;
        for (let j = 0; j < n; j++) {
          if (j === k) continue;
          const dr = zr[k] - zr[j], di = zi[k] - zi[j];
          const tr = qr * dr - qi * di;
          qi = qr * di + qi * dr;
          qr = tr;
        }
        const den = qr * qr + qi * qi;
        if (den === 0) { zr[k] += 1e-8 * R; continue; }
        const sr = (pr * qr + pi * qi) / den, si = (pi * qr - pr * qi) / den;
        zr[k] -= sr;
        zi[k] -= si;
        maxStep = Math.max(maxStep, Math.hypot(sr, si) / (1 + Math.hypot(zr[k], zi[k])));
      }
      if (maxStep < 1e-14) break;
    }
    return zr.map((r, k) => [r, zi[k]]);
  }

  /**
   * Move (x, y) onto the curve F = 0 by a few Newton steps along the
   * gradient.  Returns null if it fails to converge.
   */
  function projectToCurve(F, Fx, Fy, x, y, maxStep = Infinity) {
    for (let it = 0; it < 20; it++) {
      const v = F(x, y), gx = Fx(x, y), gy = Fy(x, y);
      const g2 = gx * gx + gy * gy;
      if (!(g2 > 0)) return null;
      let dx = v * gx / g2, dy = v * gy / g2;
      const step = Math.hypot(dx, dy);
      if (step > maxStep) { dx *= maxStep / step; dy *= maxStep / step; }
      x -= dx; y -= dy;
      if (step < 1e-13 * (1 + Math.hypot(x, y))) break;
    }
    const v = F(x, y), g = Math.hypot(Fx(x, y), Fy(x, y));
    return (isFinite(x) && isFinite(y) && Math.abs(v) <= 1e-8 * g * (1 + Math.hypot(x, y)))
      ? [x, y] : null;
  }

  /**
   * Dual point (in the polar-reciprocal picture) of the tangent line to
   * F = 0 at p, i.e. grad F / (p . grad F), or null if the tangent line
   * passes through the origin.
   */
  function dualPointAt(Fx, Fy, p) {
    const gx = Fx(p[0], p[1]), gy = Fy(p[0], p[1]);
    const dot = p[0] * gx + p[1] * gy;
    if (!(Math.abs(dot) > 1e-12 * Math.hypot(gx, gy) * (1 + Math.hypot(p[0], p[1]))))
      return null;
    return [gx / dot, gy / dot];
  }

  /**
   * Candidate points of tangency of the curve f = 0 with the line
   * a x + b y = 1: critical points of f restricted to the line (the line
   * is tangent where f has a double root).  Returns points [x, y].
   */
  function tangencyCandidates(f, a, b) {
    const d = f.degree();
    if (d < 2) return [];
    const q = lineRestriction(f.sortedTerms(), d, a, b, new Float64Array(d + 1));
    // dQ/dt
    const dq = [];
    for (let k = 1; k <= d; k++) dq.push(k * q[k]);
    const r = a * a + b * b;
    const out = [];
    for (const [t, ti] of polyRoots(dq)) {
      if (Math.abs(ti) > 0.1 * (1 + Math.abs(t))) continue;
      out.push([(a - t * b) / r, (b + t * a) / r]);
    }
    return out;
  }

  /**
   * Gradient of the degree-D homogenization of p, at the point at
   * infinity [c : s : 0].  Returns a function (c, s) => [dX, dY, dZ].
   */
  function gradAtInfinity(p, D) {
    const top = [], next = [];
    for (const [i, j, c] of p.sortedTerms()) {
      if (i + j === D) top.push([i, j, c]);
      else if (i + j === D - 1) next.push([i, j, c]);
    }
    return function(c, s) {
      let gx = 0, gy = 0, gz = 0;
      for (const [i, j, k] of top) {
        if (i > 0) gx += k * i * Math.pow(c, i - 1) * Math.pow(s, j);
        if (j > 0) gy += k * j * Math.pow(c, i) * Math.pow(s, j - 1);
      }
      for (const [i, j, k] of next) gz += k * Math.pow(c, i) * Math.pow(s, j);
      return [gx, gy, gz];
    };
  }

  /**
   * Members of the pencil lambda g1 + mu g2 (viewed as projective curves
   * of degree D) which are singular at a real point at infinity.
   *
   * At P = [cos phi : sin phi : 0], a member is singular iff its
   * (homogeneous) gradient vanishes, i.e. iff grad g1 and grad g2 are
   * linearly dependent at P.  We minimize the scale-invariant measure
   * r(phi) = |grad g1 x grad g2| / (|grad g1|^2 + |grad g2|^2) over phi.
   *
   * Returns [{theta, lambda, mu, phi}], with (lambda, mu) a unit vector.
   */
  function singularMembersAtInfinity(g1, g2, D, nSamples = 720, tol = 1e-8) {
    if (D < 1) return [];
    const G1 = gradAtInfinity(g1, D), G2 = gradAtInfinity(g2, D);
    const r = (phi) => {
      const c = Math.cos(phi), s = Math.sin(phi);
      const a = G1(c, s), b = G2(c, s);
      const cx = a[1] * b[2] - a[2] * b[1];
      const cy = a[2] * b[0] - a[0] * b[2];
      const cz = a[0] * b[1] - a[1] * b[0];
      const n = a[0] * a[0] + a[1] * a[1] + a[2] * a[2] +
                b[0] * b[0] + b[1] * b[1] + b[2] * b[2];
      return n === 0 ? 0 : Math.hypot(cx, cy, cz) / n;
    };

    // phi and phi + pi are the same point, so sample [0, pi) periodically
    const h = Math.PI / nSamples;
    const vals = [];
    for (let k = 0; k < nSamples; k++) vals.push(r(k * h));

    const out = [];
    for (let k = 0; k < nSamples; k++) {
      const vm = vals[(k + nSamples - 1) % nSamples], v0 = vals[k], vp = vals[(k + 1) % nSamples];
      if (!(v0 <= vm && v0 <= vp)) continue;

      // Golden-section refinement on [phi - h, phi + h]
      let lo = (k - 1) * h, hi = (k + 1) * h;
      const gr = (Math.sqrt(5) - 1) / 2;
      let x1 = hi - gr * (hi - lo), x2 = lo + gr * (hi - lo);
      let f1 = r(x1), f2 = r(x2);
      for (let it = 0; it < 100 && hi - lo > 1e-15; it++) {
        if (f1 < f2) { hi = x2; x2 = x1; f2 = f1; x1 = hi - gr * (hi - lo); f1 = r(x1); }
        else         { lo = x1; x1 = x2; f1 = f2; x2 = lo + gr * (hi - lo); f2 = r(x2); }
      }
      const phi = 0.5 * (lo + hi);
      if (r(phi) > tol) continue;

      // (lambda, mu) spans the null space of [grad g1, grad g2]: the
      // eigenvector of the smallest eigenvalue of the 2x2 Gram matrix
      const c = Math.cos(phi), s = Math.sin(phi);
      const a = G1(c, s), b = G2(c, s);
      const aa = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
      const bb = b[0] * b[0] + b[1] * b[1] + b[2] * b[2];
      const ab = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const ev = 0.5 * (aa + bb) - Math.hypot(0.5 * (aa - bb), ab);
      let v1 = [ab, ev - aa], v2 = [ev - bb, ab];
      let v = Math.hypot(...v1) >= Math.hypot(...v2) ? v1 : v2;
      if (Math.hypot(...v) === 0) v = aa <= bb ? [1, 0] : [0, 1];
      const nv = Math.hypot(...v);
      const lambda = v[0] / nv, mu = v[1] / nv;

      let theta = Math.atan2(mu, lambda);
      if (theta < 0) theta += Math.PI;
      if (theta >= Math.PI) theta -= Math.PI;
      if (out.some(o => Math.min(Math.abs(o.theta - theta), Math.PI - Math.abs(o.theta - theta)) < 1e-6))
        continue;
      out.push({theta, lambda, mu, phi: ((phi % Math.PI) + Math.PI) % Math.PI});
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

    // Members singular at a point at infinity (e.g. the line in the
    // family of circles, which is really line + line at infinity)
    const D = Math.max(...basis.map(p => p.degree()));
    for (const mi of singularMembersAtInfinity(g1, g2, D)) {
      let mem = members.find(m => {
        const d = Math.abs(m.theta - mi.theta);
        return Math.min(d, Math.PI - d) < 1e-6;
      });
      if (!mem) {
        const poly = g1.scale(mi.lambda).add(g2.scale(mi.mu));
        mem = {theta: mi.theta, poly, singPts: [], atInfinity: []};
        members.push(mem);
      }
      if (!mem.atInfinity) mem.atInfinity = [];
      mem.atInfinity.push(mi.phi);
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

      // Dual curve (created after this.curve, so it updates after it in
      // each board update and can use the freshly traced curve data)
      this.showDual = false;
      this.unitCircle = this.board.create('circle', [[0, 0], 1], {
        strokeColor: '#999', strokeWidth: 1, dash: 1,
        fixed: true, highlight: false, visible: false, hasInnerPoints: false,
      });
      this.dualCurve = this.board.create('curve', [[], []], {
        strokeColor: '#2a9d4b', strokeWidth: 2,
        fixed: true, highlight: false, visible: false,
      });
      this.dualCurve.updateDataArray = function() {
        const [X, Y] = ctrl.showDual ? ctrl.computeDual() : [[], []];
        this.dataX = X;
        this.dataY = Y;
      };

      this.setupHover();
    }

    /**
     * When the dual is shown, hovering over either curve highlights a
     * point p of the curve and the dual point q of its tangent line,
     * along with the tangent line at p (which is the line represented by
     * q) and the polar line of p (which is tangent to the dual at q).
     */
    setupHover() {
      const ctrl = this;
      // Hidden elements have NaN coordinates, so they aren't drawn; this
      // way they can be updated without a full board update.
      this.hover = {p: [NaN, NaN], q: [NaN, NaN], tan: [NaN, NaN, NaN]};
      const H = this.hover;
      const common = {fixed: true, highlight: false, showInfobox: false, name: ""};
      const lineOpts = Object.assign({}, common, {
        strokeWidth: 1.5, dash: 2, layer: 3, straightFirst: true, straightLast: true,
      });
      this.hoverElems = [
        // tangent line at p, which is the line represented by q
        this.board.create('line', [() => H.tan[0], () => H.tan[1], () => H.tan[2]],
          Object.assign({}, lineOpts, {strokeColor: '#1f5fbf'})),
        // polar line of p, tangent to the dual at q
        this.board.create('line', [() => -1, () => H.p[0], () => H.p[1]],
          Object.assign({}, lineOpts, {strokeColor: '#2a9d4b'})),
        this.board.create('point', [() => H.p[0], () => H.p[1]],
          Object.assign({}, common, {size: 5, strokeColor: '#fff', fillColor: '#1f5fbf', layer: 8})),
        this.board.create('point', [() => H.q[0], () => H.q[1]],
          Object.assign({}, common, {size: 5, strokeColor: '#fff', fillColor: '#2a9d4b', layer: 8})),
      ];

      this.board.on('move', function(evt, mode) {
        if (mode === ctrl.board.BOARD_MODE_DRAG) ctrl.setHover(null, null);
        else ctrl.onHoverMove(evt);
      });
      this.board.on('down', () => ctrl.setHover(null, null));
      this.board.containerObj.addEventListener('pointerleave', () => ctrl.setHover(null, null));
    }

    setHover(p, q) {
      const H = this.hover;
      const same = (u, v) => (u[0] === v[0] || (isNaN(u[0]) && isNaN(v[0]))) &&
                             (u[1] === v[1] || (isNaN(u[1]) && isNaN(v[1])));
      const P = p || [NaN, NaN], Q = q || [NaN, NaN];
      if (same(H.p, P) && same(H.q, Q)) return;
      H.p = P;
      H.q = Q;
      // Tangent line at p, as [c, a, b] for c + a x + b y = 0
      if (p) {
        const gx = this.dfx(p[0], p[1]), gy = this.dfy(p[0], p[1]);
        H.tan = [-(p[0] * gx + p[1] * gy), gx, gy];
      } else if (q) {
        H.tan = [-1, q[0], q[1]];
      } else {
        H.tan = [NaN, NaN, NaN];
      }
      for (const el of this.hoverElems) el.prepareUpdate().update().updateRenderer();
    }

    /**
     * Find which curve (if either) the mouse is near, and the dual pair.
     */
    onHoverMove(evt) {
      if (!this.showDual || this.degenerate || !this.fPoly) {
        this.setHover(null, null);
        return;
      }
      const [mx, my] = this.board.getUsrCoordsOfMouse(evt);
      const ux = this.board.unitX, uy = this.board.unitY;
      const tolPx = 8;

      // Nearest point (in pixels) on a NaN-separated polyline
      const nearest = (X, Y) => {
        let best = Infinity, bx = NaN, by = NaN;
        for (let k = 0; k + 1 < X.length; k++) {
          const x0 = X[k], y0 = Y[k], x1 = X[k + 1], y1 = Y[k + 1];
          if (isNaN(x0) || isNaN(x1) || isNaN(y0) || isNaN(y1)) continue;
          const ex = (x1 - x0) * ux, ey = (y1 - y0) * uy;
          const wx = (mx - x0) * ux, wy = (my - y0) * uy;
          const e2 = ex * ex + ey * ey;
          const t = e2 > 0 ? Math.max(0, Math.min(1, (wx * ex + wy * ey) / e2)) : 0;
          const d = Math.hypot(wx - t * ex, wy - t * ey);
          if (d < best) { best = d; bx = x0 + t * (x1 - x0); by = y0 + t * (y1 - y0); }
        }
        return {d: best, pt: [bx, by]};
      };

      const onCurve = nearest(this.curve.dataX || [], this.curve.dataY || []);
      const onDual = nearest(this.dualCurve.dataX || [], this.dualCurve.dataY || []);
      const F = this.f, Fx = this.dfx, Fy = this.dfy;
      const pxDist = (u, v) => Math.hypot((u[0] - v[0]) * ux, (u[1] - v[1]) * uy);

      if (onCurve.d <= tolPx && onCurve.d <= onDual.d) {
        const p = projectToCurve(F, Fx, Fy, onCurve.pt[0], onCurve.pt[1], 2 * tolPx / ux);
        if (p) { this.setHover(p, dualPointAt(Fx, Fy, p)); return; }
      } else if (onDual.d <= tolPx && this.fPoly.degree() >= 2) {
        // The point of tangency of the line q0 (approximately on the dual):
        // try each critical point of f along the line, snap it onto the
        // curve, and keep the one whose dual point is nearest q0.
        const q0 = onDual.pt;
        let best = null, bestD = Infinity;
        for (const c of tangencyCandidates(this.fPoly, q0[0], q0[1])) {
          const p = projectToCurve(F, Fx, Fy, c[0], c[1]);
          if (!p) continue;
          const q = dualPointAt(Fx, Fy, p);
          if (!q) continue;
          const d = pxDist(q, q0);
          if (d < bestD) { bestD = d; best = [p, q]; }
        }
        if (best && bestD <= 3 * tolPx) { this.setHover(best[0], best[1]); return; }
        // Point of tangency not found (e.g. it is very far away): still
        // show the dual point and the line it represents
        if (Math.hypot(q0[0], q0[1]) > 1e-9) { this.setHover(null, q0); return; }
      }
      this.setHover(null, null);
    }

    /**
     * Dual of the current curve, as polyline data [X, Y].  Combines the
     * point-by-point image of the traced curve (accurate, with sharp cusps)
     * with marching squares on the dual's implicit equation (which also
     * catches pieces coming from tangent lines outside the view, e.g.
     * asymptotes).  The dual of a line is a point, drawn as a small cross.
     */
    computeDual() {
      if (this.degenerate || !this.fPoly) return [[], []];
      const f = this.fPoly;
      const bb = this.board.getBoundingBox();
      const view = Math.max(Math.abs(bb[0]), Math.abs(bb[1]), Math.abs(bb[2]), Math.abs(bb[3]));

      if (f.degree() === 1) {
        const D = dualPointOfLine(f);
        if (!D) return [[], []];
        const h = 0.06 * view / 2;
        return [[D[0] - h, D[0] + h, NaN, D[0], D[0]],
                [D[1], D[1], NaN, D[1] - h, D[1] + h]];
      }

      const Fd = dualFunction(f);
      if (!Fd) return [[], []];
      const [PX, PY] = dualOfTracedCurve(this.curve.dataX || [], this.curve.dataY || [],
                                         this.f, this.dfx, this.dfy, view, 3 * view);
      const m = 0.02 * view;
      // Coarser grid while dragging (JSXGraph redraws at high quality on
      // release); the point-by-point part keeps the in-view detail sharp
      const nGrid = this.board.updateQuality === this.board.BOARD_QUALITY_LOW ? 70 : 120;
      const [MX, MY] = marchingSquares(Fd, [bb[0] - m, bb[1] + m, bb[2] + m, bb[3] - m], nGrid, nGrid);
      return [PX.concat([NaN], MX), PY.concat([NaN], MY)];
    }

    setShowDual(show) {
      this.showDual = !!show;
      this.dualCurve.setAttribute({visible: this.showDual});
      this.unitCircle.setAttribute({visible: this.showDual});
      if (!this.showDual) this.setHover(null, null);
      this.board.update();
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

      this.dualCheckbox = this.ids.dual ? $(this.ids.dual) : null;
      if (this.dualCheckbox) {
        this.dualCheckbox.addEventListener("change",
          () => this.setShowDual(this.dualCheckbox.checked));
        // Browsers may restore a checked state on reload
        if (this.dualCheckbox.checked) this.setShowDual(true);
      }
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
  PolyBasisController.dualFunction = dualFunction;
  PolyBasisController.dualFunctionDirect = dualFunctionDirect;
  PolyBasisController.marchingSquares = marchingSquares;
  PolyBasisController.dualOfTracedCurve = dualOfTracedCurve;
  PolyBasisController.dualPointOfLine = dualPointOfLine;
  PolyBasisController.polyRoots = polyRoots;
  PolyBasisController.tangencyCandidates = tangencyCandidates;

  root['PolyBasisController'] = PolyBasisController;

})(this);
