---
layout: post
title: "The Reliability Math Nobody Tells You About AI Agents"
date: 2026-04-03
categories: [ai-agents, architecture]
tags: [agents, reliability, production-ai, architecture, agentic-systems]
description: "Compounding failure rates in multi-step AI agents explain why 32% of practitioners cite quality as their top production barrier."
---

Most teams encounter this problem empirically, through failed deployments and postmortems, rather than seeing it coming. The math that explains it is straightforward, and running it before you ship can save significant pain.

If each step in an agentic workflow succeeds 85% of the time -- a solid baseline for a well-engineered, well-tested agent -- a 10-step workflow will complete successfully roughly 20% of the time. That is not an approximation. It is 0.85^10 = 0.197. A 5-step workflow at the same per-step reliability succeeds about 44% of the time. A 15-step workflow falls below 10%.

This is the arithmetic behind why 32% of practitioners in recent industry surveys cite quality as their single biggest barrier to getting agents into production. The reliability does not break because the model is bad or the engineering is careless. It compounds away, step by step, in ways that are entirely predictable -- once you know to look for them.

## Why 85% Per-Step Reliability Is a Realistic Baseline

Before examining what these numbers mean for architecture, it is worth understanding why 85% per-step success is a reasonable middle-of-the-road assumption rather than a pessimistic edge case.

Large language models are probabilistic systems. Even with well-crafted prompts, structured inputs, and retrieval augmentation in place, individual steps in an agentic workflow can fail in several distinct ways.

**Parsing and format failures.** The model produces output that downstream steps cannot process -- a JSON object with an unexpected structure, a function call with missing arguments, or a structured response that omits a required field. These are common, usually recoverable failures, but each one counts against your per-step reliability.

**Hallucinated tool calls.** The model invokes a tool with incorrect parameters, references a tool that does not exist in the current context, or misreads the schema for a real tool. This failure mode scales with the size of the tool catalog exposed to the agent. More tools mean more surface area for this kind of error.

**Context window pressure.** Long agentic tasks accumulate conversation history. As context fills, models tend to lose track of earlier instructions, skip steps they have nominally completed, or produce outputs that drift from the original task specification. Per-step reliability often degrades on the later steps of long workflows for exactly this reason.

**Environmental failures.** External APIs return errors. Filesystems have permission issues. Network timeouts interrupt retrieval steps. Agents can catch and retry some of these, but not all -- and retries consume tokens and add latency without always recovering the original task state cleanly.

An 85% per-step baseline assumes you have already done meaningful engineering work: thoughtful system prompts, input validation, retry logic for transient errors, and structured output formats. Teams earlier in their development process often see lower per-step success rates than this, which makes the compounding even more severe.

## Architectural Responses to Compounding Failure

Once you internalize the reliability math, several design choices that might have seemed like over-engineering start to look like basic practice for any agent you intend to run in production.

### Scope tasks aggressively

The most direct lever you have on end-to-end reliability is reducing the number of steps required to complete a task. A workflow that requires 5 steps at 85% per-step reliability succeeds 44% of the time. Reduce it to 3 steps and success probability climbs to 61%. Reduce it to 2 steps and you are above 72%.

This runs counter to the natural impulse when designing agentic systems. Agents feel capable precisely because they can handle long, complex sequences autonomously. The temptation is to give them a broad mandate and let them work out the decomposition.

A more reliable approach is to scope tasks narrowly and explicitly. Define clear preconditions (what must be true for the agent to start this task) and postconditions (what must be true for the task to be considered complete). Keep individual tasks atomic where possible. When a task genuinely requires many sequential steps, decompose it into multiple shorter sub-tasks, each with its own verification gate, rather than building a single long-running workflow that accumulates failure probability across every step.

Stripe's internal AI coding agents -- their team calls them Minions -- operate on exactly this principle. Each agent handles a specific, bounded task type: dependency upgrades, configuration changes, minor refactors. Tasks that require broader judgment stay with human engineers. The narrow scoping is what makes 1,300+ pull requests per week achievable at a reliability level that actually works in production on infrastructure supporting over a trillion dollars in annual payment volume.

### Instrument and verify at every step

In traditional software, you can often infer whether a process succeeded from its outputs. In agentic workflows, outputs look plausible even when the underlying process went wrong. A model that hallucinated a step will often produce coherent-looking output for that step -- output that passes a casual human review but contains errors that compound through every subsequent step.

This makes explicit per-step verification essential rather than optional. For each step in your workflow, define what success looks like in a form you can check programmatically: schema validation for structured outputs, assertions on extracted fields, automated tests for code generation outputs, confidence scoring for retrieval steps.

The verification logic does not need to be elaborate. A JSON schema check and a handful of assertions on critical fields will catch the most common failure modes. The important architectural point is that verification happens before the workflow proceeds, so failures surface at the step where they occurred rather than propagating forward and becoming difficult to diagnose.

Per-step verification adds latency and code complexity. The trade-off is almost always worth accepting for workflows where the cost of downstream failure -- in tokens consumed, in user trust, in real-world side effects -- exceeds the cost of catching the failure early.

### Protect high-stakes actions with explicit gates

The reliability math makes a strong case for human review or confirmation gates at specific points in agentic workflows -- not as a workaround for a system you do not trust, but as deliberate architecture for actions where mistakes are costly or irreversible.

Consider a workflow that manages customer communications: generating and sending emails, updating CRM records, triggering follow-up tasks. Even with careful engineering, some fraction of workflow runs will produce incorrect outputs. For low-stakes steps -- drafting a response, summarizing account history -- incorrect outputs are recoverable. The cost of a mistake is a few minutes of human review.

For high-stakes steps -- sending an email to a customer, updating a billing record, initiating a refund -- incorrect outputs can damage customer relationships, create legal exposure, or require expensive corrections. These are precisely the steps where a confirmation gate is warranted regardless of the system overall accuracy level.

OpenAI's Operator product ran into this problem in a well-publicized incident: an agent made an unauthorized purchase on behalf of a user based on an ambiguous instruction. The root cause was architectural: the workflow lacked a confirmation step before a high-stakes, irreversible action. The model performed correctly given its instructions -- the instructions themselves were the gap.

Identifying which actions in your workflow are high-stakes and irreversible, then building explicit confirmation steps for those specific actions, is one of the highest-leverage reliability improvements available for production agentic systems.

### Plan for partial failure and graceful degradation

In a multi-step workflow, the question is whether your system handles partial failures gracefully or leaves the world in a broken intermediate state. Failures will occur -- the design question is how the system responds to them.

A workflow built without partial failure handling either completes successfully or fails completely. When it fails partway through, it may have already completed the first several steps, including steps with external side effects: sent messages, updated records, triggered downstream processes. That intermediate state can be more problematic than a clean failure would have been.

Designing for partial failure requires thinking carefully about two things. First, idempotency: can you safely retry a step that may have already completed? If retrying a step that succeeded on the first attempt produces a duplicate action (a second email sent, a record updated twice), you need idempotency guards before you can retry safely. Second, compensation: if a step fails after previous steps have already taken effect, what does rollback look like, and do you need to implement it?

Not every workflow needs full transactional semantics. For many internal tooling workflows, partial completion is acceptable and a clean failure log is sufficient. For workflows that touch customer-facing systems or financial records, mapping out the failure modes for each step and deciding explicitly what partial completion means is worth doing before you hit it in production.

## A Pre-Deployment Audit Checklist

Walking through these questions before deploying an agentic workflow into production can surface reliability gaps that would otherwise surface through incidents.

**On task scope:** How many distinct steps does this workflow require? Can any steps be combined or eliminated? Does each step have a clear, testable success condition?

**On verification:** Is each step output validated before the workflow proceeds? Are failures surfaced with enough diagnostic context? Do retry mechanisms apply appropriate backoff?

**On high-stakes actions:** Which steps produce irreversible effects? Which steps have disproportionate downstream impact? Are those steps protected by confirmation gates?

**On partial failure:** If this workflow fails partway through, what state will external systems be in? Can each step be safely retried? Is rollback logic implemented for steps that require it?

**On observability:** Is per-step success rate instrumented and logged? Are end-to-end success rates tracked over time? Are error patterns aggregated so common failure modes can be addressed?

## Starting Where You Are

If you have agentic workflows running in production today, the most immediately useful step is to run the reliability math on your current step counts and per-step success rates. If you do not have per-step instrumentation yet, adding it is the right first move -- without per-step data, you can diagnose end-to-end failures but cannot identify where in the workflow reliability is being lost.

For teams earlier in the design process, the single most impactful structural choice is task scope. Starting with short, tightly defined workflows, validating their reliability in production conditions, and extending scope incrementally as you build confidence in the system performance is a more durable path than building long autonomous workflows and iterating backward from production failures.

The goal is a system where failures are caught at the step where they occur, isolated from downstream effects, and handled in ways that leave the world in a recoverable state. Given the probabilistic nature of the underlying models, a system that never fails is not a realistic engineering target. A system that fails gracefully and predictably is.

Making that goal concrete: for a 10-step workflow to succeed 95% of the time, each individual step needs to succeed roughly 99.5% of the time. Moving from a typical 85% per-step success rate to 99.5% requires real engineering work across task scoping, output verification, error handling, and retry logic. The math tells you exactly what that target is and makes the required reliability investment legible before you start building -- which is a considerably better place to begin than after your first production incident.