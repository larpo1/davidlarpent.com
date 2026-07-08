---
title: Authorizing access to data with RAG implementations
author: Riggs Goodman III / AWS
type: article
link: https://aws.amazon.com/blogs/security/authorizing-access-to-data-with-rag-implementations/
date: 2025-09-18T00:00:00.000Z
tags:
  - context-engineering
  - organisational-brain
  - access-control
  - how-to
---

<!-- note: 2026-07-08T12:00 -->
<!-- tags: access-control, how-to -->
<!-- published: true -->
The cloud-vendor recipe, with working code. The operating assumption is the right one: any chunk passed to the model can be returned to the user, so chunks are filtered against the caller's access grants before the model ever sees them. Published the same day as the participant-aware access control paper, and effectively that argument implemented: authorisation as a deterministic precondition enforced at retrieval, not a filter applied after generation.
