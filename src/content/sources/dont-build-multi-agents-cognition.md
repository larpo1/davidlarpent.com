---
title: Don't Build Multi-Agents
author: Walden Yan / Cognition
type: article
link: https://cognition.ai/blog/dont-build-multi-agents
date: 2025-06-12T00:00:00.000Z
tags:
  - harness-engineering
  - agents
  - context-engineering
---

<!-- note: 2026-05-11T21:42 -->
<!-- tags: context-engineering, context-compaction -->
<!-- published: true -->
Most multi agent patterns fail for one of two main problems: 1. lack of common context, for example in the case of dispatching multiple parallel subagents, or 2. context overflow, in the case of uncompacted linear sub agent processes. Context compaction is answer to the second problem.