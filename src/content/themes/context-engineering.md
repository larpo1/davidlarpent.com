---
title: Context Engineering
description: 'How to build an organisational brain: a context system that gives a company''s people and agents deep, current knowledge while enforcing need-to-know and least privilege, from the boardroom to the end user.'
tags:
  - context-engineering
  - organisational-brain
sources:
  - company-brain-request-for-startups-y-combinator
  - securing-the-agent-multitenant-enterprise-retrieval-arceo-narsing
  - document-level-rbac-for-rag-pipelines-truto
  - okta-for-ai-agents-general-availability-okta
  - what-is-a-company-brain-falconer
  - built-in-memory-for-claude-managed-agents-anthropic
  - internal-ai-engineering-stack-cloudflare
  - context-kubernetes-mouzouni
  - llm-wiki-karpathy
  - knowledge-activation-ai-skills-institutional-knowledge-bakal
  - retrieval-pivot-attacks-in-hybrid-rag-thornton
  - company-knowledge-in-chatgpt-openai
  - effective-context-engineering-for-ai-agents-anthropic
  - authorizing-access-to-data-with-rag-implementations-aws
  - enterprise-ai-must-enforce-participant-aware-access-control-bhatt
draft: false
---

A working notebook on context engineering, focused on one question: how to build an organisational brain. Not a wiki, not enterprise search, but a living context system that gives a company's people and agents knowledge that is deep, wide and current, while respecting need-to-know and least privilege at every tier. The motivating case is my own organisation, a b2b2c SaaS business in the property technology space, where the tiers are concrete: the CEO's full picture, then HR, SMT, Product and GTM inside the business, then customers in a b2b relationship, then their guests and residents at the end of the chain, each entitled to a progressively narrower slice of the same brain.

The through-line, from three months of reading (April to July 2026): the market has named the thing (YC's Summer 2026 RFS calls the company brain "the missing primitive"; vendors call it a moat) but nearly all the demand-side writing is silent on permissions. Meanwhile the security literature has quietly established that the permission half is where the design lives, and that the failure mode is structural, not adversarial: shared entities leak across boundaries under entirely benign queries. The brain and the access model are not two problems. They are one.

Threads to follow:

- **The market names itself.** Blomfield's RFS and Falconer's moat argument define the product category, and neither says a word about who is allowed to see what. The gap between the pitch and the papers is the opportunity.
- **Relevance is not authorisation.** The load-bearing distinction. Retrieval ranks by similarity; entitlement is orthogonal; a shared index conflates them by default. Arceo and Narsing formalise it, Thornton quantifies it (95% of benign queries leaking cross-tenant), and it is the reason a naive company-wide RAG index is a breach waiting for a query.
- **Deterministic, not probabilistic.** Bhatt et al.'s rule: guardrails and output filters fail, so authorisation must be enforced before the model sees anything, at ingestion and retrieval, never patched after generation. Need-to-know is a precondition, not a filter.
- **Agent authority is a strict subset of human authority.** Context Kubernetes' permission model and Okta's delegation tokens converge on the same invariant from opposite directions, one from knowledge orchestration, one from identity. An agent should never know more than the person it acts for.
- **Memory you can audit.** Anthropic's files-on-a-filesystem design and Karpathy's LLM wiki are the same instinct at different scales: knowledge as plain, inspectable files, synthesis done at ingest rather than at query time. Memory that is inspectable is memory that can be governed; opaque memory cannot respect need-to-know because nobody can see what it holds.
- **From paper to production.** The how-to layer, for an engineering org that wants to start this quarter. Cloudflare's internal stack is the reference build (gateway, knowledge layer, enforcement layer, everything through one proxy); Truto's six-step RBAC recipe and AWS's chunk-authorisation pattern are the permission plumbing, with code. Notable that the production writeups enforce at retrieval, exactly where the research papers said the enforcement has to live.
- **Inherited versus designed permissions.** OpenAI's company knowledge inherits source-system ACLs, which ships today and ceilings tomorrow. The privilege hierarchy an organisation actually needs, running from the CEO's full picture down to a single end user's slice, has to be designed. No vendor ships it yet.

Order runs newest-first by publication date: the 2026 material at the top is the last three months of the argument, the 2025 tail is the lineage it rests on. Read up the page for the state of play, down the page for how we got here.
