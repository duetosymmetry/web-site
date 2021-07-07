---
title: Complex polynomial roots toy
categories: [tool]
excerpt: Interactive toy for visualizing relationship between polynomial roots and coefficients
tags: [interactive, algebra, polynomial, roots]
date: 2017-12-15
modified: 2019-06-08
jsxgraph: true
published: true
pinned: false
---

<!------------------------------------------------------------>

<style>
.mybox {
width: 360px;
height: 360px;
margin-bottom: 1em;
display: inline-block;
}

.myDegInput {
width: 4em;
}

.myLabel {
display: inline-block;
}

.myBoxTitle {
padding: 10px;
text-decoration: underline;
}
</style>

Grab the red dots and play around! Or jump to the
[explanation](#explanation), or [try this](#things-to-try).

<div id="coeffbox" class="jxgbox mybox" style="">
</div>
<div id="rootbox" class="jxgbox mybox" style="">
</div>

<form onsubmit="return false;">
<div>
<label for="degView" class="myLabel">Degree of polynomial (change me!):</label>
<input type="number" name="degView" id="degView" class="myDegInput" min="1" max="7" step="1" value="4">
</div>

<div>
<label for="viewDisc" class="myLabel">View discriminant's roots?</label>
<input type="checkbox" name="viewDisc" id="viewDisc">
</div>
</form>

<label for="equationTextBox" class="myLabel">Equation (generated from degree):</label>
<input type="text" id="equationTextBox" width="30" disabled>

<!------------------------------------------------------------>
<!-- CODE -->

<script type="text/javascript" src="{{ site.url }}/assets/js/fraction.min.js"></script>
<script type="text/javascript" src="{{ site.url }}/assets/js/complex.min.js"></script>
<script type="text/javascript" src="{{ site.url }}/assets/js/quaternion.min.js"></script>
<script type="text/javascript" src="{{ site.url }}/assets/js/polynomial.min.js"></script>

<script type="text/javascript" src="{{ site.url }}/assets/js/poly-root-toy.js"></script>

<script type="text/javascript">
  var controller = new PolyRootController("rootbox","coeffbox", "degView", "viewDisc");
</script>

## Explanation

A [polynomial](https://en.wikipedia.org/wiki/Polynomial) in *x* of
*degree n* has the form
<div>
\begin{align}
P(x) = \sum_{i=0}^n a_i x^i .
\end{align}
</div>
From the [fundamental theorem of
algebra](https://en.wikipedia.org/wiki/Fundamental_theorem_of_algebra),
there are exactly *n* roots $$z_i \in \mathbb{C}$$ in the complex
plane.[^1]  The same polynomial can be written as
<div>
\begin{align}
\label{eq:factored}
P(x) = a_n (x-z_1)(x-z_2)\cdots(x-z_n) .
\end{align}
</div>
Let's set $$a_n=1$$ for simplicity (this is called a monic
polynomial).

Now, if you have the roots, finding the values of the coefficients
$$a_i$$ is straightforward: just expand out the product in Eq. \eqref{eq:factored}.
The functions $$a_i(z_1, z_2, \ldots, z_n)$$ are known as [elementary
symmetric
polynomials](https://en.wikipedia.org/wiki/Elementary_symmetric_polynomial)
(up to a sign).  If you move a root, you can see how all the
coefficients change.

Solving for the $$z_i$$'s from the $$a_i$$'s with some algebraic
formula is possible for $$n\le 4$$ but generally impossible for higher
degrees.[^2] Nonetheless, we can numerically solve for roots
with [various numerical
algorithms](https://en.wikipedia.org/wiki/Category:Root-finding_algorithms).[^3]
If you move a coefficient, your computer will solve for the
new locations of the roots, and you can see how they respond.

## Things to try

Grab a coefficient $$a_i$$ and move it around in a closed loop.  If it
comes back to where it started, then the *set* of roots $$\{ z_j \}$$
have to return to the starting set.

But we can also talk about each individual root's trajectory as
$$a_i$$ is varied.  If $$a_i$$ moves in a very small loop, so does
each $$z_j$$.

Now try to find a larger loop for some $$a_i$$ so that some $$z_j$$'s
swap places!

Hint (spoiler): a really simple choice is to move $$a_0$$ around the
unit circle, if all the other $$a_i$$'s are close to the origin.  Then
you should see the *n* roots $$z_j$$ each shift one spot to the
left/right around their unit circle.  This is an n-cycle.

Try to find a 2-cycle (two roots swap places) or other more
complicated types of *permutations*.

What we have here is a map from closed loops in *a*-space to
[permutations](https://en.wikipedia.org/wiki/Permutation_group) of the
*n* roots.

Question: What determines the type of permutation (cycle structure or
conjugacy class)?
Hint: It has something to do with the zeros of the
[discriminant](https://en.wikipedia.org/wiki/Discriminant).
To understand the relationship, check <a href="#viewDisc">the box</a> to view the
discriminant's roots.  When you drag a coefficient $$a_i$$, you will
see the roots of the discriminant (treated as univariate, holding fixed
all other $$a_{j\neq i}$$).

## Acknowledgments

This toy was somewhat inspired by [John Baez's
post](https://plus.google.com/+johncbaez999/posts/81M1B5TCmhb), which
in turn was discussing [this tumblr
post](http://twocubes.tumblr.com/post/140680223428/same-polynomials-but-this-time-im-letting-t-vary).

This toy makes use of [JSXGraph](http://jsxgraph.uni-bayreuth.de/wp/)
and my extended version of
[Polynomial.js](https://github.com/infusion/Polynomial.js).[^3]

Suggestions welcome!

[^1]: I'm only considering $$a_i \in \mathbb{C}$$; things like
    polynomials over finite fields are trickier!

[^2]: Proved by [Évariste
    Galois](https://en.wikipedia.org/wiki/%C3%89variste_Galois) before
    his death in a duel at age 20.

[^3]: For root-finding, I implemented the [Aberth-Ehrlich
    method](https://en.wikipedia.org/wiki/Aberth_method) into the
    javascript package
    [Polynomial.js](https://github.com/infusion/Polynomial.js),
    following [Dario Bini's paper](https://doi.org/10.1007/BF02207694)
    and his [FORTRAN
    implementation](http://www.netlib.org/numeralgo/na10).
    To evaluate the discriminant, I compute the determinant of the
    [Bézout matrix](https://en.wikipedia.org/wiki/Bézout_matrix).
