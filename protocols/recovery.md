# Recovery Protocol

Recovery begins from the last trusted authority, not from panic.

## Procedure

1. stop uncontrolled mutation;
2. identify observable current state;
3. identify the last trusted branch/SHA;
4. preserve relevant failure evidence;
5. classify the failure;
6. determine affected scope and ownership;
7. choose the least destructive safe recovery path;
8. validate recovered state;
9. update durable memory if the incident changes accepted understanding.

## Possible recovery actions

- continue from a valid candidate;
- create a clean replacement branch;
- revert an isolated change;
- rebuild from known authority;
- quarantine polluted history;
- repeat validation in a clean sandbox;
- issue a new handoff with corrected authority.

Do not erase evidence solely to make history look cleaner.