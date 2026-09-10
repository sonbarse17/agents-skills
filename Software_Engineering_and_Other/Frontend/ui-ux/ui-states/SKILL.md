---
name: ui-states
description: Design empty, loading, error, and partial states for any
  data-driven UI. Use when a component or page only has a "happy path"
  designed and needs its other states filled in, or when reviewing whether
  a screen handles zero-results, slow-network, and failure cases.
tags:
  - frontend
  - ui-states
depends_on:
  - interaction-patterns
  - frontend-animation
---

# UI States

Every screen that renders data has at least five states: loading, loaded-with-data,
loaded-empty, error, and partial/stale. Most design and review attention goes to the
loaded-with-data state; the other four are exactly where users hit dead ends, blank screens, and
confusion when something inevitably isn't a clean success.

## When to Use This Skill

- A component or page has only a "happy path" mock — filling in its other states
- Reviewing whether a screen handles zero results, slow network, and request failure
- Designing a skeleton/loading pattern for a list, card grid, or detail view
- Deciding what an error state should say and offer as a next step
- Designing a "stale data" indicator for content that failed to refresh

## The Five States

```
Request initiated
├── Loading (first load, no data yet) → Skeleton or spinner
├── Success + has data → The "happy path" — most-designed state
├── Success + zero results → Empty state (not the same as loading!)
├── Error (request failed) → Error state with retry
└── Success + stale (refresh failed, showing cached data) → Stale indicator, not a full error
```

Treat "empty" and "error" as first-class states with their own design, not a fallback to
whatever the loading or happy-path component renders by default with no data.

## Loading States

- **Skeleton screens** (gray placeholder shapes matching the eventual layout) are preferred over spinners for content that has a predictable shape (lists, cards, article layouts) — they reduce perceived wait time because the layout doesn't jump when data arrives.
- **Spinners** are appropriate for actions with no predictable layout (a full-page transition, a button's own in-flight state) or very short loads.
- Never show a loading state for less than ~300-500ms even if the data returns instantly — a flash of a skeleton then content reads as janky; either show nothing under that threshold or ensure a minimum display time.
- For paginated/infinite lists, only skeleton the *new* items being fetched — don't re-skeleton content already on screen.

```tsx
function ProductList({ status, items }: { status: 'loading' | 'success' | 'error'; items: Product[] }) {
  if (status === 'loading') return <ProductGridSkeleton count={6} />;
  if (status === 'error') return <ErrorState onRetry={refetch} />;
  if (items.length === 0) return <EmptyState />;
  return <ProductGrid items={items} />;
}
```

## Empty States

An empty state is not "no data yet" (that's loading) — it's a confirmed, successful response
with zero results. Design each empty state around *why* it's empty:

| Cause | What to show |
|---|---|
| First-time use, nothing created yet | Explain the value of creating one, with a prominent primary action ("Create your first project") |
| Filtered/searched to zero results | State what was searched for, offer to clear filters or broaden the search |
| Content was deleted/archived | Confirm what happened, offer to view archive or undo if recent |
| Permission-restricted (user can't see anything here) | Explain why, not a bare blank screen that looks broken |

A generic "No items" with a large blank area below it looks like a bug, not an intentional state
— always pair the message with an icon/illustration and, where relevant, a next action.

## Error States

- State what failed in plain language, not a raw error code or stack trace ("We couldn't load
  your orders" not "Error 500").
- Always offer a next step: retry button, link to support, or a fallback view — never leave the
  user at a dead end with no recovery path.
- Distinguish error *scope*: a full-page error (nothing loaded) replaces the whole view; a
  partial error (one widget on an otherwise-working dashboard) should degrade just that widget,
  not the entire page.
- Network errors, permission errors (403), and not-found errors (404) are different situations
  and deserve different messages/actions — a blanket "Something went wrong" for all three loses
  information the user could act on.

```tsx
function ErrorState({ error, onRetry }: { error: AppError; onRetry: () => void }) {
  const message = {
    network: "You're offline. Check your connection and try again.",
    forbidden: "You don't have access to this. Contact your admin if this seems wrong.",
    notFound: "This couldn't be found — it may have been moved or deleted.",
    unknown: "Something went wrong on our end. Please try again.",
  }[error.type];

  return (
    <div role="alert">
      <p>{message}</p>
      {error.type !== 'forbidden' && <button onClick={onRetry}>Try again</button>}
    </div>
  );
}
```

## Stale / Partial Data

When a background refresh fails but cached data still exists, show the stale data with a subtle
indicator ("Last updated 5 minutes ago — refresh failed") rather than replacing working content
with a full error state. Losing data the user could still see is a worse outcome than showing
slightly outdated data with a clear timestamp.

## Skeleton Design Guidelines

- Match the skeleton's shape and proportions to the real content's layout — a skeleton that
  doesn't resemble the eventual content causes a visual "pop" when real content replaces it.
- Use a subtle shimmer/pulse animation (respecting `prefers-reduced-motion` — see `animation`) so
  the skeleton reads as "loading," not as broken gray boxes.
- Cap skeleton count to what will realistically render (don't skeleton 20 rows if the page shows 6).

## Common Pitfalls

1. **No empty-state design**: the "happy path" component renders with an empty array and produces a blank or broken-looking layout.
2. **Generic error messages**: "Something went wrong" for every failure type, with no retry action.
3. **Full-page error for a partial failure**: one failed widget takes down an entire working dashboard.
4. **Flashing loading states**: skeleton shown for <300ms causing visual flicker.
5. **Skeleton shape mismatch**: generic gray boxes that don't resemble the eventual content layout.
6. **Losing visible data on a failed background refresh**: replacing working stale content with a hard error instead of a stale indicator.

## Rules

1. Every data-driven view designs loading, empty, error, and (where relevant) stale states — not just the happy path.
2. Empty state is never the loading or error component rendered with no data — it has its own design.
3. Error messages are in plain language with a concrete next step, never a raw error code alone.
4. A partial failure degrades only the affected section, never the whole page, when other content loaded successfully.
5. Skeleton screens match the real content's layout and respect `prefers-reduced-motion`.
