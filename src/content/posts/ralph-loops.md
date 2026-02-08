---
title: On Ralph Loops
date: 2026-01-30T00:00:00.000Z
description: Or how to run Claude Code like a sweatshop
draft: false
tags:
  - AI
  - automation
  - tools
  - development
category: not-work
featureImage: /images/posts/ralph-loops/sketch-1770516071.jpg
---
This particular rabbit hole might seem ironic, given [the other thing I wrote today](/posts/what-we-lose-when-we-stop-struggling), but here goes.

There’s a technique doing the rounds called “Ralph Wiggum loops.” Named after the Simpsons character who keeps trying despite overwhelming evidence that he should stop.

The idea is that you spin up one Claude Code instance as your PM to work on tasks, todos, docs and tests and limit it to iteratively update only a CLAUDE.md file. You then spin up a second Claude Code instance (Ralph) which you run in a bash loop, picking tasks, executing, going again. 

I’ve been playing with this. It’s amusing.

## The basic setup

At its most basic:

```
while :; do cat PROMPT.md | claude ; done
```

That’s the whole thing. Claude reads your prompt, does some work, tries to exit like a professional, and the loop shoves it back in the room like a whip cracker in a sweatshop.

It picks up where it left off because the codebase has changed. The tests that were failing are now… different tests that are failing. Progress.

Someone made a plugin for this. Because of course they did.

## ”Pretengineering”

You heard it here first. OK fine. “Vibe Coding”. Whatever. 

You’re asking an AI to do work. It does some work. Then it tries to leave. You don’t let it leave. It sighs and does more work. This continues until either success or you run out of money.

This is how you train a puppy, or solve a Rubik’s cube by randomly turning bits ‘til the colours line up.

## How to start

### Option 1: Artisanal Hand-Crafted Loop

Create a file called `RALPH.md`:

```
Build a todo API.

When it works, create a file called DONE.txt

If you're stuck after 10 attempts, create STUCK.txt and explain why.
```

Then:

```
while [ ! -f DONE.txt ] && [ ! -f STUCK.txt ]; do 
  claude -p "Read RALPH.md. Continue working."
done
```

Go make tea. Check back in 20 minutes. Either you have an API or you have a confession.

### Option 2: The Fancy Plugin

```
/ralph-loop:ralph-loop "Build a todo API" --max-iterations 30 --completion-promise "DONE"
```

The `--max-iterations` is important unless you enjoy explaining large API bills to your finance team.

### Option 3: Full Production Setup

Chris MDP has a [whole system](https://github.com/chrismdp/ralph) with work queues, separate PM sessions, git worktrees for parallel execution…

At this point you’re building infrastructure to manage your AI that’s building infrastructure for you. It’s loops all the way down.

## When This Works

The sweet spot is narrower than the hype suggests.

**Works:** Clear success criteria, automated verification, you can walk away, scope is contained.

“Make the tests pass” is a good Ralph task. “Make the architecture elegant” is how you get a codebase that looks like it was designed by a committee of sleep-deprived squirrels.

**Doesn’t work:** Design judgment, subjective quality, tight deadlines, anything going near production.

## The Two-Terminal Problem

If you run a separate Claude instance as “PM” to plan work while Ralph builds, you’ll discover something amusing: the PM will immediately try to do the work itself.

Thirty seconds into its planning role, mine was already writing React components. Couldn’t help itself. Watching work exist without doing it is apparently as hard for AI as it is for that guy in every standup who can’t stop volunteering.

The fix is a `PM.md` file that repeatedly insists it stay in its lane. Even then, it drifts. Some things are universal.

## Honest Caveats

**This burns money.** Running Claude in a loop for hours is not cheap. Budget accordingly.

**The code needs review.** It works, in the sense that the tests pass. Whether it’s _good_ code is a separate question.

**It’s not pair programming.** Ralph doesn’t push back on your ideas or suggest better approaches. It just… does what you said, over and over, until something works.

## So Why Bother?

Because it’s an entertaining way to do things you don’t care that much about.

Because there’s something delightful about waking up to a feature that didn’t exist when you went to sleep.

Because it forces you to think clearly about what you actually want, which turns out to be useful even when humans are writing the code.

And because I suspect this is a preview of something.

[^1]: The technique and plugin are documented at [awesomeclaude.ai/ralph-wiggum](https://awesomeclaude.ai/ralph-wiggum). The name references Ralph Wiggum from The Simpsons, a character whose defining trait is cheerful persistence despite consistent failure.

[^2]: Chris MDP's implementation adds sophisticated features like "beads" (units of work), a separate PM session for task management, and git worktrees for parallel execution. His detailed writeup: [chrismdp.com/running-ralph-loops-is-easy](https://www.chrismdp.com/running-ralph-loops-is-easy/)

[^3]: From Chris MDP's blog: "I exhausted my Max5 allocation within a few hours. The value exceeded the cost, so I upgraded to Max20 without hesitation." Your mileage may vary, but assume this will burn through tokens quickly.
