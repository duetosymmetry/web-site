---
layout: pub-link
title: "Merger remnant and eccentricity dynamics surrogates for eccentric nonspinning black hole binaries"
modified:
categories: pubs
excerpt:
tags: [gravity, general relativity, black holes, dynamics, python, surrogate, SXS]
pub:
  authors: "Adhrit Ravichandran, Peter James Nee, Keefe Mitman, Tousif Islam, Scott E. Field, Vijay Varma, Michael Boyle, Andrea Ceja, Nils Deppe, Noora Ghadiri, Lawrence E. Kidder, Prayush Kumar, Marlo Morales, Jordan Moxon, Kyle C. Nelli, Harald P. Pfeiffer, Antoni Ramos-Buades, Katie Rink, Hannes R. Rüter, Mark A Scheel, Md Arif Shaikh, Leo C. Stein, Daniel Tellez, William Throwe, Nils L. Vu"
  doi:
  arXiv: "2605.00124"
  jref:
date: 2026-04-30
---

![]({{ site.url }}/images/posts/ecc-dyn-rem-surr/rem-mass-wiggles.png)
{: .align-right style="width: 350px; margin: 2em 0 0 1em;"}
> Accurate models of merger remnants are increasingly important for gravitational-wave science, including precision tests of gravity with ringdown, inference of black-hole populations, and modeling hierarchical mergers. For eccentric binaries, remnant mass, spin, and recoil carry nontrivial imprints of eccentricity that are both physically informative and more challenging to model, yet remain less developed than in the quasi-circular case. We present two new models trained on numerical-relativity (NR) simulations of unequal-mass, non-spinning eccentric binary black holes: `NRSurE_q4NoSpin_Remnant`, which predicts remnant properties, and `NRSurE_q4NoSpin_Dynamics`, a time-domain surrogate for the evolution of eccentricity and mean anomaly. Both models are trained on NR simulations over a three-dimensional parameter space with mass ratios $$q\le4$$, eccentricity $$e<0.23$$, and mean anomaly $$\ell\in[0,2\pi)$$ radians, where both $$e$$ and $$\ell$$ defined at $$t=-1000M$$ relative to peak amplitude and $$M$$ is the total mass. We highlight some applications, including the phenomenological impact of eccentricity on remnant properties and the enhancement or suppression of recoil. We also provide error estimates for all modeled quantities, supporting reliable use in current and future gravitational-wave parameter-estimation analyses. Both models will be made available through open-source codes.
