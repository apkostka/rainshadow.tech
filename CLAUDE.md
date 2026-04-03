# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rain Shadow Tech — a Jekyll-based static site hosted on GitHub Pages at rainshadow.tech. It's a consulting/portfolio site with a blog.

## Build & Serve

```bash
bundle install          # install dependencies (first time)
bundle exec jekyll serve  # local dev server at http://localhost:4000
bundle exec jekyll build  # build to _site/
```

Uses the `github-pages` gem, which pins Jekyll and plugin versions to match GitHub Pages.

## Architecture

- **Layouts** chain: `post.html` → `default.html`, `home.html` → `default.html`, `blog/index.html` → `default.html`
- **`default.html`** is the shell: includes `head.html`, `nav.html`, footer, and an IntersectionObserver script for `.fade-in` animations
- **`index.html`** (root) uses `layout: home` and contains the full landing page markup with an inline base64-encoded logo (~165KB file — do not casually rewrite)
- **Blog posts** go in `_posts/` with filename format `YYYY-MM-DD-slug.md` and front matter: `layout: post`, `title`, `date`, `tags`
- **Blog index** at `blog/index.html` iterates `site.posts` with read-time estimates (200 wpm)

## Key Config

- **Permalink**: `/blog/:year/:month/:day/:title/`
- **Markdown**: kramdown with GFM input, Rouge syntax highlighting
- **Fonts**: Inter (body), JetBrains Mono (code) via Google Fonts
- **CSS**: `assets/css/main.css` (670 lines, all styles), `assets/css/syntax.css` (Rouge theme)

## Deployment

Push to `main` — GitHub Pages builds and deploys automatically. CNAME points to `rainshadow.tech`.
