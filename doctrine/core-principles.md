# Core Principles

KIRION Forge coordinates engineering through explicit state, bounded roles, durable memory, and evidence-driven promotion.

## 1. Agents are ephemeral

No project should depend on one conversation or one model instance remaining available. Important project knowledge must be externalized.

## 2. Authority is explicit

Every consequential mutation should have an identifiable source of authority: user instruction, Maintainer handoff, repository-local rule, accepted branch, or exact SHA.

## 3. Evidence is durable

Claims about implementation quality, tests, runtime behavior, integration, and deployment should be tied to observable evidence where possible.

## 4. Memory belongs to the project

The project must preserve enough current truth that another agent can reconstruct the active engineering state without replaying entire historical conversations.

## 5. Build aggressively inside bounded environments

Forge encourages speed inside sandboxes because damage is constrained. The boundary between candidate and accepted state is where caution increases.

## 6. Implementation and acceptance are different powers

A Code Writer can produce excellent work and still lack the authority to declare that work accepted.

## 7. Failures must be classified before correction

A failing test may represent a production defect, stale test, environment defect, integration issue, authority drift, or another class of failure. Editing production code before classification may make the system worse.

## 8. Recoverability is a first-class quality

Forge assumes mistakes will occur. Good workflow design makes them cheap to identify, contain, and reverse.

## 9. Context should be deliberately budgeted

Load current task state and current project truth by default. Retrieve historical detail only when it materially affects a decision.

## 10. Completed work should strengthen the next execution

Material state changes should update the appropriate durable memory, evidence, or decision record so the next worker starts from a stronger state.