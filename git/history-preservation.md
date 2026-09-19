# History Preservation

Forge preserves evidence by default.

Before discarding local or remote state:

- identify commits and refs involved;
- preserve meaningful commits with a branch/tag/ref when permitted;
- capture dirty work with a patch/capsule when a commit would be dishonest;
- record the reason for quarantine or replacement;
- verify the preservation ref before destructive cleanup.

Force push and shared-history rewriting are prohibited by default and require explicit destructive authority.

A clean-looking history is not more valuable than recoverable engineering evidence.
