-- ============================================================
-- UHS-PIMS Seed Data (optional, for demo/testing)
-- Run AFTER schema.sql, and after you create your first admin
-- login via Supabase Auth (Authentication > Users > Add user).
-- ============================================================

insert into colleges (name, location) values
  ('College of Horticulture, Bagalkot', 'Bagalkot'),
  ('College of Horticulture, Bengaluru', 'Bengaluru'),
  ('College of Horticulture, Mudigere', 'Mudigere')
on conflict (name) do nothing;

insert into departments (name, college_id)
select 'Department of Fruit Science', id from colleges where name = 'College of Horticulture, Bagalkot'
on conflict (name) do nothing;

insert into departments (name, college_id)
select 'Department of Vegetable Science', id from colleges where name = 'College of Horticulture, Bagalkot'
on conflict (name) do nothing;

insert into departments (name, college_id)
select 'Department of Floriculture', id from colleges where name = 'College of Horticulture, Bengaluru'
on conflict (name) do nothing;

insert into departments (name, college_id)
select 'Department of Plant Pathology', id from colleges where name = 'College of Horticulture, Mudigere'
on conflict (name) do nothing;

insert into funding_agencies (name, agency_type) values
  ('University Grants', 'University'),
  ('ICAR', 'Government'),
  ('DST', 'Government'),
  ('DBT', 'Government'),
  ('Private Industry Grant', 'Private')
on conflict (name) do nothing;

insert into projects (
  title, principal_investigator, co_principal_investigator,
  department_id, college_id, funding_agency_id,
  funding_type, project_cost, start_date, end_date, duration_months, status, remarks
)
select
  'Evaluation of Mango Hybrids for Yield and Quality',
  'Dr. A. Sharma', 'Dr. R. Naik',
  d.id, d.college_id, f.id,
  'External Funded', 1850000, '2023-04-01', '2026-03-31', 36, 'Ongoing',
  'Field trials in progress at three locations'
from departments d, funding_agencies f
where d.name = 'Department of Fruit Science' and f.name = 'ICAR'
limit 1;

insert into projects (
  title, principal_investigator, co_principal_investigator,
  department_id, college_id, funding_agency_id,
  funding_type, project_cost, start_date, end_date, duration_months, status, remarks
)
select
  'Organic Cultivation Practices for Tomato',
  'Dr. K. Patil', null,
  d.id, d.college_id, f.id,
  'University Funded', 450000, '2022-01-15', '2024-01-14', 24, 'Completed',
  'Final report submitted'
from departments d, funding_agencies f
where d.name = 'Department of Vegetable Science' and f.name = 'University Grants'
limit 1;

insert into projects (
  title, principal_investigator, co_principal_investigator,
  department_id, college_id, funding_agency_id,
  funding_type, project_cost, start_date, end_date, duration_months, status, remarks
)
select
  'Genetic Improvement of Rose Varieties',
  'Dr. S. Iyer', 'Dr. M. Joshi',
  d.id, d.college_id, f.id,
  'External Funded', 2200000, '2024-07-01', '2027-06-30', 36, 'Ongoing',
  'Year 1 data collection underway'
from departments d, funding_agencies f
where d.name = 'Department of Floriculture' and f.name = 'DBT'
limit 1;

insert into projects (
  title, principal_investigator, co_principal_investigator,
  department_id, college_id, funding_agency_id,
  funding_type, project_cost, start_date, end_date, duration_months, status, remarks
)
select
  'Biocontrol Agents for Fungal Wilt Management',
  'Dr. T. Reddy', null,
  d.id, d.college_id, f.id,
  'External Funded', 980000, '2021-09-01', '2023-08-31', 24, 'Completed',
  'Two biocontrol strains identified'
from departments d, funding_agencies f
where d.name = 'Department of Plant Pathology' and f.name = 'DST'
limit 1;
