---
title: 'Interpreting GPT: The Logit Lens'
author: nostalgebraist
type: article
link: https://www.lesswrong.com/posts/AcKRB8wDpdaN6v6ru/interpreting-gpt-the-logit-lens
date: 2020-08-31T00:00:00.000Z
tags:
  - interpretability
  - global-workspace
---

<!-- note: 2026-07-08T10:10 -->
<!-- tags: interpretability -->
<!-- published: true -->
The method's grandparent. Project intermediate activations directly onto the vocabulary to see what the model is "leaning toward saying" at each layer. The J-lens is the Jacobian generalisation of exactly this idea. Instead of a linear read-off, ask which activation directions most change the probability of each token.
