---
layout: pub-link
title: "GWSurrogate: A Python package for gravitational wave surrogate models"
modified:
categories: pubs
excerpt:
tags: [gravity, gravitational waves, general relativity, numerical relativity, SXS, surrogate, python, code, scientific computing, numerical methods]
pub:
  authors: "Scott E. Field, Vijay Varma, Jonathan Blackman, Bhooshan Gadre, Chad R. Galley, Tousif Islam, Keefe Mitman, Michael Pürrer, Adhrit Ravichandran, Mark A. Scheel, Leo C. Stein, and Jooheon Yoo"
  doi: "10.21105/joss.07073"
  arXiv: "2504.08839"
  jref: "J. Open Source Softw., 10(107), 7073"
date: 2025-03-29
---

![]({{ site.url }}/images/gwsurrogate.png)
{: .align-right style="width: 350px; margin: 2em 0 0 1em;"}
> Fast and accurate waveform models are fundamentally important to
> modern gravitational wave astrophysics, enabling the study of
> merging compact objects like black holes and neutron stars. However,
> generating high-fidelity gravitational waveforms through numerical
> relativity simulations is computationally intensive, often requiring
> days to months of computation time on supercomputers. Surrogate
> models provide a practical solution to dramatically accelerate
> waveform evaluations (typically tens of milliseconds per evaluation)
> while retaining the accuracy of computationally expensive
> simulations. The GWSurrogate Python package provides easy access to
> these gravitational wave surrogate models through a user-friendly
> interface. Currently, the package supports 16 surrogate models, each
> varying in duration, included physical effects (e.g., nonlinear
> memory, tidal forces, harmonic modes, eccentricity, mass ratio
> range, precession effects), and underlying solution methods (e.g.,
> Effective One Body, numerical relativity, black hole perturbation
> theory). GWSurrogate models follow the waveform model conventions
> used by the LIGO-Virgo-Kagra collaboration, making the package
> immediately suitable for both theoretical studies and practical
> gravitational wave data analysis. By enabling rapid and precise
> waveform generation, GWSurrogate serves as a production-level tool
> for diverse applications, including parameter estimation, template
> bank generation, and tests of general relativity.
