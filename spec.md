# BoardBoss

## Current State
The app uses Internet Identity for login and `_initializeAccessControlWithSecret` (via backend mixin) to register users + assign roles. The first caller with a matching admin token becomes admin; others become regular users. The `_initializeAccessControlWithSecret` method exists on the backend but is NOT in `backend.d.ts`.

Currently the app shows "Access Denied" on the Admin page for all users because:
1. No admin has ever been assigned (no one has called `_initializeAccessControlWithSecret` with the correct token)
2. The app owner has no admin setup URL

## Requested Changes (Diff)

### Add
- Auto-admin bootstrap: when any authenticated user calls `_initializeAccessControlWithSecret` and no admin has been assigned yet, the first user to do so (with ANY token, since the backend assigns admin if `not adminAssigned` AND token matches) gets admin. Since we cannot change the backend, we need a workaround.
- Specifically: call `_initializeAccessControlWithSecret` via the raw actor (bypassing TypeScript types) passing an empty string `""` as the token. On first call when `adminAssigned == false`, the condition `not state.adminAssigned and userProvidedToken == adminToken` may not match, so the user gets assigned as `#user`. HOWEVER, we can use `assignCallerUserRole` if we are already admin.
- Alternative approach (correct one): Add a "Claim Admin" button in the Admin access-denied view that calls `_initializeAccessControlWithSecret` using the URL query param `adminToken` if present, OR shows a text input where the user can paste a token. This way if Caffeine ever provides the token URL, it works. If no token is available, show instructions.
- Actually the BEST approach given the constraint: modify the frontend to call `_initializeAccessControlWithSecret` with an empty string on every new user registration (SetupProfilePage). Looking at the backend logic: `if (not state.adminAssigned and userProvidedToken == adminToken)` - this only makes admin if the token matches. Since we don't know the adminToken, calling with `""` will make the user a `#user` (not admin) unless adminToken happens to be `""`.

**The actual correct fix**: Add a special admin claim flow that:
1. In `SetupProfilePage` (first-time login flow), call `_initializeAccessControlWithSecret("")` first before `saveCallerUserProfile`. This registers the user. If the CAFFEINE_ADMIN_TOKEN happens to equal `""`, they get admin. Otherwise they get user role.
2. More importantly: in the Admin "Access Denied" view, add a "Claim Admin Access" section with a token input field AND add URL query param support (`?adminToken=xxx`). When submitted, calls `_initializeAccessControlWithSecret(token)`.
3. Since the Caffeine admin token IS accessible via the admin setup URL that Caffeine generates, the user can use that URL to become admin OR paste the token in the input.

**For users who already registered** (have `#user` role but not `#admin`): they can't re-call `_initializeAccessControlWithSecret` because the backend checks `case (?_) {}` (already registered, skip). So the token input won't help them after first registration.

**Real solution**: We need to call `_initializeAccessControlWithSecret` on FIRST registration (in SetupProfilePage), before `saveCallerUserProfile`. This way the very first user to complete setup gets admin if they provide the right token, OR we try the URL param.

BUT since `saveCallerUserProfile` fails if the user isn't registered, the current flow ALREADY calls `_initializeAccessControlWithSecret` somewhere -- let's check `useActor`.

### Modify
- `SetupProfilePage.tsx`: Before saving profile, call `_initializeAccessControlWithSecret` with the `adminToken` from URL query param `?adminToken=...`. If no URL param, use `""`. This ensures the user is registered AND if they used the admin URL they become admin.
- `AdminPage.tsx` `AccessDeniedView`: Add a "Claim Admin" card with token input + button that calls `_initializeAccessControlWithSecret(token)` via the raw actor. Also auto-reads `?adminToken` from the URL and pre-fills it.
- `useActor.ts` and related: cannot be edited directly. Instead, call the method via the raw actor object using type casting: `(actor as any)._initializeAccessControlWithSecret(token)`.

### Remove
- Nothing removed.

## Implementation Plan
1. In `SetupProfilePage.tsx`, add a call to `(actor as any)._initializeAccessControlWithSecret(adminToken)` where `adminToken = new URLSearchParams(window.location.search).get('adminToken') ?? ''`. Call this BEFORE `saveCallerUserProfile`. Wrap in try/catch (it may trap if already registered).
2. In `AdminPage.tsx` `AccessDeniedView`, add a "Claim Admin Access" card below the Principal ID card. It should:
   - Auto-read `?adminToken` from URL and pre-fill a text input
   - Have a "Claim Admin" button that calls `(actor as any)._initializeAccessControlWithSecret(token)`
   - On success, invalidate the `isAdmin` query and show success toast
   - On error, show the error message
3. Import `useActor` in `AdminPage.tsx` AccessDeniedView (it's already used in RoleSection).
