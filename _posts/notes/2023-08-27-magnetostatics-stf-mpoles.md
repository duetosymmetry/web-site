---
title: "Notes: Magnetostatic multipole expansion using STF tensors"
modified:
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
researchers in GR.  After I developed these notes, [Julio
Parra-Martinez](https://julioparramartinez.me/) pointed me to [a paper
by Andreas Ross](https://arxiv.org/abs/1202.4750) which implicitly
includes these results, though I want to explain a bit more slowly.

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
  \right) M^{j_{1}j_{2}\cdots j_{\ell}} ,
\end{align}
</div>
where we have defined the $$\ell$$th STF multipole tensor of the
source as
<div>
\begin{align}
M^{j_{1}j_{2}\cdots j_{\ell}} \equiv \int
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
  \right) \mathcal{M}^{i;j_{1}j_{2}\cdots j_{\ell}} \,,
\end{align}
</div>
where the magnetic multipole moments are defined as
<div>
\begin{align}
  \label{eq:Bstatic-mpole-tensor-def}
  \mathcal{M}^{i;j_{1}j_{2}\cdots j_{\ell}}
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
  - \mathcal{M}^{i}
  \,.
\end{align}
</div>
The left hand side vanishes since in magnetostatics,
$$\cd\cdot\bs{J}=0$$.  Therefore the $$\ell=0$$ magnetic monopole moment
vanishes, $$\mathcal{M}^{i}=0$$.

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
  m^{i} &= \frac{1}{2} \epsilon^{ijk} \mathcal{M}_{k;j} \,, &
  \mathcal{M}^{k;j} &= \epsilon^{jki} m_{i} \,,\\
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
except that we have dropped the singular
$$\mu_{0}m^{i}\delta_{(3)}(\bs{x})$$ term.

It seems like we've discarded some information --- only the
antisymmetric part of $$\mathcal{M}^{i;j}$$ contributed to $$m^{i}$$.
What about the symmetric part?  This exactly vanishes, and that
generalizes to all higher $$\ell$$.  The proof follows similarly to why
$$\mathcal{M}^{i}$$ vanished above.  Use that $$\cd\cdot\bs{J}=0$$, and
integrate this divergence against $$x^{j_{1}}x^{j_{2}}\cdots
x^{j_{\ell}}$$,
<div>
\begin{align}
  0 &= -\int (\pd_{i}J^{i})x^{j_{1}}x^{j_{2}}\cdots x^{j_{\ell}}
  \ d^{3}\bs{x} \\
  &= +\int J^{i} \pd_{i}
  \left(
    x^{j_{1}}x^{j_{2}}\cdots x^{j_{\ell}}
  \right) \ d^{3}\bs{x} \\
  &=
  \int J^{i}
  \left[
    \delta_{i}^{j_{1}}x^{j_{2}}\cdots x^{j_{\ell}}
    +
    x^{j_{1}}\delta_{i}^{j_{2}}x^{j_{3}}\cdots x^{j_{\ell}}
  \right. \nn\\
  &\qquad\qquad
  \left.
    + \ldots + x^{j_{1}}x^{j_{2}}\cdots x^{j_{\ell-1}} \delta_{i}^{j_{\ell}}
  \right]\ d^{3}\bs{x} \\
  &= \ell \int J^{(j_{1}} x^{j_{2}}\cdots x^{j_{\ell})}
  \ d^{3}\bs{x} \,.
\end{align}
</div>
What we found is that the completely symmetric part of
$$\mathcal{M}^{i;j_{1}\cdots j_{\ell-1}}$$ vanishes (in fact it vanishes
even before removing the traces on the indices after the semicolon).

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

However, above we showed that the completely symmetric part, labeled
by $$(\ell+1)$$, vanishes.  Therefore, we have shown that each
$$\mathcal{M}^{i;j_{1}\cdots j_{\ell}}$$ lives in the $$(\ell,1)$$
diagram, and this means the $$i$$ index is antisymmetric with each $$j$$
index.

Because of the antisymmetry between $$i$$ and any one of the $$j$$'s, we
are free to insert a projector in the space of 2-forms,
<div>
\begin{align}
  \mathcal{M}^{i;j_{1}j_{2}\cdots j_{\ell}}
  = \delta^{i}_{[k}\delta^{j_{1}}_{p]} \mathcal{M}^{k;pj_{2}\cdots j_{\ell}}
  = \tfrac{1}{2}\epsilon^{ij_{1}q}\epsilon_{qkp} \mathcal{M}^{k;pj_{2}\cdots j_{\ell}}
  \,.
\end{align}
</div>
This motivates defining an auxiliary tensor $$m$$, like in the dipole
case,
<div>
\begin{align}
  \label{eq:mstatic-mpole-and-dual-rels}
  m^{k j_{2}j_{3}\cdots j_{\ell}} &\equiv -\tfrac{1}{2} \epsilon^{k}{}_{i j_{1}} \mathcal{M}^{i;j_{1}j_{2}\cdots j_{\ell}}
  \,, &
  \mathcal{M}^{i;j_{1}j_{2}\cdots j_{\ell}} &=
  -\epsilon^{ij_{1}}{}_{k} m^{k j_{2}j_{3}\cdots j_{\ell}}
  \,.
\end{align}
</div>
The two minus signs (which cancel) are here to agree with the
traditional notation for the magnetic dipole vector.  We can insert
the integral expression,
<div>
\begin{align}
  m^{k j_{2}j_{3}\cdots j_{\ell}}
  =
  \int -\tfrac{1}{2} \epsilon^{k}{}_{i j_{1}} J^{i}
  x^{\langle j_{1}} x^{j_{2}} \cdots x^{j_{\ell}\rangle} d^{3}x
  \,.
\end{align}
</div>

What are the symmetries of $$m^{kj_{2}\cdots j_{\ell}}$$? It is
obviously symmetric and tracefree on the $$j$$'s.  It is also easy to
see that tracing $$k$$ with any of the $$j$$'s would result in a symmetric
pair of indices contracting with the $$\epsilon$$ tensor in the
definition of $$m$$, so by symmetry-antisymmetry,
$$m^{kj_{2}\cdots j_{\ell}}$$ is tracefree on all indices.

Now we will show that $$m^{kj_{2}\cdots j_{\ell}}$$ is symmetric on
$$(k,j_{2})$$ and thus on $$k$$ with any of the $$j$$'s.  Suppose we split
the tensor into parts that are symmetric and antisymmetric on these
two indices,
$$m^{kj_{2}\cdots j_{\ell}} = m^{(kj_{2})\cdots j_{\ell}} +
m^{[kj_{2}]\cdots j_{\ell}}$$.  For the antisymmetric part, we could
again insert a projector in the space of 2-forms.
While evaluating this projector, we have the dual on $$[k j_{2}]$$.
But this is simply a trace of $$\mathcal{M}$$: from
Eq. \eqref{eq:mstatic-mpole-and-dual-rels},
<div>
\begin{align}
  \epsilon^{p}{}_{kj_{2}}m^{kj_{2}\cdots j_{\ell}} =
  \mathcal{M}^{p;j_{1}j_{2}j_{3}\cdots j_{\ell}}\delta_{j_{1}j_{2}} = 0
  \,,
\end{align}
</div>
which vanishes since $$\mathcal{M}$$ is tracefree on all the $$j$$'s.
Since this antisymmetric part of $$m^{kj_{2}\cdots j_{\ell}}$$ vanished,
we found that $$m$$ is STF on all indices.

We can finally restate $$A^{k}$$ and $$B^{i}$$ in terms of these magnetic
STF moments, after a bit of algebra:
<div>
\begin{align}
  A^{k}(\bs{x}) &= \frac{\mu_{0}}{4\pi}
  \sum_{\ell=0}^{\infty}
  \frac{(-1)^{\ell}}{\ell!}
  \left(
    \pd_{j_1} \pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  \right) \epsilon^{kp j_{1}}m^{p j_{2}\cdots j_{\ell}} \,,
  \\
  B^{i} = \epsilon^{ijk}\pd_{j}A_{k} &=
  \frac{\mu_{0}}{4\pi}
  \sum_{\ell=0}^{\infty}
  \frac{(-1)^{\ell+1}}{\ell!}
  \left(
    \pd_{i} \pd_{j_{1}}\pd_{j_2} \cdots \pd_{j_\ell} \frac{1}{r}
  \right)
  m^{j_{1} j_{2}\cdots j_{\ell}} \,.
\end{align}
</div>
