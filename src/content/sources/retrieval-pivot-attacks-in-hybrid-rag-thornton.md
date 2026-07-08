---
title: 'Retrieval Pivot Attacks in Hybrid RAG: Measuring and Mitigating Amplified Leakage from Vector Seeds to Graph Expansion'
author: Scott Thornton
type: paper
link: https://arxiv.org/abs/2602.08668
date: 2026-02-09T00:00:00.000Z
tags:
  - context-engineering
  - organisational-brain
  - access-control
  - multi-tenancy
---

<!-- note: 2026-07-08T10:40 -->
<!-- tags: multi-tenancy, access-control -->
<!-- published: true -->
The scare statistic: roughly 95% of benign queries leaked cross-tenant data in a hybrid RAG corpus, not from attackers but from organic entity connections. A shared employee name or supplier is a bridge between two customers' documents, and graph expansion walks straight across it. Read before designing anything customer-facing; the fix (authorisation enforced at the graph-expansion boundary) is cheap, but only if you know you need it.
