---
layout: pub-link
title: "Fixing the center-of-mass frame of numerical relativity waveforms using the post-Newtonian center-of-mass charge"
modified: 2026-08-03
categories: pubs
excerpt:
tags: [gravity, general relativity, black holes, dynamics]
pub:
  authors: "Aniket Khairnar, Leo C. Stein, Michael Boyle, Nils Deppe, Lawrence E. Kidder, Keefe Mitman, Jordan Moxon, Kyle C. Nelli, William Throwe, Nils L. Vu"
  doi: "10.1103/w57c-gp1p"
  arXiv: "2603.24661"
  jref: "Phys. Rev. D <b>114</b>, 024087 (2026)"
date: 2026-03-26
---

![]({{ site.url }}/images/posts/PN-COM-BMS-fixing/comcharge.png)
{: .align-right style="width: 350px; margin: 2em 0 0 1em;"}
> The Bondi--van der Burg--Metzner--Sachs (BMS) frame of gravitational waves produced by numerical relativity (NR) simulations is crucial for building accurate waveform models. A proper comparison of NR waveforms with other models requires fixing the arbitrary BMS frame. In this work we improve the center-of-mass (CoM) frame fixing for quasicircular, nonprecessing binary systems. Past work approximated the CoM motion with just a linear fit. We compute a post-Newtonian result of the boosted CoM charge to also capture its physical out-spiraling oscillations. We show that using the analytical results improves the robustness of the fit parameters -- translation and boost vectors -- to the choice of duration and time of the fitting window. Our analysis demonstrates a maximum improvement in robustness when the window is placed at the center of the inspiral. We quantified this improvement by computing the ratio of variances of fit parameters when the fit window size is varied. The largest improvement in robustness of parameters is by a factor of ∼25 for the boost vector and ∼20 for the translation vector. Finally, we incorporate this method into the BMS frame-fixing routine of the python package 𝚜𝚌𝚛𝚒 for waveforms produced with Cauchy-characteristic evolution.
