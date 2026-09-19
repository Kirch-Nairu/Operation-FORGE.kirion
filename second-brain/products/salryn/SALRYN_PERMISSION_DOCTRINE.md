# Permission Doctrine

Backend mutations require permission guards.

No UI action should imply authority unless the backend enforces that authority.

## Forbidden

- UI-only restrictions for serious actions
- backend mutation without role/permission check
- cashier access to admin/manager-only mutation paths
- hidden admin endpoints

## Required pattern

1. Define permission.
2. Enforce permission in backend.
3. Reflect permission in UI.
4. Test allowed and denied cases.

UI is convenience. Backend is authority.
