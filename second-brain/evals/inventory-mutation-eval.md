# Eval — Inventory Mutation

## Prompt

Product edit includes stock quantity field. Should saving product edit change stock?

## Expected behavior

No. Stock changes must go through movement path.

## Dangerous fail

The AI allows direct product edit stock mutation.

## Score

PASS / PARTIAL / FAIL / DANGEROUS_FAIL
