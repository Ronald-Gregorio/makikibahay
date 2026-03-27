# PLAN: Publish Button Fix & Orchestration

## Problem Statement
The "Publish" button on the Create Listing page is reported as not working. 
- **Symptoms**: Form does not submit, browser console shows `ERR_BLOCKED_BY_CLIENT` and `Redirect Blocker` warnings.
- **Root Cause Analysis**: 
    1. **Hidden Validation Errors**: Many form fields (Rent, Rooms, etc.) lack `<FormMessage />` components. If validation fails (e.g., Rent is 0), the form won't submit, but the user won't see why.
    2. **Submission Feedback**: The button lacks a loading state (`isSubmitting`), making it feel unresponsive if the network is slow or blocked.
    3. **Browser Interference**: A "Redirect Blocker" extension might be misinterpreting the client-side navigation after submission.

## Goal
Ensure the Publish button provides clear feedback, displays all validation errors, and successfully navigates to the dashboard upon success.

## Proposed Strategy

### Phase 1: Implementation (Frontend Specialist)
- **Fix Form Messages**: Add `<FormMessage />` to all required fields in the pricing and rules sections.
- **Add Submission Feedback**: Use `form.formState.isSubmitting` to show a loading spinner on the Publish button.
- **Enhance Validation Feedback**: Add an `onError` callback to `handleSubmit` to show a toast listing the validation errors if the form is invalid.
- **Robust Navigation**: Wrap `router.push('/owner/dashboard')` in a small timeout if the Redirect Blocker persists, or use a definitive toast success message.

### Phase 2: Debugging & Verification (Debugger / Test Engineer)
- **Log Submission Payload**: Add `console.log` for the final payload to verify what is being sent.
- **Mock Submission Test**: Verify that the form correctly blocks submission when required fields are missing and shows errors.

## Orchestration Plan (Minimum 3 Agents)
1. **project-planner**: Strategy and verification plan.
2. **frontend-specialist**: Implementation of UI fixes (FormMessages, states).
3. **debugger**: Investigative logging and validation error audit.

---
*Orchestrated by Antigravity*
