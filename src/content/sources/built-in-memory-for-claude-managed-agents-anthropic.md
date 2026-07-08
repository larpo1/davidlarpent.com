---
title: Built-in memory for Claude Managed Agents
author: Anthropic
type: article
link: https://claude.com/blog/claude-managed-agents-memory
date: 2026-04-23T00:00:00.000Z
tags:
  - context-engineering
  - organisational-brain
  - memory
---

<!-- note: 2026-07-08T10:25 -->
<!-- tags: memory, organisational-brain -->
<!-- published: true -->
Agent memory shipped as files on a filesystem: exportable, editable, manageable via API, read and written with the same bash tools the agent already uses. The design choice matters more than the feature. Memory you can inspect is memory you can govern; opaque memory cannot respect need-to-know because nobody can see what it holds. If the organisational brain is going to remember things, this is the auditable end of the spectrum.
