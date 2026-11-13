# Changes Made & Sync Registry

Tracks changes across the 3 production workspaces:
- **Web:** `SIBapp` (`main` branch)
- **iOS:** `SIBapp` (`feat/ios-build` branch)
- **Android:** `SIB_app_android` (`main` branch)

---

## Template

```markdown
### #<Number> [YYYY-MM-DD] - <Category / Module Name>
- **Type:** [Feature / Bug Fix / UI / Config]
- **Origin:** [Web / iOS / Android]
- **Sync Status:** Web: [Synced/Pending/N/A] | iOS: [Synced/Pending/N/A] | Android: [Synced/Pending/N/A]
- **Files:** `path/to/file1.jsx`, `path/to/file2.jsx`
- **Summary:**
  1. One-line summary of change 1.
  2. One-line summary of change 2 (grouped if in same session & category).

---
```

---

## Change Log

### #1 [2026-11-13] - President Portal
- **Type:** Bug Fix
- **Origin:** Web
- **Sync Status:** Web: Synced | iOS: Pending | Android: Pending
- **Files:** `src/PresidentPortal/components/MemberRole.jsx`
- **Summary:**
  1. Fixed coordinator removal not calling API after page refresh due to role capitalization mismatch (`"Coordinator"` vs `"coordinator"`).

---
