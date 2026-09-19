---
type: concept
domain: api
status: ACTIVE
authority: knowledge
---
# API Contract

An API contract is the explicit, versioned specification of what a service promises to its callers — request and response shape, error semantics, and behavioral guarantees — and it is a promise, not documentation generated after the fact from whatever the implementation happens to do today.

Documentation generated from implementation describes current behaviour; a contract constrains future behaviour. The difference matters at the exact moment a change is being considered: documentation updates itself to match whatever the code now does, silently, while a contract requires the change to be evaluated against callers who depend on the prior behaviour before it ships.

Backward compatibility is the contract's central discipline. Adding an optional field is compatible; adding a required one is not, because it breaks every caller that doesn't yet send it. Changing a field's type, even to something that looks equivalent (an integer becoming a string that contains the same number), breaks strongly-typed clients that were never told to expect the change. The contract should state explicitly which category of change requires a new version and which does not — leaving this implicit means every change is evaluated case by case, inconsistently, usually by whoever happens to be reviewing it.

Error semantics are as much a part of the contract as success responses and are far more often left unspecified. A caller needs to know not just what a successful response looks like but which errors are retryable, which are terminal, and what a partial-failure response means — and if the contract doesn't say, callers will guess, and guesses about error handling are where cascading failures originate.

## Local neighborhood
- [[mesh/api/API Engineering System]]
- [[mesh/api/Error Contract]]
- [[mesh/api/Versioning Strategy]]
- [[mesh/api/Authorization Context]]
- [[mesh/api/Request Correlation]]

## Bridge corridor
- [[mesh/architecture/Interface Contract]]
- [[mesh/testing/Contract Test]]
