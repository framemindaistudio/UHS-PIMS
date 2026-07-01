# UHS-PIMS
### University of Horticultural Sciences — Project Information Management System

A lightweight, secure web app for the DR Office to manage research projects: add/search/filter projects, manage departments/colleges/funding agencies, view dashboard analytics, and export PDF/Excel reports.

**Stack:** HTML5 + Bootstrap 5.3 + vanilla JS (ES6) + Chart.js · Supabase (PostgreSQL + Auth) · Vercel hosting

**🌐 Live app:** https://uhs-pims.vercel.app

---

## 1. Quick Start (≈15 minutes)

### Step 1 — Create a Supabase project
1. Go to [supabase.com](https://supabase.com) → New Project.
2. Pick a name (e.g. `uhs-pims`), set a database password, choose a region close to you, and wait ~2 min for it to provision.

### Step 2 — Run the database schema
1. In your Supabase project, open **SQL Editor → New query**.
2. Paste the entire contents of `database/schema.sql` and click **Run**.
3. (Optional, for demo data) Open a new query, paste `database/seed.sql`, and run it.

### Step 3 — Create your admin login
1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter the DR Office admin's email and a password. Tick **Auto Confirm User** (so no email verification step is required).
3. This automatically creates a matching row in `admin_users` (via the trigger in `schema.sql`).

> There's no public sign-up page by design — the DR Office creates accounts here.

**Roles (admin vs. read-only viewer):** New accounts default to **read-only "user"** — they can view everything but cannot add/edit/delete. To make an account a full **admin**, run this in the SQL Editor (replace the email):
> ```sql
> update admin_users set role = 'admin' where email = 'person@uhsbagalkot.edu.in';
> ```
> Make sure your first/main DR Office account is set to `admin` this way. Additional data-entry admins or read-only viewers (e.g. college staff who should only view reports) are added the same way — create the user, then set their role.

### Step 4 — Connect the frontend to Supabase
1. In Supabase: **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `config/supabase.js` and paste them in:
   ```js
   const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```
   The anon key is safe to expose in frontend code — actual data access is enforced by the Row Level Security policies already set up in `schema.sql` (only logged-in users can read/write).

### Step 5 — Run locally
No build step needed — it's plain HTML/JS. Easiest options:
- **VS Code**: install the "Live Server" extension, right-click `index.html` → "Open with Live Server".
- **Node**: `npx serve .` from the project root, then open the printed local URL.

Log in with the admin email/password you created in Step 3.

---

## 2. Deploy to Vercel (production)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Framework preset: **Other** (it's static HTML, no build command needed).
4. Click **Deploy**. Done — Vercel will give you a live `*.vercel.app` URL.

Because Supabase credentials live in `config/supabase.js` and access is gated by Supabase Auth + RLS, no extra environment variables are required for this MVP.

---

## 3. Project Structure

```
uhs-pims/
├── assets/
│   ├── css/style.css        # University green theme
│   └── js/
│       ├── data.js          # All Supabase queries (DataService)
│       └── utils.js         # Formatting, toasts, badges, debounce
├── pages/
│   ├── login.html
│   ├── dashboard.html
│   ├── projects.html
│   ├── project-form.html    # Add/Edit project
│   ├── departments.html
│   ├── colleges.html
│   ├── funding.html
│   ├── reports.html
│   └── profile.html
├── components/
│   ├── auth.js               # Session check, login/logout
│   ├── sidebar.js
│   ├── navbar.js
│   └── footer.js
├── database/
│   ├── schema.sql            # Tables, indexes, RLS policies, triggers, view
│   └── seed.sql              # Optional demo data
├── config/
│   ├── supabase.js           # ← fill in your project URL + anon key
│   └── config.js             # Status/funding-type options
├── index.html                 # Redirects to login or dashboard
├── package.json
└── vercel.json
```

## 4. Modules Implemented

- **Authentication** — Supabase email/password login, protected pages, logout, password change.
- **Dashboard** — stat cards (total / ongoing / completed / university / external funded), status & agency charts (Chart.js), recent projects table.
- **Projects** — full CRUD, live search (title/PI/department/college/agency), filters (status, funding type, department). Each project records the PI's **designation**.
- **Departments / Colleges / Funding Agencies** — master-data CRUD via modals.
- **Reports** — filter by year, status, funding type, department, college, **designation** and **duration**; export to **PDF** (jsPDF) and **Excel** (SheetJS).
- **Roles** — two-tier access: **admin** (read + write) and **viewer** (read-only). Write actions are hidden in the UI for viewers and blocked at the database by Row Level Security.
- **Security** — Supabase Auth session gating on every page, Row Level Security on every table (only authenticated admins can read/write), no SQL string concatenation (Supabase client parameterizes everything), HTML-escaping on all rendered user data.

## 5. Notes & Known Limits

- **Two roles**: admin (read + write) and read-only viewer. Finer-grained per-department/college permissions are future scope.
- No file/document uploads yet (future scope).
- `project_cost` is stored as a plain numeric column — for INR formatting at scale you may want to add currency config if other currencies are needed later.

### Upgrading an existing database
If your Supabase project was set up before the **designation** field and **role-based access** were added, run `database/migration-v2-designation-roles.sql` once in the SQL Editor. A brand-new install using the latest `schema.sql` already includes both.

## 6. Handover Checklist

- [x] Supabase project created and `schema.sql` run (project: `mffuhbgpjcjrhfgxpunu`)
- [x] Migration v2 applied (designation field + admin/viewer roles)
- [x] Admin user created and set to `role = 'admin'`
- [x] Frontend connected to Supabase (`config/supabase.js` populated)
- [x] Deployed to Vercel — live at https://uhs-pims.vercel.app
- [x] Supabase Auth **Site URL** + **Redirect URLs** set to the Vercel domain
- [x] Admin & read-only viewer roles verified end-to-end (UI + database RLS)
- [x] `database/schema.sql`, `seed.sql` and migration provided for backup/restore
- [x] `README.md` (technical) and `HANDOVER.md` (client one-pager) as manuals
- [ ] Delete the temporary `viewer-test` account used for role testing
- [ ] Admin credentials handed to the client, and password rotated to a client-owned secret
