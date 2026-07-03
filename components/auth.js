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

  // Cached role of the logged-in user: 'admin' (read+write) or 'user' (read-only).
  _role: undefined,
  async getRole() {
    if (this._role !== undefined) return this._role;
    const session = await this.getSession();
    if (!session) return (this._role = null);
    const { data, error } = await supabaseClient
      .from("admin_users").select("role").eq("id", session.user.id).single();
    // Fail safe to the least-privileged role if the lookup fails.
    this._role = error ? "user" : (data?.role || "user");
    return this._role;
  },

  async isAdmin() {
    return (await this.getRole()) === "admin";
  }
};

// Listen for auth state changes (e.g. token refresh, sign-out in another tab)
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    const inPages = window.location.pathname.includes("/pages/");
    window.location.href = inPages ? "login.html" : "pages/login.html";
  }
});
