# Failure Taxonomy

A red test does not automatically mean an implementation defect.

| Class | Meaning | Example | Normal owner / response |
|---|---|---|---|
| A | STALE EXPECTATION / TEST | accepted behavior changed but test asserts superseded contract | test owner/Maintainer; prove current contract before editing test |
| B | IMPLEMENTATION DEFECT | candidate violates accepted behavior | writer; fix owned production code and revalidate |
| C | INTEGRATION DEFECT | individually valid surfaces fail when combined | Integration Writer; resolve within integration authority |
| D | ENVIRONMENT / TOOLING DEFECT | runner, SDK, filesystem, clock, browser, tool unavailable/broken | environment owner; preserve logs, avoid product change without evidence |
| E | AUTHORITY DRIFT | branch/SHA/remote no longer matches handoff | Maintainer; writer stops at boundary |
| F | EXTERNAL DEPENDENCY FAILURE | vendor/API/service unavailable or changed | dependency owner/Maintainer; capture external evidence and retry policy |
| G | ARCHITECTURE CONFLICT | requested implementation contradicts accepted architecture | Maintainer; do not redesign silently |
| H | DATA / SCHEMA INCOMPATIBILITY | schema/data state incompatible with candidate | data/schema owner; classify migration/rollback risk |
| I | ACCEPTANCE EVIDENCE MISSING | behavior may work but required evidence was not produced | writer/acceptance; run evidence gate or mark unverified |
| J | CI / AUTOMATION DEFECT | workflow/harness itself is wrong | CI/test owner; prove automation defect before weakening product |
| K | CONFIGURATION DEFECT | wrong/missing config changes behavior | config owner; verify environment and expected config |
| L | DEPLOYMENT DEFECT | artifact is valid but deployment/packaging/release failed | release/deployment owner |
| M | SECURITY DEFECT | security property violated or control weakened | security/Maintainer; contain and escalate according to severity |
| N | UNKNOWN / UNCLASSIFIED | evidence insufficient | current role gathers evidence; avoid speculative production edits |

## Evidence required for classification

At minimum capture the failing command/scenario, exact candidate, environment details that matter, failure output/artifact, and why the chosen class fits better than alternatives.

## Escalation

Escalate to the Maintainer when classification changes architecture, authority, acceptance criteria, data migration policy, destructive action, security posture, or another writer's ownership.

Production code should normally change for B and some authorized C/K/L/M cases. It should not normally change merely because A/D/E/F/I/J/N is red.
