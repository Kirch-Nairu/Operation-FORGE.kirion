# Case Study — Talibon: Parallel Writers, Integration Authority, and Stale Tests

## Source anchors

Repository:

`Kirch-Nairu/Talibon-Sales-Prototype`

Observed default-branch authority during this Forge case-study extraction:

- `main`
- SHA `f9538306f88ba42719edfdb3951d65412187b0b0`

Observed integration branch during extraction:

- `KIRCH-TALIBON-SALES-V1`
- current observed head `fdb7f5a272bad3c0f3efc352951a9746c544012a`

Historically relevant navigation-contract maintenance commit:

- `42c249c50e4df33a2fe9323514c95821afc08fa6`
- message: `test(navigation): align legacy contracts with One Talibon authority`
- parent: `dce8c247c0584bfabf41424a0d6569b899b25f98`

Primary files inspected:

- `AGENTS.md`
- `tests/Feature/CurrentPortalNavigationTest.php`
- commit `42c249c50e4df33a2fe9323514c95821afc08fa6`

The current integration head is later than the historically relevant test-maintenance commit. This example uses both: the current branch head to identify present repository state, and the earlier commit because that commit captures the actual stale-contract correction event.

---

## What the repository shows

### 1. Parallelism was constrained by explicit ownership

The repository-local `AGENTS.md` does not merely tell agents to "be careful." It defines ownership boundaries.

Examples from the observed contract include:

- W01 owns shared navigation and shell surfaces.
- W12 owns unrelated shared CSS.
- writers must not edit another writer's fixtures;
- writers must not opportunistically repair another writer's page;
- route wiring gaps are reported to integration rather than solved by silently taking another writer's scope.

The contract also states that writer branches are isolated work areas and that writers do not merge other writers, move the integration branch, deploy, or modify a separate Talibon repository.

### Forge lesson

Parallel agent work becomes useful only when write authority is narrower than repository visibility.

A writer may need to understand neighboring surfaces, but understanding a dependency does not automatically grant ownership of that dependency.

This is the practical meaning of bounded authority.

---

## 2. Commit speed and commit discipline were both required

The same `AGENTS.md` explicitly says to commit aggressively while prohibiting meaningless commits such as empty, whitespace-only, placeholder, or commit-count padding changes.

It also prohibits force pushes and requires a remote fetch before publishing a batch when unexpected movement would invalidate the writer's assumptions.

### Forge lesson

"Commit aggressively" is not equivalent to "commit carelessly."

Forge wants frequent recoverable states, but those states must remain semantically meaningful.

Fast history is useful only when the history can still explain the build.

---

## 3. The integration branch had different authority from `main`

During extraction, `main` remained at:

`f9538306f88ba42719edfdb3951d65412187b0b0`

while `KIRCH-TALIBON-SALES-V1` had advanced independently to:

`fdb7f5a272bad3c0f3efc352951a9746c544012a`

That separation is significant.

Writer and integration work could move forward without silently redefining stable/default-branch authority.

### Forge lesson

A branch name is not enough. Forge records both branch and exact SHA because a named branch is a moving reference while the SHA identifies the actual state being discussed.

---

## 4. A red test was treated as a classification problem, not an automatic production-code defect

The historically relevant commit `42c249c50e4df33a2fe9323514c95821afc08fa6` modified navigation contract tests.

Its diff shows that older tests expected navigation details to remain inline in older modules. The current architecture had decomposed navigation authority across dedicated modules including:

- `portalNavigation.ts`
- `navigationAccess.ts`
- `navigationDestinations.ts`
- `navigationRoutePlan.ts`

The corrected `CurrentPortalNavigationTest` checks the architecture that actually became authoritative:

- permission visibility is delegated through `isPortalDestinationVisible(...)`;
- permission lookup lives in `navigationAccess.ts` using `permissions[destination.permission]`;
- route authority is inspected from `navigationRoutePlan.ts`;
- the destination registry distinguishes wired from `integration_pending` entries;
- Audit & Security remains absent from visible destination authority;
- role-name checks are rejected from the active frontend navigation contract.

The test also separately verifies that hidden backend routes such as audit and MFA routes remain registered and that selected internal routes retain authentication, active-account, and MFA-assurance middleware.

### Why this matters

A simplistic "red means fix production" workflow could have pushed the implementation backwards just to satisfy obsolete source-shape expectations.

Instead, the failure was classified as a stale contract expectation and the tests were aligned with the accepted architecture.

### Forge lesson

A failing test is evidence that an expectation and implementation disagree.

It does **not** by itself tell the Maintainer which side is wrong.

Before editing production code, classify the failure:

- stale test;
- implementation defect;
- integration defect;
- environment defect;
- authority drift;
- other known Forge failure class.

---

## 5. Hidden presentation did not mean removed security behavior

The observed repository contract deliberately removes Audit & Security from visible primary navigation while explicitly forbidding weakening underlying authentication, authorization, sessions, CSRF, policies, audit logging, private file controls, or related security behavior.

The current navigation test reinforces that separation by checking both:

- absence from visible navigation authority; and
- continued registration of hidden backend audit/MFA routes and security middleware.

### Forge lesson

Presentation authority and runtime security authority are separate concerns.

Removing a visible navigation item is not evidence that the underlying behavior should be removed.

This is exactly why Forge asks the Maintainer to identify domain authority and invariants before making broad "cleanup" changes.

---

## Case-study conclusion

Talibon demonstrates several Forge principles operating together:

1. bounded writer ownership enables parallelism;
2. exact SHA anchoring prevents branch-name ambiguity;
3. integration authority is separate from stable authority;
4. tests are interpreted, not blindly obeyed;
5. hidden product surfaces can coexist with preserved backend invariants;
6. writers build candidates and stop instead of turning local implementation authority into general repository authority.

The value is not any single rule. The value is that the rules compose into a workflow where aggressive parallel development can still remain reconstructable and reviewable.

## Traceable evidence

- `https://github.com/Kirch-Nairu/Talibon-Sales-Prototype/tree/KIRCH-TALIBON-SALES-V1`
- `https://github.com/Kirch-Nairu/Talibon-Sales-Prototype/blob/KIRCH-TALIBON-SALES-V1/AGENTS.md`
- `https://github.com/Kirch-Nairu/Talibon-Sales-Prototype/blob/KIRCH-TALIBON-SALES-V1/tests/Feature/CurrentPortalNavigationTest.php`
- `https://github.com/Kirch-Nairu/Talibon-Sales-Prototype/commit/42c249c50e4df33a2fe9323514c95821afc08fa6`
