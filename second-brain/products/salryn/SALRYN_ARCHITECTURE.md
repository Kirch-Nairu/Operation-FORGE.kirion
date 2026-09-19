# Salryn Architecture

Salryn Standard is the parent source for Salryn-derived projects.

## Usually reusable

- local app shell
- local API host
- WebView structure
- SQLite setup
- migration pattern
- auth/session
- permission guard
- audit log
- user management
- business identity
- receipt/snapshot pattern
- report/export pattern
- CoreSmoke testing style
- offline-first design

## Maybe reusable

- product catalog
- inventory movement
- POS receipt flow
- printer settings
- backup/restore
- role surfaces

## Not reusable unless project requires it

- checkout lifecycle
- stock deduction
- POS sale lifecycle
- BIR/RMO/eSales lanes
- cashier-specific POS flow

## Adaptation rule

Never copy blindly.

Use:

```text
Study → Extract pattern → Adapt only what applies → Prove with gates
```
