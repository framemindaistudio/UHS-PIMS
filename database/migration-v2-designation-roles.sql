-- ============================================================
-- UHS-PIMS — Migration v2
-- Adds: (1) project "designation" field, (2) role-based access
--       (admin can write, all authenticated users can read).
-- Run this ONCE in Supabase SQL Editor on an existing project that
-- already has the original schema.sql applied.
-- Safe to re-run (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1. DESIGNATION on projects (PI's designation / position)
-- ------------------------------------------------------------
alter table projects add column if not exists designation text;
create index if not exists idx_projects_designation on projects (designation);

-- Recreate the frontend view to include designation.
-- (Dropped first because CREATE OR REPLACE VIEW cannot insert a column
--  in the middle of an existing view's column list.)
drop view if exists projects_view;
create view projects_view as
select
  p.id,
  p.title,
  p.principal_investigator,
  p.co_principal_investigator,
  p.designation,
  p.department_id,
  d.name as department_name,
  p.college_id,
  c.name as college_name,
  p.funding_agency_id,
  f.name as funding_agency_name,
  p.funding_type,
  p.project_cost,
  p.start_date,
  p.end_date,
  p.duration_months,
  p.status,
  p.remarks,
  p.created_at,
  p.updated_at
from projects p
left join departments d on d.id = p.department_id
left join colleges c on c.id = p.college_id
left join funding_agencies f on f.id = p.funding_agency_id;

-- ------------------------------------------------------------
-- 2. ROLES: admin (read + write) vs user (read-only)
-- ------------------------------------------------------------
-- New accounts default to read-only 'user'; promote to 'admin' explicitly.
alter table admin_users alter column role set default 'user';

-- Helper: is the current auth user an admin?
-- security definer so it can read admin_users without recursive RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Replace the old "any authenticated user can write" policies with
-- "only admins can write". Read policies stay as-is (all authenticated).
do $$
declare t text;
begin
  foreach t in array array['colleges','departments','funding_agencies','projects']
  loop
    execute format('drop policy if exists "Authenticated write %1$s" on %1$s;', t);
    execute format('drop policy if exists "Authenticated update %1$s" on %1$s;', t);
    execute format('drop policy if exists "Authenticated delete %1$s" on %1$s;', t);
    execute format('drop policy if exists "Admin write %1$s" on %1$s;', t);
    execute format('drop policy if exists "Admin update %1$s" on %1$s;', t);
    execute format('drop policy if exists "Admin delete %1$s" on %1$s;', t);

    execute format('create policy "Admin write %1$s"  on %1$s for insert with check (public.is_admin());', t);
    execute format('create policy "Admin update %1$s" on %1$s for update using (public.is_admin());', t);
    execute format('create policy "Admin delete %1$s" on %1$s for delete using (public.is_admin());', t);
  end loop;
end $$;

-- ------------------------------------------------------------
-- 3. HOW TO ADD A READ-ONLY USER
-- ------------------------------------------------------------
-- a) Supabase Dashboard > Authentication > Users > Add user (Auto Confirm).
--    The trigger auto-creates an admin_users row with role = 'user'.
-- b) They can now log in and VIEW everything, but cannot add/edit/delete.
--
-- To make someone an ADMIN, run (replace the email):
--   update admin_users set role = 'admin' where email = 'person@example.com';
--
-- To confirm your own account is admin (the original DR Office admin):
--   update admin_users set role = 'admin' where email = 'chinmayrm733@gmail.com';
