-- ============================================================
-- UHS-RIMS Migration v7 — Security lockdown
-- Fixes a privilege-escalation hole found in a security audit (2026-07-03).
--
-- HOLE: the "Self update admin_users" policy had no WITH CHECK, so any
-- logged-in viewer could PATCH their own row and set role='admin',
-- gaining full read/write/delete over every table. Proven live.
--
-- FIX: keep self-service profile edits, but forbid a non-admin from
-- changing their own role. A user may only leave role as 'user'
-- (or an existing admin may set anything).
--
-- NOTE: This SQL closes escalation. It does NOT, by itself, stop random
-- people from *registering*. You MUST also disable public sign-up in the
-- Supabase Dashboard (see SECURITY.md / the accompanying instructions),
-- otherwise anyone can still create a read-only account and read the data.
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1) Block self privilege-escalation on admin_users --------------------------
drop policy if exists "Self update admin_users" on admin_users;
create policy "Self update admin_users" on admin_users
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (role = 'user' or public.is_admin())
  );

-- 2) Defense-in-depth: also forbid a user from INSERTing an admin row for
--    themselves with an elevated role (the signup trigger already inserts
--    role='user'; this stops any hand-crafted insert from setting 'admin').
drop policy if exists "No self-insert admin_users" on admin_users;
create policy "No self-insert admin_users" on admin_users
  for insert
  with check (public.is_admin());

-- ============================================================
-- Verify (optional): as a plain 'user' these should now FAIL.
--   update admin_users set role='admin' where id = auth.uid();  -> 0 rows / error
-- ============================================================
