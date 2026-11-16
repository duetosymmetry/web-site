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
      this.curve = this.board.create('implicitcurve', [
        (x, y) => ctrl.f(x, y),
        (x, y) => ctrl.dfx(x, y),
        (x, y) => ctrl.dfy(x, y),
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
        this.points.push(p);
      }
    }

    teardownPoints() {
      for (const p of this.points) this.board.removeObject(p);
      this.points = [];
    }

    randomizePoints() {
      this.board.suspendUpdate();
      for (const p of this.points)
        p.setPosition(JXG.COORDS_BY_USER, [this.randomCoord(), this.randomCoord()]);
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
          const ph = p.toHTML();
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

  root['PolyBasisController'] = PolyBasisController;

})(this);
