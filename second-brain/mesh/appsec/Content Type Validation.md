---
type: control
domain: appsec
status: ACTIVE
authority: knowledge
---
# Content Type Validation

Content-type validation does not trust filename extension or client-declared MIME alone. The application validates allowed formats, parser behavior, decompression/expansion risk, and whether content will later be executed or rendered.

## Local neighborhood
- [[mesh/appsec/Application Security Control System]]
- [[mesh/appsec/File Upload Policy]]
- [[mesh/appsec/Upload Storage Isolation]]
- [[mesh/appsec/Request Size Limit]]
- [[mesh/appsec/Information Disclosure Control]]

## Bridge corridor
- [[mesh/vulnerability/Unsafe File Upload]]
- [[mesh/quality/Boundary Validation]]
