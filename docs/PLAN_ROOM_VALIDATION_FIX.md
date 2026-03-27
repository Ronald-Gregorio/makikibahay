# PLAN: Room Validation Fix & Cleanup

## Problem Statement
The Create Listing page fails validation silently for the `rooms` field.
- **Root Cause**: The `defaultValues` for `rooms` initializes with one empty room object `[{ type: '', ... }]`. 
- **Validation Failure**: The `roomSchema` requires `type`, `price`, and `inclusions`. Since these are empty and the UI (Unified Form) no longer renders individual room fields, the user cannot fill them, and the form cannot submit.
- **Log Confirmation**: `Publisherror.txt` shows `{rooms: Array(1)}` in the validation errors.

## Goal
Remove the invalid default initialization and clean up unused field array logic to ensure successful form submission.

## Proposed Strategy

### Phase 1: Implementation (Frontend Specialist)
- **Modify CreateListingPage**:
    - Change `rooms` default value to `[]`.
    - Remove unused `useFieldArray` and related imports (`PlusCircle`, `Trash2`).
- **Modify EditListingPage**:
    - Ensure `rooms` default is `[]`.
    - Remove unused `useFieldArray` and related imports.
- **Audit Schema**: Ensure `rooms` remains optional in `listingFormSchema`.

### Phase 2: Verification (Debugger / Test Engineer)
- **Log Check**: Verify that `onSubmit` is reached when the form is valid.
- **Lint & Typecheck**: Ensure no regressions.

## Orchestration Plan (Minimum 3 Agents)
1. **project-planner**: Strategy and verification plan.
2. **frontend-specialist**: Implementation of code cleanup and default value adjustment.
3. **debugger**: Investigative verification of the fix using the provided logs as reference.

---
*Orchestrated by Antigravity*
