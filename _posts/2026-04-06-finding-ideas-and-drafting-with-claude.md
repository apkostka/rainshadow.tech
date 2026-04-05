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

I keep a running list of ideas in my Obsidian vault, updated automatically by a content pipeline I built with Claude Code. Every weekday morning, a research task scans for trending AI topics across news, practical use cases, developer tooling, and indie founder communities. On Mondays, a separate task takes those research findings and generates structured blog ideas with formats, word count estimates, and angle descriptions. The ideas accumulate in a single markdown file that I can browse anytime in Obsidian. Most of them need refinement, but the pipeline means I'm never staring at a blank page wondering what to write about.

**My own project work.** Rain Shadow is a consulting practice, so I'm constantly solving real problems for real teams. Every engagement surfaces patterns: the same mistakes, the same architectural questions, the same "I wish someone had told me this" moments. When I notice myself explaining the same concept to multiple clients, that's a signal it should be a blog post. I anonymize the details, but the core insight stays intact.

The side project work contributes too. Building Better One Day and running Rain Shadow's own infrastructure gives me a steady stream of "here's what I tried, here's what worked" content. The Jekyll and GitHub Pages post you read in Part 1 came directly from this. I set it up, it worked well, and I figured other solo founders would want the walkthrough.

**Questions and conversations.** Social media replies, DMs, and comments surface questions I wouldn't have thought to write about on my own. When someone asks a question and I realize the answer is too long for a reply, that's a post. When I see the same question asked multiple ways across different platforms, that's a post with proven demand.

The key is having a capture system. Ideas are perishable, and if I don't write them down within a few minutes, they're gone. The Obsidian vault serves as my single source of truth. Everything goes there, whether it came from the automated pipeline, a client conversation, or a shower thought.

## The Pipeline Behind the Ideas

I want to go deeper on the automated pipeline because it's the piece that made consistency realistic for me as a solo operator.

The whole thing runs as a set of Claude Code commands on my machine, scheduled with cron. Each task is independent and communicates with the others through markdown files in my Obsidian vault. Here's how the pieces fit together:

**Research** runs every weekday morning at 7am. Claude searches the web for 5-7 current AI topics, tags each one by category (news, evergreen, practical workflow, tools), and writes a structured research file into the vault. Each topic gets a summary, a note on why it matters for my audience, and a source link. The task also flags which topics would work best for social media and which have enough depth for a blog post.

**Social media posts** run at 8am, after research finishes. Claude reads the latest research file, picks the strongest topic, and drafts three platform-specific posts: one for Bluesky, one for X, and one for LinkedIn. Each post is written to feel native to its platform, not like a cross-post. The posts get queued automatically to Buffer through a shell script that wraps the Buffer GraphQL API, so they go out at whatever time my Buffer schedule is set to.

**Blog ideas** update on Mondays at 9am. Claude reads the research, rotates old ideas into a "previous" section, and adds three new ones. Each idea includes a title, a suggested format (how-to, explainer, opinion, topical), a word count estimate, and a short description of the angle. Over time, this file becomes a rich backlog I can pull from whenever I'm ready to write.

**Blog drafts** generate on Mondays and Fridays at 9:30am. Claude picks the strongest idea from the backlog, does additional web research to gather context and data points, and writes a full 1,500+ word draft directly into my Jekyll `_posts/` directory. The draft comes complete with front matter, and after writing, Claude automatically drafts social media posts promoting the new article and queues them to Buffer.

**Engagement discovery** runs at 10am on weekdays. Claude searches Bluesky, X, and LinkedIn for relevant conversations and people in the AI consulting space. On Bluesky, it actually likes posts from practitioners and founders using the `goat` CLI tool. For all three platforms, it saves an engagement report with clickable links to posts worth replying to, accounts worth following, and draft replies written in my voice.

Each task saves its output as a dated markdown file in a structured folder inside the vault. Research goes in `Research/`, social posts in `Social/`, and so on. Because everything is markdown and everything is in Obsidian, I can review the pipeline's output anytime from my phone or laptop without touching the terminal.

The whole thing took about two hours to set up initially, and the ongoing maintenance is minimal. When I want to tweak the voice or adjust what the research task looks for, I edit a markdown command file and the changes apply on the next run.

## Using Claude to Draft

Even with automated drafts landing in my `_posts/` folder twice a week, my relationship with Claude as a drafting partner goes beyond what the pipeline does. When I want to write about something specific, something that came from a client conversation or a personal experiment, I run the blog draft command manually and pass it my topic.

The workflow for a manual draft looks like this:

**Step 1: I provide the topic.** I run `/rainshadow-blog-draft` with a description of what I want to write about. It can be as short as "Write about RAG pipelines for small teams" or as detailed as a few sentences explaining the angle, audience, and key takeaway. The specificity of what I provide directly determines the quality of what comes back.

For example, the brief for Part 1 of this series was something like: "Walkthrough of how I set up rainshadow.tech with Jekyll and GitHub Pages. Practical, not promotional. Cover the setup, image optimization pipeline, and SEO basics. Audience is other solo founders and indie devs who want a simple, fast, free blog. Tone should be 'here's what I did and why,' written peer-to-peer."

**Step 2: Claude writes a first draft.** Claude does web research to gather current context, then writes a full post with proper Jekyll front matter and section structure. The command includes detailed style rules: no em dashes, no terse dramatic fragments, no cynical framing, no AI-obvious phrasing. I spent time tuning these constraints because the default output from any LLM has tells that are easy to spot if you know what to look for.

The first draft is never publishable as-is, and that's fine. What it gives me is structure. Claude is good at organizing ideas into a logical flow, finding the right section breaks, and making sure the post actually builds toward something instead of rambling. That structural scaffolding is worth more to me than any individual sentence it writes.

**Step 3: I rewrite.** This is where my voice comes back in. I go through the draft paragraph by paragraph and rewrite anything that doesn't sound like me. Sometimes that's a word choice, because Claude tends toward slightly more formal language than I'd use naturally. Sometimes it's restructuring a section because my instinct about the best order differs from Claude's. Sometimes a paragraph is already right and I leave it.

The ratio varies by post. Some drafts need 30% rewriting, some need 70%. The point is to never start from a blank page. The psychological difference between "edit this draft" and "write this post" is enormous, even when the editing is substantial.

**Step 4: I add what only I can add.** The things that make a blog post worth reading (the specific anecdote from a client project, the opinion that goes against conventional wisdom, the personal context that explains why I care about this topic) always come from me. Claude can structure an argument and get the facts right, but it can't tell you about the time I spent three hours debugging a Liquid template at midnight because I misunderstood how Jekyll handles collections. Those details are what turn a competent post into one people actually remember.

## What I've Learned About Working With Claude

A few things I've picked up after several months of this workflow.

**Be specific about what you don't want.** I've found it's as important to tell Claude what to avoid as what to include. My style rules explicitly ban em dashes, negation-contrast constructions ("not X, it's Y"), and a list of AI-obvious phrases like "game-changer" and "let's unpack." These constraints produce noticeably better first drafts. Without them, every LLM falls back on the same patterns, and readers can smell it.

**Automate the boring parts, keep the interesting parts.** The pipeline handles research, idea generation, first drafts, and social promotion. I handle editing, voice, and the personal details that make posts worth reading. This split means I spend my writing time on the parts I'm actually good at instead of staring at a blank page or manually scheduling social posts.

**Provide real examples of your writing.** The first few times I used Claude for drafts, I didn't give it any style reference, and the output was fine but generic. Once I started including two or three paragraphs from previous posts as a voice sample, the drafts started sounding much closer to my actual writing. It's a small step that saves a lot of rewriting.

**Optimize for starting.** The biggest value of this workflow is that it eliminates the hardest moment: the blank page. It also makes writing faster, but that's secondary. When I sit down to "edit a draft," I'm already in motion. There's no activation energy problem. Some weeks, the edit is light and I publish quickly. Other weeks, I basically rewrite the whole thing. Both outcomes are fine because the alternative was not writing at all.

**The human review is non-negotiable.** I read every draft carefully, check every technical claim, and rewrite anything that doesn't feel authentic. Claude is a very good tool, but the blog has my name on it, and the quality bar is mine to maintain. I think of the whole thing as a "start faster and finish stronger" system, where the human review is what makes the output worth publishing.

## The Full Pipeline

Putting it all together, here's what a typical week looks like:

Monday through Friday at 7am, the research task scans for AI topics and writes a summary to my Obsidian vault. At 8am, social posts get drafted and queued to Buffer. Monday at 9am, the blog ideas backlog gets refreshed. Monday and Friday at 9:30am, a full blog draft lands in my Jekyll `_posts/` directory with social promotion posts queued automatically. At 10am each weekday, engagement discovery finds conversations and people worth connecting with across Bluesky, X, and LinkedIn.

My active involvement is reviewing and editing the blog drafts (about 60-90 minutes per post), glancing at the engagement report to decide which replies to actually send, and occasionally browsing the research files when I want to write something off-schedule.

The whole process, from idea generation to published post, typically takes me about 60-90 minutes of active work per post. Without Claude and the automated pipeline, it used to take three to four hours, and I published less consistently because the blank-page problem kept winning. The pipeline also means I'm posting to social media every weekday without thinking about it, which has been good for visibility.

Everything runs on my local machine through Claude Code and cron. There's no cloud infrastructure to manage, no third-party automation platform to pay for, and the total cost is my existing Claude subscription plus a free Buffer account. The commands are all markdown files I can edit in any text editor, and the outputs all live in Obsidian where I can search and browse them alongside the rest of my notes.

---

*That wraps up this two-part series on building and running the Rain Shadow blog. If you're a solo founder or indie builder thinking about starting a blog, I'd encourage you to keep the stack simple and build a system that makes consistency easy. The best blog is the one you actually publish to.*
