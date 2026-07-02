-- ============================================================
-- UHS-PIMS Database Schema
-- University of Horticultural Sciences
-- Project Information Management System
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. COLLEGES
-- ------------------------------------------------------------
create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. DEPARTMENTS
-- ------------------------------------------------------------
create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  college_id uuid references colleges(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. FUNDING AGENCIES
-- ------------------------------------------------------------
create table if not exists funding_agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  agency_type text, -- e.g. Government, Private, International
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. PROJECTS
-- ------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  principal_investigator text not null,
  co_principal_investigator text,
  designation text, -- PI's designation / position (e.g. Professor, Scientist)
  department_id uuid references departments(id) on delete set null,
  college_id uuid references colleges(id) on delete set null,
  funding_agency_id uuid references funding_agencies(id) on delete set null,
  funding_type text not null check (funding_type in ('University Funded','External Funded')),
  project_cost numeric(14,2) default 0,
  start_date date,
  end_date date,
  duration_months int,
  status text not null default 'Ongoing' check (status in ('Ongoing','Completed','Proposed','Terminated')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_title on projects using gin (to_tsvector('english', title));
create index if not exists idx_projects_pi on projects (principal_investigator);
create index if not exists idx_projects_status on projects (status);
create index if not exists idx_projects_funding_type on projects (funding_type);
create index if not exists idx_projects_department on projects (department_id);
create index if not exists idx_projects_college on projects (college_id);
create index if not exists idx_projects_agency on projects (funding_agency_id);
create index if not exists idx_projects_start_date on projects (start_date);
create index if not exists idx_projects_designation on projects (designation);

-- Keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
before update on projects
for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- 5. ADMIN USERS (profile table linked to Supabase Auth)
-- ------------------------------------------------------------
-- Roles: 'admin' (read + write) or 'user' (read-only viewer).
-- New accounts default to read-only 'user'; promote to 'admin' explicitly.
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- Helper: is the current auth user an admin? (security definer avoids RLS recursion)
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

-- ============================================================
-- ROW LEVEL SECURITY
-- Only authenticated users (logged-in admins) can read/write.
-- ============================================================
alter table colleges enable row level security;
alter table departments enable row level security;
alter table funding_agencies enable row level security;
alter table projects enable row level security;
alter table admin_users enable row level security;

-- Read: any authenticated user (admin or read-only user).
-- Write: admins only (enforced via public.is_admin()).

-- Colleges
create policy "Authenticated read colleges" on colleges for select using (auth.role() = 'authenticated');
create policy "Admin write colleges" on colleges for insert with check (public.is_admin());
create policy "Admin update colleges" on colleges for update using (public.is_admin());
create policy "Admin delete colleges" on colleges for delete using (public.is_admin());

-- Departments
create policy "Authenticated read departments" on departments for select using (auth.role() = 'authenticated');
create policy "Admin write departments" on departments for insert with check (public.is_admin());
create policy "Admin update departments" on departments for update using (public.is_admin());
create policy "Admin delete departments" on departments for delete using (public.is_admin());

-- Funding Agencies
create policy "Authenticated read funding_agencies" on funding_agencies for select using (auth.role() = 'authenticated');
create policy "Admin write funding_agencies" on funding_agencies for insert with check (public.is_admin());
create policy "Admin update funding_agencies" on funding_agencies for update using (public.is_admin());
create policy "Admin delete funding_agencies" on funding_agencies for delete using (public.is_admin());

-- Projects
create policy "Authenticated read projects" on projects for select using (auth.role() = 'authenticated');
create policy "Admin write projects" on projects for insert with check (public.is_admin());
create policy "Admin update projects" on projects for update using (public.is_admin());
create policy "Admin delete projects" on projects for delete using (public.is_admin());

-- Admin users: users read their own row; admins can read everyone (for the Users page).
create policy "Self read admin_users" on admin_users for select using (auth.uid() = id);
create policy "Admin read all admin_users" on admin_users for select using (public.is_admin());
create policy "Self update admin_users" on admin_users for update using (auth.uid() = id);

-- ============================================================
-- Auto-create admin_users row when a new auth user signs up
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.admin_users (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ============================================================
-- Helpful view: project list with joined names (used by frontend)
-- ============================================================
create or replace view projects_view as
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
