-- ============================================================
-- UHS-PIMS — Migration v3
-- Lets admins read the full user list (for the in-app Users page).
-- Non-admins can still only read their own row.
-- Run once in Supabase SQL Editor. Safe to re-run.
-- ============================================================

drop policy if exists "Admin read all admin_users" on admin_users;
create policy "Admin read all admin_users"
  on admin_users for select
  using (public.is_admin());

-- Note: the existing "Self read admin_users" policy stays. RLS combines
-- SELECT policies with OR, so admins see everyone and others see only self.
