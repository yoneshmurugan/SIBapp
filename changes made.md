# Changes Made & Sync Registry

Tracks changes across the 3 production workspaces:
- **Web:** `SIBapp` (`main` branch)
- **iOS:** `SIBapp` (`feat/ios-build` branch)
- **Android:** `SIB_app_android` (`main` branch)

---

## 📊 Quick Sync Tracker

| # | Date | Category / Module | Web (`main`) | iOS (`feat/ios-build`) | Android (`main`) |
|---|---|---|:---:|:---:|:---:|
| #1 | 2026-11-13 | President Portal | [x] Synced | [x] Synced | [x] Synced |
| #2 | 2026-11-13 | Members Analytics | [x] Synced | [x] Synced | [x] Synced |
| #3 | 2026-11-13 | Coordinators Portal | [x] Synced | [x] Synced | [x] Synced |
| #4 | 2026-11-13 | Authentication (Sign In & Password Recovery) | [x] Synced | [x] Synced | [x] Synced |
| #5 | 2026-11-13 | Wall of Wishes | [x] Synced | [x] Synced | [x] Synced |
| #6 | 2026-11-13 | Settings (Update Password) | [x] Synced | [x] Synced | [x] Synced |
| #7 | 2026-11-13 | Settings (Sessions, Badge & Blood Donor) | [x] Synced | [x] Synced | [x] Synced |

---

## Template

```markdown
### #<Number> [YYYY-MM-DD] - <Category / Module Name>
- **Type:** [Feature / Bug Fix / UI / Config]
- **Origin:** [Web / iOS / Android]
- **Files:** `path/to/file1.jsx`, `path/to/file2.jsx`

#### Sync Status:
- [ ] **Web (`SIBapp:main`):** [Synced / Pending / N/A]
- [ ] **iOS (`SIBapp:feat/ios-build`):** [Synced / Pending / N/A]
- [ ] **Android (`SIB_app_android`):** [Synced / Pending / N/A]

#### Summary:
1. One-line summary of change 1.
2. One-line summary of change 2 (grouped if in same session & category).

---
```

---

## Change Log

### #1 [2026-11-13] - President Portal
- **Type:** Bug Fix / UI / Feature
- **Origin:** Web
- **Files:** `src/PresidentPortal/components/MemberRole.jsx`, `src/PresidentPortal/components/CreateUser.jsx`, `src/PresidentPortal/components/CreateMeeting.jsx`

#### Sync Status:
- [x] **Web (`SIBapp:main`):** Synced
- [x] **iOS (`SIBapp:feat/ios-build`):** Synced
- [x] **Android (`SIB_app_android`):** Synced

#### Summary:
1. Fixed coordinator removal not calling API after page refresh due to role capitalization mismatch (`"Coordinator"` vs `"coordinator"`).
2. Greyscaled and disabled President rows in Member Role Management to prevent presidents from self-assigning as coordinator.
3. Added "Last Signed In" column displaying formatted last login timestamps (`user.last_signed_in`) for each member.
4. Removed "President" option from role selection dropdown in Create Member Form (restricted to regional admin panel).
5. Added Location field and validation when creating "Others" meeting type in Create Meeting modal.
6. Added interactive ascending/descending column sorting to the table header (Username, Role, Last Signed In, Coordinator).

---

### #2 [2026-11-13] - Members Analytics
- **Type:** Feature / Performance / UI
- **Origin:** Web
- **Files:** `src/MembersAnalytics/MembersAnalytics.jsx`, `src/main.jsx`

#### Sync Status:
- [x] **Web (`SIBapp:main`):** Synced
- [x] **iOS (`SIBapp:feat/ios-build`):** Synced
- [x] **Android (`SIB_app_android`):** Synced

#### Summary:
1. Split heavy M2M, TYFTB, and Referrals overview tables into lazy-loaded dedicated views accessible via coordinator action buttons ("M to M Coordinator", "TYB Coordinator", "Referrals Coordinator") for much faster initial page loads.

---

### #3 [2026-11-13] - Coordinators Portal
- **Type:** UI
- **Origin:** Web
- **Files:** `src/Coordinatorsportal/Coordinatorsportalpage.jsx`, `src/Coordinatorsportal/components/PhotoGall.jsx`

#### Sync Status:
- [x] **Web (`SIBapp:main`):** Synced
- [x] **iOS (`SIBapp:feat/ios-build`):** Synced
- [x] **Android (`SIB_app_android`):** Synced

#### Summary:
1. Removed static "Network" (Active Chapter Members) and "Status" (Online System Operations) statistic cards from the Coordinator Dashboard.
2. Removed delete album and delete photo options from Events Gallery in Coordinators Portal.

---

### #4 [2026-11-13] - Authentication (Sign In & Password Recovery)
- **Type:** Feature / Bug Fix / UI
- **Origin:** Web
- **Files:** `src/SigninPage/SignInPage.jsx`, `src/SigninPage/SignInForm.jsx`, `src/SigninPage/components/FormHeader.jsx`, `src/SigninPage/components/TextField.jsx`, `src/SigninPage/components/PasswordField.jsx`, `src/SigninPage/components/Alert.jsx`, `src/ResetPassword/ResetPassword.jsx`

#### Sync Status:
- [x] **Web (`SIBapp:main`):** Synced
- [x] **iOS (`SIBapp:feat/ios-build`):** Synced
- [x] **Android (`SIB_app_android`):** Synced

#### Summary:
1. Redesigned Member Sign In page into a polished professional portal card with SIB branding, official logo header, Eye password toggle icon, and amber accent buttons.
2. Redesigned Reset Password page with dual Email/Phone support, Firebase Client SDK fallback for failed Admin action links, resend cooldown timer, and descriptive error messaging.
3. Cleaned up both authentication pages by removing extraneous badges ("Password Recovery" pill and "Protected by SIB Secure Authentication" footer note).
4. Fixed non-registered email addresses falsely reporting success in Reset Password by adding strict MongoDB account verification in `/auth/lookup-email` and `/auth/resetPassword` before attempting dispatch.
5. Fixed `normalizeEmail()` dot-stripping bug: Express-validator's `normalizeEmail()` was stripping dots from Gmail addresses (`kavinkumar.engg@gmail.com` became `kavinkumarengg@gmail.com`), causing valid users with dots in their email to fail DB & Firebase lookup. Replaced with `.trim().toLowerCase()` and added flexible dot-tolerant MongoDB queries.

---

### #5 [2026-11-13] - Wall of Wishes
- **Type:** Feature / UI
- **Origin:** Web
- **Files:** `src/WallOfWishes/WishCard.jsx`, `src/WallOfWishes/WallOfWishes.jsx`

#### Sync Status:
- [x] **Web (`SIBapp:main`):** Synced
- [x] **iOS (`SIBapp:feat/ios-build`):** Synced
- [x] **Android (`SIB_app_android`):** Synced

#### Summary:
1. Added member celebration date (e.g. "14th Nov") with a calendar icon to WishCard alongside event type and relative status (Today / Tomorrow / In X days).
2. Passed celebration target dates from both today's celebrants and upcoming events in Wall of Wishes directly to WishCard with profile data fallback.

---

### #6 [2026-11-13] - Settings: Update Password
- **Type:** Feature / UI / Security / Error Handling
- **Origin:** Web
- **Files:** `src/Settings/components/SecurityPanel.jsx`, `src/Settings/components/SettingsHeader.jsx`, `src/Settings/components/SettingsSidebar.jsx`, `src/Settings/Settings.jsx`

#### Sync Status:
- [x] **Web (`SIBapp:main`):** Synced
- [x] **iOS (`SIBapp:feat/ios-build`):** Synced
- [x] **Android (`SIB_app_android`):** Synced

#### Summary:
1. Redesigned `SecurityPanel.jsx` with full dark/gold theme cohesion, encrypted badge, Lucide icons (`Lock`, `KeyRound`, `ShieldCheck`), and an amber gradient action button.
2. Auto-populated account email from session cache/backend (`localStorage.getItem('header_auth_user')` / `/auth/getuser`) to eliminate manual typing.
3. Added individual show/hide password visibility toggles (`Eye` / `EyeOff`) to Current Password, New Password, and Confirm Password fields.
4. Added real-time 5-point password requirement criteria checklist (8+ chars, upper, lower, number, symbol) and a 5-step visual strength meter (Weak / Fair / Good / Strong).
5. Added real-time confirm password match indicator ("✓ Passwords match" vs "Passwords do not match yet").
6. Added inline field error highlighting and clean banner feedback (green `CheckCircle2` success card and red `AlertCircle` error card).
7. Added seamless fallback to Firebase Client SDK (`signInWithEmailAndPassword` + `updatePassword`) if backend API returns network failure or server error.
8. Upgraded `SettingsHeader.jsx` and `SettingsSidebar.jsx` with themed navigation, removing outdated red save alert button.
9. Removed the boxed icons beside "Account Settings" and "Update Password" for a cleaner, streamlined header layout.

---

### #7 [2026-11-13] - Settings: Session History, Membership Badge
- **Type:** Feature / UI / Security / Community
- **Origin:** Web
- **Files:** `src/Settings/components/SecurityPanel.jsx`, `src/Settings/components/MembershipBadgePanel.jsx`, `src/Settings/components/SessionsPanel.jsx`, `src/Settings/components/SettingsSidebar.jsx`, `src/Settings/Settings.jsx`, `SIB_backend/src/schemas.mjs`, `SIB_backend/src/validators.mjs`, `SIB_backend/src/pages/profile/profileRoute.mjs`, `SIB_backend/src/pages/Auth/routes.mjs`

#### Sync Status:
- [x] **Web (`SIBapp:main`):** Synced
- [x] **iOS (`SIBapp:feat/ios-build`):** Synced
- [x] **Android (`SIB_app_android`):** Synced

#### Summary:
1. **Dedicated Session & Device History Panel:** Moved session history out of Update Password into its own separate panel (`src/Settings/components/SessionsPanel.jsx`) with dedicated sidebar item "Session & Devices".
2. **Fixed Dark Mode Visibility:** Resolved the issue where session and device cards had illegible text on bright white containers in dark mode. Restructured with dark theme classes (`bg-gray-50 dark:bg-gray-850/60` fixed to `dark:bg-gray-800/70 border-gray-200 dark:border-gray-800`), bold high-contrast text (`text-gray-900 dark:text-gray-100`), amber badge icons, and active session pulse indicator.
3. **Membership Badge:** Created `MembershipBadgePanel.jsx` displaying a luxury SIB digital membership badge with SIB Member ID (`idno`) and copy button, Chapter Name & Chapter Code, Member Role badge (President / Coordinator / Member), Joining Date, and dynamic Renewal Date countdown badge with days remaining.
4. **Reverted Emergency Blood Donor:** Completely removed the Emergency Blood Donor opt-in and all associated schemas and routes per request to keep settings streamlined.

---
