---
layout: pub-link
title: "Optimizing post-Newtonian parameters and fixing the BMS frame for numerical-relativity waveform hybridizations"
modified:
categories: pubs
excerpt:
tags: [BMS, hybrid, post-Newtonian, SXS, asymptotia, gravity, gravitational waves, general relativity, numerical relativity, black holes]
pub:
  authors: "Dongze Sun, Michael Boyle, Keefe Mitman, Mark A. Scheel, Leo C. Stein, Saul A. Teukolsky, Vijay Varma"
  doi:
  arXiv: "2403.10278"
  jref:
date: 2024-03-19
---

![]({{ site.url }}/images/PN-NR-handshake-1920.png)
{: .align-right style="width: 350px; margin: 2em 0 0 1em;"}
> Numerical relativity (NR) simulations of binary black holes provide
> precise waveforms, but are typically too computationally expensive
> to produce waveforms with enough orbits to cover the whole frequency
> band of gravitational-wave observatories. Accordingly, it is
> important to be able to hybridize NR waveforms with analytic,
> post-Newtonian (PN) waveforms, which are accurate during the early
> inspiral phase. We show that to build such hybrids, it is crucial to
> both fix the Bondi-Metzner-Sachs (BMS) frame of the NR waveforms to
> match that of PN theory, and optimize over the PN parameters. We
> test such a hybridization procedure including all spin-weighted
> spherical harmonic modes with |m|≤ℓ for ℓ≤8, using 29 NR waveforms
> with mass ratios q≤10 and spin magnitudes |χ₁|,|χ₂|≤0.8. We find
> that for spin-aligned systems, the PN and NR waveforms agree very
> well. The difference is limited by the small nonzero orbital
> eccentricity of the NR waveforms, or equivalently by the lack of
> eccentric terms in the PN waveforms. To maintain full accuracy of
> the simulations, the matching window for spin-aligned systems should
> be at least 5 orbits long and end at least 15 orbits before
> merger. For precessing systems, the errors are larger than for
> spin-aligned cases. The errors are likely limited by the absence of
> precession-related spin-spin PN terms. Using 10⁵M long NR waveforms,
> we find that there is no optimal choice of the matching window
> within this time span, because the hybridization result for
> precessing cases is always better if using earlier or longer
> matching windows. We provide the mean orbital frequency of the
> smallest acceptable matching window as a function of the target
> error between the PN and NR waveforms and the black hole spins.
