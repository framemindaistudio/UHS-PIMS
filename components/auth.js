/**
 * UHS-PIMS — Auth Helper
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
  }
};

// Listen for auth state changes (e.g. token refresh, sign-out in another tab)
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    const inPages = window.location.pathname.includes("/pages/");
    window.location.href = inPages ? "login.html" : "pages/login.html";
  }
});
