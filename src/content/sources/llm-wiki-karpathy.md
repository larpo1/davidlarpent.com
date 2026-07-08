---
title: LLM Wiki
author: Andrej Karpathy
type: article
link: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
date: 2026-04-04T00:00:00.000Z
tags:
  - context-engineering
  - organisational-brain
  - memory
---

<!-- note: 2026-07-08T11:20 -->
<!-- tags: organisational-brain, memory -->
<!-- published: true -->
From the person who popularised the term "context engineering", the brain half of the problem at personal scale. Not RAG, which re-derives answers from raw documents on every query, but an LLM-maintained wiki: a persistent, compounding artifact where synthesis happens at ingest, cross-references are already there and contradictions have already been flagged. Three layers (immutable sources, maintained wiki, a schema that turns the model into a disciplined maintainer rather than a chatbot) and three operations (ingest, query, lint). Permissions are barely mentioned, which is exactly the pattern this list keeps finding: scale it to an organisation and the schema layer is where the access model would have to live.
