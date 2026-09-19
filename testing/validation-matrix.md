# Validation Matrix

Risk classes are decision aids, not mathematical guarantees.

| Risk | Typical change | Normal minimum evidence |
|---|---|---|
| RISK-0 | documentation/non-behavioral | link/structure/schema checks relevant to changed artifacts |
| RISK-1 | isolated low-risk implementation | static/lint + focused unit/build as applicable |
| RISK-2 | shared behavior/application workflow | unit + integration/system + build; runtime when behavior is user-visible |
| RISK-3 | auth/data/integration/infrastructure | focused lower gates + integration/system + runtime; deployed evidence when environment-sensitive |
| RISK-4 | destructive/production/security-critical | explicit human approval, recovery plan, strongest applicable automated/runtime/deployed gates, independent acceptance |

A change can be raised to a higher class due to blast radius, irreversibility, uncertain environment, security sensitivity, or weak rollback.

The handoff should name the selected class and any omitted expected gate with rationale.
