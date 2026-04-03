---
layout: post
title: "How I Built My Website With Jekyll and GitHub Pages (Part 1: Setup, Images, and SEO)"
date: 2026-04-03
description: "A practical walkthrough of how I set up rainshadow.tech using Jekyll and GitHub Pages, plus how I handle image optimization and SEO without any paid tools."
tags: [buildinpublic, webdev, jekyll, github-pages, seo]
series: "Building a Blog That Works For You"
series_part: 1
---

This is Part 1 of a series on how I run the Rain Shadow blog end-to-end. This post covers the foundation: setting up the site with Jekyll and GitHub Pages, handling images so they don't tank your load times, and getting SEO right from day one. In [Part 2](/blog/2026/04/06/finding-ideas-and-drafting-with-claude), I'll walk through how I find blog ideas and use Claude to go from rough concept to polished draft.

---

## Why Jekyll and GitHub Pages

When I set out to build rainshadow.tech, I had a short list of requirements: it needed to be fast, cheap to host, easy to maintain as a solo operator, and flexible enough that I wasn't fighting the framework every time I wanted to publish something.

Jekyll checked every box. It's a static site generator: you write markdown files, run a build step, and get plain HTML with no database, no server-side runtime, and no WordPress update anxiety. GitHub Pages hosts Jekyll sites for free with automatic builds on every push. Push a new markdown file to your repo, and the post is live in about a minute.

The other thing I appreciated is that Jekyll stays out of your way. The templating system (Liquid) is straightforward, the file structure is logical, and when something breaks, the error messages actually help you fix it. For a solo founder who wants to spend time writing and building instead of debugging a CMS, that matters a lot.

## The Setup

Getting started is genuinely simple. If you have Ruby installed, it's three commands:

```bash
gem install bundler jekyll
jekyll new my-site
cd my-site && bundle exec jekyll serve
```

That gives you a working local site at `localhost:4000`. From there, you push to a GitHub repo, enable GitHub Pages in the repo settings, and you're live.

For the theme, I started with a minimal base and customized from there. Jekyll themes are just collections of layouts and includes (HTML templates with Liquid tags). I wanted something clean that loaded fast, so I kept the dependencies minimal: no jQuery, no heavy CSS framework, just enough custom styling to look professional without being over-designed.

The directory structure is worth understanding because it's where Jekyll's simplicity really shines. Your posts live in `_posts/` as dated markdown files (like `2026-04-03-my-post-title.md`). Pages live in the root or organized in folders. Layouts and partials go in `_layouts/` and `_includes/`. Configuration lives in `_config.yml`. That's basically it. Once you internalize the convention, publishing a new post is just creating a file and pushing.

One thing worth mentioning: I keep my `Gemfile` lean. The only plugins I use are the ones GitHub Pages supports natively: `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-feed`, and `jekyll-paginate`. This means I never have to worry about custom build steps or GitHub Actions for deployment. The built-in GitHub Pages build pipeline handles everything. If you start adding unsupported plugins, you'll need to set up a GitHub Actions workflow to build and deploy, which works fine but adds a layer of complexity I didn't want.

For anyone wondering about custom domains: GitHub Pages supports them natively. You add a `CNAME` file to your repo with your domain, point your DNS records at GitHub's servers, and HTTPS is handled automatically via Let's Encrypt. The whole process took me about 15 minutes.

## Image Optimization

This is the part that trips up a lot of static site owners. Images are almost always the heaviest assets on a page, and if you're not intentional about how you handle them, your fast static site becomes a slow static site.

My approach has three layers.

First, I convert everything to WebP before it goes into the repo. WebP gives you significantly smaller file sizes than JPEG or PNG at comparable quality. I use a simple shell script that runs ImageMagick's `convert` command across any new images in my assets folder:

```bash
for img in assets/images/originals/*.{jpg,png}; do
  filename=$(basename "$img" | sed 's/\.[^.]*$//')
  convert "$img" -quality 80 -resize "1200x>" "assets/images/${filename}.webp"
done
```

That converts to WebP at 80% quality and caps the width at 1200 pixels, which is more than enough for blog content. The originals stay in a subfolder (git-ignored) in case I ever need them.

Second, I use responsive image markup. Instead of a bare `<img>` tag, I use the `srcset` attribute to let browsers pick the right size:

```html
<img
  src="/assets/images/my-image-800.webp"
  srcset="/assets/images/my-image-400.webp 400w,
         /assets/images/my-image-800.webp 800w,
         /assets/images/my-image-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Descriptive alt text here"
  loading="lazy"
  decoding="async"
/>
```

Third, and this is easy to overlook, I add `loading="lazy"` and `decoding="async"` to every image that isn't above the fold. Lazy loading means the browser won't fetch images until the user scrolls near them, and async decoding prevents image processing from blocking the page render. Two attributes that require zero JavaScript and make a noticeable difference in how the page feels.

To make this less tedious in practice, I wrote a small Jekyll include (`_includes/optimized-image.html`) that takes a filename and alt text and generates the full responsive markup automatically. In my posts, inserting an optimized image looks like this:

```liquid
{% raw %}{% include optimized-image.html name="my-image" alt="Descriptive alt text" %}{% endraw %}
```

One line in my markdown, properly optimized HTML in the output. That's the kind of small investment that pays off every time you publish.

## SEO Without Paid Tools

SEO for a blog like this doesn't need to be complicated. The fundamentals matter far more than any premium tool, and Jekyll makes most of them easy to get right.

**Front matter does the heavy lifting.** Every post has a `title`, `description`, and `tags` field in the YAML front matter. The title becomes the `<title>` tag and the `og:title` meta tag. The description becomes the meta description and `og:description`. I use a layout that generates all the Open Graph and Twitter Card meta tags automatically from the front matter, so every post gets proper social previews without any extra effort per post.

**The `jekyll-seo-tag` plugin is worth using.** It's officially supported by GitHub Pages and handles canonical URLs, JSON-LD structured data, Open Graph tags, and Twitter Cards out of the box. You add it to your `_config.yml`, drop `{% raw %}{% seo %}{% endraw %}` in your `<head>`, and it does the right thing based on your front matter and site configuration. I've seen people hand-roll all of this and get subtle things wrong. The plugin handles the edge cases.

**Sitemap and RSS come free.** The `jekyll-sitemap` plugin generates a `sitemap.xml` automatically, and it's also supported on GitHub Pages. `jekyll-feed` does the same with an Atom feed for RSS. Submit your sitemap to Google Search Console, and you're giving search engines a clean map of your content with zero ongoing maintenance.

**Semantic HTML matters more than people think.** I use proper heading hierarchy (one `<h1>` per page, logical `<h2>`/`<h3>` nesting), descriptive alt text on every image, and meaningful link text instead of "click here." These are accessibility best practices and direct SEO signals at the same time. Search engines understand your content structure through your headings and markup, so getting this right from the start compounds over time.

**Page speed is SEO.** This is where the image optimization work above pays double. Google uses Core Web Vitals as a ranking factor, and a static Jekyll site with optimized images, minimal JavaScript, and clean markup scores well by default. I periodically run Lighthouse audits to catch regressions, but the baseline is strong because the architecture is simple.

**Internal linking is easy and worth doing.** Jekyll's `{% raw %}{% post_url %}{% endraw %}` tag lets you link between posts using filenames instead of hardcoded URLs, so links don't break if you change your permalink structure. I also keep a small "Related Posts" section at the bottom of each post, just two or three manually chosen links. Internal links help search engines understand how your content connects, and they keep readers on the site longer.

One thing I'd recommend to anyone starting a Jekyll blog: set up your `_config.yml` with a proper `url`, `baseurl`, `title`, `description`, and `author` field from day one. The SEO plugin and other tools pull from these, and getting them right at the start means every page and post inherits correct metadata automatically.

## The Result

The whole setup (site, blog, image pipeline, SEO) took about a weekend to get right. Hosting costs me nothing. Publishing a new post is writing a markdown file and pushing to GitHub. Lighthouse scores consistently come in above 95 across the board. And I own everything completely, because the entire site is a Git repo of markdown and HTML that I own completely.

The stack is deliberately simple, and that's the point. The less time I spend on infrastructure, the more time I have for writing and building.

---

*Next up in this series: [Part 2, Finding Ideas and Drafting Posts With Claude](/blog/2026/04/06/finding-ideas-and-drafting-with-claude/). I'll walk through how I source blog topics from AI news, industry trends, and my own project work, and how I use Claude to turn a rough idea into a publishable draft without losing my voice.*
