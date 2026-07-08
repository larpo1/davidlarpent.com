---
title: Context Engineering
description: 'How to build an organisational brain: a context system that gives a company''s people and agents deep, current knowledge while enforcing need-to-know and least privilege, from the boardroom to the end user.'
tags:
  - context-engineering
  - organisational-brain
sources:
  - company-brain-request-for-startups-y-combinator
  - securing-the-agent-multitenant-enterprise-retrieval-arceo-narsing
  - okta-for-ai-agents-general-availability-okta
  - what-is-a-company-brain-falconer
  - built-in-memory-for-claude-managed-agents-anthropic
  - context-kubernetes-mouzouni
  - knowledge-activation-ai-skills-institutional-knowledge-bakal
  - retrieval-pivot-attacks-in-hybrid-rag-thornton
  - company-knowledge-in-chatgpt-openai
  - effective-context-engineering-for-ai-agents-anthropic
  - enterprise-ai-must-enforce-participant-aware-access-control-bhatt
draft: false
---

A working notebook on context engineering, focused on one question: how to build an organisational brain. Not a wiki, not enterprise search, but a living context system that gives a company's people and agents knowledge that is deep, wide and current, while respecting need-to-know and least privilege at every tier: CEO, HR, SMT, Product and GTM inside the business, then customers in a b2b relationship, then their end users in a b2b2c one.

The through-line, from three months of reading (April to July 2026): the market has named the thing (YC's Summer 2026 RFS calls the company brain "the missing primitive"; vendors call it a moat) but nearly all the demand-side writing is silent on permissions. Meanwhile the security literature has quietly established that the permission half is where the design lives, and that the failure mode is structural, not adversarial: shared entities leak across boundaries under entirely benign queries. The brain and the access model are not two problems. They are one.

Threads to follow:

- **The market names itself.** Blomfield's RFS and Falconer's moat argument define the product category, and neither says a word about who is allowed to see what. The gap between the pitch and the papers is the opportunity.
- **Relevance is not authorisation.** The load-bearing distinction. Retrieval ranks by similarity; entitlement is orthogonal; a shared index conflates them by default. Arceo and Narsing formalise it, Thornton quantifies it (95% of benign queries leaking cross-tenant), and it is the reason a naive company-wide RAG index is a breach waiting for a query.
- **Deterministic, not probabilistic.** Bhatt et al.'s rule: guardrails and output filters fail, so authorisation must be enforced before the model sees anything, at ingestion and retrieval, never patched after generation. Need-to-know is a precondition, not a filter.
- **Agent authority is a strict subset of human authority.** Context Kubernetes' permission model and Okta's delegation tokens converge on the same invariant from opposite directions, one from knowledge orchestration, one from identity. An agent should never know more than the person it acts for.
- **Memory you can audit.** Anthropic's files-on-a-filesystem design: memory that is inspectable is memory that can be governed. Opaque memory cannot respect need-to-know because nobody can see what it holds.
- **Inherited versus designed permissions.** OpenAI's company knowledge inherits source-system ACLs, which ships today and ceilings tomorrow. The privilege hierarchy an organisation actually needs, running from the CEO's full picture down to a single end user's slice, has to be designed. No vendor ships it yet.

Order runs newest-first by publication date: the 2026 material at the top is the last three months of the argument, the 2025 tail is the lineage it rests on. Read up the page for the state of play, down the page for how we got here.
