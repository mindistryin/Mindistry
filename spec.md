# BoardBoss

## Current State
Full student productivity app with dashboard, planner, timetable generator, materials, storage, AI research, grades, and admin panel. Uses Internet Identity for auth and authorization component for role-based access control.

**Bug:** New users who log in for the first time fail at the "What's your name?" setup step with "Failed to save profile." The root cause is that `saveCallerUserProfile` and `getCallerUserProfile` check `AccessControl.hasPermission(..., #user)`, which calls `getUserRole`, which calls `Runtime.trap("User is not registered")` for callers who have never been registered. New Internet Identity users are never auto-registered, so they can never save their profile.

## Requested Changes (Diff)

### Add
- Auto-registration logic: any non-anonymous caller who calls `saveCallerUserProfile` or `getCallerUserProfile` (or any other user-facing endpoint) should be automatically registered as a `#user` role (or `#admin` if no admin has been assigned yet). This eliminates the chicken-and-egg problem where users must be registered before they can register themselves.

### Modify
- `saveCallerUserProfile`: remove the `hasPermission` guard; replace with an `isAnonymous` check and auto-register the caller before saving.
- `getCallerUserProfile`: remove the `hasPermission` guard; replace with an `isAnonymous` check (auto-register so subsequent calls also work).
- All other user data endpoints (createSubject, getTasks, etc.): keep existing guards but also auto-register before the permission check, so that once the profile is saved, users can access all features without an additional registration step.

### Remove
- Nothing removed.

## Implementation Plan
1. Add a private `ensureRegistered(caller)` helper that registers non-anonymous callers as `#user` (or `#admin` if first) if they don't already have a role.
2. Call `ensureRegistered` at the start of every `public shared` and `public query` function that a user initiates (profile, subjects, tasks, materials, files).
3. Keep all existing data types, storage, and functionality identical.
