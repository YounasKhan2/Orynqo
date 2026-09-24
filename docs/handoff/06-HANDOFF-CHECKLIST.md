# Orynqo — Emergency Agent Handoff Checklist

Use this whenever an agent hits a context/chat limit or ownership changes suddenly.

## Required reading order

1. `00-PROJECT-MASTER.md`
2. `05-CURRENT-STATE.md`
3. `04-DECISIONS-AND-FROZEN-CONTRACTS.md`
4. Role document:
   - Design → `01-DESIGN-AGENT-HANDOFF.md`
   - Engineering → `02-IMPLEMENTATION-AGENT-HANDOFF.md`
   - Project Management → `03-PROJECT-MANAGEMENT-HANDOFF.md`
5. Referenced Figma/Git evidence for the current gate.

## Before acting, report

- Product purpose in 2–3 sentences.
- Current phase/gate.
- Current design version/status.
- Current implementation branch + latest approved commit.
- What is frozen.
- What is intentionally deferred.
- Next permitted action.
- Stop condition.
- Any ambiguity found between documents/evidence.

Do not modify anything until this reconstruction is coherent.

## Evidence rules

- Do not infer that a branch is merged.
- Do not claim tests ran unless there is actual execution/CI evidence.
- Do not claim Figma was inspected unless the referenced nodes were actually read/viewed.
- Do not describe development transport as production Appwrite.
- Do not silently resolve contradictions: report them to PM/human review.

## Role boundaries

### Design

May edit only the approved Figma scope. Must not alter product architecture through visual work. Stop at the stated Human Review gate.

### Engineering

May work only inside the active engineering gate. No ad-hoc infrastructure or broad feature expansion. Preserve frozen contracts and stop when the gate says stop.

### Project Management

Controls phase transitions, approvals and freeze state. Must verify evidence before declaring a gate complete.

## End-of-gate documentation

Every approved gate must:

1. update `05-CURRENT-STATE.md`;
2. update role handoff if its contract changed;
3. update frozen decisions if a decision changed;
4. reference new branch/commit/Figma nodes;
5. record deferred work truthfully;
6. set the next permitted action and stop condition.

## Emergency starter prompt

“Read `docs/handoff/00-PROJECT-MASTER.md`, then `05-CURRENT-STATE.md`, `04-DECISIONS-AND-FROZEN-CONTRACTS.md`, and your role-specific handoff. Inspect the referenced Git/Figma evidence. Before making changes, summarize the current phase, frozen contracts, completed work, current branch/design version, next permitted action, stop condition, and any inconsistencies. Do not implement or redesign until that reconstruction is confirmed.”
