---
title: "Notes: Near-identity transformations to split fast and slow motion"
modified:
categories: [notes]
excerpt:
tags: [perturbation theory]
date: 2026-04-05T00:00:00-06:00
published: true
---

The name near-identity transformation (NIT) is just shorthand for a specific
application of perturbation theory---one which is particularly useful in
dynamical systems that have slow and fast timescales.  This is not all they can
be used for (see e.g. Fumagalli+[^1] where a NIT is used to remove gauge dependence).
What I write below is covered in some standard references but it's easy enough
to rederive it, so I'm writing it here so I can easily find my derivation.

<script type="math/tex">
\newcommand{\pd}{\partial}
\newcommand{\cd}{\nabla}
\newcommand{\bs}{\boldsymbol}
\newcommand{\nn}{\nonumber}
\newcommand{\avg}[1]{\langle {#1} \rangle}
</script>

The nicest possible setting where we can apply a NIT is close to an integrable
Hamiltonian system.  Say we start with a system we can put into action-angle
variables,
<div>
\begin{align}
\label{eq:AA-EOM}
    \dot{J}_a &= 0 , & \dot{\phi}^a &= \omega^a(\bs{J}) ,
\end{align}
</div>
where the $$\phi$$'s are all $$2\pi$$-periodic, so the phase space is foliated
by N-tori. This system already has a slow-fast split; in fact the action variables
don't evolve at all, which is the slowest possible! But, now we add a
perturbation that breaks this structure and add forcing terms to the right hand
sides,
<div>
\begin{align}
\label{eq:pertEOMJ}
    \dot{J}_a &= \epsilon F_a(\bs{J}, \bs{\phi}) , \\
\label{eq:pertEOMphi}
    \dot{\phi}^a &= \omega^a(\bs{J}) + \epsilon f^a(\bs{J}, \bs{\phi}) .
\end{align}
</div>
This doesn't need to be a Hamiltonian system.
(Here I will only do first order. This can be developed to arbitrary order; see
e.g. Lynch+[^2] for second order in the context of extreme mass-ratio inspirals,
but beware of differences in notation).


The trouble with Eqs. \eqref{eq:pertEOMJ} and \eqref{eq:pertEOMphi} is that now
both the $$J$$'s and the $$\phi$$'s can vary rapidly on the short timescale,
while there is also (usually) a slow secular drift.  A classic way to get a
simpler dynamical system is to simply *average* the right hand sides.  This is
covered in most standard textbooks like Goldstein or Jose and Saletan.  But, it
turns out we can do much better.  First, we give ourselves an *infinite* amount
of additional freedom by doubling the number of functions we're using,[^3]
<div>
\begin{align}
\label{eq:bar-tilde-split}
    \bs{J}(t) &= \bar{\bs{J}}(t) + \epsilon \tilde{\bs{J}}(t) , &
    \bs{\phi}(t) &= \bar{\bs{\phi}}(t) + \epsilon \tilde{\bs{\phi}}(t) .
\end{align}
</div>
Well, obviously we're going to need twice as many equations.  But we basically
get to pick whatever extra equations we want to close the system, which is why
NITs are so powerful: you can use them to enforce a slow/fast split; or as in
Fumagalli+,[^1] pull out gauge dependence; or maybe something else!

Anyway, a convenient choice for the $$\bar{\bs{J}}$$ variables is that they just
evolve on a slow timescale, which is $$\mathcal{O}(\epsilon^{-1})$$ longer than
the fast time given by $$|\bs{\omega}|^{-1}$$.  Let's decompose the $$F$$'s and
$$f$$'s as Fourier series on their N-tori,
<div>
\begin{align}
    F_a(\bs{J}, \bs{\phi}) &= \sum_{\vec{n}\in \mathbb{Z}^N}
    F_{a,\vec{n}}(\bs{J}) \exp(i \vec{n}\cdot\vec{\phi} ) , \\
    f^a(\bs{J}, \bs{\phi}) &= \sum_{\vec{n}\in \mathbb{Z}^N}
    f^a_{\vec{n}}(\bs{J}) \exp(i \vec{n}\cdot\vec{\phi} ) .
\end{align}
</div>
The mode with $$\vec{n}=\bs{0}$$ is just the torus-average, which is
$$\bs{\phi}$$-independent, so we can write the split
<div>
\begin{align}
    f^a(\bs{J}, \bs{\phi}) &=
    \avg{f^a}(\bs{J}) +
    \sum_{\vec{n}\neq \bs{0}}
    f^a_{\vec{n}}(\bs{J}) e^{i \vec{n}\cdot\vec{\phi}} ,
\end{align}
</div>
where the average is simply
<div>
\begin{align}
\avg{f^a}(\bs{J}) \equiv \int \frac{d^N\phi}{(2\pi)^N} f^a(\bs{J},\bs{\phi})
\end{align}
</div>
and similarly for the $$F$$'s.

Now we plug in this Fourier decomposition and the bar/tilde split from
Eq. \eqref{eq:bar-tilde-split} into the equations of motion,
<div>
\begin{align}
\label{eq:J-bar-tilde-EOM}
    \dot{\bar{J}}_a + \epsilon \dot{\tilde{J}}_a &=
    \epsilon \avg{F_a}(\bs{J})
    + \epsilon \sum_{\vec{n}\neq \bs{0}}
    F_{a,\vec{n}}(\bs{J}) e^{i \vec{n}\cdot\vec{\phi}} , \\
\label{eq:phi-bar-tilde-EOM}
    \dot{\bar{\phi}}^a + \epsilon \dot{\tilde{\phi}}^a &=
    \omega^a(\bar{\bs{J}}+\epsilon \tilde{\bs{J}})
    + \epsilon \avg{f^a}(\bs{J})
    + \epsilon \sum_{\vec{n}\neq \bs{0}}
    f^a_{\vec{n}}(\bs{J}) e^{i \vec{n}\cdot\vec{\phi}} .
\end{align}
</div>
Note that I wrote $$\omega(\bar{\bs{J}} + \epsilon\tilde{\bs{J}})$$.  We can
expand
<div>
\begin{align}
    \omega^a(\bar{\bs{J}} + \epsilon\tilde{\bs{J}}) =
    \omega^a(\bar{\bs{J}})
    + \epsilon \tilde{J}_b \frac{\pd \omega^a}{\pd J_b}(\bar{\bs{J}})
    .
\end{align}
</div>
Everywhere else on the RHSs of Eqs. \eqref{eq:J-bar-tilde-EOM} and
\eqref{eq:phi-bar-tilde-EOM}, the difference between $$\bs{J}$$ and
$$\bar{\bs{J}}$$ is higher order than we need to track, so we can safely replace
$$\bs{J}$$ with $$\bar{\bs{J}}$$ when convenient.  Similarly, we can replace
$$\bs{\phi}$$ with $$\bar{\bs{\phi}}$$ when convenient.

The first thing to notice is that if we choose the equation for
$$\dot{\bar{J}}$$ to be the averaged one,
<div>
\begin{align}
\label{eq:bar-J-dot}
    \dot{\bar{J}}_a = \epsilon \ \avg{F_a}(\bar{\bs{J}}) ,
\end{align}
</div>
then the $$\bar{J}$$ form an autonomous system that evolves only on the slow
time---there is no short-time oscillatory $$\phi$$ dependence here.  These are
the "slow" variables with secular effects.
Similarly, it would be convenient for the equation of motion for the
$$\bs{\bar{\phi}}$$ variables to only depend on $$\bar{\bs{J}}$$ on the right
hand side, similar to the action-angle equations of motion \eqref{eq:AA-EOM}.
We are free to choose
<div>
\begin{align}
\label{eq:bar-phi-dot}
    \dot{\bar{\phi}}^a = \omega^a(\bar{\bs{J}}) +
    \epsilon \ \avg{f^a}(\bar{\bs{J}}) .
\end{align}
</div>
So the phases evolve with slowly-varying frequencies.  The system of
Eqs. \eqref{eq:bar-J-dot} and \eqref{eq:bar-phi-dot} can be easily evolved over
long timescales, taking rather large timesteps.

Subtracting from the original equations of motion \eqref{eq:J-bar-tilde-EOM} and
\eqref{eq:phi-bar-tilde-EOM}, the tilde variables must satisfy
<div>
\begin{align}
\label{eq:tilde-J-dot}
    \dot{\tilde{J}}_a &= \sum_{\vec{n}\neq \bs{0}}
    F_{a,\vec{n}}(\bar{\bs{J}}) e^{i \vec{n}\cdot\bar{\phi}} , \\
\label{eq:tilde-phi-dot}
    \dot{\tilde{\phi}}^a &= \tilde{J}_b \frac{\pd \omega^a}{\pd \bar{J}_b}(\bs{\bar{J}})
    +
    \sum_{\vec{n}\neq \bs{0}}
    f^{a}_{\vec{n}}(\bar{\bs{J}}) e^{i \vec{n}\cdot\bar{\phi}} ,
\end{align}
</div>
where we have replaced unbarred with barred variables on the right hand sides,
because everything here is already $$\mathcal{O}(\epsilon)$$.  Observe that the
RHS of \eqref{eq:tilde-J-dot} has zero mean, so except for a constant of
integration---that we choose to vanish---we know that $$\tilde{\bs{J}}$$ are
purely oscillatory, with no secular effects.  Let's perform a Fourier
decomposition of $$\tilde{\bs{J}}$$ and compute its time derivative,
<div>
\begin{align}
    \tilde{J}_a &= \sum_{\vec{n}\neq \bs{0}}
    \tilde{J}_{a,\vec{n}}(\bar{\bs{J}}) e^{i \vec{n}\cdot\bar{\phi}} , \\
\label{eq:tilde-J-Fourier-dot}
    \frac{d}{dt}\tilde{J}_a &= \sum_{\vec{n}\neq \bs{0}}
    \left[
    \frac{\pd \tilde{J}_{a,\vec{n}}}{\pd \bar{J}_b} \dot{\bar{J}}_b
    + \tilde{J}_{a,\vec{n}}(\bar{\bs{J}}) (i \vec{n}\cdot \dot{\bar{\bs{\phi}}})
    \right]e^{i \vec{n}\cdot\bar{\phi}} , \\
\label{eq:tilde-J-Fourier-dot-plug-in}
    \frac{d}{dt}\tilde{J}_a &= \sum_{\vec{n}\neq \bs{0}}
    \tilde{J}_{a,\vec{n}}(\bar{\bs{J}}) (i \vec{n}\cdot \vec{\omega}(\bar{\bs{J}}))
    e^{i \vec{n}\cdot\bar{\phi}} + \mathcal{O}(\epsilon) .
\end{align}
</div>
In going from Eq. \eqref{eq:tilde-J-Fourier-dot} to
\eqref{eq:tilde-J-Fourier-dot-plug-in}, we plugged in the equations of motion
for $$\dot{\bar{\bs{J}}}$$ and $$\dot{\bar{\bs{\phi}}}$$, keeping only the
$$\epsilon^0$$ piece.  Now we simply match coefficients in this Fourier
expansion and the RHS of Eq. \eqref{eq:tilde-J-dot} to find
<div>
\begin{align}
\label{eq:tilde-J-sol}
    \tilde{J}_{a,\vec{n}}(\bar{\bs{J}}) =
    \frac{F_{a,\vec{n}}(\bar{\bs{J}})}{i \vec{n}\cdot \vec{\omega}(\bar{\bs{J}})} .
\end{align}
</div>
Notice that this will fail near resonances, where $$\tilde{\bs{J}}$$ might no
longer be small relative to $$\bar{\bs{J}}$$!  But anyway, far from (important)
resonances, if you know the Fourier decomposition of the forcing functions
$$F_a$$ on your tori, then you know the solution for $$\tilde{\bs{J}}$$ (once
you plug in a (possibly numerical) solution for $$\bar{\bs{J}}$$).

The same approach works for $$\tilde{\bs{\phi}}$$, except there is one more term
in Eq. \eqref{eq:tilde-phi-dot}.  In the term $$\tilde{J}_b
\partial\omega^a/\partial\bar{J}_b$$, it is important that
$$\partial\omega^a/\partial\bar{J}_b$$ depends only on $$\bar{\bs{J}}$$, so that
its Fourier expansion is purely "DC".  This means we don't have to re-expand a
product of Fourier expansions.  Fourier-expanding $$\tilde{\bs{\phi}}$$, taking
a time derivative, again using the time derivatives $$\dot{\bar{\bs{J}}}$$
and $$\dot{\bar{\bs{\phi}}}$$, and equating with the RHS of
Eq. \eqref{eq:tilde-phi-dot}, we eventually find
<div>
\begin{align}
    \tilde{\phi}^a_{\vec{n}}(\bar{\bs{J}}) (i \vec{n}\cdot \vec{\omega}(\bar{\bs{J}}))
    &=
    \tilde{J}_{b,\vec{n}}(\bar{\bs{J}}) \frac{\pd \omega^a}{\pd \bar{J}_b}(\bar{\bs{J}})
    + f^a_\vec{n}(\bar{\bs{J}}) , \\
    \tilde{\phi}^a_{\vec{n}}(\bar{\bs{J}})
    &=
    \frac{F_{b,\vec{n}}(\bar{\bs{J}})}{(i \vec{n}\cdot \vec{\omega}(\bar{\bs{J}}))^2}
    \frac{\pd \omega^a}{\pd \bar{J}_b}(\bar{\bs{J}})
    + \frac{f^a_\vec{n}(\bar{\bs{J}})}{i \vec{n}\cdot \vec{\omega}(\bar{\bs{J}})} ,
\end{align}
</div>
where in going to the second line we plugged in the solution for
$$\tilde{\bs{J}}$$ from Eq. \eqref{eq:tilde-J-sol}.  Here of course we still
have the problem of small denominators near resonances; but other than that, the
solution is just given in terms of Fourier coefficients, frequencies, and
(background) gradients of the frequencies, all evaluated upon the slow solution
for $$\bar{\bs{J}}$$.

## Summary

Summarizing, the full solution---with both secular drifts and oscillations on
short timescales---is reconstructed from the sums
<div>
\begin{align}
    \bs{J}(t) &= \bar{\bs{J}}(t) + \epsilon \tilde{\bs{J}}(t) , &
    \bs{\phi}(t) &= \bar{\bs{\phi}}(t) + \epsilon \tilde{\bs{\phi}}(t) ,
\end{align}
</div>
where the barred (slow) variables solve the system
<div>
\begin{align}
    \dot{\bar{J}}_a &= \epsilon \ \avg{F_a}(\bar{\bs{J}}) , \\
    \dot{\bar{\phi}}^a &= \omega^a(\bar{\bs{J}}) +
    \epsilon \ \avg{f^a}(\bar{\bs{J}}) ,
\end{align}
</div>
while the tilded (fast) variables have the Fourier expansions
<div>
\begin{align}
    \tilde{J}_a &= \sum_{\vec{n}\neq \bs{0}}
    \tilde{J}_{a,\vec{n}}(\bar{\bs{J}}) e^{i \vec{n}\cdot\bar{\phi}} , \\
    \tilde{\phi}^a &= \sum_{\vec{n}\neq \bs{0}}
    \tilde{\phi}^{a}_{\vec{n}}(\bar{\bs{J}}) e^{i \vec{n}\cdot\bar{\phi}} ,
\end{align}
</div>
where their Fourier coefficients are found from
<div>
\begin{align}
    \tilde{J}_{a,\vec{n}}(\bar{\bs{J}}) &=
    \frac{F_{a,\vec{n}}(\bar{\bs{J}})}{i \vec{n}\cdot
    \vec{\omega}(\bar{\bs{J}})} , \\
    \tilde{\phi}^a_{\vec{n}}(\bar{\bs{J}})
    &=
    \frac{F_{b,\vec{n}}(\bar{\bs{J}})}{(i \vec{n}\cdot \vec{\omega}(\bar{\bs{J}}))^2}
    \frac{\pd \omega^a}{\pd \bar{J}_b}(\bar{\bs{J}})
    + \frac{f^a_\vec{n}(\bar{\bs{J}})}{i \vec{n}\cdot \vec{\omega}(\bar{\bs{J}})} .
\end{align}
</div>


# References

[^1]: Fumagalli et al., *Nonadiabatic dynamics of eccentric black-hole binaries
    in post-Newtonian theory*, [Phys. Rev. D 112, 024012
    (2025)](https://journals.aps.org/prd/abstract/10.1103/znmj-6wvt)

[^2]: Lynch et al., *Eccentric self-forced inspirals into a rotating black
    hole*, [Class. Quantum Grav. 39 145004
    (2022)](https://iopscience.iop.org/article/10.1088/1361-6382/ac7507)

[^3]: Beware: much of the literature uses different conventions for what tilde
    denotes.  I like a bar to denote something average, and a tilde to denote
    something oscillatory.
