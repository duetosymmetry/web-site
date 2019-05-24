(function(root) {

  "use strict";

  function makeRootPointOnDrag(controller, j) {
    return function() {
      controller.roots[j].re = controller.rootPoints[j].X();
      controller.roots[j].im = controller.rootPoints[j].Y();

      controller.updatePolyCoeffsFromRoots();
      controller.updateCoeffView();
    };
  };

  function makeCoeffPointOnDrag(controller, j) {
    return function() {
      controller.coeffs[j].re = controller.coeffPoints[j].X();
      controller.coeffs[j].im = controller.coeffPoints[j].Y();

      controller.p = new Polynomial(controller.coeffs);

      controller.updateRootsFromPoly();
      controller.updateRootView();

      return; // Discriminant stuff is not ready for production

      // Beginning of discriminant roots code
      if (controller.showingDiscRoots) {
        // Somebody else already set this up, nothing to do
        return;
      } else {
        // Take care of the roots of the discriminant polynomial
        controller.showingDiscRoots = true;

        var nDiscRoots = controller.degree;
        if (j==0)
          nDiscRoots = nDiscRoots - 1;

        controller.discRootPoints = new Array(nDiscRoots);

        if (nDiscRoots == 0)
          return;

        var t0 = performance.now();
        var disc = controller.discriminantAsUnivariateOfCoeff(j).monic();
        var t1 = performance.now();

        console.log("Discriminant took "+(t1-t0)+"ms.");
        console.log(disc);

        var dRootResult = disc.complexRoots(controller.roots);
       // TODO CHECK FOR ERRORS

        console.log(dRootResult);

        for (var i=0; i<nDiscRoots; i++) {
          controller.discRootPoints[i] =
            controller.coeffbox.create(
              'point',
              [dRootResult.root[i].re, dRootResult.root[i].im],
              {name: "", face: "x", color: 'gray'});
        };
      };
    };
  };

  function makeCoeffPointOnUp(controller, j) {
    return function() {
      if (controller.showingDiscRoots) {
        // Tear down the discriminant root points
        for (var p in controller.discRootPoints) {
          controller.coeffbox.removeObject(controller.discRootPoints[p]);
        }
        controller.discRootPoints = [];
        controller.showingDiscRoots = false;
        return;
      } else {
        // Not sure how we can get here
        return;
      }
    };
  };

  /**
   * TODO Document this
   */
  function SylvesterMatrix(p1, p2) {
    var n1 = p1.degree(), n2 = p2.degree();
    var p1a = p1.coeffArray(), p2a = p2.coeffArray();

    var d = n1+n2;

    var s = new Array(d);

    for (var i=0; i<n2; i++) {
      s[i] = new Array(d);
      for (var j=0; j<i; j++)
        s[i][j] = 0;
      for (var j=i; j<i+n1+1; j++)
        s[i][j] = p1a[n1-j+i];
      for (var j=i+n1+1; j<d; j++)
        s[i][j] = 0;
    };

    for (var i=n2; i<d; i++) {
      s[i] = new Array(d);
      for (var j=0; j<i-n2; j++)
        s[i][j] = 0;
      for (var j=i-n2; j<i+1; j++)
        s[i][j] = p2a[i-j];
      for (var j=i+1; j<d; j++)
        s[i][j] = 0;
    };

    return s;
  }

  /**
   * Return the (i,j) minor matrix
   */
  function MinorMatrix(mat, i, j) {
    var dim = mat.length;

    var rowRemoved = mat.slice(0,i).concat(mat.slice(i+1, dim));
    var colRemoved = rowRemoved.map( r =>
                                     r.slice(0,j).concat(r.slice(j+1, dim)));

    return colRemoved;
  };

  /**
   * TODO Document this.
   * Compute the determinant of some square matrix (array of arrays)
   * as a Polynomial() object.
   * Use minor expansion.
   * TODO: MINOR EXPANSION IS HELLA SLOW, USE GAUSSIAN ELIMINATION INSTEAD
   * Explicitly skip over terms that are 0.
   * This is an optimization because I'm only going to use this
   * function for computing the discriminant from the Sylvester matrix.
   */
  function PolyDeterminant(mat) {
    var dim = mat.length;

    // TODO: Hardcode more low dimensional cases
    if (dim == 1)
      return Polynomial(mat[0][0]);

    // Because of the structure of the Sylvester matrix, it's going
    // to be more efficient to perform the minor expansion down the
    // first column, where all but two entries are 0.
    var result = Polynomial(Complex(0.));
    for (var i=0; i<dim; i++) {
      if (mat[i][0] == 0)
        continue;

      var summand = Polynomial(mat[i][0]);
      summand = summand.mul( PolyDeterminant( MinorMatrix(mat, i, 0) ) );

      if (!(i%2)) {
        result = result.add(summand);
      } else {
        result = result.sub(summand);
      };
    };

    return result;
  };

  function PolyRootController(rootboxName, coeffboxName, degreeInputName) {

    if (!(this instanceof PolyRootController)) {
      return new PolyRootController(rootboxName, coeffboxName, degreeInputName);
    }

    // Only care about complex numbers
    Polynomial.setField("C");

    this.setupBoxes(rootboxName, coeffboxName);

    this.setupDegreeInput(degreeInputName);

    // Fire the input handler to set up
    this.degreeInput.oninput();
  };

  PolyRootController.prototype = {
    'degree': 0,
    'degreeInput': {},
    'roots' : [],
    'coeffs': [],
    'p': {},
    'rootbox': {},
    'rootPoints': [],
    'coeffbox': {},
    'coeffPoints': [],

    'keepHist': false,
    'iterHist': {},

    'showingDiscRoots': false,
    'discRootPoints': [],

    'updateEquation': function() {
      var formula_pieces = [];
      // Degree zero is just the coefficient.
      formula_pieces.push("a0");
      // Lower degrees have a coefficient ai and x^i.
      for (var i = 1; i < this.degree; i++) {
        formula_pieces.push("a" + i + " x^" + i);
      }
      // The higest-degree term has a coefficient of 1.
      formula_pieces.push("x^" + this.degree);
      document.getElementById('equationBox').innerHTML = formula_pieces.join(" + ");
      // TODO: Use escaping and the try toLatex();
      // If we want to show the actual formula with coefficients, it's easy but ugly:
      // document.getElementById('equationBox').innerHTML = this.p.toString();
    },

    'updatePolyCoeffsFromRoots': function() {
      this.degree = this.roots.length;
      this.p = Polynomial.fromRoots(this.roots);
      this.coeffs = this.p.coeffArray();
    },

    'updateRootsFromPoly': function() {
      var result = this.p.complexRoots(this.roots);
      // TODO Do some error checking here?!

      if (this.keepHist) {
        var iter = result.iter;

        if (this.iterHist.hasOwnProperty(iter)) {
          this.iterHist[iter] = this.iterHist[iter] + 1;
        } else {
          this.iterHist[iter] = 1;
        }

      }

      this.roots = result.root;
    },

    'updateRootView': function() {
      this.rootbox.suspendUpdate();
      for (var i=0; i<this.degree; i++) {
        this.rootPoints[i].setPosition(
          JXG.COORDS_BY_USER, [this.roots[i].re, this.roots[i].im]);
      }
      this.rootbox.unsuspendUpdate();
    },

    'updateCoeffView': function() {
      this.coeffbox.suspendUpdate();
      for (var i=0; i<this.degree; i++) {
        this.coeffPoints[i].setPosition(
          JXG.COORDS_BY_USER, [this.coeffs[i].re, this.coeffs[i].im]);
      }
      this.coeffbox.unsuspendUpdate();
    },

    'setupBoxes': function(rootboxName, coeffboxName) {
      var baseOpts = {
        boundingbox: [-2, 2, 2, -2],
        keepaspectratio: true,
        axis: false,
        grid: true,
        pan: {enabled: false},
        showNavigation: true,
        showCopyright:  false};

      this.rootbox  = JXG.JSXGraph.initBoard(rootboxName, baseOpts);
      this.coeffbox = JXG.JSXGraph.initBoard(coeffboxName, baseOpts);

      this.rootbox.create('axis', [[0, 0], [1,0]],
        { name:'Re[z]',
			    withLabel: true,
          ticks: {minorTicks:1, majorHeight:10, minorHeight:4},
			    label: { position: 'rt',
					         offset: [-25, 20], }
			  });
      this.rootbox.create('axis', [[0, 0], [0,1]],
        { name:'Im[z]',
			    withLabel: true,
          ticks: {minorTicks:1, majorHeight:10, minorHeight:4},
			    label: { position: 'rt',
					         offset: [20, 0], }
			  });

      // This is a dumb hack to fix the label relative to the screen instead of axes.
      // Did I mention how much I hate JS's scoping?
      this.rootbox.create(
        'text',
        [(function (box) { return function(){ return box.getBoundingBox()[0];}; })(this.rootbox),
         (function (box) { return function(){ return box.getBoundingBox()[1];}; })(this.rootbox),
         'Roots'],
        {anchorX: 'left', anchorY: 'top',
         cssClass: 'myBoxTitle', highlightCssClass: 'myBoxTitle',
         fontSize: 14});

      this.coeffbox.create('axis', [[0, 0], [1,0]],
        { name:'Re[a<sub>i</sub>]',
			    withLabel: true,
          ticks: {minorTicks:1, majorHeight:10, minorHeight:4},
			    label: { position: 'rt',
					         offset: [-25, 20], }
			  });
      this.coeffbox.create('axis', [[0, 0], [0,1]],
        { name:'Im[a<sub>i</sub>]',
			    withLabel: true,
          ticks: {minorTicks:1, majorHeight:10, minorHeight:4},
			    label: { position: 'rt',
					         offset: [20, 0], }
			  });
      this.coeffbox.create(
        'text',
        [(function (box) { return function(){ return box.getBoundingBox()[0];}; })(this.coeffbox),
         (function (box) { return function(){ return box.getBoundingBox()[1];}; })(this.coeffbox),
         'Coefficients'],
        {anchorX: 'left', anchorY: 'top',
         cssClass: 'myBoxTitle', highlightCssClass: 'myBoxTitle',
         fontSize: 14});
    },

    'setDegreeFromView': function() {
      this.degree = parseInt( this.degreeInput.value, 10);
      if (isNaN(this.degree))
        this.degree = 4;
    },

    'setupDegreeInput': function(degreeInputName) {
      this.degreeInput = document.getElementById(degreeInputName);
      this.degreeInput.oninput =
        (function(controller) {
          return function() {
            controller.teardownPoints();

            controller.setDegreeFromView();

            controller.setupRandomRoots();
            controller.updatePolyCoeffsFromRoots();

            controller.setupPoints();

            controller.updateRootView();
            controller.updateCoeffView();
            controller.updateEquation();
          };
        })(this);
    },

    'setupRandomRoots': function() {
      var eps = 0.1;
      var n = this.degree;

      this.roots = new Array(n);
      for (var j=0; j<n; j++) {
        this.roots[j] = Complex.I.mul(2.*Math.PI*j/n).exp();
        this.roots[j] = this.roots[j].add(Complex(Math.random(), Math.random()).mul(eps));
      }
    },

    'setupPoints': function() {
      for (var i=0; i<this.degree; i++) {
        this.rootPoints[i] =
          this.rootbox.create('point', [0,0], {name: ""});

        this.coeffPoints[i] =
          this.coeffbox.create('point', [0,0], {name: "a<sub>"+i+"</sub>"});

        this.rootPoints[i].on('drag', makeRootPointOnDrag(this, i));
        this.coeffPoints[i].on('drag', makeCoeffPointOnDrag(this, i));
        // this.coeffPoints[i].on('up', makeCoeffPointOnUp(this, i));
      }
    },

    'teardownPoints': function() {
      for (var i=0; i<this.degree; i++) {
        this.rootbox.removeObject(this.rootPoints[i]);
        this.coeffbox.removeObject(this.coeffPoints[i]);
      };
      this.rootPoints = [];
      this.coeffPoints = [];
    },

    'startKeepingHist': function() {
      this.iterHist = {};
      this.keepHist = true;
    },

    'stopKeepingHist': function() {
      this.keepHist = false;
    },

    /**
     * TODO Document this
     * view the discriminant as a univariate polynomial in coefficient
     * a[j], holding all other coefficients constant
     */
    'discriminantAsUnivariateOfCoeff': function(j) {
      var SylvM = SylvesterMatrix(this.p, this.p.derive(1));
      var n = this.degree;
      var px = Polynomial("x");
      var pjx = px.mul(Complex(j));

      // replace the appropriate slots in SylvM with px or pjx
      for (var i=0; i<n-1; i++)
        SylvM[i][i + n - j] = px;
      if (j>0) {
        for (var i=n-1; i<(n * 2 - 1); i++)
          SylvM[i][i+1 - j] = pjx;
      }

      return PolyDeterminant(SylvM);
    },
  };

  PolyRootController.SylvesterMatrix = SylvesterMatrix;
  PolyRootController.MinorMatrix = MinorMatrix;
  PolyRootController.PolyDeterminant = PolyDeterminant;

  root['PolyRootController'] = PolyRootController;

})(this);
