---
layout: post
title: "Finding Ideas and Drafting Posts With Claude (Part 2: The Content Workflow)"
date: 2026-04-06
description: "How I source blog topics from AI news and my own work, then use Claude to go from rough idea to publishable draft without losing my voice."
tags: [buildinpublic, writing, claude, ai-tools, content]
series: "Building a Blog That Works For You"
series_part: 2
---

This is Part 2 of a series on how I run the Rain Shadow blog. In [Part 1](/blog/how-i-built-my-website-with-jekyll-and-github-pages), I covered the technical foundation: Jekyll, GitHub Pages, image optimization, and SEO. This post is about the content side: where ideas come from, how I use Claude to turn a rough concept into a real draft, and the editing process that keeps it sounding like me.

---

## Where Ideas Come From

The hardest part of blogging consistently is deciding what to write about. I spent years in the "I should blog more" phase before I built a system that actually generates ideas faster than I can write them.

My approach has three sources, and I rotate between them.

**Industry news and trends.** I follow AI developments closely as part of my job, so I'm already reading papers, product launches, and technical deep dives every week. The blog ideas come from noticing when something I read has a gap between the announcement and the practical implications. Press releases tell you *what* shipped. Blog posts worth reading explain *what it means* for people building things. When I read something and my first instinct is "that's interesting, but here's what they're not saying," that's usually a post.

I keep a running list in Confluence that gets updated automatically by a content pipeline I built. Three times a week, it scans for trending AI topics, cross-references them against what I've already written, and generates structured blog ideas with hooks, angles, and audience notes. Most of the ideas need refinement, but the pipeline means I'm never staring at a blank page wondering what to write about.

**My own project work.** Rain Shadow is a consulting practice, so I'm constantly solving real problems for real teams. Every engagement surfaces patterns: the same mistakes, the same architectural questions, the same "I wish someone had told me this" moments. When I notice myself explaining the same concept to multiple clients, that's a signal it should be a blog post. I anonymize the details, but the core insight stays intact.

The side project work contributes too. Building Better One Day and running Rain Shadow's own infrastructure gives me a steady stream of "here's what I tried, here's what worked" content. The Jekyll and GitHub Pages post you read in Part 1 came directly from this. I set it up, it worked well, and I figured other solo founders would want the walkthrough.

**Questions and conversations.** Social media replies, DMs, and comments surface questions I wouldn't have thought to write about on my own. When someone asks a question and I realize the answer is too long for a reply, that's a post. When I see the same question asked multiple ways across different platforms, that's a post with proven demand.

The key is having a capture system. Ideas are perishable, and if I don't write them down within a few minutes, they're gone. The Confluence page serves as my single source of truth. Everything goes there, whether it came from the automated pipeline, a client conversation, or a shower thought.

## Using Claude to Draft

Here's where things get interesting. I use Claude as a drafting partner, a collaborator that helps me get from "rough idea with bullet points" to "coherent first draft" much faster than I could alone.

The workflow looks like this:

**Step 1: I write the brief.** Before Claude touches anything, I write a short brief, usually three to five sentences describing the idea, the angle I want to take, who it's for, and the one thing I want the reader to walk away with. This is the most important step, because the specificity of the brief directly determines the quality of what comes back.

For example, the brief for Part 1 of this series was something like: "Walkthrough of how I set up rainshadow.tech with Jekyll and GitHub Pages. Practical, not promotional. Cover the setup, image optimization pipeline, and SEO basics. Audience is other solo founders and indie devs who want a simple, fast, free blog. Tone should be 'here's what I did and why,' written peer-to-peer."

**Step 2: Claude writes a first draft.** I feed Claude the brief along with context about Rain Shadow's voice: friendly, practical, first-person, no jargon for jargon's sake. I've found that giving Claude a few paragraphs of my existing writing as a style reference makes a noticeable difference. It picks up on sentence length, punctuation habits, and when I get specific with code versus when I stay conceptual.

The first draft is never publishable as-is, and that's fine. What it gives me is structure. Claude is good at organizing ideas into a logical flow, finding the right section breaks, and making sure the post actually builds toward something instead of rambling. That structural scaffolding is worth more to me than any individual sentence it writes.

**Step 3: I rewrite.** This is where my voice comes back in. I go through the draft paragraph by paragraph and rewrite anything that doesn't sound like me. Sometimes that's a word choice, because Claude tends toward slightly more formal language than I'd use naturally. Sometimes it's restructuring a section because my instinct about the best order differs from Claude's. Sometimes a paragraph is already right and I leave it.

The ratio varies by post. Some drafts need 30% rewriting, some need 70%. The point is to never start from a blank page. The psychological difference between "edit this draft" and "write this post" is enormous, even when the editing is substantial.

**Step 4: I add what only I can add.** The things that make a blog post worth reading (the specific anecdote from a client project, the opinion that goes against conventional wisdom, the personal context that explains why I care about this topic) always come from me. Claude can structure an argument and get the facts right, but it can't tell you about the time I spent three hours debugging a Liquid template at midnight because I misunderstood how Jekyll handles collections. Those details are what turn a competent post into one people actually remember.

## What I've Learned About Working With Claude

A few things I've picked up after several months of this workflow.

**Be specific about what you don't want.** I've found it's as important to tell Claude what to avoid as what to include. "Write the main content in prose, no bullet points." "Don't start with a generic introduction about how important AI is." "Don't hedge every claim with 'it's worth noting that.'" These constraints produce noticeably better first drafts.

**Provide real examples of your writing.** The first few times I used Claude for drafts, I didn't give it any style reference, and the output was fine but generic. Once I started including two or three paragraphs from previous posts as a voice sample, the drafts started sounding much closer to my actual writing. It's a small step that saves a lot of rewriting.

**Optimize for starting.** The biggest value of this workflow is that it eliminates the hardest moment: the blank page. It also makes writing faster, but that's secondary. When I sit down to "edit a draft," I'm already in motion. There's no activation energy problem. Some weeks, the edit is light and I publish quickly. Other weeks, I basically rewrite the whole thing. Both outcomes are fine because the alternative was not writing at all.

**The human review is non-negotiable.** I read every draft carefully, check every technical claim, and rewrite anything that doesn't feel authentic. Claude is a very good tool, but the blog has my name on it, and the quality bar is mine to maintain. I think of the whole thing as a "start faster and finish stronger" system, where the human review is what makes the output worth publishing.

## The Full Pipeline

Putting it all together, here's what the end-to-end process looks like for a typical Rain Shadow blog post:

The content pipeline runs three times a week, scanning AI news and trends and generating structured blog ideas on a Confluence page. On Wednesdays, a separate task drafts a full post from whichever idea I've flagged. I review the draft, rewrite as needed, add my own examples and perspective, drop it into a dated markdown file in my Jekyll `_posts/` folder, push to GitHub, and it's live.

The whole process, from idea generation to published post, typically takes me about 90 minutes of active work per post. Without Claude and the automated pipeline, it used to take three to four hours, and I published less consistently because the blank-page problem kept winning.

---

*That wraps up this two-part series on building and running the Rain Shadow blog. If you're a solo founder or indie builder thinking about starting a blog, I'd encourage you to keep the stack simple and build a system that makes consistency easy. The best blog is the one you actually publish to.*
