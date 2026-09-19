# Web Lookup Policy

Use web lookup when:

- API/library behavior may have changed
- legal, tax, BIR, RMO, eSales, invoice, receipt, or compliance rules are involved
- installer behavior depends on current Windows tooling
- package/library versions matter
- security-relevant behavior is discussed
- the AI is guessing
- a current tool behavior affects instructions

Prefer official docs and primary sources.

## Do not use web when

- existing repo code is the authority
- the answer is already proven by tests
- task is a local refactor under existing patterns
- user explicitly says no web

## Reporting

When web was used, cite the source in the final answer or handoff.
