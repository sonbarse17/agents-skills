---
name: information-architecture
description: Design navigation structures, content hierarchies, and
  categorization systems — sitemaps, navigation patterns, labeling, search
  vs. browse tradeoffs. Use when structuring a new site/app's navigation,
  reorganizing content that's become hard to find, or deciding between
  navigation patterns (tabs, sidebar, mega menu, hub-and-spoke).
tags:
  - frontend
  - information-architecture
depends_on:
  - ux-research
  - responsive-design
---

# Information Architecture

Information architecture (IA) is the structure that lets users predict where to find something
before they've seen it — a well-labeled, logically-grouped hierarchy that matches how users think
about the content, not how the org chart or database schema happens to be organized.

## When to Use This Skill

- Structuring navigation for a new site or application
- Reorganizing content that users report they "can't find"
- Choosing a navigation pattern (top nav, sidebar, tabs, mega menu, hub-and-spoke)
- Writing labels for navigation items and categories
- Deciding when to rely on search vs. browse
- Designing breadcrumbs and wayfinding for deep hierarchies

## Core Principles

- **Match the user's mental model, not the org chart.** Content organized by internal department names ("Solutions," "Platform," "Enterprise") is frequently meaningless to a new visitor who thinks in tasks ("I want to X").
- **The three clicks rule is a myth** — depth matters less than clarity at each step. Users tolerate more clicks if every click's outcome is predictable; they abandon after one ambiguous click.
- **Card sort before you design the visual navigation** — see `ux-research` for the method. Validating the *structure* is cheap; validating it after the visual design is built is expensive to fix.
- **Breadth vs. depth tradeoff**: a shallow-and-wide hierarchy (many top-level categories, few sublevels) is easier to scan; a narrow-and-deep hierarchy (few top categories, many sublevels) is easier to maintain as content grows. Most consumer sites lean shallow-and-wide (5-9 top-level items); large documentation sites lean narrow-and-deep.

## Navigation Patterns

| Pattern | Best for | Avoid when |
|---|---|---|
| Top nav (horizontal) | 5-7 top-level sections, desktop-first | More than ~7 items (forces a "More" overflow) |
| Sidebar (vertical) | Deep hierarchies, docs, dashboards, persistent context | Content is primarily linear/sequential |
| Tabs | Switching between views of the *same* object (e.g., a record's Overview/History/Settings) | Navigating between unrelated sections — tabs imply siblings, not a hierarchy |
| Mega menu | Large catalogs needing multiple categories visible at once (e-commerce) | Fewer than ~15 items — adds interaction cost with no benefit |
| Hub-and-spoke | Distinct, largely unrelated task flows launched from one home | Content that's meant to be browsed sequentially |
| Bottom nav (mobile) | 3-5 primary destinations on mobile | More than 5 — cramped targets, forces a "More" tab that hides content |

## Categorization Approaches

- **Exact (objective)**: alphabetical, chronological, geographical, by size/price. Best when users already know what they're looking for.
- **Ambiguous (subjective)**: by topic, by task, by audience, by metaphor. Best when users are exploring or don't have precise vocabulary for what they need — requires validation (card sorting) since categories reflect interpretation, not fact.
- Never mix organizing schemes at the same navigation level (e.g., some items by product type, others by audience, in the same menu) — users can't predict which scheme applies to find the next item.

## Labeling

- Use the user's vocabulary, not internal jargon — "Billing" beats "Subscription Management Portal."
- Be consistent: don't call the same concept "Account," "Profile," and "Settings" in different parts of the product.
- Front-load the distinguishing word: "Settings — Privacy" scans faster than "Privacy Settings" in a long vertical list, because the eye scans the first word of each line.
- Avoid ambiguous single words as top-level labels ("Solutions," "Resources") unless the submenu disambiguates immediately on hover/expand.

## Search vs. Browse

- Users search when they know what they want and expect to name it correctly; they browse when
  exploring or unsure of vocabulary. Provide both — neither substitutes for the other.
- A prominent search box is not a substitute for good IA: search relies on the user guessing the
  right term, and a flat search-only site has no categorization to fall back on when the guess is
  wrong.
- Site search failure ("no results") should suggest related categories or corrected spelling, not
  a dead end.

## Wayfinding: Breadcrumbs and Indicators

```
Home > Electronics > Laptops > Gaming Laptops
```

- Breadcrumbs show *path*, not necessarily category membership — useful for hierarchies deeper than 2 levels.
- Always highlight the current location in the primary navigation (active state) — users need to know where they are, not just how they got there.
- For faceted/filtered browsing (e-commerce, search results), show active filters as removable chips near the results, not just in a sidebar checkbox state that's easy to lose track of.

## Sitemap Documentation

A sitemap is the working artifact for reviewing IA before visual design starts — a simple
indented list or box diagram of every page/section and its parent, not a polished deliverable.

```
Home
├── Products
│   ├── Category A
│   │   └── Product Detail
│   └── Category B
├── Pricing
├── About
│   ├── Team
│   └── Careers
└── Support
    ├── FAQ
    └── Contact
```

Review the sitemap with stakeholders and validate the structure with a card sort or tree test
(`ux-research`) before committing to visual navigation design — restructuring a shipped visual
nav is far more expensive than restructuring a list.

## Common Pitfalls

1. **Navigation by org chart**: mirroring internal team structure instead of user tasks.
2. **Inconsistent labeling**: the same feature named differently in the nav, page title, and breadcrumb.
3. **Mixing organizing schemes** at one level (by audience AND by product type in the same menu).
4. **Over-nesting**: burying frequently-needed content 4+ levels deep "to keep the top level clean."
5. **Search as an excuse to skip IA**: relying on search to compensate for a confusing structure instead of fixing the structure.
6. **No validation before build**: skipping card sorting/tree testing and discovering the structure doesn't match users' mental model only after launch.

## Rules

1. Validate any new or restructured navigation with a card sort or tree test before visual design.
2. Never mix categorization schemes within a single navigation level.
3. Every navigation label uses the user's vocabulary, not internal/team jargon.
4. The current location is always visually indicated in the primary navigation.
5. Search complements browse — it never replaces having a coherent category structure.
6. Keep top-level navigation to 5-9 items; use a mega menu or sidebar for anything larger.
