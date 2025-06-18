---
title: "Notes: Magnetostatic multipole expansion using STF tensors"
modified: 2025-06-17
categories: [notes]
excerpt: "How to do the STF multipole expansion of the magnetic potential and field (it's been on my TODO list for a while)"
tags: [electromagnetism, multipole, tensor]
date: 2023-08-27T00:00:00-06:00
published: true
---

<script type="math/tex">
\newcommand{\pd}{\partial}
\newcommand{\cd}{\nabla}
\newcommand{\bs}{\boldsymbol}
\newcommand{\nn}{\nonumber}
</script>

{% include toc %}

These notes are intended for students (or profs) aware of the
multipole expansion for electrostatics in terms of symmetric tracefree
(STF) tensors.  Standard texts on electrodynamics (like Jackson)
hardly mention the STF version, though it is extremely well-known to
researchers in GR.

**Update 2025-06-17**: I am updating these notes because of two issues.  First,
Alan Guth pointed out to me, I missed terms that were pure gauge (I incorrectly
claimed they vanished). Second, [Cyril
Pitrou](https://www2.iap.fr/users/pitrou/) pointed out to me [this lovely paper
by Damour and Iyer
(1991)](https://journals.aps.org/prd/abstract/10.1103/PhysRevD.43.3259) which
does the whole dynamical case (i.e. the radiative multipole expansion), and
pointed out that I had a factor which is only correct in the dipole
case. Therefore I am cleaning up my error and reworking some of the discussion.

# Refresher: Electrostatic STF multipole expansion

Before getting to magnetostatics, we'll start with electrostatics.
This is easier since we only need to solve for the scalar potential,
which satisfies
<div>
\begin{align}
  \cd^2 \Phi = - \frac{\rho}{\epsilon_0} .
\end{align}
</div>
We're interested in the case where $$\rho$$ vanishes outside of a
compact region.  The most efficient way to get to the STF version of
the multipole expansion is to start from the Green's function
solution,
<div>
\begin{align}
  \Phi(\bs{x}) = \frac{1}{4\pi\epsilon_0}
  \int \frac{\rho(\bs{x}')}{|\bs{x}-\bs{x}'|} d^3\bs{x}' .
\end{align}
</div>
We then take the function $$1/|\bs{x}-\bs{x}'|$$ and perform a multivariate
Taylor series expansion about the point $$\bs{x}'=0$$, since far away from
the source, $$|\bs{x}'| \ll |\bs{x}|$$.  This expansion is
<div>
\begin{align}
    \frac{1}{|\bs{x}-\bs{x}'|} &= \sum_{\ell=0}^\infty \frac{(-1)^\ell}{\ell!} x^{\prime j_1} x^{\prime j_2} \cdots x^{\prime j_\ell}
  \pd_{j_1} \pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  \,, \\
  &=
  \sum_{\ell=0}^\infty \frac{(-1)^\ell}{\ell!}
  (r')^\ell
  n'^{j_1} n'^{j_2}\cdots n'^{j_\ell}
  \pd_{j_1} \pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  .
\end{align}
</div>
In the $$\ell$$ index tensor $$\pd_{j_1} \pd_{j_2} \cdots \pd_{j_\ell}
(1/r)$$, all indices are obviously symmetric; they are also tracefree
away from the origin, where we get a delta function, owing to $$\cd^2
(1/r) = -4\pi \delta_{(3)}(\bs{x})$$.  Since this tensor is symmetric
and tracefree (STF), we are free to take only the STF part of the
product of $$\bs{x}'$$ direction vectors.  We denote this with angle
brackets around the relevant indices,
<div>
\begin{align}
    \frac{1}{|\bs{x}-\bs{x}'|} &=
  \sum_{\ell=0}^\infty \frac{(-1)^\ell}{\ell!}
  x'^{\langle j_1} x'^{j_2}\cdots x'^{j_\ell\rangle}
  \pd_{j_1} \pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  .
\end{align}
</div>
Plugging this in to the Green's function integral, we get
<div>
\begin{align}
  \Phi(\bs{x}) &= \frac{1}{4\pi\epsilon_{0}} \sum_{\ell=0}^{\infty}
  \frac{(-1)^\ell}{\ell!}
  \left(
    \pd_{j_1} \pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  \right) Q^{j_{1}j_{2}\cdots j_{\ell}} ,
\end{align}
</div>
where we have defined the $$\ell$$th STF multipole tensor of the
source as
<div>
\begin{align}
Q^{j_{1}j_{2}\cdots j_{\ell}} \equiv \int
  \rho(\bs{x}) x^{\langle j_1} x^{j_2} \cdots x^{j_\ell \rangle}
  \ d^{3} \bs{x}
  .
\end{align}
</div>

# Magnetostatic multipole expansion

We can apply our results from the electrostatic multipole expansion to
magnetostatics, using the potential formulation.  In magnetostatics,
we are trying to find a magnetic field $$\bs{B}(\bs{x})$$ satisfying
<div>
\begin{align}
  \cd\times\bs{B} &= \mu_{0} \bs{J}\,,  & \text{(static)}
\end{align}
</div>
where as usual $$\cd\cdot\bs{B}=0$$, and in statics, conservation of
charge demands that $$\cd\cdot\bs{J}=0$$.  Now we go to the potential
formulation, $$\bs{B}=\cd\times\bs{A}$$, and use our gauge freedom to go
to Coulomb gauge, $$\cd\cdot\bs{A}=0$$.  Plugging in, we are now trying
to solve
<div>
\begin{align}
  \cd^{2} A^{i} = - \mu_{0} J^{i} \,.
\end{align}
</div>
In Cartesian coordinates, this is just three independent copies of the
Poisson equation, one for each Cartesian component $$A^{i}$$.  Therefore
we can use the Green's function for the scalar Laplacian's for each
component,
<div>
\begin{align}
  A^{i}(\bs{x}) = \frac{\mu_{0}}{4\pi} \int
  \frac{J^{i}(\bs{x}')}{|\bs{x}-\bs{x}'|} d^{3}\bs{x}'
  \,.
\end{align}
</div>

Just like in the electrostatic case, we Taylor expand
$$\tfrac{1}{|\bs{x}-\bs{x}'|}$$, pull things out of the integrals, etc.
Essentially, we are just making a replacement in the electrostatic
case: $$\Phi \to A^{i}, \tfrac{\rho}{\epsilon_{0}} \to \mu_{0} J^{i}$$.
This means our multipole moments get an extra index that does not
participate in the STF operation.  As it stands, our solution is
<div>
\begin{align}
  \label{eq:A-mpole-external}
  A^{i}(\bs{x}) &= \frac{\mu_{0}}{4\pi}
  \sum_{\ell=0}^{\infty}
  \frac{(-1)^\ell}{\ell!}
  \left(
    \pd_{j_1} \pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  \right) G^{i;j_{1}j_{2}\cdots j_{\ell}} \,,
\end{align}
</div>
where we defined some moment integrals
<div>
\begin{align}
  \label{eq:Bstatic-mpole-tensor-def}
  G^{i;j_{1}j_{2}\cdots j_{\ell}}
  \equiv
  \int
  J^{i}(\bs{x})
  x^{\langle j_1} x^{j_2} \cdots x^{j_\ell \rangle}
  \ d^{3} \bs{x}
  \,,
\end{align}
</div>
which are STF only on the $$j_{1}\cdots j_{\ell}$$  indices after the
semicolon.

Notice that the $$\ell=0$$ term vanishes -- no magnetic monopoles! -- by
conservation of charge.  Integrate $$(\cd\cdot\bs{J})x^{j}$$ and use
integration by parts:
<div>
\begin{align}
  \int (\pd_{i}J^{i})x^{j} \ d^{3} \bs{x}
  =
  -\int J^{i}\pd_{i}x^{j} \ d^{3} \bs{x}
  =
  -\int J^{i}\delta_{i}^{j} \ d^{3} \bs{x}
  =
  - G^{i}
  \,.
\end{align}
</div>
The left hand side vanishes since in magnetostatics,
$$\cd\cdot\bs{J}=0$$.  Therefore the $$\ell=0$$ magnetic monopole moment
vanishes, $$G^{i}=0$$.  [As an exercise, try a similar approach with $$\int
  (\pd_i J^i) x^{j_{1}}x^{j_{2}}\cdots x^{j_{\ell}}
  \ d^{3}\bs{x}$$, and see if you can generate an identity for arbitrary $$\ell$$.]

Before handling the arbitrary $$\ell$$ term, let's write the dipole in
the traditional form seen in e.g. Griffiths.  The traditional form for
a magnetic dipole is
<div>
\begin{align}
  \bs{A}_{\text{dip}} &= \frac{\mu_{0}}{4\pi} \frac{\bs{m}\times\bs{n}}{r^{2}} \,,\\
  A^{i}_{\text{dip}} &= \frac{\mu_{0}}{4\pi} \epsilon^{ijk} m_{j} \pd_{k} \frac{-1}{r} \,.
\end{align}
</div>
Here the magnetic dipole pseudo-vector is related to the 2-index
magnetic dipole tensor,
<div>
\begin{align}
  m^{i} &= \frac{1}{2} \epsilon^{ijk} G_{k;j} \,, &
  G^{k;j} &= \epsilon^{jki} m_{i} \,,\\
  \bs{m} &= \frac{1}{2} \int \bs{x} \times \bs{J}(\bs{x}) \ d^{3}\bs{x}
  \,.
\end{align}
</div>
This gives the ideal dipole magnetic field
<div>
\begin{align}
  \bs{B}_{\text{dip}} &= \cd\times\bs{A}_{\text{dip}} \,, \\
  B^{i}_{\text{dip}} &= \frac{\mu_{0}}{4\pi} m^{j} \pd_{i}\pd_{j}\frac{1}{r}
  \,,
\end{align}
</div>
except that we have dropped a singular
$$\mu_{0}m^{i}\delta_{(3)}(\bs{x})$$ term.

## Aside on Young tableau and STF decomposition

It seems like we've discarded some information --- only the
antisymmetric part of $$G^{i;j}$$ contributed to $$m^{i}$$.
What about the symmetric part?  It turns out nothing has been lost.

The next step for understanding these magnetic multipole tensors
requires a little knowledge of how Young diagrams classify the index
symmetries of tensors (ok, maybe not strictly necessary, but this was
how I first realized what to do).   We know that the tensor
$$x^{\langle j_{1}}x^{j_{2}}\cdots x^{j_{\ell}\rangle}$$ lives in the
representation labeled by the diagram of shape $$(\ell)$$,

![Young tableau of shape (ell)]({{ site.url }}/images/yt-j1-jl.png){: .align-center style="width: 250px"}

Now recall that when we tensor-product a vector with some tensor in a
diagram with shape $$\lambda$$, we generate tensors in irreps related
by adding one box at the end of any allowed row or as a new row
underneath (the decomposition of tensor products into irreps is
determined by the [Littlewood--Richardson
rule](https://en.wikipedia.org/wiki/Littlewood%E2%80%93Richardson_rule);
adding one box where allowed is the simplest case.  This is
encapsulated in a *Hasse diagram* called [Young's
lattice](https://en.wikipedia.org/wiki/Young%27s_lattice), which gives
a partial order on Young diagrams, seen in here:

![Young lattice]({{ site.url }}/images/Young-lattice.png){: .align-center }

Now, since $$x^{\langle j_{1}}x^{j_{2}}\cdots x^{j_{\ell}\rangle}$$
lives in the $$(\ell)$$ representation, we know that tensoring with
$$J^{i}$$ can produce content in exactly two representations: the
$$(\ell+1)$$ diagram, and the $$(\ell,1)$$ diagram, having shapes

![Two Young tableaux, one of shape (ell+1), one of shape (ell,1)]({{ site.url }}/images/yt-lp1-and-l1.png){: .align-center }

These above statements were for Young tableaux labeling the representations of
GL(3).  Once we introduce our metric $$\delta_{ij}$$ and go to SO(3), we can do
a further trace decomposition.  At the same time we've also introduced the
Levi-Civita tensor $$\epsilon_{ijk}$$, which lives in the irrep labeled by 3
boxes stacked vertically.  We can use the Levi-Civita tensor to dualize $$p$$
antisymmetric indices to $$3-p$$ indices, which is how we replaced $$G^{i;j}$$
with $$m^i$$.  The ultimate goal is to decompose arbitrary tensors into
combinations of STF tensors, $$\delta_{ij}$$, and $$\epsilon_{ijk}$$.

To do this we can use a rule from [Blanchet and Damour
(1986)](https://www2.iap.fr/users/blanchet/images/Structure_gravitational_field_BD_1986.pdf)
which is also in [Damour and Iyer
(1991)](https://journals.aps.org/prd/abstract/10.1103/PhysRevD.43.3259).  You
can build the decomposition inductively starting from the tensor product of just
a single vector with an $$\ell$$-index STF tensor (here we use STF multindex notation)
<div>
\begin{align}
  \label{eq:vec-STF-prod-decomp}
  U_i \hat{T}_{L} = \hat{R}_{iL}^{(+)} 
  + \frac{\ell}{\ell+1} \epsilon_{si\langle i_\ell} \hat{R}^{(0)}_{L-1\rangle s}
  + \frac{2\ell-1}{2\ell+1} \delta_{i\langle i_\ell} \hat{R}^{(-)}_{L-1\rangle}
\end{align}
</div>
where everything with a hat is STF, and the three pieces on the RHS are
<div>
\begin{align}
  \hat{R}_{L+1}^{(+)} &= U_{\langle i_{\ell+1}} \hat{T}_{L\rangle} \,,\\
  \hat{R}^{(0)}_{L} &= U_a \hat{T}_{b\langle L-1} \epsilon_{i_\ell \rangle ab} \,,\\
  \hat{R}^{(-)}_{L-1} &= U_s \hat{T}_{s L-1} \,.
\end{align}
</div>
This is akin to $$\boldsymbol{1}\otimes \boldsymbol{\ell} = (\boldsymbol{\ell -
1}) \oplus \boldsymbol{\ell} \oplus (\boldsymbol{\ell+1})$$ in angular momentum
coupling.  Let me comment here: Blanchet and Damour say that this expression
(which is their (A3)) is "straightforwardly checked." I did check it, but there
is a lot of room for error! Two intermediate steps you need are:
<div>
\begin{align}
  \delta_{a\langle i_{\ell+1}} \hat{T}_{L\rangle} &= \delta_{a(i_{\ell+1}}
  \hat{T}_{L)} - \frac{\ell}{2\ell+1} \hat{T}_{a(L-1} \delta_{i_\ell i_{\ell+1})} \,,\\
  \epsilon_{ab\langle i_\ell} \hat{T}_{L-1\rangle a} &=
  \epsilon_{ab( i_\ell} \hat{T}_{L-1) a} \quad \text{(already tracefree)}
\end{align}
</div>
Getting all these $$\ell$$-dependent coefficients requires a bit of combinatorics.
For example, suppose we want to trace $$\hat{T}_{a(L-1} \delta_{i_\ell i_{\ell+1})}$$
on the $$(i_\ell i_{\ell+1})$$ indices.  There are a total of
$$\binom{\ell+1}{2}$$ distinct terms (counting which two indices appear on the
$$\delta$$):
<div>
\begin{align}
\hat{T}_{a(L-1} \delta_{i_\ell i_{\ell+1})}
=
\frac{1}{(\ell+1)\ell/2}
\underbrace{\left(
\hat{T}_{ai_1i_2\ldots} \delta_{i_\ell i_{\ell+1}}
+
\hat{T}_{ai_1i_2\ldots} \delta_{i_{\ell-1} i_{\ell+1}}
+
\cdots
+
\hat{T}_{ai_3i_4\ldots} \delta_{i_1 i_2}\right)}_{\binom{\ell+1}{2}\text{ distinct terms}}
\,.
\end{align}
</div>
The $$(i_\ell i_{\ell+1})$$ indices are either both on the $$\delta$$
(one way), both on $$\hat{T}$$ ($$\binom{\ell-1}{2}$$ ways), or one index
on $$\hat{T}$$ and the other on $$\delta$$.  When both indices are on
$$\delta$$, we get $$3\hat{T}_{aL-1}$$.  If both indices are on $$\hat{T}$$,
the trace vanishes.  And for each of the $$\binom{\ell+1}{2} - 1 - \binom{\ell-1}{2} =
2\ell-2$$ terms where the indices are on different tensors, we get
$$\hat{T}_{aL-1}$$. So, this gives
<div>
\begin{align}
\delta^{i_\ell i_{\ell+1}}
\hat{T}_{a(L-1} \delta_{i_\ell i_{\ell+1})} = \frac{2(2\ell+1)}{(\ell+1)\ell} \hat{T}_{aL-1} \,.
\end{align}
</div>

## Back to magnetostatics

We apply this to magnetostatics, decomposing $$G_{i;L}$$ into three STF
pieces
<div>
\begin{align}
G_{i;L} = U_{iL} - \epsilon_{ai\langle i_\ell} M_{L-1\rangle a}
+ \frac{2\ell-1}{2\ell+1} \delta_{i\langle i_\ell} D_{L-1\rangle}
\end{align}
</div>
where
<div>
\begin{align}
U_{iL} &\equiv G_{\langle i; L\rangle} \,,\\
M_L &\equiv -\frac{\ell}{\ell+1}G_{a;b\langle L-1} \epsilon_{i_\ell\rangle ab} \,,\\
D_{L-1} &\equiv G_{a;aL-1} \,.
\end{align}
</div>
Now, by the parenthetical exercise I suggested before, you can show that
$$U_{L+1}=0$$.  Meanwhile, I'll claim without proof that if you plug the
$$D_{L-1}$$ term back into the expression for $$A_i$$, you'll see that it's pure
gauge, and can be removed by a gauge transformation (see Damour and Iyer for all
the details).

The two minus signs and placement of the factor of $$\ell/(\ell+1)$$ were chosen
to agree with the traditional definition for the magnetic dipole vector.  We can
write the magnetic STF multipole tensor in terms of the integral
<div>
\begin{align}
  M^{j_1j_2\cdots j_\ell}
  = \frac{\ell}{\ell+1}
  \int 
  x^{\langle j_{1}} x^{j_{2}} \cdots x^{j_{\ell-1}} \mathcal{M}^{j_\ell\rangle} d^{3}x
  \,,
\end{align}
</div>
where we have defined the magnetization density (note a factor of 1/2 difference
from Jackson)
<div>
\begin{align}
\boldsymbol{\mathcal{M}} \equiv \boldsymbol{x} \times \boldsymbol{J}
\,.
\end{align}
</div>

We can finally restate $$A^{k}$$ and $$B^{i}$$ in terms of these magnetic
STF moments, after a bit of algebra:
<div>
\begin{align}
  A^{k}(\bs{x}) &= \frac{\mu_{0}}{4\pi}
  \sum_{\ell=0}^{\infty}
  \frac{(-1)^{\ell}}{\ell!}
  \left(
    \pd_{j_1} \pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  \right) \epsilon^{kp j_{1}}M^{p j_{2}\cdots j_{\ell}} \,,
  \\
  B^{i} = \epsilon^{ijk}\pd_{j}A_{k} &=
  \frac{\mu_{0}}{4\pi}
  \sum_{\ell=0}^{\infty}
  \frac{(-1)^{\ell+1}}{\ell!}
  \left(
    \pd_{i} \pd_{j_{1}}\pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  \right)
  M^{j_{1} j_{2}\cdots j_{\ell}} \,.
\end{align}
</div>
