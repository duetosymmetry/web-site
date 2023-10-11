---
layout: pub-link
title: "Numerical relativity surrogate model with memory effects and post-Newtonian hybridization"
modified: 2023-10-11
categories: pubs
excerpt:
tags: [gravity, gravitational waves, numerical relativity, LIGO, black holes]
pub:
  authors: "Jooheon Yoo, Keefe Mitman, Vijay Varma, Michael Boyle, Scott E. Field, Nils Deppe, François Hébert, Lawrence E. Kidder, Jordan Moxon, Harald P. Pfeiffer, Mark A. Scheel, Leo C. Stein, Saul A. Teukolsky, William Throwe, Nils L. Vu"
  doi: "10.1103/PhysRevD.108.064027"
  arXiv: "2306.03148"
  jref: "Phys. Rev. D <b>108</b>, 064027 (2023)"
date: 2023-06-05
---

![]({{ site.url }}/images/CCE-surrogate.png)
{: .align-right style="width: 350px; margin: 2em 0 0 1em;"}
> Numerical relativity simulations provide the most precise templates
> for the gravitational waves produced by binary black hole
> mergers. However, many of these simulations use an incomplete
> waveform extraction technique -- extrapolation -- that fails to
> capture important physics, such as gravitational memory
> effects. Cauchy-characteristic evolution (CCE), by contrast, is a
> much more physically accurate extraction procedure that fully
> evolves Einstein's equations to future null infinity and accurately
> captures the expected physics. In this work, we present a new
> surrogate model, <tt>NRHybSur3dq8_CCE</tt>, built from CCE waveforms
> that have been mapped to the post-Newtonian (PN) BMS frame and then
> hybridized with PN and effective one-body (EOB) waveforms. This
> model is trained on 102 waveforms with mass ratios q≤8 and aligned
> spins χ<sub>1z</sub>,χ<sub>2z</sub> ∈ [−0.8,0.8]. The model spans
> the entire LIGO-Virgo-KAGRA (LVK) frequency band (with
> f<sub>low</sub>=20Hz) for total masses M ≳ 2.25M<sub>⊙</sub> and
> includes the ℓ≤4 and (ℓ,m)=(5,5) spin-weight −2 spherical harmonic
> modes, but not the (3,1), (4,2) or (4,1) modes. We find that
> <tt>NRHybSur3dq8_CCE</tt> can accurately reproduce the training
> waveforms with mismatches ≲ 2×10<sup>−4</sup> for total masses
> 2.25M<sub>⊙</sub> ≤ M ≤ 300M<sub>⊙</sub> and can, for a modest
> degree of extrapolation, capably model outside of its training
> region. Most importantly, unlike previous waveform models, the new
> surrogate model successfully captures memory effects.
