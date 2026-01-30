---
title: "I Put an AI in a Loop and Went to Make Tea"
date: 2026-01-30
description: "Ralph Wiggum loops are a ridiculous way to build software. I've been playing with them anyway."
draft: false
---

There's a technique doing the rounds called "Ralph Wiggum loops."[^1] Named after the Simpsons character who keeps trying despite overwhelming evidence that he should stop.

The idea is that you put Claude Code in a bash loop, give it a task, and walk away. It runs, fails, runs again, fails differently, runs again, and eventually either succeeds or sets fire to something. You come back to either working code or a cautionary tale.

I've been playing with this. It's ridiculous. It also kind of works.

---

## What We're Actually Talking About

At its most basic:

```bash
while :; do cat PROMPT.md | claude ; done
```

That's the whole thing. Claude reads your prompt, does some work, tries to exit like a professional, and the loop shoves it back in the room like a disappointed parent. "You're not done. Try again."

It picks up where it left off because the codebase has changed. The tests that were failing are now... different tests that are failing. Progress.

Someone made a plugin for this. Because of course they did.

---

## Why This Is Absurd

Let me be clear about what's happening here.

You're asking an AI to do work. It does some work. Then it tries to leave. You don't let it leave. It sighs (metaphorically) and does more work. It tries to leave again. You still don't let it leave. This continues until either success or you run out of money.

This is not how serious software gets built. This is how you train a puppy, or wear down a toddler, or solve a Rubik's cube by just... turning it randomly until the colours line up.

And yet.

I've shipped actual features this way. Not production features at my day job, let me be extremely clear. But side projects, prototypes, things where "does it work?" is a more important question than "would a senior engineer approve of this?"

---

## The Actual How-To

### Option 1: Artisanal Hand-Crafted Loop

Create a file called `RALPH.md`:

```markdown
Build a todo API.

When it works, create a file called DONE.txt

If you're stuck after 10 attempts, create STUCK.txt and explain why.
```

Then:

```bash
while [ ! -f DONE.txt ] && [ ! -f STUCK.txt ]; do 
  claude -p "Read RALPH.md. Continue working."
done
```

Go make tea. Check back in 20 minutes. Either you have an API or you have a confession.

### Option 2: The Fancy Plugin

```bash
/ralph-loop:ralph-loop "Build a todo API" --max-iterations 30 --completion-promise "DONE"
```

The `--max-iterations` is important unless you enjoy explaining large API bills to your finance team.

### Option 3: Full Production Setup

Chris MDP has a [whole system](https://github.com/chrismdp/ralph) with work queues, separate PM sessions, git worktrees for parallel execution...[^2]

At this point you're building infrastructure to manage your AI that's building infrastructure for you. It's loops all the way down.

---

## When This Actually Works

The sweet spot is narrower than the hype suggests.

**Works:** Clear success criteria, automated verification, you can walk away, scope is contained.

"Make the tests pass" is a good Ralph task. "Make the architecture elegant" is how you get a codebase that looks like it was designed by a committee of sleep-deprived raccoons.

**Doesn't work:** Design judgment, subjective quality, tight deadlines, anything going near production.

I cannot stress this enough: I am not shipping Ralph-generated code to real users without reading every line. This is a toy. A very interesting toy. But a toy.

---

## The Prompt Is The Product

Here's what I've actually learned.

Your prompt is executable now. If you write vague instructions, you get vague code. If you write precise instructions, you get precise code. The mapping is uncomfortably direct.

This means all the things you were too lazy to specify? Claude will make those decisions for you. Naming conventions. Error handling. Whether to use tabs or spaces. (It's spaces. Claude is not a monster.)

I've found myself writing documentation I never would have written before. Not for humans. For the robot. "When building API endpoints, use this pattern. When handling errors, do it this way. When you're stuck, here's what to try."

I'm essentially writing a training manual for a junior developer who has infinite patience and no judgment.

---

## What It Feels Like

There's something strange about walking away from your computer while code writes itself.

Part of me loves it. I went to make dinner. When I came back, there was a working feature. I didn't write it, but I specified it, reviewed it, and shipped it. Is this what being a manager feels like?

Part of me finds it unsettling. I used to know every line of my codebases. Now I review code that a robot wrote based on instructions I wrote. The authorship question gets weird fast.

And part of me just thinks it's funny. We've built a system where persistence beats intelligence. Ralph Wiggum, the character who eats paste and thinks the leprechaun tells him to burn things, is now a software development methodology.

We're through the looking glass, people.

---

## Honest Caveats

**This burns money.** Running Claude in a loop for hours is not cheap. One practitioner reported exhausting their monthly API allocation in a single afternoon.[^3] Budget accordingly.

**The code needs review.** It works, in the sense that the tests pass. Whether it's *good* code is a separate question that requires human eyes.

**It's not pair programming.** I miss the back-and-forth of working with another human. Ralph doesn't push back on your ideas or suggest better approaches. It just... does what you said, over and over, until something works.

**It doesn't belong in production.** Yet. Maybe ever. I'm not willing to bet my company on code I didn't understand while it was being written.

---

## So Why Bother?

Because it's genuinely fun.

Because there's something delightful about waking up to a feature that didn't exist when you went to sleep.

Because it forces you to think clearly about what you actually want, which turns out to be useful even when humans are writing the code.

And because I suspect this is a preview of something. I don't know what exactly. But the fact that "put the AI in a loop until it works" is a viable strategy tells us something about where we are.

Two years ago this would have produced garbage. Now it produces... mostly working code that sometimes solves problems correctly.

The trajectory is interesting. Where it lands, I genuinely don't know.

In the meantime, I'm going to keep playing with it. Responsibly. On side projects. With extensive code review.

And a healthy sense of the absurd.

---

[^1]: The technique and plugin are documented at [awesomeclaude.ai/ralph-wiggum](https://awesomeclaude.ai/ralph-wiggum). The name references Ralph Wiggum from The Simpsons, a character whose defining trait is cheerful persistence despite consistent failure.

[^2]: Chris MDP's implementation adds sophisticated features like "beads" (units of work), a separate PM session for task management, and git worktrees for parallel execution. His detailed writeup: [chrismdp.com/running-ralph-loops-is-easy](https://www.chrismdp.com/running-ralph-loops-is-easy/)

[^3]: From Chris MDP's blog: "I exhausted my Max5 allocation within a few hours. The value exceeded the cost, so I upgraded to Max20 without hesitation." Your mileage may vary, but assume this will burn through tokens quickly.
