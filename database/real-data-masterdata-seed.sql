-- UHS-PIMS master-data seed generated from the real UHS Excel files.
-- Run this in Supabase SQL editor BEFORE importing the two Excel files
-- (the importer matches College/Department by exact name).

insert into departments (name) values
  ('Agriculture Entomology'),
  ('CIB'),
  ('FTEM'),
  ('Floriculture'),
  ('Fruit Science'),
  ('NRM'),
  ('PHM'),
  ('PSMA'),
  ('Plant Pathology'),
  ('SAS'),
  ('Vegetable Science')
on conflict do nothing;

insert into colleges (name, location) values
  ('CHEFT, Devihosur', 'Devihosur'),
  ('COH, Bagalkot', 'Bagalkot'),
  ('COH, Bengaluru', 'Bengaluru'),
  ('COH, Bidar', 'Bidar'),
  ('COH, Kolar', 'Kolar'),
  ('COH, Koppal', 'Koppal'),
  ('COH, Munirabad', 'Munirabad'),
  ('COH, Mysuru', 'Mysuru'),
  ('COH, Sirsi', 'Sirsi'),
  ('HREC, Arasikere', 'Arasikere'),
  ('HREC, Devihosur', 'Devihosur'),
  ('HREC, Hassan', 'Hassan'),
  ('HREC, Hidakal Dam', 'Hidakal Dam'),
  ('HREC, Hogalagere', 'Hogalagere'),
  ('HREC, Kanabargi', 'Kanabargi'),
  ('HREC, Mugalkod', 'Mugalkod'),
  ('HREC, Sirsi', 'Sirsi'),
  ('HREC, Tidagundi', 'Tidagundi'),
  ('KRCCH, Arabhavi', 'Arabhavi'),
  ('KVK, Kolar', 'Kolar'),
  ('MHREC, Bagalkot', 'Bagalkot'),
  ('RHREC, Bengaluru', 'Bengaluru'),
  ('RHREC, Dharwad', 'Dharwad'),
  ('RHREC, Kumbapur', 'Kumbapur')
on conflict do nothing;