---
title: Real algebraic curves toy
categories: [tool]
excerpt: Interactive toy for drawing plane curves through points, from a chosen set of polynomials
tags: [interactive, algebra, polynomial, algebraic geometry]
date: 2026-11-16
modified: 2026-11-23
jsxgraph: true
published: true
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

Grab the red dots and play around!  You can choose from a preset list of
polynomials, or type in your own.  Jump to the [explanation](#explanation), or
[try this](#things-to-try).

<div id="curvebox" class="jxgbox curvebox"></div>

<div id="curveEqn" class="curveEqn"></div>

<form id="basisForm" class="curveControls">
<div>
<label for="basisPreset">Family of curves:</label>
<select id="basisPreset"></select>
</div>
<div>
<label for="basisInput">Set of polynomials (comma-separated, change me!):</label><br>
<input type="text" id="basisInput" autocomplete="off" spellcheck="false">
<input type="submit" value="Apply">
</div>
<div id="basisMsg" class="curveMsg" style="display: none"></div>
<div>
<input type="checkbox" id="viewSingular">
<label for="viewSingular" class="myLabel">View singular locus while dragging?</label>
</div>
<div>
<input type="checkbox" id="viewDual">
<label for="viewDual" class="myLabel">View dual curve?</label>
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
    singular: "viewSingular",
    dual: "viewDual"
  });
</script>

## Explanation

Two points determine a line, and three points (that are not collinear) determine
a circle.  How many points does it take to specify an ellipse or a hyperbola?
Turns out to be 5, but why?

Every line in the plane can be written in the form
<div>
\begin{align}
0 = ax + by + c ,
\end{align}
</div>
but we get the same line if we scale each of $$ (a,b,c) \to (sa, sb, sc) $$, so
there are really only two parameters here, not 3.  Similarly, the equation for a
circle in the plane is
<div>
\begin{align}
0 = (x-x_0)^2 + (y-y_0)^2 - R^2 ,
\end{align}
</div>
which clearly has 3 parameters. We can rearrange this into
<div>
\begin{align}
0 = a(x^2+y^2) + bx + cy + d ,
\end{align}
</div>
but again multiplying the whole equation by a non-zero constant gives the same
circle, so there are only 3 parameters, not 4. (Note that $$x^2$$ and $$y^2$$
must have the same coefficient so we don't get an ellipse).

In these examples, we found that the number of points was the same as the number
of polynomials you were adding together minus one, where we were counting that
trailing constant as multiplying the polynomial 1.

Let's generalize this.
Pick a set of *N* polynomials $$p_1(x,y), \ldots, p_N(x,y)$$, take a linear
combination, and consider the curves in the plane given by the zeros
<div>
\begin{align}
f(x,y) = \sum_{k=1}^N c_k\, p_k(x,y) = 0 .
\end{align}
</div>
Rescaling all the $$c_k$$'s by the same nonzero number doesn't change
the curve, so there are morally only $$N-1$$ free parameters.
(We're not allowed to include linearly-dependent polynomials; e.g. you can only
include two of the three in the set $$\{ x^2, y^2, x^2 + y^2 \}$$, or else our
problem would be degenerate.)

How do you relate this to the $$N-1$$ points that go through the curve?  For
each point $$(x_i, y_i)$$, you get an equation that the $$c_k$$'s have to
satisfy, $$f(x_i, y_i) = 0$$.  This equation is *linear* in the $$c_k$$'s.  So
we have $$N-1$$ equations, but we still have $$N$$ unknowns because we haven't
fixed some overall scaling for the $$c_k$$'s.

But, this *does* give us an algebraic equation that the curve has to satisfy.
Say some *other* point $$(x,y)$$ is on that same curve that goes through the
$$N-1$$ points $$\{ (x_i, y_i) \}$$.  Then we have $$N$$ equations for $$N$$ unknowns,
and our linear system has a nontrivial solution (up to scale) exactly when this
$$N\times N$$ determinant vanishes,
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
Do you see where this comes from?
Expanding along the first row shows this is a linear combination of
the $$p_i$$'s.  And if you plug in $$(x,y) = (x_k,y_k)$$, two rows are
equal, so the determinant vanishes: the curve passes through every
one of the $$\{ (x_i, y_i) \}$$'s.

As you drag the points, the toy recomputes Eq. \eqref{eq:sysdet} and
redraws the zero set.  You can choose one of the preset families, or
type in your own set, like `1, x, y^2 - x^3`.

I was a bit cavaliear above, because my explanation breaks if you try to make
a circle with three collinear points.  If you avoid that kind of breakdown, we
say the points are "in general position."

## Things to try

**Circles.**  Three points determine a circle.  Now line the three
points up---what happens to the circle?  The circle is allowed
to degenerate, with its radius going off to infinity (the coefficient of
$$x^2+y^2$$ vanishes), if the three points are collinear.

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
the red ×'s mark where the singularities would be.
See [below](#the-singular-locus) for how this works.

## The singular locus

While you drag one point $$a$$, the other $$N-2$$ points stay fixed.
Requiring a curve to pass through those $$N-2$$ points leaves a
2-dimensional space of coefficients, so the curves through them form a
linear system that is called a *pencil*,
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
point at infinity.  These are drawn too, but without an ×.

Try it with conic sections: with four points fixed, the singular
conics through them are the three pairs of lines through them.  So
the singular locus of the fifth point is the six lines joining pairs
of the four fixed points---exactly where the fifth point is collinear
with two others.

## The dual curve

Each tangent line to the curve is a point of the *dual* curve, which
lives in the dual projective plane (the space of lines).  To draw it in
the same picture, the toy uses *polar reciprocity* in the unit circle:
the line $$a x + b y = 1$$ is drawn as the point $$(a, b)$$.  The
tangent line at a point $$p$$ of the curve $$f=0$$ is then drawn at
<div>
\begin{align}
p^\ast = \frac{\nabla f(p)}{p \cdot \nabla f(p)} .
\end{align}
</div>
Check <a href="#viewDual">the box</a> to see the dual in green, along
with the unit circle (dotted), which is its own dual.

Hover the mouse over either curve to see a dual pair: a point $$p$$ on
the curve (blue dot) and the point $$p^\ast$$ on the dual (green dot).
The blue dashed line is the tangent line at $$p$$, which is the line
represented by $$p^\ast$$.  The green dashed line is the line
represented by $$p$$, namely $$p \cdot (x,y) = 1$$, and it is tangent
to the dual curve at $$p^\ast$$.  That's duality working in both
directions!

Things to notice:
* The dual of a conic is a conic.
* Inflection points of the curve become *cusps* of the dual, and
  lines tangent at two points (bitangents) become *nodes*.  A smooth
  real cubic has three real inflection points, so its dual has three
  real cusps.
* A tangent line through the origin corresponds to a point at
  infinity, so the dual runs off the screen.  Conversely, the line at
  infinity is drawn at the origin: an elliptic curve in standard form
  has an inflection point at infinity (with the line at infinity as
  its tangent), so its dual has a cusp at the origin.
* Taking the dual twice gets you back where you started.

To draw the dual, the toy maps the traced curve point by point, and
also traces the zero set of the dual's implicit equation, which is
the discriminant of $$f$$ restricted to the line $$a x + b y = 1$$.
The latter catches pieces coming from tangent lines outside the
picture, such as the asymptotes.

## Acknowledgments

Thanks to [Allen Knutson](https://pi.math.cornell.edu/~allenk/) for the idea, all the way back in 2019! This was
originally a Mathematica notebook.  I finally caved and started using Claude
code, which I used to convert the Mathematica code to javascript so everyone
could enjoy.

Between then and now, Taran Knutson and Allen Knutson made this wonderful YouTube
video on this topic:
<iframe width="560" height="315" src="https://www.youtube.com/embed/iUUm0sKLoiE?si=xxS64luFDhHbiCre" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

This toy makes use of [JSXGraph](https://jsxgraph.org/), whose
implicit curve plotter draws the zero sets.

Suggestions welcome!
