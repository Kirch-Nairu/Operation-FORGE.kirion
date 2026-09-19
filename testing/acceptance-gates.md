# Acceptance Gates by Risk

These are default floors; the Maintainer may strengthen them.

- **RISK-0:** structural/link/schema checks relevant to changed artifacts; review for false authority/evidence claims.
- **RISK-1:** focused automated checks appropriate to the implementation; build when compilation/packaging applies.
- **RISK-2:** unit plus integration/system evidence for shared behavior, build, and runtime/user-flow evidence when behavior is externally observable.
- **RISK-3:** explicit integration/data/auth/infrastructure scenarios, runtime evidence, rollback/recovery considerations, and independent acceptance.
- **RISK-4:** explicit human approval for destructive/production action, recovery evidence, strongest applicable gates, and post-action observation.

Missing required evidence yields `NOT ACCEPTED` or `REWORK`, not an invented pass.
