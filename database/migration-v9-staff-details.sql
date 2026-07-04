-- ============================================================
-- UHS-RIMS Migration v9 — Official staff details ("Staff Details Teaching")
-- The client sent their authoritative staff register, which includes an
-- official Employee No and a sparse ABAC/station code. This adds those two
-- columns; the rest of the fields already exist (v6). The actual row reload
-- is done by a data script after this runs.
--
--   employee_no : official Employee No (kept as TEXT — the source mixes 5- and
--                 9-digit numbers and has a few duplicates/blanks; NOT made a
--                 unique key so nothing is dropped. Bad entries flagged to client.)
--   abac        : ABAC / station code (present for ~17 station-posted staff only)
--
-- Rebuilds employees_view to expose the new columns and RE-APPLIES
-- security_invoker (a view reset would otherwise re-open the RLS bypass — v5).
-- Run in Supabase SQL Editor.
-- ============================================================

alter table employees add column if not exists employee_no text;
alter table employees add column if not exists abac        text;

drop view if exists employees_view;
create view employees_view as
select
  e.id, e.emp_no, e.employee_no, e.abac,
  e.name, e.designation, e.date_of_birth, e.college_id, c.name as college_name,
  e.email, e.phone,
  e.academic_level, e.discipline, e.present_position, e.working_office, e.place_of_working,
  e.rpc, e.promotion_status,
  e.dt_prof_15, e.dt_prof_14, e.dt_assoc_13a, e.dt_asst_12, e.dt_asst_11, e.dt_asst_10,
  e.dt_instructor, e.dt_service,
  e.created_at
from employees e
left join colleges c on c.id = e.college_id;
alter view employees_view set (security_invoker = true);
