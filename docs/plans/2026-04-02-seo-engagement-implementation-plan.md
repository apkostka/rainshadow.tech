# SEO, Engagement & Image Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add SEO infrastructure (meta tags, structured data, sitemap, RSS), social sharing buttons, PostHog analytics, image optimization pipeline, custom 404 page, and GitHub Actions deployment to rainshadow.tech.

**Architecture:** Enable bundled Jekyll plugins (jekyll-seo-tag, jekyll-feed, jekyll-sitemap) for SEO/feeds. Add Node.js tooling (Sharp + Jampack) for image optimization. Replace default GitHub Pages build with a GitHub Actions workflow that runs the full pipeline. Add PostHog analytics, social share buttons on posts, and a custom 404 page.

**Tech Stack:** Jekyll (via github-pages gem), Node.js (Sharp, Jampack), GitHub Actions, PostHog JS snippet

---

### Task 1: Update `.gitignore` for Node.js artifacts

**Files:**
- Modify: `.gitignore`

**Step 1: Add Node.js and Jampack entries to .gitignore**

Add these lines to the end of the existing `.gitignore`:

```
node_modules/
.jampack/
package-lock.json
```

**Step 2: Verify**

Run: `cat .gitignore`
Expected: All existing entries plus the three new lines.

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add node_modules and jampack to gitignore"
```

---

### Task 2: Create `package.json` and install dependencies

**Files:**
- Create: `package.json`

**Step 1: Create package.json**

```json
{
  "name": "rainshadow-tech",
  "version": "1.0.0",
  "private": true,
  "description": "Rain Shadow Tech - AI-First Development & Consulting",
  "scripts": {
    "optimize": "node scripts/optimize-images.js",
    "jampack": "jampack ./_site"
  },
  "dependencies": {
    "sharp": "^0.33.3"
  },
  "devDependencies": {
    "@divriots/jampack": "^0.23.4"
  }
}
```

**Step 2: Install dependencies**

Run: `cd /home/apkos/repos/rainshadow.tech && npm install`
Expected: `node_modules/` created, `package-lock.json` created (ignored by git).

**Step 3: Verify sharp works**

Run: `node -e "const sharp = require('sharp'); console.log('sharp version:', sharp.versions.sharp)"`
Expected: Prints sharp version number without errors.

**Step 4: Commit**

```bash
git add package.json
git commit -m "chore: add package.json with sharp and jampack dependencies"
```

---

### Task 3: Create image optimization script

**Files:**
- Create: `scripts/optimize-images.js`

**Step 1: Create the optimization script**

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, '..', 'assets', 'img');
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 85;
const PNG_COMPRESSION = 9;
const WEBP_QUALITY = 85;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

async function getImageFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getImageFiles(fullPath));
    } else if (IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const webpPath = filePath + '.webp';

  // Skip if WebP already exists and is newer than source
  if (fs.existsSync(webpPath)) {
    const srcStat = fs.statSync(filePath);
    const webpStat = fs.statSync(webpPath);
    if (webpStat.mtimeMs >= srcStat.mtimeMs) {
      console.log(`  SKIP (up to date): ${path.relative(IMG_DIR, webpPath)}`);
      return;
    }
  }

  const image = sharp(filePath);
  const metadata = await image.metadata();

  // Resize if wider than MAX_WIDTH
  const resizeOpts = metadata.width > MAX_WIDTH ? { width: MAX_WIDTH } : {};

  // Optimize original in-place
  if (ext === '.jpg' || ext === '.jpeg') {
    const buffer = await image.resize(resizeOpts).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    fs.writeFileSync(filePath, buffer);
  } else if (ext === '.png') {
    const buffer = await image.resize(resizeOpts).png({ compressionLevel: PNG_COMPRESSION }).toBuffer();
    fs.writeFileSync(filePath, buffer);
  }

  // Generate WebP variant
  await sharp(filePath).resize(resizeOpts).webp({ quality: WEBP_QUALITY }).toFile(webpPath);

  console.log(`  DONE: ${path.relative(IMG_DIR, filePath)} -> +webp`);
}

async function main() {
  console.log('Optimizing images in', IMG_DIR);

  if (!fs.existsSync(IMG_DIR)) {
    console.log('No image directory found, skipping.');
    return;
  }

  const files = await getImageFiles(IMG_DIR);
  console.log(`Found ${files.length} image(s) to process.\n`);

  for (const file of files) {
    await optimizeImage(file);
  }

  console.log('\nImage optimization complete.');
}

main().catch(err => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});
```

**Step 2: Test the script**

Run: `cd /home/apkos/repos/rainshadow.tech && node scripts/optimize-images.js`
Expected: Processes `rainshadow_logo.png`, creates `rainshadow_logo.png.webp`, skips SVGs.

**Step 3: Add generated WebP to gitignore**

Add to `.gitignore`:
```
*.webp
```

Note: WebP files are build artifacts generated by the pipeline. Source PNGs/JPGs stay in git.

**Step 4: Commit**

```bash
git add scripts/optimize-images.js .gitignore
git commit -m "feat: add image optimization script using sharp"
```

---

### Task 4: Create GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the workflow file**

First create the directory: `mkdir -p .github/workflows`

```yaml
name: Deploy Jekyll site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Node dependencies
        run: npm ci

      - name: Optimize images
        run: npm run optimize

      - name: Build with Jekyll
        run: bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
        env:
          JEKYLL_ENV: production

      - name: Run Jampack
        run: npx @divriots/jampack ./_site

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Verify YAML is valid**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))" && echo "Valid YAML"`
Expected: "Valid YAML"

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for Jekyll + image optimization + Jampack"
```

**Important post-deploy note:** After pushing, go to the GitHub repo Settings > Pages and change "Source" from "Deploy from a branch" to "GitHub Actions". Without this, the default GitHub Pages build will still run alongside (or instead of) the Actions workflow.

---

### Task 5: Enable Jekyll plugins and add SEO config

**Files:**
- Modify: `_config.yml`

**Step 1: Update _config.yml with plugins, author, social, and defaults**

Replace the entire contents of `_config.yml` with:

```yaml
title: Rain Shadow
description: AI-First Development & Consulting
url: "https://rainshadow.tech"

markdown: kramdown
highlighter: rouge
permalink: /blog/:year/:month/:day/:title/

kramdown:
  input: GFM
  syntax_highlighter: rouge

# Plugins (all bundled with github-pages gem)
plugins:
  - jekyll-seo-tag
  - jekyll-feed
  - jekyll-sitemap

# SEO: Author info (used by jekyll-seo-tag for JSON-LD)
author:
  name: "Andrew Kostka"
  url: "https://rainshadow.tech"

# SEO: Site logo for structured data
logo: /assets/img/rainshadow_logo.png

# SEO: Social links (used by jekyll-seo-tag for JSON-LD Organization)
social:
  name: Rain Shadow
  links:
    - https://www.linkedin.com/company/rainshadow-tech
    - https://x.com/rainshadow_tech
    - https://bsky.app/profile/rainshadow-tech.bsky.social

# SEO: Twitter/X card type
twitter:
  card: summary_large_image

# SEO: Default front matter for posts
defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      image: /assets/img/rainshadow_logo.png

# Analytics
posthog:
  api_key: "phc_tof437PekmgcTMkYN9S9rEQeKMjVFYrT3VptEfiAiKZz"
  api_host: "https://us.i.posthog.com"

# Feed settings
feed:
  path: /feed.xml

exclude:
  - Gemfile
  - Gemfile.lock
  - README.md
  - docs/
  - vendor/
  - node_modules/
  - package.json
  - package-lock.json
  - scripts/
  - .jampack/
```

**Step 2: Verify config parses correctly**

Run: `cd /home/apkos/repos/rainshadow.tech && bundle exec jekyll doctor 2>&1 || true`
Expected: No fatal errors. Warnings about missing plugins are OK if not all gems are installed locally.

**Step 3: Commit**

```bash
git add _config.yml
git commit -m "feat: enable jekyll-seo-tag, jekyll-feed, jekyll-sitemap with SEO config"
```

---

### Task 6: Update head.html for SEO tags and feed

**Files:**
- Modify: `_includes/head.html`

**Step 1: Replace head.html contents**

Replace the entire contents of `_includes/head.html` with:

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
{% seo %}
{% feed_meta %}
<link rel="icon" type="image/svg+xml" href="{{ '/favicon.svg' | relative_url }}">
<link rel="preconnect" href="https://fonts.googleapis.com/">
<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/syntax.css' | relative_url }}">
{% include analytics.html %}
```

This removes the manual `<title>` and `<meta name="description">` tags since `{% seo %}` generates both. It adds `{% feed_meta %}` for RSS autodiscovery, and includes the analytics partial.

**Step 2: Commit**

```bash
git add _includes/head.html
git commit -m "feat: replace manual meta tags with jekyll-seo-tag and feed_meta"
```

---

### Task 7: Create PostHog analytics include

**Files:**
- Create: `_includes/analytics.html`

**Step 1: Create the analytics partial**

```html
{% if site.posthog.api_key and site.posthog.api_key != "" %}
<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="Ii init Di qi Sr Bi Zi Pi capture calculateEventProperties Yi register register_once register_for_session unregister unregister_for_session Xi getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Ji identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty Wi Vi createPersonProfile setInternalOrTestUser Gi Fi Ki opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing $i debug Tr Ui getPageViewId captureTraceFeedback captureTraceMetric Ri".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('{{ site.posthog.api_key }}', {
        api_host: '{{ site.posthog.api_host | default: "https://us.i.posthog.com" }}',
        person_profiles: 'identified_only',
    })
</script>
{% endif %}
```

**Step 2: Verify it renders the PostHog snippet**

Run: `cd /home/apkos/repos/rainshadow.tech && bundle exec jekyll build 2>&1 | tail -5`
Then: `grep -c "posthog" _site/index.html`
Expected: At least `1` (PostHog snippet rendered since api_key is configured)

**Step 3: Commit**

```bash
git add _includes/analytics.html
git commit -m "feat: add PostHog analytics include (disabled until api_key is configured)"
```

---

### Task 8: Create social share buttons include

**Files:**
- Create: `_includes/share-buttons.html`

**Step 1: Create the share buttons partial**

```html
{% assign share_url = page.url | absolute_url | uri_escape %}
{% assign share_title = page.title | uri_escape %}

<div class="share-buttons">
  <span class="share-label">Share</span>
  <div class="share-links">
    <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ share_url }}"
       target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" class="share-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      <span>LinkedIn</span>
    </a>
    <a href="https://twitter.com/intent/tweet?text={{ share_title }}&url={{ share_url }}"
       target="_blank" rel="noopener noreferrer" aria-label="Share on X" class="share-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
      <span>X</span>
    </a>
    <a href="https://bsky.app/intent/compose?text={{ share_title }}%20{{ share_url }}"
       target="_blank" rel="noopener noreferrer" aria-label="Share on Bluesky" class="share-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.6 3.476 6.178 3.126-4.443.766-8.328 2.632-4.87 7.627 3.906 4.296 6.625.554 8.068-2.217.56-1.074.834-2.138.834-2.138s.275 1.064.834 2.138c1.443 2.771 4.162 6.513 8.069 2.217 3.457-5.004-.428-6.861-4.87-7.627 2.577.35 5.392-.499 6.177-3.126C21.622 9.418 22 4.458 22 3.768c0-.69-.139-1.861-.902-2.203-.659-.3-1.664-.62-4.3 1.24C14.046 4.747 11.087 8.686 12 10.8z"/></svg>
      <span>Bluesky</span>
    </a>
    <button onclick="copyLink()" class="share-btn" aria-label="Copy link">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span id="copy-label">Copy link</span>
    </button>
  </div>
</div>

<script>
function copyLink() {
  navigator.clipboard.writeText('{{ page.url | absolute_url }}').then(function() {
    var label = document.getElementById('copy-label');
    label.textContent = 'Copied!';
    setTimeout(function() { label.textContent = 'Copy link'; }, 2000);
  });
}
</script>
```

**Step 2: Commit**

```bash
git add _includes/share-buttons.html
git commit -m "feat: add social share buttons include (LinkedIn, X, Bluesky, copy link)"
```

---

### Task 9: Add share button and 404 page styles to main.css

**Files:**
- Modify: `assets/css/main.css`

**Step 1: Add share button styles**

Append the following to the end of `assets/css/main.css` (after the last line, `}`):

```css

/* ---- SHARE BUTTONS ---- */
.share-buttons {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.share-label {
    font-family: var(--mono);
    font-size: 0.75rem;
    color: var(--text-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.share-links {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.share-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--mono);
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.4rem 0.75rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
}

.share-btn:hover {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-dim);
}

/* ---- 404 PAGE ---- */
.error-page {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding-top: 8rem;
}

.error-page h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
}

.error-page p {
    color: var(--text-secondary);
    font-size: 1.05rem;
    margin-bottom: 2rem;
    line-height: 1.7;
}

.error-recent-posts {
    margin-top: 3rem;
    text-align: left;
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
}

.error-recent-posts h2 {
    font-size: 1rem;
    font-family: var(--mono);
    color: var(--text-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
}
```

**Step 2: Commit**

```bash
git add assets/css/main.css
git commit -m "feat: add share button and 404 page styles"
```

---

### Task 10: Add share buttons to post layout

**Files:**
- Modify: `_layouts/post.html`

**Step 1: Add share buttons include after post content**

Replace the entire contents of `_layouts/post.html` with:

```html
---
layout: default
---

<section style="padding-top: 8rem;">
    <div class="section-inner">
        <div class="post-content">
            <div class="post-header">
                <h1>{{ page.title }}</h1>
                <div class="post-meta">
                    <span>{{ page.date | date: "%B %-d, %Y" }}</span>
                    {% if page.tags.size > 0 %}
                        <span>{{ page.tags | join: ", " }}</span>
                    {% endif %}
                    {% assign words = content | number_of_words %}
                    {% assign minutes = words | divided_by: 200 %}
                    {% if minutes < 1 %}{% assign minutes = 1 %}{% endif %}
                    <span>{{ minutes }} min read</span>
                </div>
            </div>
            {{ content }}
            {% include share-buttons.html %}
        </div>
    </div>
</section>
```

**Step 2: Commit**

```bash
git add _layouts/post.html
git commit -m "feat: add share buttons to post layout"
```

---

### Task 11: Create robots.txt

**Files:**
- Create: `robots.txt`

**Step 1: Create robots.txt at the project root**

```
User-agent: *
Allow: /

Sitemap: https://rainshadow.tech/sitemap.xml
```

**Step 2: Commit**

```bash
git add robots.txt
git commit -m "feat: add robots.txt with sitemap reference"
```

---

### Task 12: Create custom 404 page

**Files:**
- Create: `404.html`

**Step 1: Create 404.html at the project root**

```html
---
layout: default
permalink: /404.html
title: "Page Not Found"
---

<section class="error-page">
    <div class="section-inner">
        <h1>Page not found</h1>
        <p>This page doesn't exist or may have been moved.</p>
        <a href="{{ '/' | relative_url }}" class="btn-primary">Back to Home</a>

        {% if site.posts.size > 0 %}
        <div class="error-recent-posts">
            <h2>Recent Posts</h2>
            <div class="blog-list">
                {% for post in site.posts limit:3 %}
                <div class="blog-post-entry">
                    <a href="{{ post.url | relative_url }}">
                        <div class="blog-post-meta">
                            <span>{{ post.date | date: "%B %-d, %Y" }}</span>
                            {% assign words = post.content | number_of_words %}
                            {% assign minutes = words | divided_by: 200 %}
                            {% if minutes < 1 %}{% assign minutes = 1 %}{% endif %}
                            <span>{{ minutes }} min read</span>
                        </div>
                        <h3>{{ post.title }}</h3>
                        <p>{{ post.description | default: post.excerpt | strip_html | truncatewords: 30 }}</p>
                    </a>
                </div>
                {% endfor %}
            </div>
        </div>
        {% endif %}
    </div>
</section>
```

**Step 2: Commit**

```bash
git add 404.html
git commit -m "feat: add custom 404 page with recent posts"
```

---

### Task 13: Build and verify everything locally

**Files:** None (verification only)

**Step 1: Run full Jekyll build**

Run: `cd /home/apkos/repos/rainshadow.tech && JEKYLL_ENV=production bundle exec jekyll build 2>&1`
Expected: Build succeeds without errors.

**Step 2: Verify SEO tags are present**

Run: `grep -c 'og:title' _site/blog/2026/04/02/the-mythos-problem-building-ai-products-on-shifting-ground/index.html`
Expected: At least `1`

Run: `grep -c 'twitter:card' _site/blog/2026/04/02/the-mythos-problem-building-ai-products-on-shifting-ground/index.html`
Expected: At least `1`

**Step 3: Verify feed.xml exists**

Run: `head -5 _site/feed.xml`
Expected: XML content with `<feed>` tag.

**Step 4: Verify sitemap.xml exists**

Run: `head -5 _site/sitemap.xml`
Expected: XML content with `<urlset>` tag.

**Step 5: Verify robots.txt**

Run: `cat _site/robots.txt`
Expected: Content with `User-agent: *` and `Sitemap:` lines.

**Step 6: Verify 404 page**

Run: `grep 'Page not found' _site/404.html`
Expected: Match found.

**Step 7: Verify share buttons on blog post**

Run: `grep -c 'share-buttons' _site/blog/2026/04/02/the-mythos-problem-building-ai-products-on-shifting-ground/index.html`
Expected: At least `1`

**Step 8: Verify PostHog IS rendered (api_key is configured)**

Run: `grep -c 'posthog' _site/index.html`
Expected: At least `1`

**Step 9: Verify JSON-LD structured data**

Run: `grep -c 'application/ld+json' _site/index.html`
Expected: At least `1`

---

### Task 14: Final verification commit

**Step 1: Check nothing is left unstaged**

Run: `git status`
Expected: Clean working tree, or only untracked files that should be ignored (node_modules, .webp files, _site).

If any relevant files are unstaged, add and commit them:

```bash
git add -A
git commit -m "chore: final cleanup for SEO and engagement features"
```

---

## Post-Implementation Notes

After pushing to `main`:

1. **GitHub Pages Settings**: Go to repo Settings > Pages > Source and change from "Deploy from a branch" to "GitHub Actions"
2. **PostHog**: Set `posthog.api_key` in `_config.yml` to your PostHog project API key to enable analytics
3. **Google Search Console**: Submit `https://rainshadow.tech/sitemap.xml` to Google Search Console for indexing
4. **RSS**: The feed is at `https://rainshadow.tech/feed.xml` — can be submitted to RSS aggregators or linked from the site
