# Orynqo — Project Management Agent Handoff

This document is for the coordinating agent responsible for phase control across Product, Design and Engineering.

## Operating model
Orynqo uses explicit gates:
`define → execute narrow scope → inspect evidence → human review → approve/fix → freeze → update handoff → next gate`.

Never allow one agent to silently cross from its approved gate into another phase.

## Sources of truth
1. Git repository and approved commits.
2. Figma frozen/approved nodes.
3. `docs/handoff/05-CURRENT-STATE.md`.
4. Frozen decisions.
5. Role-specific handoffs.
Chat history is not the canonical project record.

## Major completed phases
Product architecture, information architecture, design system, core components, product shell, Work Items collection, RB-142 Golden Flow, responsive specification, accessibility/QA and implementation handoff were designed and frozen.

Engineering:
- Gate 1 ORY-000→010 foundation approved.
- Gate 2 ORY-011→015 approved after corrections.
- RB-142 Golden Flow implemented.
- Final integration correction approved at commit `d86654b3c534698be7edb2835237e739161aa556`.
- Actual Appwrite persistence/realtime intentionally deferred.

Design:
- Implementation findings triggered Design Validation Pass 01.
- Figma page `61:2` / board `61:3` completed.
- Human Review approved it for controlled propagation.
- Current target is Design System v1.1 final propagation + freeze.

## Why we returned to design
Implementation validated the major architecture but exposed missing visual state language: pending vs offline, canonical vs attempted conflicts, permission change, archive vs unavailable, comment sending/failure and clearer Activity hierarchy. The response is a v1.1 interaction-state correction, not a redesign.

## Current coordination rule
Engineering remains stopped until Design System v1.1 is propagated, independently reviewed and frozen. After that, PM chooses the next narrow vertical slice; do not let Design or Engineering choose it unilaterally.

## Blocker policy
No ad-hoc fixes. First understand the blocker, inspect current evidence, research current external semantics if relevant, present the narrowest valid options, obtain approval when architecture/contract changes are involved, then implement.

## Infrastructure philosophy
“Architecture ahead of scale. Infrastructure follows measured scale.”
Near-zero initial spend is desired, but product architecture must not be weakened to save infrastructure cost. Use Appwrite Education resources intelligently and introduce additional infrastructure only when evidence requires it.

## Gate Definition of Done
Every approved gate must update `05-CURRENT-STATE.md`. Update the role handoff if its contract changed and `04-DECISIONS-AND-FROZEN-CONTRACTS.md` if a decision changed. Documentation updates are part of the gate, not cleanup later.

## PM onboarding test
A replacement PM agent must be able to state:
- what Orynqo is;
- current design version;
- current engineering branch/commit;
- what is frozen;
- what is intentionally deferred;
- current active gate;
- next permitted action;
- stop condition.
If any answer is uncertain, inspect the referenced source before directing another agent.
