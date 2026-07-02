# UHS-PIMS — Handover Guide (for the DR Office)

**University of Horticultural Sciences — Project Information Management System**

**🌐 Live application:** https://uhs-pims.vercel.app

This is a one-page operating guide. For full technical/deployment details see `README.md`.

---

## 1. What it does

A secure, web-based system to store and manage all UHS research projects in one place — replacing scattered spreadsheets. It provides:

- Add / search / filter / edit research projects
- Master data: Colleges, Departments, Funding Agencies
- Dashboard with live totals, funding and charts
- Reports filtered by year, status, funding type, department, college, **designation** and **duration**, exportable to **PDF** and **Excel**

## 2. Logging in

1. Go to **https://uhs-pims.vercel.app**
2. Enter your email and password (provided by the administrator)
3. First-time on a new device: a short guided tour appears automatically. You can replay it anytime from **Help & Guide** in the sidebar.

## 3. User roles

| Role | Can do |
|------|--------|
| **Administrator** | View everything **and** add / edit / delete projects and master data |
| **Viewer** (read-only) | View all projects, dashboard and reports; export PDF/Excel. Cannot add or change data. |

Write actions are hidden for viewers in the screen **and** blocked in the database — a viewer cannot change data even by other means.

## 4. Managing users (administrator task)

There is no public sign-up (by design, for security).

**Add a read-only viewer — from inside the app (easiest):**
1. Log in as an administrator → click **Users** in the sidebar
2. Under **Add a viewer**, enter their name, email and a temporary password → **Create viewer account**
3. Hand them the credentials — they can log in straight away and view everything (but not edit). They can change their password later from **Profile**.

> Only administrators see the Users page and can create accounts.

**To make someone an administrator**, create them as a viewer first (above), then open Supabase → **SQL Editor** and run (replace the email):

```sql
update admin_users set role = 'admin' where email = 'person@uhsbagalkot.edu.in';
```

**To remove someone's access**, delete their account in Supabase → **Authentication → Users**.

To change your own password once logged in: **Profile → Change Password**.

## 5. Backup & restore

- The database schema lives in `database/schema.sql` (structure) — keep a copy.
- To export current data, use **Reports → Export Excel**, or Supabase → **Table Editor** / backups.
- Supabase provides automatic daily backups on its dashboard.

## 6. A note on technology

The original proposal suggested a PHP/Python backend. The delivered system uses **Supabase** (a managed PostgreSQL database with a secure, built-in API). This meets the same goals — a secure relational database with controlled access — with **less maintenance and no server to run**. The database is still PostgreSQL, exactly as specified.

## 7. Support checklist

- [ ] Administrator email + password received and password changed
- [ ] Confirmed you can log in at the live URL
- [ ] (Optional) Additional viewer/admin accounts created as needed
- [ ] `database/schema.sql` kept for backup/restore
