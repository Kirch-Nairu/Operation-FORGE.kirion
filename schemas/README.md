# Forge Schemas

## What is this?

JSON Schemas provide machine-readable structural contracts for common Forge artifacts. They validate shape, not engineering judgment or authority.

## When do I load it?

Load a specific schema when generating or validating its corresponding machine-readable artifact.

## Canonical schemas

- `nest.schema.json`
- `writer-handoff.schema.json`
- `writer-report.schema.json`
- `sandbox-capsule.schema.json`
- `evidence-manifest.schema.json`
- `active-work.schema.json`

All schemas declare version `1` contracts and use JSON Schema 2020-12.

## Limitations

Forge's standard-library checker validates that schema files parse and contain core schema structure. Full JSON Schema instance validation is optional unless a project installs a compatible validator.
