# Offline-First Doctrine

Salryn daily operation must not depend on internet.

## Default architecture

- local app
- local SQLite
- local receipts/files
- local settings
- local backup

## Parked unless approved

- cloud sync
- online auth requirement
- remote database requirement
- online-only reporting
- SMS/email delivery as required workflow
- payment gateway dependency

## Rule

External services may enhance later versions, but they must not be required for core V1 operation unless the Project Constitution explicitly approves the dependency.
