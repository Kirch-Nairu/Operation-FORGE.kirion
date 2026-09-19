---
type: concept
domain: testing
status: ACTIVE
authority: knowledge
---
# Test Strategy

A test strategy is a deliberate allocation of verification effort across the levels, types, and rigor that a system's actual risk profile justifies — not a coverage percentage and not "write tests for everything."

The allocation question is the real design decision. Unit tests are cheap and fast and prove units in isolation; they cannot prove the units compose correctly. Integration tests prove composition at real cost in speed and flakiness; a suite of nothing but integration tests is slow to run and slow to diagnose when it fails. End-to-end tests prove the system as a user experiences it and are the most expensive and least specific about where a failure originates. A strategy states, for this system, which layers carry the verification weight and why — not by rule of thumb, but by where this system's actual failures have historically originated or are most plausible.

Coverage percentage measures how much code ran during tests, not how much of the system's *behaviour* is verified. A file can be 100% covered by tests that assert nothing meaningful about its correctness. The stronger question a strategy should answer is: for each consequential behaviour, is there a test that would fail if that behaviour broke? That is a different — and harder — question than "did the line execute."

A test strategy should also say what is deliberately not tested and why, because an unstated gap is indistinguishable from an oversight, while a stated one is a decision that can be revisited.

## Local neighborhood
- [[mesh/testing/Verification System]]
- [[mesh/testing/Unit Test Boundary]]
- [[mesh/testing/Integration Test Boundary]]
- [[mesh/testing/Contract Test]]
- [[mesh/testing/End to End Test]]
- [[mesh/testing/Negative Testing]]

## Bridge corridor
- [[mesh/planning/Acceptance Criteria]]
- [[mesh/quality/Testability]]
