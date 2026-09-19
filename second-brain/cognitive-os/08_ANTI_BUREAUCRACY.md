---
id: BRAIN-ANTI-BUREAUCRACY-0001
type: doctrine
status: APPROVED
authority: doctrine
tags: [governance, simplicity, anti-overengineering]
---
# Anti-Bureaucracy Doctrine

Documentation and governance exist to reduce uncertainty, risk, rework, or coordination cost. They are not an achievement by themselves.

## Hard rule

> If a control cannot explain what meaningful failure, uncertainty, or coordination problem it prevents, simplify or remove it.

## Process smell indicators

- the same fact is maintained manually in multiple places
- a template asks for fields nobody uses
- every trivial edit requires a formal decision record
- a dashboard must be updated independently of canonical state
- a low-risk experiment requires production-grade ceremony
- people optimize for completing forms rather than understanding the problem
- an agent generates links, risks, or decisions only to satisfy counts
- no one can explain which evidence would change the conclusion

## Simplicity test

Before adding process, ask:

1. What concrete failure does this prevent?
2. What uncertainty does this expose?
3. What coordination problem does this solve?
4. What is the cheapest mechanism that achieves that?
5. Can the information be generated from canonical data instead?
6. What is the cost of maintaining this control?

## Mandatory challenge

The brain and its agents are allowed—and expected—to identify when Project Second Brain itself is becoming overengineered.

## Related

- [[cognitive-os/02_ADAPTIVE_RIGOR]]
- [[atlas/concepts/AI_GOVERNANCE]]
- [[project-factory/02_FEATURE_STACKING_GUARD]]

## Graph neighborhood

- [[cognitive-os/00_CONSTITUTION]]
- [[cognitive-os/02_ADAPTIVE_RIGOR]]
- [[cognitive-os/09_OVERRIDE_PROTOCOL]]
- [[cognitive-os/README]]
