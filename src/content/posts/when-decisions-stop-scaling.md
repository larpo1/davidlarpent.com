---
title: "When Decisions Stop Scaling"
date: 2026-02-02T00:00:00.000Z
description: "The synthesis bottleneck, and what to do about it"
draft: true
tags:
  - AI
  - decisions
  - organisations
  - strategy
---

Every organisation hits a ceiling on how many good decisions it can make in a given period. Not because people aren't smart. Not because data doesn't exist. But because the work of turning data into decisions doesn't scale the way other things do.

This is the problem I keep coming back to. And I think it's the problem that AI is most likely to solve in the near term, if we set it up correctly.

## The synthesis bottleneck

Consider how a reasonably complex business decision gets made today.

Someone notices a problem or opportunity. They request data. An analyst pulls a report, maybe several. The data arrives, but it doesn't quite answer the question, so there's back-and-forth. Eventually, enough context is assembled that someone senior can weigh the trade-offs and make a call.

This process works. It's how most organisations operate. But notice where the constraints are.

The analyst who knows how to pull the data is a bottleneck. There are only so many requests they can handle. The senior person who holds enough context to interpret the data is a bottleneck. Their calendar is full. The meeting where stakeholders align on what the numbers mean is a bottleneck. It takes a week to schedule.

None of these bottlenecks are about data availability. The data exists. The bottleneck is synthesis: the work of combining multiple sources, adding context, weighing trade-offs, and arriving at a recommendation.

Synthesis is skilled work. It requires judgment. It's hard to automate. And because it's hard to automate, it tends to concentrate in a small number of people who become organisational chokepoints.

## The symptoms

You can recognise the synthesis bottleneck by its symptoms.

**Decisions take longer than they should.** Not because the decision is genuinely complex, but because assembling the evidence takes time. A question that should take an hour to answer takes two weeks because it has to queue behind other requests.

**Gut feel fills the gap.** When getting proper evidence is slow, people default to intuition. Sometimes intuition is right. Often it's just faster. The organisation develops a culture of "we don't have time to analyse this properly."

**The same questions get asked repeatedly.** Different people, different contexts, same underlying question. Each time, someone rebuilds the analysis from scratch. There's no leverage.

**Heroic individuals become critical paths.** The person who "knows where all the bodies are buried" becomes indispensable. This is good for that person's job security, bad for organisational resilience.

**Senior time gets consumed by synthesis work.** Leaders spend their days in meetings interpreting data, when their time would be better spent on decisions that actually require their judgment.

If any of this sounds familiar, you're experiencing the synthesis bottleneck.

## Why dashboards didn't solve it

The last generation of business intelligence tools were built on a premise: if we give people visibility into their data, they'll make better decisions.

This was true, as far as it went. Dashboards solved the visibility problem. You can now see, in near real-time, what's happening across your business. That's genuinely valuable.

But visibility is not the same as synthesis. A dashboard shows you that a number is red. It doesn't tell you why, or what to do about it. It certainly doesn't weigh that red number against three other factors and recommend a course of action.

So what happens? People look at dashboards, notice problems, and then the synthesis process begins anyway. The dashboard is a starting point, not an answer.

This isn't a criticism of dashboards. They do what they were designed to do. But they were designed for a different constraint. When the problem was "we can't see what's happening," dashboards were the right tool. When the problem is "we can see what's happening but can't process it all into decisions," dashboards aren't enough.

## What changes with AI

Large language models are genuinely good at synthesis. Given multiple pieces of information, they can combine them, reason across them, and produce a coherent summary or recommendation. This is what they're trained to do.

This creates an opportunity. The synthesis work that currently bottlenecks on a few skilled humans could, in theory, be partially automated. Not the judgment part. Not the accountability part. But the assembly-and-reasoning part that consumes so much time.

I say "in theory" because there's a catch. AI synthesis is only as good as the data it has access to. Point a language model at messy, inconsistent, poorly-structured data and you'll get confident-sounding nonsense. The model will happily synthesise garbage into a well-formatted recommendation.

This is why [data architecture matters](/posts/ai-data-architecture). Before you can build systems that synthesise across data sources, you need sources worth synthesising. Canonical metrics that are trustworthy. Semantic data that's properly embedded. Correlation mappings that connect your internal data to external context.

The AI is the reasoning layer. But it needs a foundation to reason over.

## The decision system opportunity

With the right foundation, you can build what I've started calling [decision systems](/posts/decision-systems). Tools that start from a question rather than a report.

Instead of "show me the data," you ask "where should I invest in improvements?" The system decomposes the question, pulls from multiple sources, and returns an evidence-backed recommendation.

This changes the scaling dynamics. The synthesis work that used to require a senior analyst can happen in seconds. The context that used to live in one person's head can be encoded in the system's access to data. The meeting where everyone argues about what the numbers mean can be replaced by a shared evidence base.

Decisions still require human judgment. The system recommends; people decide. But the time between "I need to make a decision" and "I have what I need to make it well" compresses dramatically.

## Who wins

The organisations that figure this out will have an advantage. Not because AI is magic, but because they'll be able to make more good decisions per unit of time.

Think about what that means competitively. If your organisation can evaluate opportunities faster, allocate resources more precisely, and catch problems earlier, you compound those advantages over time. Each better decision creates slightly better conditions for the next one.

The organisations that don't figure it out will keep doing synthesis the old way. They'll add more analysts, schedule more meetings, and wonder why decisions still feel slow. They'll buy AI tools and be disappointed when the tools produce garbage, not realising that the problem is the data foundation, not the AI.

## The work ahead

If you're in a position to influence this in your organisation, here's what I'd focus on:

**First, fix the data foundation.** Canonical metrics that everyone trusts. Unstructured data that's embedded and queryable. Correlation mappings that connect internal performance to external context. This is unglamorous work, but it's prerequisite work.

**Second, identify the synthesis bottlenecks.** Where do decisions queue? Who are the heroic individuals that everything routes through? What questions get asked repeatedly? These are your opportunities.

**Third, build decision systems, not just dashboards.** Start with high-value, repeated decisions. Design for questions, not reports. Show evidence, not just answers.

This isn't a technology project. It's an organisational capability. The technology is available. The question is whether you'll build the foundation to use it well.

---

*This is the third in a series on AI and decision-making. Previously: [AI Data Readiness](/posts/ai-data-architecture) and [Decision Systems, Not Dashboards](/posts/decision-systems).*
