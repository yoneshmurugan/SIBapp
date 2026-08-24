# Fix User Deletion Logic (Anonymization Strategy)

Based on your feedback, we want to **preserve the financial and activity statistics** of the chapter (so the revenue doesn't drop), but we want to completely **destroy the user's personal data and access**.

We will achieve this using a "Scrub and Soft-Delete" strategy.

## Proposed Changes

### Backend

#### [MODIFY] `src/pages/admin/AdminRoute.mjs`
Instead of forcefully deleting all the user's slips or leaving orphaned data that crashes the app, we will do the following when a user is deleted:

1. **Delete their `Profile` document:** This instantly removes all their personal details (company name, address, services, photos) from the database and public directory.
2. **Delete their `Membership` document:** This removes them from all slip dropdowns and chapter member counts.
3. **Wipe their `Firebase Auth`:** Their login access is permanently destroyed.
4. **Anonymize their `User` document:** Instead of deleting their core User record, we will permanently overwrite it:
   - `username` becomes `"Deleted User"`
   - `email` becomes `"deleted_[timestamp]@sib.com"`
   - `phone_number` becomes `"0000000000"`
   - `status` becomes `false`

**Why this works perfectly:**
Because the `User` document still exists but is renamed to "Deleted User", all of their past TYFTBs, 121s, and Referrals will still function correctly in the backend. When other members look at their slip history, the slip will simply say it was exchanged with "Deleted User". This preserves the total chapter revenue without keeping any trace of the actual person!

### Frontend

#### [MODIFY] `src/Admin/Components/PresidentRole.jsx`
Update the Delete Confirmation Modal to be explicit about what is happening:

> [!IMPORTANT]
> **"You are about to permanently delete [User]. Their login access, profile, and personal details will be destroyed. To preserve chapter statistics, their past slips (TYFTBs, Referrals) will be kept but anonymized as 'Deleted User'. This action cannot be undone. Are you sure?"**

## Verification Plan

### Manual Verification
1. I will log in as an Admin and delete a test user who has existing TYFTB slips.
2. I will verify that their TYFTB slips still exist in the database, but now show "Deleted User" as the partner.
3. I will verify they disappear from the Members directory and slip dropdowns because their Profile/Membership is gone.
4. I will verify their Firebase login is destroyed.
