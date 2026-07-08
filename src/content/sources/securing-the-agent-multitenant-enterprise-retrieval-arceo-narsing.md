---
title: 'Securing the Agent: Vendor-Neutral, Multitenant Enterprise Retrieval and Tool Use'
author: Francisco Javier Arceo, Varsha Prasad Narsing
type: paper
link: https://arxiv.org/abs/2605.05287
date: 2026-05-06T00:00:00.000Z
tags:
  - context-engineering
  - organisational-brain
  - access-control
  - multi-tenancy
---

<!-- note: 2026-07-08T10:10 -->
<!-- tags: access-control, multi-tenancy -->
<!-- published: true -->
Formalises the "relevance-authorization gap": retrieval ranks by similarity, not entitlement, so one tenant's query can surface another tenant's confidential data simply because it scores highest. Their fix is layered, policy-aware ingestion plus server-side enforcement of tool execution and state isolation, with an open-source reference implementation. This is the b2b2c problem stated precisely: in a shared index, semantic relevance is not permission.
