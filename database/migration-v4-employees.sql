-- ============================================================
-- UHS-PIMS Migration v4 — Employees (with retirement tracking)
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query).
-- Retirement date is computed in the app as Date of Birth + 62 years
-- (configurable via APP_CONFIG.retirementAge).
-- ============================================================

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text,
  date_of_birth date,
  college_id uuid references colleges(id) on delete set null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create index if not exists idx_employees_name on employees (name);
create index if not exists idx_employees_dob on employees (date_of_birth);
create index if not exists idx_employees_college on employees (college_id);

-- Row Level Security: read = any authenticated user, write = admins only
alter table employees enable row level security;

create policy "Authenticated read employees" on employees for select using (auth.role() = 'authenticated');
create policy "Admin insert employees" on employees for insert with check (public.is_admin());
create policy "Admin update employees" on employees for update using (public.is_admin());
create policy "Admin delete employees" on employees for delete using (public.is_admin());

-- Convenience view with the joined college name (frontend reads this)
create or replace view employees_view as
select
  e.id,
  e.name,
  e.designation,
  e.date_of_birth,
  e.college_id,
  c.name as college_name,
  e.email,
  e.phone,
  e.created_at
from employees e
left join colleges c on c.id = e.college_id;
