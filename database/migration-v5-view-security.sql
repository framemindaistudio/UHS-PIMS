-- ============================================================
-- UHS-PIMS Migration v5 — Harden views against RLS bypass
-- Run in Supabase SQL Editor.
--
-- Postgres views run with the view owner's privileges by default, so they
-- skip the Row Level Security on the underlying tables — meaning anyone with
-- the public anon key could read view data WITHOUT logging in.
-- security_invoker = true makes each view run as the QUERYING user, so RLS
-- applies: logged-in app users still see everything; anonymous requests get
-- nothing. (Requires Postgres 15+, which Supabase uses.)
-- ============================================================

alter view projects_view set (security_invoker = true);
alter view employees_view set (security_invoker = true);
