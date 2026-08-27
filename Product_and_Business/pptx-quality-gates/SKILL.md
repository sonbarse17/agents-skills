---
name: pptx-quality-gates
description: "Use when validating or repairing an editable PPTX deck for geometry, accessibility, native editability, source lineage, and OOXML package integrity."
---

# PPTX Quality Gates

Use this skill before delivering a generated PPTX. Treat deterministic failures as repair work, not exceptions.

## Workflow

1. Confirm the spec, builder, PPTX, source manifest, and [audit](../../AI_and_Agents/Operations/audit/SKILL.md) paths.
2. Apply `../../../Global_References/[audit](../../AI_and_Agents/Operations/audit/SKILL.md)-checklist.md` to the coordinate contract before building.
3. Reopen the PPTX and compare slide count, actual bounds, hidden slides, and requested geometry with the layout tree.
4. For production decks, run `[pptx-reference-deck-analysis](../../DevOps_and_Cloud/Observability_and_SecOps/[pptx-reference-deck-analysis](../../Software_Engineering_and_Other/Miscellaneous/pptx-deck-creation/skills/pptx-reference-deck-analysis/SKILL.md)/SKILL.md)/scripts/validate_package.py` and save the JSON report.
5. Check document language, slide titles, meaningful-image alt text, reading order, table headers, and source references.
6. When a compatible renderer is already available, inspect previews for clipping, font fallback, contrast, crop, and hierarchy. Do not add a renderer dependency.
7. Repair the spec or task-local builder, rebuild, and rerun the same checks.

## Required artifacts

Keep the spec, PPTX, build record, geometry [audit](../../AI_and_Agents/Operations/audit/SKILL.md), accessibility [audit](../../AI_and_Agents/Operations/audit/SKILL.md), package report, and source manifest together. Report any documented exception with slide ID, object ID, owner, reason, and review date.

## Pass criteria

Zero content collisions, text overflows, unsafe content bounds, invalid positive geometry, and package-integrity errors. Meaningful slide content must remain native editable objects; images support rather than replace it.

See `../../../Global_References/[audit](../../AI_and_Agents/Operations/audit/SKILL.md)-checklist.md` for the complete checklist.

