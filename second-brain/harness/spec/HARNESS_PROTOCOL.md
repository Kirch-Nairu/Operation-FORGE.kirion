# Harness Protocol V1

## Purpose

The runtime converts Project Second Brain topology into deterministic machine instructions for an engineering agent. It does not replace engineering judgment; it constrains where judgment begins, what evidence is required, and which claims are allowed.

## Determinism boundary

For a fixed harness source tree and normalized task:

- explicit task types override classifier heuristics;
- heuristic classification is deterministic and fails closed on configured ambiguity;
- risk scoring uses versioned dimensions, weights, floors, signal minimums, and critical triggers;
- routing is the union of always-on, task-type, signal, and rigor-mode lanes;
- lane IDs resolve through the versioned 23-lane registry;
- context expansion is breadth-first, stable-sorted, depth-bounded, document-bounded, and byte-bounded;
- each included source is SHA-256 hashed;
- unresolved optional graph expansion is reported, never silently promoted to evidence;
- missing required route seeds block the context pack.

The model may reason over the resulting pack, but it cannot retroactively change which sources the runtime claims were consulted.

## Fail-closed conditions

V1 blocks on malformed task input, unknown/ambiguous task type, unknown lane IDs, missing mandatory control/lane notes, missing primary journeys for build work, and any applicable BLOCK gate failure at the evaluated lifecycle stage.

## Lifecycle stages

`BOOTSTRAP → PRE_DESIGN → PRE_IMPLEMENTATION → PRE_DELIVERY → POST_DEPLOY → POST_VERIFY`

A gate evaluation can stop at a stage. Future-stage failures must not prevent earlier work from starting, but they remain obligations that must be satisfied before the later claim is made.

## Evidence model

Evidence capabilities are intentionally non-linear. `DURABLE` does not imply `TESTED`, and `TESTED` does not imply `OBSERVED`.

A claim has `status`, explicit `levels`, and optional source/detail/SHA/timestamp metadata. Gate rules require exact capabilities rather than a vague confidence score.

## Primary journey acceptance rule

A build-oriented task must enumerate stable primary journey IDs. Before PRE_DELIVERY can pass, every journey must have `journey.<journey-id>.runtime` with PASS and `OBSERVED` evidence. Automated tests may also be attached, but `TESTED` is not accepted as a substitute for `OBSERVED` for this gate.

This is deliberate: an integration path can be absent from a test suite while the suite remains green.

## Context compilation

Seed sources are Central Brain, Adaptive Rigor, Authority and Truth, and every routed semantic lane. The compiler follows resolvable Obsidian wikilinks to a depth selected by rigor mode. It indexes authored Markdown locally and resolves exact paths first, then unique stems. Ambiguous stems do not resolve.

Generated/report/archive/template directories are excluded from context expansion by default.

## Agent adapters

CLI output is stable JSON plus Markdown. Future ChatGPT/MCP adapters should call the same runtime functions rather than reimplement classification or routing in prompts.

A remote adapter must pin or report the exact Second Brain revision used. It must not claim a context pack was loaded unless the listed source hashes were actually read.

## Doctrine mutation

Runtime failures can justify learning candidates, but V1 does not auto-write permanent doctrine. Changes to the Second Brain remain reviewed source changes. Automation may propose; it may not silently rewrite the governing brain.

## Graph anchor

- [[cognitive-os/hubs/OPERATING_SURFACES_SECTOR]]
