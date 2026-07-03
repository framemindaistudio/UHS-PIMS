-- ============================================================
-- UHS-PIMS Migration v6 — Full staff/teaching record on employees
-- Adds every field from the client's "Teaching Final Data" sheet so no
-- data is lost: academic level, discipline, posting, RPC, promotion status,
-- and the full CAS service history (entry/promotion dates per cadre).
-- Service-history dates are TEXT (the source mixes DD.MM.YY, DD.MM.YYYY and
-- "NA" markers — kept verbatim so nothing is misread or dropped).
-- Run in Supabase SQL Editor.
-- ============================================================

alter table employees
  add column if not exists academic_level    int,
  add column if not exists discipline        text,
  add column if not exists present_position  text,
  add column if not exists working_office    text,
  add column if not exists place_of_working  text,
  add column if not exists rpc               text,
  add column if not exists promotion_status  text,
  add column if not exists dt_prof_15        text,   -- Professor, Academic level 15
  add column if not exists dt_prof_14        text,   -- Professor, Academic level 14
  add column if not exists dt_assoc_13a      text,   -- Associate Professor, level 13A
  add column if not exists dt_asst_12        text,   -- Assistant Professor, level 12
  add column if not exists dt_asst_11        text,   -- Assistant Professor, level 11
  add column if not exists dt_asst_10        text,   -- Assistant Professor, level 10
  add column if not exists dt_instructor     text,   -- Instructor cadre
  add column if not exists dt_service        text;   -- Entry into service (permanent)

create index if not exists idx_employees_discipline on employees (discipline);

-- Rebuild the view to expose the new columns (DROP+CREATE because a view's
-- column list can't be changed in place). This resets security_invoker, so we
-- re-apply it (migration v5) to keep the view behind Row Level Security.
drop view if exists employees_view;
create view employees_view as
select
  e.id, e.name, e.designation, e.date_of_birth, e.college_id, c.name as college_name,
  e.email, e.phone,
  e.academic_level, e.discipline, e.present_position, e.working_office, e.place_of_working,
  e.rpc, e.promotion_status,
  e.dt_prof_15, e.dt_prof_14, e.dt_assoc_13a, e.dt_asst_12, e.dt_asst_11, e.dt_asst_10,
  e.dt_instructor, e.dt_service,
  e.created_at
from employees e
left join colleges c on c.id = e.college_id;

alter view employees_view set (security_invoker = true);
