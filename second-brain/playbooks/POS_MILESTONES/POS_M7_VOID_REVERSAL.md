# POS M7 — Void Sale and Stock Reversal

## What

Implement completed-sale voiding with reason, permission guard, stock reversal movement, immutable original receipt snapshot, and explicit void status.

## Why

Stores need a safe way to reverse mistakes without deleting sales or corrupting inventory history.

## How

- Inspect sale lifecycle.
- Inspect inventory movement service.
- Inspect permissions.
- Add void domain behavior.
- Add backend endpoint.
- Add UI only after backend authority exists.
- Add CoreSmoke target.

## In scope

- completed sale void
- reason required
- permission required
- stock reversal movement
- void status visible
- double void rejected
- original receipt snapshot preserved

## Out of scope

- refunds
- partial returns
- BIR/RMO/eSales production behavior
- cloud sync
- receipt redesign

## Prove

- sale decreases stock
- void requires permission
- reason required
- void marks sale
- reversal movement exists
- double void rejected
- snapshot unchanged
- no payment duplication
