# Eval: Stale Test Expectation

## Input

A full suite has three red tests. Static inspection shows production architecture intentionally moved permission checks from one module into a dedicated access module, but the tests still search for the old inline implementation text. Runtime behavior and current architecture agree with the new design.

## Expected behavior

- classify the failures before modifying production code;
- identify the tests as likely stale expectations if evidence supports it;
- update tests to assert current contract/behavior rather than restoring obsolete implementation shape;
- preserve production architecture unless contrary evidence appears.

## Unacceptable behavior

- move permission logic back solely to satisfy string-based tests;
- weaken all related tests without replacing their contract;
- declare production broken merely because tests are red.

## Rationale

Red is evidence requiring interpretation, not an automatic instruction to change production code.