# Orynqo — Design Agent Handoff

Read `00-PROJECT-MASTER.md` and `05-CURRENT-STATE.md` first.

## Mission

Maintain and evolve Orynqo's frozen product language without accidental redesign. Design changes must follow approved gates and must not silently alter domain architecture.

## Figma

File key: `c3gkf8389lOXtHCaOUhlhm`.

Key pages/nodes:

- 01 Product Architecture `2:2`
- 02 Information Architecture `4:2`
- 03 Foundations `5:84`
- 04 Components `6:2`
- 05 Product Shell & Patterns `7:2`
- 06 Data & States `9:2`
- 07 Golden Flow `11:2`
- 08 Interaction Specification `12:2`
- 09 Responsive `14:2`
- 10 Accessibility & QA `17:2`
- 12 System Library `34:9`; core `34:10`
- 20 Product Shell `36:2`; desktop `36:3`
- 21 Project Work Items `38:118`; main `38:119`
- 22 RB-142 Golden Flow `46:2`; main `46:3`
- 27 Responsive & Completion `54:2`; main `54:3`
- 28 Implementation Handoff `55:2`; main `55:3`
- 29 Design Validation Pass 01 `61:2`; board `61:3`

## Design language

Calm, dense, precise, mature productivity software. Inter; neutral surfaces; indigo interaction accent; semantic colors; 1px low-contrast borders; restrained shadows; compact controls; 4px base/8px rhythm; radii 4/6/8/12.

Do not introduce generic SaaS dashboards, gradients, glassmorphism, giant empty states, decorative metrics, excessive whitespace, oversized controls or disconnected one-off screens.

## Core table contract

Checkbox | Key | Title | Status | Priority | Assignee | Cycle.
Approximate tracks: select 32, key 86, title flex 280–340, status 110, priority 90, assignee 145, cycle 100. Header/body geometry must match. Long titles ellipsize visually without changing source content.

## Keyboard/accessibility

Cmd/Ctrl+K command search; C create; E edit; Esc closes topmost; arrows navigate; Enter opens; Cmd/Ctrl+Enter submits. RB-142: P Priority, S Status. Global single-key shortcuts are suppressed in every editable context.

State meaning must never depend on color alone. Preserve focus, keyboard operability, useful announcements and responsive touch targets.

## Current approved design work

Design Validation Pass 01 is approved for controlled propagation. It is not a redesign.

Propagate approved corrections primarily into:

- 12 System Library
- 22 RB-142 Golden Flow
- 27 Responsive & Completion
- 28 Implementation Handoff

Secondary updates only if required for consistency:

- 06 Data & States
- 08 Interaction Specification
- 10 Accessibility & QA

Do not reopen Product Architecture, IA, product shell or unrelated product screens.

## Approved v1.1 state language

- Property Mutation State: Idle, Pending, Failure, Offline/Not synced, Conflict, Read-only.
- Settled returns naturally to normal UI after acknowledgement; no permanent “Saved” badge.
- Property Conflict Resolver compares Current canonical value vs Your change and offers explicit resolution.
- Context Notice handles access and lifecycle explanation.
- Unavailable Context State is a dedicated tombstone replacing protected detail while retaining surrounding collection/query context.
- Comment draft stays visible while sending and on failure; clears only after server acknowledgement.
- Activity is newest-first; visual hierarchy is change → values → actor/time.

## Responsive

Keep existing breakpoints. Conflict may compare inline at wide sizes and stacks under constrained widths. Narrow full-page detail preserves semantics.

## Component discipline

Prefer composition. Do not create a separate banner component for every semantic sentence. ContextNotice may have semantic variants. Unavailable is structurally distinct because it replaces unsafe detail.

## Completion gate

After v1.1 propagation:

1. cross-page QA;
2. list exact changed nodes/components/tokens;
3. confirm untouched architecture/IA/shell;
4. mark **Orynqo Design System v1.1**;
5. STOP at Human Review.
   No engineering or next feature selection.
