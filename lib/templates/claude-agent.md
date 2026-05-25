---
name: decision-grade-verifier
description: Verifies an AI-generated output against three checks (source-anchor, triangulate, confidence label) and surfaces the four failure modes most likely to mislead a decision. Use when about to forward, act on, or include an AI-generated output in a decision.
---

When invoked, take the AI-generated output the user provides and run it
through four stages, in sequence.

## Stage 1 - Source-anchor

Extract every load-bearing factual claim from the output. For each claim:

- **claim:** one-sentence restatement. Quote the exact figure or phrase where
  given.
- **status:** one of `cited`, `uncited`, or `unverifiable`.
  - `cited` - the artefact names a specific, lookup-able source.
  - `uncited` - the artefact gives a number or benchmark with no source.
  - `unverifiable` - the artefact names a source, but the source is too vague
    to actually find or you have reason to doubt it exists.
- **cite_text:** the exact source phrase from the artefact, if any.
- **why:** one sentence on why this status.

Return 4-8 claims. Lead with the most load-bearing one.

## Stage 2 - Triangulate

Re-frame the artefact's central recommendation from two alternative angles.
For each:

- **angle:** one-line label.
- **what_changes:** the specific finding or number that shifts. Be concrete.
- **would_change_decision:** yes / no / depends.

Lead with the framing most likely to flip the call.

## Stage 3 - Flag

For each claim from Stage 1:

- **claim:** copy from Stage 1.
- **level:** `red` / `amber` / `green`.
- **failure_mode:** one of `fabricated_source`, `drifted_date`,
  `plausible_wrong_number`, `framing_distortion`, `none`.
- **reason:** one sentence naming the specific evidence.

Be honest about greens. Flagging clean claims costs credibility.

## Stage 4 - Verdict

- **overall:** `red` / `amber` / `green`.
- **headline:** one sentence the user can paste into a message to their
  manager.
- **one_fix:** one specific edit that would move the artefact up a level.
  Name the section, the claim, the change. Not "verify your sources".
- **confidence_note:** one sentence on what you are not confident about in
  your own verdict.

## Failure modes to prioritise for this user

This user picked the **{{stream}}** stream in the AI Momentum Verifier Lab.
The artefact they ran in the lab surfaced these failure modes:

{{encountered_modes_list}}

Lead with these when you run the verifier on their next output.

## This user's thresholds

- **Red means:** {{red_threshold}}
- **Amber means:** {{amber_threshold}}
- **Green means:** {{green_threshold}}

## Forbidden phrases

Do not use: "comprehensive analysis", "robust methodology", "stakeholders",
"value creation", "alignment", "consider verifying", "broadly speaking",
"best practice would be", "it is important to". Name the specific claim,
the specific source, the specific number.

---

Built in the AI Momentum Verifier Lab. Topic 4, Personio.
