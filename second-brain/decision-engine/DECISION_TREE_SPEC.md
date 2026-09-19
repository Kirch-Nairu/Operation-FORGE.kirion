---
id: SPEC-TREE-0001
type: specification
status: ACTIVE
authority: doctrine
tags: [decision-tree, machine-readable]
graph_nonvisual_relations:
  - "cognitive-os/04_RELATIONSHIP_VOCABULARY"
---
# Decision Tree Specification

Decision trees must remain understandable to humans and traversable by future automation without maintaining several divergent copies.

## Canonical form

Markdown is canonical. A decision tree note contains:
- question / trigger
- decision nodes
- conditions
- evidence requirements
- terminal states
- optional Mermaid rendering

## Node semantics

```text
QUESTION     asks for missing information
CHECK        evaluates evidence/condition
DECISION     compares options
ACTION       performs a bounded operation
GATE         requires proof or approval
TERMINAL     ends in a declared state
```

## Terminal vocabulary

`PROCEED`, `STOP`, `ESCALATE`, `RESEARCH`, `REPAIR`, `ROLLBACK`, `ASK_HUMAN`.

## Machine-readable block

Where automation is justified, embed one fenced YAML block in the same canonical note rather than creating a second independent file.

Example:

```yaml
tree:
  id: TREE-EXAMPLE
  start: assess-impact
  nodes:
    assess-impact:
      kind: CHECK
      condition: material-impact
      yes: require-human
      no: proceed
    require-human:
      kind: TERMINAL
      state: ASK_HUMAN
    proceed:
      kind: TERMINAL
      state: PROCEED
```

Automation must preserve human semantics and stop when a branch has insufficient evidence.

Related: [[decision-engine/DECISION_ENGINE]] · [[decision-engine/WHAT_IF_ENGINE]] · 04_RELATIONSHIP_VOCABULARY

## Graph neighborhood

- [[cognitive-os/hubs/DECISION_GOVERNANCE_SECTOR]]
- [[decision-engine/DECISION_ENGINE]]
- [[decision-engine/WHAT_IF_ENGINE]]
