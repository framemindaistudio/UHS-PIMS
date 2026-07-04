/**
 * UHS-RIMS — Auth Helper
 * Wraps Supabase Auth: login, logout, session check, route protection.
 * Requires config/supabase.js to be loaded first.
 */
const Auth = {
  async getSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error("Session error:", error.message);
      return null;
    }
    return data.session;
  },

  /**
   * Call at the top of every protected page.
   * Redirects to login.html if no active session.
   */
  async requireAuth() {
    const session = await this.getSession();
    if (!session) {
      window.location.href = this.pathTo("login.html");
      return null;
    }
    return session;
  },

  /**
   * Call at the top of login.html.
   * If already logged in, redirect straight to dashboard.
   */
  async redirectIfLoggedIn() {
    const session = await this.getSession();
    if (session) {
      window.location.href = "dashboard.html";
    }
  },

  async login(email, password) {
    return await supabaseClient.auth.signInWithPassword({ email, password });
  },

  async logout() {
    await supabaseClient.auth.signOut();
    window.location.href = this.pathTo("login.html");
  },

  // Resolves "login.html" correctly whether called from /pages/ or root
  pathTo(file) {
    const inPages = window.location.pathname.includes("/pages/");
    return inPages ? file : `pages/${file}`;
  },

  async currentUserEmail() {
    const session = await this.getSession();
    return session?.user?.email || "Admin";
  },

  // Cached profile: role + schemes.
  //   role: 'admin' (client), 'director', 'case_worker' (scoped), 'user' (read-only)
  //   schemes: array of project categories a case_worker may see/edit
  _profile: undefined,
  async getProfile() {
    if (this._profile !== undefined) return this._profile;
    const session = await this.getSession();
    if (!session) return (this._profile = null);
    const { data, error } = await supabaseClient
      .from("admin_users").select("role, schemes").eq("id", session.user.id).single();
    // Fail safe to the least-privileged role if the lookup fails.
    this._profile = error
      ? { role: "user", schemes: [] }
      : { role: data?.role || "user", schemes: data?.schemes || [] };
    return this._profile;
  },
  async getRole()    { return (await this.getProfile())?.role || null; },
  async getSchemes() { return (await this.getProfile())?.schemes || []; },

  async isAdmin()    { return (await this.getRole()) === "admin"; },
  async isDirector() { return (await this.getRole()) === "director"; },
  // admin + director: full access to all data (master data, employees, projects)
  async canManageAll() { const r = await this.getRole(); return r === "admin" || r === "director"; },
  // admin + director + case_worker: may edit projects (case_worker only within their schemes, enforced by RLS)
  async canEditProjects() { const r = await this.getRole(); return r === "admin" || r === "director" || r === "case_worker"; }
};

// Listen for auth state changes (e.g. token refresh, sign-out in another tab)
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    const inPages = window.location.pathname.includes("/pages/");
    window.location.href = inPages ? "login.html" : "pages/login.html";
  }
});
