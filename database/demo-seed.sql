-- ============================================================
-- UHS-PIMS — Demo / Presentation Seed Data
-- A richer dataset than seed.sql: 5 colleges, 6 departments,
-- 6 funding agencies and 12 projects spread across years,
-- statuses, designations, funding types and durations — so the
-- dashboard charts look alive during a demo.
--
-- Run in Supabase SQL Editor AFTER schema.sql + migration-v2.
-- To remove it again, run the CLEAR block at the bottom.
-- ============================================================

insert into colleges (name, location) values
  ('College of Horticulture, Bagalkot', 'Bagalkot'),
  ('College of Horticulture, Bengaluru', 'Bengaluru'),
  ('College of Horticulture, Mudigere', 'Mudigere'),
  ('College of Horticulture, Bidar', 'Bidar'),
  ('College of Horticulture, Kolar', 'Kolar')
on conflict (name) do nothing;

insert into departments (name, college_id)
select v.dname, c.id from (values
  ('Department of Fruit Science', 'College of Horticulture, Bagalkot'),
  ('Department of Vegetable Science', 'College of Horticulture, Bagalkot'),
  ('Department of Floriculture & Landscape Architecture', 'College of Horticulture, Bengaluru'),
  ('Department of Plant Pathology', 'College of Horticulture, Mudigere'),
  ('Department of Post Harvest Technology', 'College of Horticulture, Bidar'),
  ('Department of Plantation, Spices, Medicinal & Aromatic Crops', 'College of Horticulture, Kolar')
) as v(dname, cname)
join colleges c on c.name = v.cname
on conflict (name) do nothing;

insert into funding_agencies (name, agency_type) values
  ('University Grants', 'University'),
  ('ICAR', 'Government'),
  ('DST', 'Government'),
  ('DBT', 'Government'),
  ('SERB', 'Government'),
  ('AgriTech Pvt Ltd', 'Private')
on conflict (name) do nothing;

insert into projects (title, principal_investigator, co_principal_investigator, designation,
  department_id, college_id, funding_agency_id, funding_type, project_cost, start_date, end_date, duration_months, status)
select v.title, v.pi, v.copi, v.desig, d.id, d.college_id, f.id, v.ftype, v.cost, v.sdate::date, v.edate::date,
  greatest(0, (extract(year from v.edate::date)-extract(year from v.sdate::date))*12 + (extract(month from v.edate::date)-extract(month from v.sdate::date)))::int, v.status
from (values
  ('Evaluation of Mango Hybrids for Yield & Quality','Dr. A. Sharma','Dr. R. Naik','Professor','Department of Fruit Science','ICAR','External Funded',1850000,'2023-04-01','2026-03-31','Ongoing'),
  ('Organic Cultivation Practices for Tomato','Dr. K. Patil',null,'Associate Professor','Department of Vegetable Science','University Grants','University Funded',450000,'2022-01-15','2024-01-14','Completed'),
  ('Genetic Improvement of Rose Varieties','Dr. S. Iyer','Dr. M. Joshi','Principal Scientist','Department of Floriculture & Landscape Architecture','DBT','External Funded',2200000,'2024-07-01','2027-06-30','Ongoing'),
  ('Biocontrol Agents for Fungal Wilt Management','Dr. T. Reddy',null,'Scientist','Department of Plant Pathology','DST','External Funded',980000,'2021-09-01','2023-08-31','Completed'),
  ('Cold Chain Optimization for Banana Storage','Dr. N. Kulkarni','Dr. P. Rao','Professor & Head','Department of Post Harvest Technology','SERB','External Funded',1650000,'2023-01-10','2025-12-31','Ongoing'),
  ('High-Density Planting Systems in Guava','Dr. V. Hegde',null,'Assistant Professor','Department of Fruit Science','ICAR','External Funded',1250000,'2022-06-01','2025-05-31','Ongoing'),
  ('Turmeric Varietal Screening for Curcumin','Dr. L. Gowda','Dr. S. Nair','Associate Professor','Department of Plantation, Spices, Medicinal & Aromatic Crops','University Grants','University Funded',620000,'2020-03-01','2022-02-28','Completed'),
  ('Drip Fertigation in Capsicum under Polyhouse','Dr. R. Desai',null,'Scientist','Department of Vegetable Science','DST','External Funded',1420000,'2024-02-01','2026-01-31','Ongoing'),
  ('Postharvest Shelf-life Enhancement of Grapes','Dr. A. Kamat','Dr. B. Shetty','Professor','Department of Post Harvest Technology','AgriTech Pvt Ltd','External Funded',2750000,'2023-08-01','2026-07-31','Ongoing'),
  ('Micropropagation Protocol for Anthurium','Dr. J. Menon',null,'Assistant Professor','Department of Floriculture & Landscape Architecture','DBT','External Funded',890000,'2021-04-01','2023-03-31','Completed'),
  ('IPM Module for Pomegranate Bacterial Blight','Dr. H. Pawar','Dr. D. Rao','Principal Scientist','Department of Plant Pathology','ICAR','External Funded',1980000,'2025-01-01','2027-12-31','Proposed'),
  ('Value-added Products from Underutilized Fruits','Dr. G. Bhat',null,'Professor & Head','Department of Fruit Science','University Grants','University Funded',540000,'2020-07-01','2022-06-30','Completed')
) as v(title, pi, copi, desig, dept, agency, ftype, cost, sdate, edate, status)
join departments d on d.name = v.dept
join funding_agencies f on f.name = v.agency;

-- ============================================================
-- CLEAR DEMO DATA (uncomment and run to wipe everything before
-- the client starts entering real data):
-- ============================================================
-- delete from projects;
-- delete from departments;
-- delete from funding_agencies;
-- delete from colleges;
