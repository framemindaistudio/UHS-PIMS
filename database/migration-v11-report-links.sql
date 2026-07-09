-- ============================================================
-- UHS-RIMS Migration v11 — Project report links
--
-- Adds a place to attach links to project reports (progress /
-- completion reports, documents, drive folders, etc.) on each
-- project. Stored as a JSON array of { label, url } objects.
--
-- Editors (admin / director / case_worker within their scheme)
-- can add/edit links via the project form; viewers see them as
-- read-only clickable links. Access is unchanged — this reuses
-- the existing projects RLS policies (no policy changes here).
--
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1. New column ---------------------------------------------------------------
alter table projects add column if not exists report_links jsonb not null default '[]'::jsonb;

-- 2. Expose report_links on the view, re-apply security_invoker (RLS guard) ----
drop view if exists projects_view;
create view projects_view as
select
  p.id, p.title, p.principal_investigator, p.co_principal_investigator, p.designation,
  p.department_id, d.name as department_name,
  p.college_id, c.name as college_name,
  p.funding_agency_id, f.name as funding_agency_name,
  p.funding_type, p.scheme, p.project_cost,
  p.start_date, p.end_date, p.duration_months, p.status, p.remarks,
  p.report_links,
  p.created_at, p.updated_at
from projects p
left join departments d on d.id = p.department_id
left join colleges c on c.id = p.college_id
left join funding_agencies f on f.id = p.funding_agency_id;
alter view projects_view set (security_invoker = true);
