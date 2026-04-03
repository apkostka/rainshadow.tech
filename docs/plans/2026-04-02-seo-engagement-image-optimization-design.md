# SEO, Engagement & Image Optimization Design

**Date:** 2026-04-02
**Status:** Approved

## Overview

Add SEO infrastructure, social sharing, analytics, image optimization, and engagement features to rainshadow.tech. Moves from default GitHub Pages build to a GitHub Actions pipeline to support Node.js-based image processing.

## 1. Build Pipeline & Image Optimization

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

Replaces default GitHub Pages build. Steps:

1. Checkout code
2. Setup Ruby (with bundler cache) + Node.js (with npm cache)
3. `bundle install` + `npm install`
4. `npm run optimize` — run image optimization script
5. `JEKYLL_ENV=production bundle exec jekyll build`
6. `npx @divriots/jampack _site/` — post-build asset optimization (lazy-loading, compression)
7. Upload artifact + deploy to GitHub Pages

Triggers: push to `main` + manual dispatch.

### Image Optimization Script (`scripts/optimize-images`)

Node.js script using Sharp that processes images in `assets/img/`:

- Generates WebP variants alongside originals
- Compresses PNG/JPG (quality 85)
- Resizes oversized images (max 1920px width)
- Skips already-optimized files (checks modification time)

### Dependencies (`package.json`)

```json
{
  "scripts": {
    "optimize": "node scripts/optimize-images.js",
    "jampack": "npx @divriots/jampack _site/"
  },
  "dependencies": {
    "sharp": "^0.33.3"
  },
  "devDependencies": {
    "@divriots/jampack": "^0.23.4"
  }
}
```

### Jampack Post-Build

Runs on `_site/` after Jekyll build:

- Adds `loading="lazy"` to images below the fold
- Adds `fetchpriority="high"` to above-fold images
- Compresses remaining unoptimized assets
- Minifies HTML/CSS/JS output

## 2. SEO & Meta Tags

### Plugin Activation (`_config.yml`)

```yaml
plugins:
  - jekyll-seo-tag
  - jekyll-feed
  - jekyll-sitemap
```

All three are already bundled with the `github-pages` gem.

### jekyll-seo-tag Configuration (`_config.yml`)

```yaml
author:
  name: "Andrew Kostka"
  url: "https://rainshadow.tech"

logo: /assets/img/rainshadow_logo.png

social:
  name: Rain Shadow
  links:
    - https://www.linkedin.com/company/rain-shadow-tech
    - https://x.com/rainshadowtech
    - https://bsky.app/profile/rainshadow.tech

twitter:
  card: summary_large_image

defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      image: /assets/img/rainshadow_logo.png
```

This auto-generates: Open Graph tags, Twitter Card tags, canonical URLs, JSON-LD (Organization schema for the site, Article schema for posts).

### Head Include Update (`_includes/head.html`)

Add before existing meta tags:

```html
{% seo %}
{% feed_meta %}
```

Remove the manually-set `<title>` and `<meta name="description">` tags since jekyll-seo-tag handles these.

### Per-Post Front Matter

Posts can override defaults:

```yaml
image: /assets/img/posts/my-post-image.png
description: "Custom description for social sharing"
author: "Andrew Kostka"
```

### robots.txt (root)

```
User-agent: *
Allow: /

Sitemap: https://rainshadow.tech/sitemap.xml
```

### Generated Files

- `/feed.xml` — Atom feed (jekyll-feed)
- `/sitemap.xml` — XML sitemap (jekyll-sitemap)
- `/robots.txt` — Static file

## 3. Social Share Buttons

### New Include (`_includes/share-buttons.html`)

Horizontal row of four buttons at the bottom of each post:

1. **LinkedIn** — `https://www.linkedin.com/sharing/share-offsite/?url=PAGE_URL`
2. **X/Twitter** — `https://twitter.com/intent/tweet?text=TITLE&url=PAGE_URL`
3. **Bluesky** — `https://bsky.app/intent/compose?text=TITLE+PAGE_URL`
4. **Copy Link** — Native Clipboard API, shows "Copied!" feedback for 2 seconds

Behavior:

- Share links open in new tab with `target="_blank" rel="noopener noreferrer"`
- URLs use `page.url | absolute_url` for canonical URLs
- Titles are URL-encoded via Liquid `| uri_escape` filter
- No external JS dependencies
- Copy button uses inline `<script>` with Clipboard API

### Styling

- Matches dark theme (uses `--bg-subtle`, `--text-secondary`, `--accent` CSS variables)
- Subtle border/background, hover state transitions to `--accent`
- Responsive: horizontal row, wraps on small screens
- SVG icons for each platform (inline, no icon library dependency)

### Integration

Added to `_layouts/post.html` after `{{ content }}`, before any post footer/nav.

## 4. PostHog Analytics

### New Include (`_includes/analytics.html`)

Conditional PostHog snippet:

```html
{% if site.posthog.api_key %}
<script>
  !function(t,e){...}(document,"script"); // standard PostHog snippet
  posthog.init('{{ site.posthog.api_key }}', {
    api_host: '{{ site.posthog.api_host | default: "https://us.i.posthog.com" }}'
  });
</script>
{% endif %}
```

### Configuration (`_config.yml`)

```yaml
posthog:
  api_key: ""  # Set your PostHog project API key to enable
  api_host: "https://us.i.posthog.com"
```

Empty `api_key` disables tracking (local dev, staging). Set the key to enable.

### Integration

Included in `_layouts/default.html` before `</head>`.

## 5. Custom 404 Page

### New File (`404.html`)

```yaml
---
layout: default
permalink: /404.html
title: "Page Not Found"
---
```

Content:

- "Page not found" heading (h1)
- Friendly message: "This page doesn't exist or may have been moved."
- "Back to Home" link button (styled like existing CTAs)
- "Recent Posts" section showing up to 3 latest posts with title, date, and description

GitHub Pages automatically serves `404.html` for missing routes.

### Styling

Uses existing CSS classes. No new styles needed — leverages `.section-inner`, `.btn`, and post list styles already in `main.css`.

## Files Changed

### New Files
- `.github/workflows/deploy.yml` — GitHub Actions build + deploy
- `package.json` — Node.js dependencies
- `scripts/optimize-images.js` — Image optimization script
- `_includes/share-buttons.html` — Social share buttons
- `_includes/analytics.html` — PostHog analytics
- `404.html` — Custom 404 page
- `robots.txt` — Crawler directives

### Modified Files
- `_config.yml` — Plugins, author, social, PostHog, defaults
- `_includes/head.html` — Add `{% seo %}`, `{% feed_meta %}`, remove manual title/description
- `_layouts/default.html` — Include analytics partial
- `_layouts/post.html` — Include share buttons
- `assets/css/main.css` — Share button styles, 404 page styles
- `.gitignore` — Add `node_modules/`, `.jampack/`
