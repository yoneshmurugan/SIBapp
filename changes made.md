# Changes Made & Sync Registry

Tracks changes across the 3 production workspaces:
- **Web:** `SIBapp` (`main` branch)
- **iOS:** `SIBapp` (`feat/ios-build` branch)
- **Android:** `SIB_app_android` (`main` branch)

---

## 📊 Quick Sync Tracker

| # | Date | Category / Module | Web (`main`) | iOS (`feat/ios-build`) | Android (`main`) |
|---|---|---|:---:|:---:|:---:|
| #1 | 2026-11-13 | President Portal | [x] Synced | [ ] Pending | [ ] Pending |
| #2 | 2026-11-13 | Members Analytics | [x] Synced | [ ] Pending | [ ] Pending |

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
- [ ] **iOS (`SIBapp:feat/ios-build`):** Pending
- [ ] **Android (`SIB_app_android`):** Pending

#### Summary:
1. Fixed coordinator removal not calling API after page refresh due to role capitalization mismatch (`"Coordinator"` vs `"coordinator"`).
2. Greyscaled and disabled President rows in Member Role Management to prevent presidents from self-assigning as coordinator.
3. Added "Last Signed In" column displaying formatted last login timestamps (`user.last_signed_in`) for each member.
4. Removed "President" option from role selection dropdown in Create Member Form (restricted to regional admin panel).
5. Added Location field and validation when creating "Others" meeting type in Create Meeting modal.

---

### #2 [2026-11-13] - Members Analytics
- **Type:** Feature / Performance / UI
- **Origin:** Web
- **Files:** `src/MembersAnalytics/MembersAnalytics.jsx`, `src/main.jsx`

#### Sync Status:
- [x] **Web (`SIBapp:main`):** Synced
- [ ] **iOS (`SIBapp:feat/ios-build`):** Pending
- [ ] **Android (`SIB_app_android`):** Pending

#### Summary:
1. Split heavy M2M, TYFTB, and Referrals overview tables into lazy-loaded dedicated views accessible via coordinator action buttons ("M to M Coordinator", "TYB Coordinator", "Referrals Coordinator") for much faster initial page loads.

---
