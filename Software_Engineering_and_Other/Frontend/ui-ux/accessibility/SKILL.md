---
name: accessibility
description: Foundational web accessibility principles — semantic HTML, ARIA
  basics, keyboard navigation, focus management, and disability-aware design.
  Use as the starting point for any accessibility work; for WCAG 2.2 compliance
  checklists use `accessibility-compliance`, for audit workflows use
  `wcag-audit-patterns`, for assistive-tech testing use `screen-reader-testing`.
tags:
  - frontend
  - accessibility
depends_on:
  - accessibility-compliance
---

# Accessibility Fundamentals

Accessibility (a11y) means people with disabilities — visual, auditory, motor, cognitive, or
situational — can perceive, operate, and understand an interface. It is not a checklist bolted on
at the end; it is a design constraint that, applied early, usually produces a simpler and more
robust UI for everyone.

## Who This Affects

| Disability type | Examples | Primary needs |
|---|---|---|
| Visual | Blindness, low vision, color blindness | Screen readers, high contrast, zoom, no color-only meaning |
| Auditory | Deafness, hard of hearing | Captions, transcripts, visual alerts instead of audio-only |
| Motor | Limited dexterity, tremor, no mouse use | Full keyboard access, large touch targets, no time limits |
| Cognitive | Dyslexia, ADHD, memory impairment | Plain language, consistent layout, minimal distraction |
| Situational | Bright sunlight, broken arm, noisy room | Same accommodations as permanent disabilities, temporarily |

## Core Principle: Semantic HTML First

The browser gives interactive elements keyboard support, focus handling, and screen-reader
semantics for free. ARIA re-implements what native HTML already does, worse, unless there is no
native equivalent.

```html
<!-- BAD: a div pretending to be a button gets none of this for free -->
<div class="btn" onclick="submit()">Submit</div>

<!-- GOOD: native button gets keyboard, focus, and role for free -->
<button type="submit">Submit</button>
```

Reach for ARIA only when HTML has no equivalent (custom comboboxes, tab panels, live regions) —
never to patch a `<div>` into behaving like a control that already exists natively.

### The 5 Rules of ARIA

1. Don't use ARIA if a native HTML element or attribute already does the job.
2. Don't change native semantics unless you really have to (`role="button"` on a `<button>` is redundant and harmless; on an `<h1>` it destroys the heading).
3. All interactive ARIA controls must be usable with the keyboard.
4. Don't use `role="presentation"` or `aria-hidden="true"` on a focusable element.
5. All interactive elements must have an accessible name (visible text, `aria-label`, or `aria-labelledby`).

## Keyboard Accessibility

Every interactive element must be reachable and operable with a keyboard alone — this is the
foundation both screen-reader users and motor-impaired users depend on.

- **Tab** moves focus forward, **Shift+Tab** backward, through all interactive elements in DOM order.
- **Enter** activates links and buttons; **Space** activates buttons and toggles checkboxes.
- **Arrow keys** move within a composite widget (menu, tab list, radio group) — not between widgets.
- **Escape** closes dialogs, menus, and popovers, returning focus to the trigger.
- Never set `tabindex` greater than `0` — it breaks natural tab order. Use `tabindex="0"` to add a non-native element to the tab order, `tabindex="-1"` to make an element programmatically focusable but skip it in Tab order.
- Never remove the focus outline (`outline: none`) without replacing it with an equally visible custom style — invisible focus is a WCAG 2.4.7 failure and leaves keyboard users unable to tell where they are.

```css
/* BAD -- focus indicator removed with nothing to replace it */
button:focus { outline: none; }

/* GOOD -- styled but still visible, and only shown for keyboard focus */
button:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
```

## Focus Management

- Moving focus programmatically (opening a modal, navigating a SPA route) must place focus somewhere sensible — the dialog heading, or the main content landmark — never leave it stranded on a removed element.
- Modals and dialogs trap focus inside themselves while open and return it to the triggering element on close.
- Never trap focus outside of a modal context — a keyboard user must always be able to reach every part of the page.

## Images and Non-Text Content

- Every meaningful `<img>` needs `alt` text describing its purpose, not its appearance ("Company logo, links to home" not "blue swirl icon").
- Purely decorative images use `alt=""` (empty, not omitted) so screen readers skip them silently.
- Icons used as the only content of a button need an accessible name via `aria-label`, since the icon itself has none.

```html
<!-- Decorative: silent to screen readers -->
<img src="divider.svg" alt="" />

<!-- Icon-only button: needs an explicit name -->
<button aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>
```

## Color and Contrast

- Never convey information (errors, required fields, status) through color alone — pair it with an icon, text, or pattern. Roughly 8% of men have some form of color vision deficiency.
- Minimum contrast: 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold) and UI component boundaries.

## Where to Go Next

This skill covers the foundations. For deeper, more specific work:

- **`accessibility-compliance`** — WCAG 2.2 Level AA/AAA implementation checklist, mobile accessibility (VoiceOver, TalkBack), common violation patterns.
- **`wcag-audit-patterns`** — running a structured accessibility audit, POUR principles, conformance levels, violation severity triage.
- **`screen-reader-testing`** — hands-on testing procedures and keyboard commands for VoiceOver, NVDA, JAWS, and TalkBack.

## Rules

1. Use semantic HTML elements before reaching for ARIA.
2. Every interactive element is keyboard-operable — test by unplugging the mouse.
3. Never remove focus indicators without an equally visible replacement.
4. Every image has appropriate `alt` text (descriptive, empty, or an accessible-name equivalent for icon buttons).
5. Never use color as the only carrier of meaning.
6. Every form input has a programmatically associated label.
7. Test with at least one real screen reader before shipping, not simulators alone.
