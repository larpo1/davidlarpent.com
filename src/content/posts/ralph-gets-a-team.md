---
title: Ralph 2.0
date: 2026-02-06T00:00:00.000Z
description: Claude Opus 4.6 makes Ralph Loops reliable
draft: true
tags:
  - AI
  - automation
  - tools
  - development
category: not-work
---
Last week I wrote about [running Claude Code in a bash loop](/posts/ralph-loops). One agent, one task file, a PM that kept sneaking off to write React components. Charming chaos.

Anthropic released Claude Opus 4.6 yesterday, and with it, sub-agents: multiple agents with distinct roles running inside a single session. The PM plans. Ralph builds. A third agent reviews. One window instead of two.

The interesting bit is structural. In the old setup, the PM wouldn’t stay in its lane because you were asking it nicely not to code. Now the PM literally cannot run code. No Bash access. “Please don’t” became “you can’t,” which turns out to be the same gap that separates company values posters from actual org design.

It burns through tokens. I haven’t measured whether this is faster than just doing it myself. I’ve been too busy tinkering with the setup to measure the setup. I’m aware of the irony.

The model is one day old. I suspect the ceiling is a long way up.