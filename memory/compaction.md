# Memory Compaction

Compaction reduces the amount of history required to understand current state without destroying provenance.

## Preferred method

1. preserve the original historical record;
2. extract current durable facts into the active SSOT/architecture/decision records;
3. add explicit references to the source records;
4. mark superseded material;
5. move cold material out of default startup paths;
6. verify a fresh agent can reconstruct current state from active records alone.

Do not repeatedly load entire engineering logs into new sessions.

Compaction must not:

- erase failed attempts that are still relevant to recovery;
- turn reported claims into observed facts;
- discard the SHA/ref that identifies an accepted state;
- silently merge incompatible decisions.

Compaction is successful when current work needs less context while historical provenance remains retrievable.
