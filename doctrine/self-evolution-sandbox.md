# Self-Evolution Sandbox

Forge may improve its own mechanics through controlled experiments, but self-modification is not self-authorization.

## Purpose

A self-evolution run may formulate hypotheses, simulate or execute bounded scenarios, modify an isolated branch, measure regressions, keep or revert mutations, and record lessons. The objective is controlled learning without allowing the subject under test to silently redefine the authority used to judge itself.

## Hard invariants

1. **Isolated mutation.** Self-evolution work occurs on an explicit experiment branch or disposable sandbox. The accepted baseline is frozen before mutation.
2. **No self-promotion.** Passing simulations, CI, verifier output, or model confidence create a candidate improvement only. They do not authorize merge, promotion, deployment, or accepted doctrine.
3. **Authority monotonicity.** Cognition, teachers, subagents, verifiers, and learned skills may not expand the capability set granted by Forge.
4. **Evaluator independence within a generation.** A mutation may not silently weaken or rewrite the evaluator, fitness model, scenario expectations, or acceptance threshold used to prove that same mutation. If the evaluator must change materially, close the generation and start a new one with the change disclosed.
5. **Pre-registered hypothesis.** Record the hypothesis and the failure/friction it is intended to address before evaluating the mutation.
6. **Regression accounting.** Compare the candidate against the frozen baseline on the relevant scenario families. Unexplained regressions block retention.
7. **Reversibility.** Every experiment mutation must be attributable to a commit/diff and safely revertible.
8. **Evidence honesty.** Simulation proves only the simulated property. Source inspection, CI, runtime behavior, deployment, and operations remain separate evidence classes.
9. **Observer notes are not authority.** Notion journals, benchmark notes, model memories, and retrospective prose may explain why a mutation exists; they cannot grant repository authority.
10. **Durable checkpoint before external wait.** When a run depends on asynchronous CI or another external system, persist exact branch/SHA/run identity before returning control. A later resume reconstructs from durable state rather than conversation memory.
11. **Child authority is a subset.** Delegated workers inherit at most the parent experiment authority and may not escape the experiment branch/scope.
12. **Main remains protected.** The experiment may prepare a promotion packet, but `main` changes require a separate authority transition outside the experiment loop.

## Generation record

A generation should record:

- baseline branch and SHA;
- experiment branch and starting SHA;
- hypothesis;
- scenario/evaluator version;
- mutation commit(s);
- before/after measurements;
- regressions;
- keep/revert decision;
- known limitations;
- promotion status.

## Fitness

Fitness is multi-dimensional rather than a single opaque score. At minimum track:

- authority integrity;
- evidence honesty;
- recovery/resumability;
- context/decision-surface efficiency;
- task correctness;
- operator coordination burden;
- latency/cost where measured.

A gain in speed does not compensate for an authority violation. Authority integrity and evidence honesty are hard constraints, not tradeable points.

## Learning boundary

A successful teacher trace or repeated pattern may produce a **skill candidate**. Skill candidates are evaluated like any other change. They are not written directly into authoritative procedure because they worked once.

## Stop conditions

Stop the generation when:

- the baseline or target branch moved unexpectedly;
- the evaluator changed without a generation boundary;
- an authority invariant is ambiguous;
- the candidate requires destructive or remote action outside granted scope;
- evidence cannot distinguish product behavior from harness/environment failure;
- the experiment would have to modify `main` to continue.

The correct outcome may be `BLOCKED`, `REVERTED`, or `INCONCLUSIVE`. Self-evolution is not required to produce a positive mutation every generation.
