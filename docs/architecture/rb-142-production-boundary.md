# RB-142 production mutation boundary

## Status

The RB-142 browser experience in this branch uses an explicitly isolated development command server and development/test event transport because this repository does not contain deployable Appwrite project credentials/resources. It must not be described as exercised production persistence or Appwrite Realtime.

The production contract remains:

UI → ORY-015 MutationPlan / executeDomainMutation → Appwrite Function → identity + Orynqo authorization → lifecycle/workflow validation → expectedVersion → mutationId idempotency → TablesDB transaction → canonical result → TanStack Query reconciliation → Realtime reconciliation.

## Production transaction shape

Each successful RB-142 command is intended to be one TablesDB transaction:

1. load canonical Work Item and Effective Access inputs;
2. reject forbidden/lifecycle/workflow/version failures;
3. check MutationReceipt by mutationId;
4. stage WorkItem update when applicable;
5. stage Comment insert when applicable;
6. stage ActivityEvent insert;
7. stage MutationReceipt insert;
8. commit;
9. return canonical result.

The Work Item version is server-owned. A duplicate mutationId returns the recorded logical result and must not repeat Work Item, Comment or Activity side effects.

## Current exercised vertical slice

The exercised architecture in this branch is:

UI → concrete RB-142 MutationPlan → ORY-015 executeDomainMutation → DevelopmentRb142CommandGateway → Rb142DevelopmentServer → canonical result → shared RB-142 Query projection helper.

Incoming development/test events use:

Rb142DevelopmentServer → Rb142DevelopmentEventTransport → reconcileRealtime → the same Query projection helper.

The event transport is deliberately named and scoped as development/test infrastructure. It is not Appwrite Realtime.

## Query ownership

TanStack Query owns client-side server-derived RB-142 projections. The development server remains the simulated server authority. RB-142 is not copied into Zustand, React Context, or another client-side canonical store.

The collection and inspector can have different projections, but both are reconciled from the same logical RB-142 server state.
