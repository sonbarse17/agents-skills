---
name: web-image-optimization
description: Optimize images for the web — format selection (AVIF/WebP/JPEG),
  responsive srcset/sizes, lazy loading, image CDNs, and Core Web Vitals
  impact. Use when images are too large, LCP is slow because of a hero image,
  or the user asks about responsive images, art direction, or an image CDN.
  For Docker/container image size, use `image-optimization` in
  containers-orchestration instead.
tags:
  - frontend
  - image-optimization
depends_on:
  - responsive-design
  - design-visual-design
---

# Web Image Optimization

Images are usually the single largest contributor to page weight and the most common cause of a
slow Largest Contentful Paint (LCP). Optimization means shipping the smallest correct image for
each viewport and connection — not compressing everything harder after the fact.

## When to Use This Skill

- Choosing an image format (AVIF, WebP, JPEG, PNG, SVG) for a given asset
- Implementing responsive images with `srcset`/`sizes` or `<picture>`
- Diagnosing a slow LCP caused by a hero image or above-the-fold image
- Setting up an image CDN (Cloudinary, Imgix, Cloudflare Images, `next/image`)
- Implementing lazy loading for below-the-fold images
- Handling art direction (different crops per breakpoint)

## Format Selection

| Format | Best for | Notes |
|---|---|---|
| AVIF | Photos, general use | Smallest file size (~50% smaller than JPEG); ~94% browser support; slower encode |
| WebP | Photos, general use | ~30% smaller than JPEG; near-universal support; safe default |
| JPEG | Photos (fallback) | Universal fallback for AVIF/WebP; no transparency |
| PNG | Screenshots, transparency, sharp edges | Lossless; large for photos — avoid for photographic content |
| SVG | Icons, logos, illustrations | Infinitely scalable, tiny for simple shapes; inline for critical icons |

Serve AVIF → WebP → JPEG as a fallback chain via `<picture>`; let the browser pick the smallest
format it supports rather than shipping one format to everyone.

```html
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="Product photo" width="1200" height="630" />
</picture>
```

## Responsive Images

`srcset` + `sizes` lets the browser pick the right resolution for the viewport and device pixel
ratio — never ship a 2400px image to a 400px mobile viewport.

```html
<img
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w, photo-2400.jpg 2400w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
  src="photo-800.jpg"
  alt="Descriptive text"
  width="800"
  height="600"
  loading="lazy"
/>
```

- `sizes` describes the image's rendered width at each breakpoint, not the screen width — get this wrong and the browser picks the wrong candidate.
- Use `<picture>` instead of plain `srcset` when the *crop* needs to change per breakpoint (art direction), not just the resolution.
- Always set explicit `width`/`height` (or `aspect-ratio` in CSS) so the browser reserves layout space before the image loads — this is what prevents Cumulative Layout Shift.

## Lazy Loading

- `loading="lazy"` on the native `<img>` element is sufficient for almost all below-the-fold images — no JS library needed.
- Never lazy-load the LCP candidate (hero image, above-the-fold banner) — that delays the metric it's supposed to help. Use `fetchpriority="high"` on it instead.
- For infinite-scroll galleries, combine native lazy loading with an `IntersectionObserver` only if you need custom placeholder/skeleton behavior beyond what the browser gives for free.

```html
<!-- LCP image: eager, high priority, never lazy -->
<img src="hero.jpg" alt="..." fetchpriority="high" loading="eager" />

<!-- Below the fold: lazy -->
<img src="thumb.jpg" alt="..." loading="lazy" />
```

## Image CDNs

An image CDN generates every size/format/crop on demand from one source image via URL parameters,
instead of a build step pre-generating a fixed matrix of files.

| Tool | Approach |
|---|---|
| `next/image` (Next.js) | Built-in on-demand resizing, format negotiation, lazy loading, LCP hints |
| Cloudinary / Imgix | URL-parameter-driven transforms (`?w=800&fm=webp&q=auto`), works with any framework |
| Cloudflare Images | Edge-resized, cache-friendly, integrates with Cloudflare's CDN |
| `astro:assets` | Build-time optimization for static sites |

Prefer a CDN/framework solution over hand-rolling a `srcset` matrix for any site with more than a
handful of images — manually maintaining N sizes × M formats per image doesn't scale.

## Core Web Vitals Impact

- **LCP**: the hero/above-the-fold image is frequently the LCP element. Preload it (`<link rel="preload" as="image">`), never lazy-load it, and serve it at the exact rendered size.
- **CLS**: always reserve space via `width`/`height` or `aspect-ratio` — an image that loads and shifts content is the most common CLS cause.
- **INP**: not directly image-related, but decoding very large images synchronously can block the main thread — use `decoding="async"`.

## Common Pitfalls

1. **Shipping the source image untouched** — a 4000px camera photo displayed at 400px wastes ~90% of the transferred bytes.
2. **Missing `width`/`height`** — causes layout shift as the image loads, hurting CLS.
3. **Lazy-loading the LCP image** — directly delays the metric it should improve.
4. **One `srcset` for all crops** — when the composition needs to change (portrait crop on mobile vs. wide crop on desktop), use `<picture>` with per-breakpoint `<source>`, not a single `srcset`.
5. **No format fallback** — serving raw AVIF/WebP with no JPEG fallback breaks on the small remaining share of older browsers/tools (email clients, some scrapers).
6. **Re-encoding already-lossy images** — repeatedly re-saving a JPEG degrades quality without shrinking file size proportionally; always optimize from the original/source asset.

## Rules

1. Never serve an image larger than its maximum rendered size at 2x DPR.
2. The LCP image is never lazy-loaded and is preloaded when known ahead of render.
3. Every `<img>` has explicit `width`/`height` or a CSS `aspect-ratio`.
4. Prefer AVIF/WebP with a JPEG fallback over serving JPEG/PNG alone.
5. Below-the-fold images use native `loading="lazy"` — no JS library unless custom placeholder behavior is required.
6. SVG for icons and logos, never JPEG/PNG for content that needs to scale losslessly.
