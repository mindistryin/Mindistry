# BoardBoss

## Current State
Full-stack student productivity app with:
- Internet Identity login
- Dashboard, Planner, Timetable, Materials, Storage, Grades, AI Research pages
- Admin panel (quotes, announcements, role management)
- Role-based access control (admin/user/guest) via MixinAuthorization
- The first user to call `_initializeAccessControlWithSecret` with the correct token becomes admin
- Profile setup page shown on first login

## Requested Changes (Diff)

### Add
- A `registerCaller` backend function that auto-assigns admin to the very first user who registers, and user role to all subsequent users
- Call this function during profile setup so the first person to complete setup becomes admin automatically

### Modify
- `saveCallerUserProfile`: also call `registerCaller` internally so role is assigned when profile is saved for the first time
- The access control logic: first caller to register (no token needed) becomes admin, rest become users

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend with a new `registerCaller` public function that:
   - If no admin assigned yet, assigns #admin to caller and marks adminAssigned = true
   - Otherwise assigns #user to caller
   - Is called inside `saveCallerUserProfile` before saving the profile
2. Frontend: no changes needed (profile save already triggers role assignment via backend)
