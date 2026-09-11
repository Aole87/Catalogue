# Technical Debt Audit & Security Baseline

## 1. Executive Summary
This document registers all technical debt, code smells, architectural vulnerabilities, and security risks identified during the **M0 Baseline Audit**.

---

## 2. Security Baseline & Vulnerability Findings

| ID | Finding | Severity | Description & Remediation |
| :--- | :--- | :--- | :--- |
| **SEC-01** | **Arbitrary SQL Execution via Electron IPC** | **CRITICAL** | `preload.js` and `main.js` expose a generic `window.electronAPI.query(sql, params)` handler where the renderer process passes raw SQL strings. Any XSS or renderer compromise allows full database modification or extraction. <br>**Remediation:** Replace generic raw SQL IPC with specific, parameterized RPC/REST endpoints with backend validation. |
| **SEC-02** | **Plaintext Passwords in Database** | **CRITICAL** | User and Admin passwords in SQLite tables (`admins`, `users`) are stored in plain text with no hashing (`WHERE email = ? AND password = ?`). <br>**Remediation:** Implement Argon2 / bcrypt hashing with unique salt per password; migrate existing plaintext records during M1/M2. |
| **SEC-03** | **No Real Authentication / Session Tokens** | **CRITICAL** | Authentication state is stored purely as React in-memory state (`user`, `isAdmin`). There are no JWTs, no secure session cookies, and no backend token verification. <br>**Remediation:** Implement server-side JWT / session token generation with HttpOnly, Secure, SameSite cookies. |
| **SEC-04** | **Direct String Interpolation in Table Queries** | **HIGH** | In `src/pages/AdminDashboard.jsx`, table names and SQL clauses are dynamically constructed via template literals: ``SELECT * FROM ${table}`` and ``INSERT INTO ${table} (${cols}) VALUES (...)``. <br>**Remediation:** Replace generic dynamic table handlers with strongly-typed Prisma models and validated service repositories. |
| **SEC-05** | **External CDN Dependencies Without SRI** | **MEDIUM** | `index.html` loads Tailwind from `https://cdn.tailwindcss.com` and `AdminDashboard.jsx` injects SheetJS from `https://cdn.sheetjs.com/...` via DOM injection without Subresource Integrity (SRI) hashes. <br>**Remediation:** Bundle Tailwind and SheetJS locally as npm dependencies during Vite build. |
| **SEC-06** | **Database and Build Artifacts in Git** | **MEDIUM** | `database.sqlite` and `dist/` are currently tracked in the Git repository because `.gitignore` only includes `node_modules`. <br>**Remediation:** Update `.gitignore` to exclude `.sqlite`, `.env*`, `dist/`, `.DS_Store`, and temporary artifacts. |

---

## 3. Code Quality & Architectural Debt

### A. Raw SQL Embedded in UI Components
- **Issue:** SQL strings (`SELECT * FROM products WHERE...`, `INSERT INTO users...`) are scattered across React components (`Home.jsx`, `ProductList.jsx`, `AdminDashboard.jsx`, `Register.jsx`, `Login.jsx`).
- **Impact:** Tight coupling between UI and data schema, zero testability, violation of Separation of Concerns.

### B. Dual-Mode Mock Data Duplication
- **Issue:** Because the application was designed to run in both Electron and standard Web browsers, every page contains parallel mock fallback data duplicating the SQLite database.
- **Impact:** High maintenance overhead; changes made in SQLite are not reflected in web mode, and vice versa.

### C. Base64 Data URL Bloat in Database
- **Issue:** Images uploaded in AdminDashboard are converted to large Base64 strings (`data:image/png;base64,...`) and written directly to SQLite text fields.
- **Impact:** Rapid database bloat, slow query execution, high memory consumption in browser and SQLite.

### D. Sequential Row-by-Row Excel Import
- **Issue:** `ExcelImporter` in `AdminDashboard.jsx` loops over spreadsheet rows in JavaScript, executing 2–4 separate SQL queries per row sequentially over IPC.
- **Impact:** Importing a catalog of 5,000+ parts will cause extreme UI freezing and long execution times; missing batch transaction boundaries means partial imports leave corrupted data on failure.

### E. Lack of Static Typing & Test Coverage
- **Issue:** 0% TypeScript coverage, 0 unit tests, 0 integration tests, 0 E2E tests, and no CI/CD automation.
- **Impact:** High regression risk during refactoring and feature development.
