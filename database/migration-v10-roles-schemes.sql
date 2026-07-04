-- ============================================================
-- UHS-RIMS Migration v10 — Role-based access + project schemes (Phase 1)
--
-- Adds a per-project "scheme" (funding category) and scopes each case-worker
-- login to only their scheme(s). Client (admin) and Director of Research see
-- and edit EVERYTHING. Case workers see + edit ONLY their scheme's projects.
--
-- Roles (admin_users.role):
--   admin        - the client: full read + write (existing)
--   director     - Director of Research: full read + write
--   case_worker  - scoped to admin_users.schemes[]  (read + write their schemes)
--   user         - legacy read-only viewer: reads all, writes nothing
--
-- Schemes (project categories, from the client's "Employee details" doc):
--   External Funded, RKVY, TBI, Inhouse, MLT, LSD, Farm Trials,
--   Chemical Testing, Adhoc, CSS-MIDH, Revolving Fund
--
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. New columns -------------------------------------------------------------
alter table projects    add column if not exists scheme  text;
alter table admin_users add column if not exists schemes text[] not null default '{}';
create index if not exists idx_projects_scheme on projects (scheme);

-- 2. Helper functions (security definer so RLS can call them safely) ----------
create or replace function public.is_director()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admin_users where id = auth.uid() and role = 'director');
$$;

create or replace function public.is_viewer()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admin_users where id = auth.uid() and role = 'user');
$$;

create or replace function public.my_schemes()
returns text[] language sql security definer set search_path = public stable as $$
  select coalesce((select schemes from public.admin_users where id = auth.uid()), '{}'::text[]);
$$;

-- 3. Auto-tag the projects we CAN identify (109 of 558) -----------------------
update projects set scheme = 'Revolving Fund'
  where scheme is null and remarks ~* 'revolving|iirf|frf';
update projects set scheme = 'External Funded'
  where scheme is null and funding_type = 'External Funded';
-- The remaining ~449 stay NULL until the client supplies their scheme.

-- 4. Re-scope PROJECTS row level security ------------------------------------
drop policy if exists "Authenticated read projects" on projects;
drop policy if exists "Admin write projects"        on projects;
drop policy if exists "Admin update projects"        on projects;
drop policy if exists "Admin delete projects"        on projects;

-- Read: admin / director / viewer see all; case_worker sees only their schemes.
create policy "read projects scoped" on projects for select using (
  public.is_admin() or public.is_director() or public.is_viewer()
  or (scheme is not null and scheme = any (public.my_schemes()))
);
-- Write: admin / director anywhere; case_worker only within their schemes.
create policy "insert projects scoped" on projects for insert with check (
  public.is_admin() or public.is_director()
  or (scheme is not null and scheme = any (public.my_schemes()))
);
create policy "update projects scoped" on projects for update using (
  public.is_admin() or public.is_director()
  or (scheme is not null and scheme = any (public.my_schemes()))
) with check (
  public.is_admin() or public.is_director()
  or (scheme is not null and scheme = any (public.my_schemes()))
);
create policy "delete projects scoped" on projects for delete using (
  public.is_admin() or public.is_director()
  or (scheme is not null and scheme = any (public.my_schemes()))
);

-- 5. Let admins manage roles/schemes of other users (gated by is_admin) -------
drop policy if exists "Admin manage admin_users" on admin_users;
create policy "Admin manage admin_users" on admin_users for update
  using (public.is_admin()) with check (public.is_admin());

-- 6. Expose scheme on the view, re-apply security_invoker (RLS bypass guard) --
drop view if exists projects_view;
create view projects_view as
select
  p.id, p.title, p.principal_investigator, p.co_principal_investigator, p.designation,
  p.department_id, d.name as department_name,
  p.college_id, c.name as college_name,
  p.funding_agency_id, f.name as funding_agency_name,
  p.funding_type, p.scheme, p.project_cost,
  p.start_date, p.end_date, p.duration_months, p.status, p.remarks,
  p.created_at, p.updated_at
from projects p
left join departments d on d.id = p.department_id
left join colleges c on c.id = p.college_id
left join funding_agencies f on f.id = p.funding_agency_id;
alter view projects_view set (security_invoker = true);
