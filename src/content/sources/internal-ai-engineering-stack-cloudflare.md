---
title: The AI engineering stack we built internally, on the platform we ship
author: Ayush Thakur, Scott Roe-Meschke, Rajesh Bhatia / Cloudflare
type: article
link: https://blog.cloudflare.com/internal-ai-engineering-stack/
date: 2026-04-20T00:00:00.000Z
tags:
  - context-engineering
  - organisational-brain
  - how-to
---

<!-- note: 2026-07-08T11:50 -->
<!-- tags: organisational-brain, how-to -->
<!-- published: true -->
The best build writeup on this list: a real production system serving 3,683 employees and 241 billion tokens a month. Three layers worth copying wholesale. Zero-trust access and a single gateway at the front; a knowledge layer of service catalogues, MCP servers and AGENTS.md files generated across 3,900 repos; an enforcement layer of review agents that cite organisational standards by rule ID. The lesson to steal: route everything through one proxy from day one, so permissions, models and tracking update centrally without touching a single client.
