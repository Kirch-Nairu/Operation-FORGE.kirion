# Environment Fingerprint

Capture only environment attributes that materially affect reproducibility.

Typical fields:

- OS/distribution and architecture;
- runtime/compiler/SDK versions;
- package manager versions;
- dependency lockfile/hash/state;
- database/service versions when local;
- browser/device/emulator versions;
- relevant non-secret configuration profile;
- container/image identifiers;
- timezone/locale when behavior depends on them.

Do not record secret values. Prefer commands that can be rerun by a successor.

A fingerprint is evidence context, not proof that two environments are identical.
