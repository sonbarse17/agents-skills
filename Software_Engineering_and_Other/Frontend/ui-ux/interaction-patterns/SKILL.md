---
name: interaction-patterns
description: Design how interfaces respond to user input — affordances,
  feedback timing, microcopy, error message tone, confirmation patterns, and
  input method differences (mouse/touch/keyboard). Use when designing button
  states, writing UI copy, deciding when to ask for confirmation, or
  reviewing whether an interaction gives users enough feedback. For motion
  and microinteraction implementation specifically, use `interaction-design`
  or `frontend-animation`.
tags:
  - frontend
  - interaction-patterns
depends_on:
  - accessibility
  - design-visual-design
---

# Interaction Design

Interaction design is the layer between visual design and engineering: what happens, and what the
interface *tells the user is happening*, in response to every input. A beautiful interface that
gives no feedback on a slow action, or that asks "Are you sure?" for a reversible action, fails at
interaction design regardless of visual polish.

## When to Use This Skill

- Designing button/control states (default, hover, active, loading, disabled)
- Writing microcopy: button labels, empty states, error messages, tooltips, confirmations
- Deciding whether an action needs a confirmation step
- Designing feedback for actions that take time (instant, <1s, 1-10s, >10s)
- Reviewing an interaction for whether it gives users enough information about what happened

## Feedback Timing

| Duration | User perception | What to show |
|---|---|---|
| < 100ms | Instant | No feedback needed — perceived as direct manipulation |
| 100ms - 1s | Noticeable delay | A subtle loading indicator (spinner, disabled state) so the user knows the click registered |
| 1s - 10s | Waiting | Progress indicator; if possible, show what's happening ("Uploading 2 of 5 files") |
| > 10s | Long wait | Determinate progress bar with percentage/time remaining if calculable; allow cancel; consider moving the task to the background with a completion notification |

Every action that takes longer than ~100ms needs *some* visible acknowledgment — the single most
common interaction failure is a button click with no feedback, leaving the user to wonder whether
it registered and re-click (which can double-submit a form).

## Affordances

An affordance is a visual cue that tells the user an element is interactive and roughly how to
interact with it, before they try.

- Buttons look pressable (contrast, elevation/shadow, or a clear boundary) — flat, low-contrast "ghost" buttons that look like plain text reduce discoverability; use them only for genuinely secondary actions.
- Draggable elements show a grab cursor and/or a drag handle icon — don't rely on users discovering drag behavior by accident.
- Disabled controls are visually distinct (reduced opacity/contrast) AND — where feasible — explain *why* they're disabled (tooltip or adjacent text), not just present a dead-looking button.
- Links look different from buttons: a link navigates, a button performs an action. Mixing the visual language (a link styled as a button performing a destructive action) misleads users about what will happen.

## Confirmation Patterns

```
Is the action destructive or hard to reverse?
├── No (edit a draft, toggle a setting, add an item) → No confirmation; make it instantly undoable instead
├── Yes, but reversible (archive, soft-delete, unsubscribe) → Inline undo toast, no modal
└── Yes, and irreversible or high-consequence (permanent delete, payment, send-to-all) → Explicit confirmation
      → Confirmation names the specific consequence ("Delete 12 items" not "Are you sure?")
      → For the highest-stakes actions, require typing the item's name to confirm
```

Prefer **undo over confirm** wherever the action can be reversed — a confirmation dialog interrupts
every user (including the 99% who meant to do it) to protect against the rare mistake; an undo
toast only interrupts the person who actually made a mistake, after the fact.

```html
<!-- Undo pattern: better default for reversible destructive actions -->
<div role="status">Item archived. <button>Undo</button></div>
```

## Microcopy

- **Buttons**: use a specific verb + object ("Delete project," "Save draft"), not a generic "OK"/"Submit" — the label should let the user predict the outcome without reading surrounding context.
- **Error messages**: state what went wrong AND what to do about it. "Error occurred" tells the user nothing actionable; "This email is already registered — [Log in] or [use a different email]" gives them a path forward.
- **Empty states**: explain why the space is empty and what the primary action is to fill it — not just "No items" with a large blank area.
- **Tooltips**: supplement, never substitute, for a clear label — if a control needs a tooltip to be understood at all, the label or affordance itself needs fixing first.
- **Tone**: match the product's overall voice, but never joke about errors, data loss, or anything security/billing related — a "Oops! 😅" on a payment failure reads as dismissive of something the user may find stressful.

## Input Method Differences

| Concern | Mouse | Touch | Keyboard |
|---|---|---|---|
| Target size | ~24px acceptable (precise pointer) | 44×44px minimum (imprecise, larger contact area) | N/A — focus-based, not spatial |
| Hover states | Primary discovery mechanism | Does not exist — never rely on hover alone to reveal critical info/actions | N/A |
| Drag | Precise, fine-grained | Coarser; provide larger drag handles and haptic/visual feedback | Provide a keyboard-operable alternative (e.g., move-up/move-down buttons) |
| Multi-select | Ctrl/Cmd+click, Shift+click | Long-press to enter selection mode, then tap to toggle | Space to toggle, Shift+Arrow to extend |

Never gate a required action behind hover alone — touch devices have no hover, and keyboard users
navigate via focus, not pointer position. Any information or control revealed on hover must also
be reachable via focus or tap.

## Common Pitfalls

1. **Silent actions**: a button click with zero visible feedback, inviting a duplicate click.
2. **Confirmation fatigue**: adding a confirmation dialog to every destructive action regardless of reversibility, training users to click through them without reading.
3. **Vague error messages**: "Something went wrong" with no next step.
4. **Hover-only affordances on touch-capable layouts**: critical actions only visible on `:hover`.
5. **Generic button labels**: "Submit" / "OK" used everywhere regardless of what the button actually does.
6. **Double-submit**: not disabling a submit button (or debouncing) while a request is in flight, allowing rapid re-clicks to fire duplicate requests.

## Rules

1. Every action taking longer than ~100ms gets visible feedback.
2. Prefer undo over confirm for any reversible destructive action.
3. Confirmation dialogs for irreversible actions name the specific consequence, not a generic "Are you sure?"
4. Error messages state what happened and what to do next.
5. Nothing critical is revealed or operable via hover alone — it must also work via focus/tap.
6. Disable or debounce submit controls while their action is in flight.
