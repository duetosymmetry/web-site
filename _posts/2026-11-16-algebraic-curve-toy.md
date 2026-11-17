---
title: Real algebraic curves toy
categories: [tool]
excerpt: Interactive toy for drawing plane curves through points, from a chosen basis of polynomials
tags: [interactive, algebra, polynomial, algebraic geometry]
date: 2026-11-16
jsxgraph: true
published: true
unlisted: true
pinned: false
---

<!------------------------------------------------------------>

<style>
.curvebox {
width: 400px;
height: 400px;
max-width: 100%;
margin-bottom: 1em;
}

.curveControls div {
margin-bottom: 0.5em;
}

.curveControls input[type="text"] {
width: 22em;
max-width: 100%;
font-family: monospace;
}

.curveEqn {
margin-bottom: 1em;
font-size: 0.9em;
}

.curveMsg {
color: #b00;
font-size: 0.9em;
margin-bottom: 0.5em;
}

.myLabel {
display: inline-block;
}

</style>

Grab the red dots and play around! Or jump to the
[explanation](#explanation), or [try this](#things-to-try).

<div id="curvebox" class="jxgbox curvebox"></div>

<div id="curveEqn" class="curveEqn"></div>

<form id="basisForm" class="curveControls">
<div>
<label for="basisPreset">Family of curves:</label>
<select id="basisPreset"></select>
</div>
<div>
<label for="basisInput">Basis polynomials (comma-separated, change me!):</label><br>
<input type="text" id="basisInput" autocomplete="off" spellcheck="false">
<input type="submit" value="Apply">
</div>
<div id="basisMsg" class="curveMsg" style="display: none"></div>
<div>
<input type="checkbox" id="viewSingular">
<label for="viewSingular" class="myLabel">View singular locus while dragging?</label>
</div>
<div>
<input type="button" id="randomizeBtn" value="Randomize points">
</div>
</form>

<!------------------------------------------------------------>
<!-- CODE -->

<script type="text/javascript" src="{{ site.url }}/assets/js/poly-basis-toy.js"></script>

<script type="text/javascript">
  var controller = new PolyBasisController({
    board: "curvebox",
    preset: "basisPreset",
    basisInput: "basisInput",
    basisForm: "basisForm",
    randomize: "randomizeBtn",
    equation: "curveEqn",
    message: "basisMsg",
    singular: "viewSingular"
  });
</script>

## Explanation

Pick a basis of *N* polynomials $$p_1(x,y), \ldots, p_N(x,y)$$, and
consider the curves in the plane given by the zero sets of their
linear combinations,
<div>
\begin{align}
f(x,y) = \sum_{i=1}^N c_i\, p_i(x,y) = 0 .
\end{align}
</div>
Rescaling all the $$c_i$$'s by the same nonzero number doesn't change
the curve, so there are really only $$N-1$$ free parameters.  Requiring the
curve to pass through a point $$(x_k, y_k)$$ gives one linear equation
on the $$c_i$$'s.  So, $$N-1$$ points in general position determine
exactly one curve in the family.

There's a slick way to write down that curve: it is
<div>
\begin{align}
\label{eq:sysdet}
f(x,y) = \det
\begin{pmatrix}
p_1(x,y) & p_2(x,y) & \cdots & p_N(x,y) \\
p_1(x_1,y_1) & p_2(x_1,y_1) & \cdots & p_N(x_1,y_1) \\
\vdots & \vdots & \ddots & \vdots \\
p_1(x_{N-1},y_{N-1}) & p_2(x_{N-1},y_{N-1}) & \cdots & p_N(x_{N-1},y_{N-1})
\end{pmatrix} .
\end{align}
</div>
Expanding along the first row shows this is a linear combination of
the $$p_i$$'s.  And if you plug in $$(x,y) = (x_k,y_k)$$, two rows are
equal, so the determinant vanishes: the curve passes through every
point.  If the points are *not* in general position, every cofactor
vanishes, and there's no unique curve (the toy will tell you).

As you drag the points, the toy recomputes Eq. \eqref{eq:sysdet} and
redraws the zero set.  You can choose one of the preset families, or
type in your own basis, like `1, x, y^2 - x^3`.

## Things to try

**Circles.**  Three points determine a circle.  Now line the three
points up&mdash;what happens to the circle?  (Notice the basis
includes $$x^2+y^2$$ as a single element, so the "circle" is allowed
to degenerate.)

**Conic sections.**  Five points determine a conic.  Find
ellipses, parabolas, and hyperbolas.  Can you make the hyperbola
degenerate into a pair of crossing lines?

**Elliptic curves.**  In the standard form, $$y^2 = x^3 + ax + b$$,
there are only 2 free parameters, so two points determine the curve.
Sometimes the real curve has two components (an "egg" plus an
unbounded piece), and sometimes just one.  Try to move the points so
that the egg shrinks away to nothing, or so that it merges with
the unbounded piece.  In between, the curve passes through a
*singular* curve, with a node or a cusp.

Question: In the space of point positions, where are the curves
singular?
To find out, check <a href="#viewSingular">the box</a> to view the
singular locus.  While you drag a point, the dashed red curves show
where *that* point would have to be for the curve to be singular, and
the red &times;'s mark where the singularities would be.
See [below](#the-singular-locus) for how this works.

## The singular locus

While you drag one point $$a$$, the other $$N-2$$ points stay fixed.
Requiring a curve to pass through those $$N-2$$ points leaves a
2-dimensional space of coefficients, so the curves through them form a
*pencil*,
<div>
\begin{align}
\lambda\, g_1(x,y) + \mu\, g_2(x,y) = 0 ,
\end{align}
</div>
for two particular curves $$g_1, g_2$$ through the fixed points.
Dragging $$a$$ around just picks out the member of the pencil passing
through $$a$$, namely $$(\lambda,\mu) = (g_2(a), -g_1(a))$$.

A generic pencil has only finitely many *singular* members [for plane
curves of degree $$d$$, there are $$3(d-1)^2$$ of them over
$$\mathbb{C}$$].  So the curve becomes singular exactly when $$a$$
lies on one of these singular members.  In other words, the singular
locus for $$a$$ is itself a union of curves from the same family!

A member is singular at a point $$s$$ when $$(g_1, \partial_x g_1,
\partial_y g_1)$$ and $$(g_2, \partial_x g_2, \partial_y g_2)$$ are
parallel at $$s$$.  The toy finds the real solutions of these equations
numerically (excluding the *base points* where $$g_1=g_2=0$$), and then
draws the members of the pencil that are singular there.

Some singular points are at infinity!  Think of the curves as living
in the projective plane, by homogenizing to the degree of the family.
In the family of circles, the "circle" through three collinear points
is a line, but as a degree-2 curve it's really that line together with
the line at infinity, which is singular where the two meet.  So the
toy also looks for members whose (homogeneous) gradient vanishes at a
point at infinity.  These are drawn too, but without an &times;.

Try it with conic sections: with four points fixed, the singular
conics through them are the three pairs of lines through them.  So
the singular locus of the fifth point is the six lines joining pairs
of the four fixed points&mdash;exactly where the fifth point is collinear
with two others.

## Acknowledgments

Thanks to Allen Knutson for the idea.

This toy makes use of [JSXGraph](https://jsxgraph.org/), whose
implicit curve plotter draws the zero sets.

Suggestions welcome!
