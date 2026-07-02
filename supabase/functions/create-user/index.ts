// ============================================================
// UHS-PIMS — Edge Function: create-user
// Lets a logged-in ADMIN create a new read-only (viewer) account
// from inside the app, without exposing the service_role key.
//
// Flow:
//  1. Reads the caller's JWT (sent automatically by supabase-js).
//  2. Confirms the caller is an admin (admin_users.role = 'admin').
//  3. Uses the service_role key (server-side only) to create the user
//     with email_confirm = true so they can log in immediately.
//  4. The database trigger auto-creates their admin_users row with the
//     default role 'user' (view-only).
//
// Deploy:  supabase functions deploy create-user
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are
//  injected automatically by Supabase — no manual secrets needed.)
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ ok: false, error: "Not authenticated." }, 401);

    // 1. Identify the caller from their JWT.
    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData?.user) return json({ ok: false, error: "Invalid session." }, 401);

    // 2. Confirm the caller is an admin (service role bypasses RLS for this check).
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin
      .from("admin_users").select("role").eq("id", userData.user.id).single();
    if (!profile || profile.role !== "admin") {
      return json({ ok: false, error: "Only administrators can create users." }, 403);
    }

    // 3. Validate input.
    const { email, password, full_name } = await req.json().catch(() => ({}));
    if (!email || !password) return json({ ok: false, error: "Email and password are required." }, 400);
    if (String(password).length < 6) return json({ ok: false, error: "Password must be at least 6 characters." }, 400);

    // 4. Create the user (view-only via the DB default role). Confirm email so
    //    they can log in immediately with no verification step.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: String(email).trim(),
      password: String(password),
      email_confirm: true,
      user_metadata: full_name ? { full_name: String(full_name).trim() } : undefined,
    });
    if (createErr) return json({ ok: false, error: createErr.message }, 400);

    return json({ ok: true, user: { id: created.user?.id, email: created.user?.email } });
  } catch (e) {
    return json({ ok: false, error: (e as Error)?.message ?? "Unexpected error." }, 500);
  }
});
