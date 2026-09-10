---
name: ethical-design
description: Recognize and avoid dark patterns — deceptive UI that
  manipulates users against their own interest. Use when reviewing a
  cancellation/unsubscribe flow, a consent/cookie banner, pricing display, or
  any interaction where business incentive and user interest could diverge.
tags:
  - frontend
  - ethical-design
depends_on:
  - interaction-patterns
  - accessibility
---

# Ethical Design (Dark Pattern Avoidance)

A dark pattern is an interface deliberately designed to make users do something against their own
interest — subscribe, overpay, or stay opted-in — by exploiting how people actually read and
decide, rather than by making the honest option easier. Beyond the ethical case, dark patterns
carry real regulatory risk (FTC enforcement, GDPR, California's SB 6, EU Digital Services Act) and
erode trust faster than almost any other design failure.

## When to Use This Skill

- Reviewing a cancellation, unsubscribe, or account-deletion flow
- Designing a consent banner (cookies, notifications, data sharing)
- Displaying pricing, fees, or subscription terms
- Reviewing any flow where the business's incentive and the user's interest could diverge
- Auditing an existing product for patterns that would embarrass the team if called out publicly

## Common Dark Pattern Categories

| Pattern | What it looks like | Ethical alternative |
|---|---|---|
| **Roach motel** | Easy to sign up, deliberately hard to cancel (buried settings, required phone call, multi-step retention maze) | Cancellation takes the same number of steps as signup |
| **Confirmshaming** | Decline option worded to shame the user ("No thanks, I don't want to save money") | Neutral, equally-weighted wording for both options |
| **Forced continuity** | Free trial silently converts to paid with no reminder, cancellation buried | Reminder before charge; one-click cancel available throughout the trial |
| **Sneak into basket** | An item/add-on pre-selected or added without explicit action | Nothing added to cart/order without an explicit user action |
| **Hidden costs** | Fees revealed only at the final checkout step | All costs shown before the user commits to checkout |
| **Trick questions** | Double negatives or ambiguous phrasing on opt-in checkboxes ("Uncheck this box if you don't want to not receive emails") | Single, unambiguous affirmative statement per checkbox |
| **Privacy Zuckering** | Confusing settings that lead users to share more data than intended | Default to the most private setting; sharing is opt-in, not opt-out by confusion |
| **Nagging** | Repeated interruption to reconsider a decision already made (e.g., re-prompting notification permission every session) | Ask once; respect "don't ask again" |
| **Disguised ads** | Content styled to look like organic content/results but is actually paid placement | Clear, persistent "Ad" or "Sponsored" labeling |
| **False urgency** | Fake countdown timers or "3 people are viewing this" that reset or aren't real | Urgency indicators only when genuinely true and verifiable |

## Consent & Cookie Banners

- "Accept All" and "Reject All" must be equally prominent (same size, same visual weight,
  same number of clicks) — making reject require navigating into a submenu while accept is one
  click is a dark pattern (and, under GDPR, unlawful).
- Never pre-check optional consent categories — the default state is opted-out for anything
  non-essential.
- Don't re-show the banner every session once a choice has been made; respect the recorded
  preference.

```
BAD: [Accept All]  ...tiny link... "manage preferences" → 3 more clicks to reject
GOOD: [Accept All]  [Reject All]  [Manage Preferences] — all equally visible, one click each
```

## Cancellation & Unsubscribe Flows

- Cancellation should require no more steps than signup did — if signup is one click, cancellation
  requiring a phone call or a multi-page retention gauntlet is a roach motel.
- A single, optional "why are you leaving" retention offer is acceptable; multiple sequential
  offers ("Are you SURE? Here's 50% off... still sure? Here's a free month...") is not.
- Email unsubscribe links must work in one click without requiring login (CAN-SPAM requirement in
  the US, and good practice everywhere).

## Pricing & Checkout

- Show the total cost, including mandatory fees, before the final confirmation step — not
  revealed only after the user has invested time filling out the flow.
- If a plan auto-renews, state the renewal date and price clearly at signup, not only in
  hard-to-find account settings.
- Comparison tables should present plans honestly — don't artificially cripple the "recommended
  cheaper" option's presentation to funnel users toward the priciest tier through visual bias
  alone (highlighting is fine; hiding features that exist on cheaper plans is not).

## Recognizing the Line

Persuasive design is not inherently unethical — highlighting a genuinely good default, showing
real scarcity, or making the recommended plan visually prominent are legitimate. The test is
whether the technique works by **informing** the user's decision or by **exploiting** a
predictable cognitive shortcut against their interest:

```
Is the technique still effective if the user reads every word carefully and has time to think?
├── Yes → Likely legitimate persuasion (clear value prop, genuine social proof, real urgency)
└── No, it relies on the user NOT reading carefully or being rushed → Likely a dark pattern
```

## Common Pitfalls

1. **Asymmetric consent choices**: "Accept" is a button, "Reject" is a small text link.
2. **Multi-step cancellation** when signup was a single click.
3. **Pre-checked opt-ins** for marketing emails, data sharing, or add-on products.
4. **Costs revealed late** in checkout instead of up front.
5. **Confirmshaming copy** on decline/skip options.
6. **Fake scarcity/urgency** that doesn't reflect real inventory or time constraints.

## Rules

1. Cancellation/unsubscribe requires no more steps than the equivalent signup/subscribe action.
2. Accept and reject/decline options are equally prominent — same size, same number of clicks.
3. Nothing is pre-checked or pre-added to a cart/order without an explicit user action.
4. All costs are shown before the final commit step, not revealed after.
5. Urgency and scarcity indicators are only shown when genuinely true.
6. Every checkbox/toggle uses a single, unambiguous affirmative statement — no double negatives.
