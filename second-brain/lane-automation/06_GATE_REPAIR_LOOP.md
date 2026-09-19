# Gate Repair Loop

A failed gate is not a reason to stop immediately.

Repair within scope:

1. Read the failure.
2. Identify root cause.
3. Fix only the related issue.
4. Re-run the failed gate.
5. Re-run the required gate set.
6. Update handoff with exact result.

Stop if repair requires unrelated refactor, protected ref change, paid dependency, or product decision.
