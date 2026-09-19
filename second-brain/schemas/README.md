# Schemas

`governed-object-v1.json` defines the machine-readable common contract for V2 governed objects.

The schema intentionally validates only fields shared across object types. Type-specific semantic requirements remain in [[cognitive-os/03_GOVERNED_OBJECT_MODEL]] and the templates because forcing every object into one enormous schema would create brittle bureaucracy.

The standard-library validator in `tools/brain_health.py` does not require a JSON Schema dependency; external tooling may consume this schema directly.
