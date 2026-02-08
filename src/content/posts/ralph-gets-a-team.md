---
title: Ralph Gets a Team
date: 2026-02-08T00:00:00.000Z
description: Opus 4.6 Sub-agents turn a solo bash loop into a squad.
draft: false
tags:
  - AI
  - automation
  - tools
  - development
category: not-work
featureImage: /images/posts/ralph-gets-a-team/sketch-1770575431.jpg
---
Last week I wrote about [running Claude Code in a bash loop](/posts/ralph-loops). One agent, one task file, a PM that kept sneaking off to write React components. Charming chaos.

Anthropic released Claude Opus 4.6, and with it, sub-agents: multiple agents with distinct roles running inside a single session. The PM plans. Ralph builds. A third agent tests. One window instead of two terminals fighting over the same codebase.

Anthropic’s own research on building effective agents states: the most successful implementations use simple, composable patterns rather than elaborate frameworks. Three patterns in particular have been useful.

## Three Patterns

Anthropic’s guide identifies several agent architectures. 

**Orchestrator-Worker.** A lead agent decomposes work, delegates to specialists, synthesises the results. The orchestrator doesn’t do the work. It decides what the work is.

**Evaluator-Optimizer.** One agent generates output. Another evaluates it against criteria. If it fails, the generator gets another pass. This loop continues until quality meets the bar or everyone gives up.

**Tool Restriction.** Instead of prompting an agent to stay in its lane (“please don’t write code”), you remove the tools it would need to stray. The lane has walls. This turns out to be much more reliable than polite instructions, which is a lesson that generalises well beyond AI.

The insight from Anthropic’s research is that these patterns compose. You don’t pick one. You layer them. An orchestrator delegates to workers who are evaluated by a separate agent, and all of them are constrained by which tools they can access.

## The Starting Point

I have three agents. Each has a config file that defines its name, description, allowed tools, and a system prompt explaining its role. Here’s the actual setup.

### PM (Orchestrator)

```
name: pm
description: Product manager. Plans, reviews, delegates. Never implements.
disallowedTools: Write, Edit, NotebookEdit
```

The PM breaks work into tasks, reviews completed output, and dictates what goes into the task file. The critical line is `disallowedTools: Write, Edit`. The PM literally cannot modify code. In the old two-terminal setup, the PM would drift into implementation within thirty seconds. Couldn’t help itself.  Now its locked out of the code. 

Ralph (Worker)

```
name: ralph
description: Implementation agent. Writes code, runs builds, commits, pushes.
tools: Read, Write, Edit, Bash, Glob, Grep
```

Ralph reads the task file, finds the first incomplete task, implements exactly what’s specified, runs the build, commits, pushes, and moves to the next one. 

This is the worker in the orchestrator-worker pattern. Ralph does exactly what he’s told, which is both his greatest strength and, occasionally, a limitation. He won’t push back if the task is poorly specified. He’ll just produce exactly what you asked for, even if what you asked for was wrong.

### Tester (Evaluator)

```
name: tester
description: Test verification agent. Writes Playwright tests, verifies counts.
model: sonnet
```

The Tester runs on Sonnet, a cheaper and faster model. Its job is narrow: write the tests specified in the task, run them, verify the count matches what was expected, and refuse to mark anything complete until all checks pass.

This is the evaluator in the evaluator-optimizer pattern. The Tester doesn’t care whether the code is elegant. It cares whether the code does what the task said it should do. It has an explicit verification protocol:

1.  Run `npm test`. All pass, no failures.
2.  Count matches expected. If the task says “+6 tests,” there had better be six new tests.
3.  Test file exists at the specified path.
4.  Every scenario from the task description is covered.

If any check fails, it doesn’t mark the task complete. Ralph gets another pass.

### Memory

Each agent has its own persistent memory file. Ralph accumulates Astro gotchas and build system quirks. The Tester records which Playwright patterns are reliable and which selectors are flaky. The PM tracks what’s been shipped and what tends to go wrong.

They get better at their specific jobs over time, which is the kind of spending pattern that feels rational in the moment and questionable in the shower afterwards.

## The Full Squad

Three agents is a starting point. Here’s what an optimal setup looks like if you want to take the pattern further.

**Architect (Structural Review).** Read-only, like the PM. Reviews changes for layering violations, coupling, separation of concerns. Runs after implementation, before merge. This is an evaluator focused on structural quality rather than functional correctness. The Architect answers “does this fit?” while the Tester answers “does this work?”

**Infosec (Security Gate).** Scans for OWASP top 10 violations, credential leaks, injection vulnerabilities. Read-only. Cannot fix what it finds, only flag it. You want this agent to be unable to write code for the same reason you want your security auditor to be independent of your development team. The separation is the point.

**Code Reviewer (Style and Standards).** Checks naming conventions, dead code, complexity metrics. Different from the Architect in the same way a copy editor is different from a structural editor: micro versus macro concerns. Could run on a cheaper model since the task is mostly pattern-matching.

The pattern across all of these is the same. Each agent has a clear role, enforced boundaries, and a specific thing it evaluates. Quality comes from the separation of concerns, not from any individual agent being smarter. An agent that writes code and reviews its own code is about as reliable as a student marking their own homework.

## How the Loop Works

Here’s a concrete walkthrough. I want to add a new feature to this site.

1.  I describe what I want to the PM.
2.  The PM breaks it into tasks in the task file, each with a specific format:

```
- [ ] **Add image generation button to toolbar**
      - **What:** Add a button that captures text selection
                  and opens a generation panel.
      - **Why:** The toolbar is the natural entry point
                  for content actions.
      - **File(s):** src/components/EditToolbar.astro
      - **Test:** npm run build passes. Button appears.
      - **Commit:** feat: Add image generation button
```

3.  Ralph picks the first incomplete task, reads the relevant files, implements it, builds, commits, pushes.
4.  The Tester picks the corresponding test task, writes Playwright tests, verifies the count increased by the expected delta.
5.  If anything fails, Ralph gets another pass.
6.  If everything passes, next task.

The format matters more than it looks. Each task specifies which files to touch, what the commit message should be, and how to verify success. Ralph doesn’t have to make judgment calls about any of this. He just follows the spec.

One lesson I learned the hard way: Ralph skips tests unless they are separate tasks with expected test counts. For a while, I embedded test requirements inside implementation tasks. “Also write tests for this.” Ralph would implement the feature, glance at the test requirement, decide the build passing was close enough, and move on. Now test tasks are structurally separate, with explicit pass/fail criteria. Quality gates only work when they’re enforced at the structural level, not requested politely.

## Setting This Up

If you want to try this yourself, the setup is simpler than it sounds.

**1\. Create the agent directory.** `.claude/agents/` in your project root.

**2\. Define each agent.** A markdown file with YAML frontmatter:

```
---
name: pm
description: Plans and reviews. Never implements.
disallowedTools: Write, Edit, NotebookEdit
model: inherit
memory: project
---

You are the PM. You plan. You do not implement.

## Your Job
- Break work into clear tasks
- Review completed work against intent
- Dictate tasks for the task file

## Rules
- You CANNOT write or edit files. Enforced at the tool level.
- If asked to "just quickly do it", refuse. Dictate a task.
- Keep tasks atomic. One task = one commit.
```

**3\. Write a task file** with tasks that include verification criteria. The format above works. 

**4\. Let agents accumulate memory.** Each agent gets a directory at `.claude/agent-memory/{name}/`. 

The design decisions that matter most: `disallowedTools` over “please don’t” prompting. Separate test tasks with expected counts. Agent memory for accumulated expertise. Everything else is tuning.

## Honest Caveats

More agents means more tokens means more money. Running three agents through a feature with ten tasks and corresponding test tasks is not cheap. 

Tool restrictions can be annoying when you want a quick shortcut. Sometimes you just want the PM to fix a typo.

Agents still don’t push back on bad ideas. The whole squad will deliver exactly the wrong thing if that’s what you asked for.

Human judgment is still the bottleneck. 

## The Punchline

The irony is hard to miss. The best way to improve AI coding output turns out to be org design. Clear roles. Enforced boundaries. Someone checking the work. A separation between planning and execution, between generation and evaluation.

These composable patterns aren’t really AI-specific. They’re management patterns with tool-level enforcement.  We’ve been doing this with humans for decades. AI agents need the same structure, for the same reasons.

[^1]: Anthropic, "Building Effective Agents" (2025). The guide covers workflow patterns including prompt chaining, routing, parallelisation, orchestrator-worker, and evaluator-optimizer. The key insight: "Agents can be used for open-ended problems where it's difficult or impossible to predict the required number of steps." [anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents)

[^2]: At time of writing, the agent memory files collectively contain tips like "Astro dynamic routes need `export const prerender = false`" and "don't use -uall flag on git status." Exactly the kind of institutional knowledge that usually lives in a senior engineer's head and leaves when they do.

[^3]: This echoes a broader principle. Asking nicely doesn't scale. Structural enforcement does. If you've worked in any regulated industry, this will sound familiar. The compliance team doesn't ask traders to please not exceed their risk limits.

[^4]: Chris MDP, who popularised the Ralph Loops technique, noted he "exhausted [his] Max5 allocation within a few hours." With multiple agents, the burn rate is correspondingly higher. His writeup: [chrismdp.com/running-ralph-loops-is-easy](https://www.chrismdp.com/running-ralph-loops-is-easy/)
