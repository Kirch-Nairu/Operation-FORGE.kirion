---
id: BRAIN-OVERRIDE-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [governance/override, decisions]
---
# Override Protocol

An override is an explicit, recorded decision to depart from an applicable guardrail, approved architecture, safety boundary, or doctrine rule.

## Explicit override required when

- changing a protected authority boundary
- bypassing a required release/recovery gate
- knowingly accepting a material security or data-integrity risk
- making a difficult-to-reverse architecture change contrary to an approved decision
- altering a protected branch/ref or production-critical path outside its approved lane

## Override record must contain

- rule or decision being overridden
- reason
- scope
- expected benefit
- risk introduced
- duration / review trigger
- rollback or reversal path if applicable
- human approver

## Repeated override rule

Repeated overrides of the same rule create a doctrine-review signal. The outcome may be:

- the rule remains correct and behavior must change
- the rule is too rigid and should be revised
- project circumstances justify a local exception

## Related

- [[decision-engine/DECISION_ENGINE]]
- [[risk/RISK_SYSTEM]]
- [[cognitive-os/08_ANTI_BUREAUCRACY]]

## Graph neighborhood

- [[decision-engine/DECISION_ENGINE]]
- [[risk/RISK_SYSTEM]]
- [[cognitive-os/08_ANTI_BUREAUCRACY]]
- [[cognitive-os/README]]
