---
title: Harness Engineering
description: The engineering of the wrapper around the model — prompt structure, tool design, hooks, MCP, context windows, eval loops, and the feedback systems that make agents reliable.
tags:
  - harness-engineering
  - mcp
sources:
  - my-ai-adoption-journey-mitchell-hashimoto
  - harness-engineering-openai
  - harness-engineering-for-coding-agent-users-martin-fowler
  - harness-engineering-for-ai-coding-agents-augment-code
  - skill-issue-harness-engineering-for-coding-agents-humanlayer
  - mitchell-hashimotos-new-way-of-writing-code-the-pragmatic-engineer
  - building-claude-code-with-boris-cherny-the-pragmatic-engineer
  - dont-build-multi-agents-cognition
  - building-effective-agents-anthropic
  - introducing-the-model-context-protocol-anthropic
  - introducing-agent-skills-anthropic
  - software-3-0-andrej-karpathy
  - your-ai-product-needs-evals-hamel-husain
  - llm-powered-autonomous-agents-lilian-weng
  - react-synergizing-reasoning-and-acting-in-language-models
  - toolformer-language-models-can-teach-themselves-to-use-tools
draft: false
---

A working notebook on the discipline of harness engineering — the wrapper around the model rather than the model itself. The argument I'm tracking: that the harness defines the productivity ceiling more than the underlying weights. Mitchell Hashimoto crystallised the term in February 2026; within a week OpenAI and Anthropic had published their own treatments, and within two months Martin Fowler's site had a full-length canonical article on it. The pattern matters: a vocabulary moved from one practitioner's habit to industry consensus in eight weeks.

Threads to follow:

- **Agent = Model + Harness.** The simplest formulation, from Hashimoto. Most discussion of "AI productivity" is really discussion of harness quality.
- **Context as substrate.** The shift from prompt engineering (one-shot wording) to context engineering (the whole information environment the agent operates inside).
- **MCP as the neutral protocol.** Tools were the bottleneck; MCP made them composable.
- **Single agent vs multi-agent.** Cognition's "Don't Build Multi-Agents" paired with Anthropic's research-system writeup is the cleanest disagreement in the field — same data, opposite conclusions.
- **Evals as steering.** Hamel Husain's argument that without evals you cannot drive the system, only watch it move.
