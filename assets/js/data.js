/**
 * UHS-RIMS — Data Service Layer
 * Wraps all Supabase table/view queries used across pages.
 */
const DataService = {
  // ---------------- Colleges ----------------
  async listColleges() {
    const { data, error } = await supabaseClient.from("colleges").select("*").order("name");
    if (error) throw error;
    return data;
  },
  async addCollege(payload) {
    const { error } = await supabaseClient.from("colleges").insert(payload);
    if (error) throw error;
  },
  async updateCollege(id, payload) {
    const { error } = await supabaseClient.from("colleges").update(payload).eq("id", id);
    if (error) throw error;
  },
  async deleteCollege(id) {
    const { error } = await supabaseClient.from("colleges").delete().eq("id", id);
    if (error) throw error;
  },

  // ---------------- Departments ----------------
  async listDepartments() {
    const { data, error } = await supabaseClient
      .from("departments")
      .select("*, colleges(name)")
      .order("name");
    if (error) throw error;
    return data;
  },
  async addDepartment(payload) {
    const { error } = await supabaseClient.from("departments").insert(payload);
    if (error) throw error;
  },
  async updateDepartment(id, payload) {
    const { error } = await supabaseClient.from("departments").update(payload).eq("id", id);
    if (error) throw error;
  },
  async deleteDepartment(id) {
    const { error } = await supabaseClient.from("departments").delete().eq("id", id);
    if (error) throw error;
  },

  // ---------------- Funding Agencies ----------------
  async listFundingAgencies() {
    const { data, error } = await supabaseClient.from("funding_agencies").select("*").order("name");
    if (error) throw error;
    return data;
  },
  async addFundingAgency(payload) {
    const { error } = await supabaseClient.from("funding_agencies").insert(payload);
    if (error) throw error;
  },
  async updateFundingAgency(id, payload) {
    const { error } = await supabaseClient.from("funding_agencies").update(payload).eq("id", id);
    if (error) throw error;
  },
  async deleteFundingAgency(id) {
    const { error } = await supabaseClient.from("funding_agencies").delete().eq("id", id);
    if (error) throw error;
  },

  // ---------------- Projects ----------------
  // Sortable columns exposed to the UI (whitelist — prevents arbitrary order-by).
  PROJECT_SORT_COLUMNS: ["title", "principal_investigator", "designation", "department_name",
    "college_name", "funding_agency_name", "funding_type", "scheme", "project_cost", "start_date", "end_date", "status", "created_at"],

  /**
   * List projects with optional filters, sorting and pagination.
   * @returns { data, count } — count is the total matching rows (for pagination).
   * Omit opts.page/pageSize to fetch everything (used by exports).
   */
  async listProjects(filters = {}, opts = {}) {
    const sortBy = this.PROJECT_SORT_COLUMNS.includes(opts.sortBy) ? opts.sortBy : "created_at";
    const ascending = opts.sortDir === "asc";
    let query = supabaseClient.from("projects_view").select("*", { count: "exact" })
      .order(sortBy, { ascending, nullsFirst: false });

    if (filters.search) {
      const s = filters.search.replace(/[%,]/g, "");
      query = query.or(
        `title.ilike.%${s}%,principal_investigator.ilike.%${s}%,department_name.ilike.%${s}%,college_name.ilike.%${s}%,funding_agency_name.ilike.%${s}%`
      );
    }
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.fundingType) query = query.eq("funding_type", filters.fundingType);
    if (filters.scheme === "__none__") query = query.is("scheme", null);
    else if (filters.scheme) query = query.eq("scheme", filters.scheme);
    if (filters.departmentId) query = query.eq("department_id", filters.departmentId);
    if (filters.collegeId) query = query.eq("college_id", filters.collegeId);
    if (filters.fundingAgencyId) query = query.eq("funding_agency_id", filters.fundingAgencyId);
    if (filters.designation) query = query.eq("designation", filters.designation);
    if (filters.year) {
      query = query.gte("start_date", `${filters.year}-01-01`).lte("start_date", `${filters.year}-12-31`);
    }
    if (filters.durationBucket) {
      const [min, max] = { "0-12": [0, 12], "13-24": [13, 24], "25-36": [25, 36], "37+": [37, null] }[filters.durationBucket] || [];
      if (min !== undefined) query = query.gte("duration_months", min);
      if (max !== null && max !== undefined) query = query.lte("duration_months", max);
    }

    if (opts.page && opts.pageSize) {
      const from = (opts.page - 1) * opts.pageSize;
      query = query.range(from, from + opts.pageSize - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], count: count ?? (data ? data.length : 0) };
  },

  // Returns just the titles (lowercased) of all projects — used for import duplicate checks.
  async listProjectTitles() {
    const { data, error } = await supabaseClient.from("projects").select("title");
    if (error) throw error;
    return new Set((data || []).map(p => (p.title || "").trim().toLowerCase()));
  },
  async getProject(id) {
    const { data, error } = await supabaseClient.from("projects_view").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
  async addProject(payload) {
    const { error } = await supabaseClient.from("projects").insert(payload);
    if (error) throw error;
  },
  async addProjectsBulk(payloads) {
    const { error } = await supabaseClient.from("projects").insert(payloads);
    if (error) throw error;
  },
  async updateProject(id, payload) {
    const { error } = await supabaseClient.from("projects").update(payload).eq("id", id);
    if (error) throw error;
  },
  async deleteProject(id) {
    const { error } = await supabaseClient.from("projects").delete().eq("id", id);
    if (error) throw error;
  },
  async deleteProjectsBulk(ids) {
    if (!ids || !ids.length) return;
    const { error } = await supabaseClient.from("projects").delete().in("id", ids);
    if (error) throw error;
  },

  // ---------------- Users (admin only) ----------------
  async listUsers() {
    const { data, error } = await supabaseClient
      .from("admin_users").select("*").order("created_at");
    if (error) throw error;
    return data;
  },
  async createViewerUser({ email, password, full_name }) {
    const { data, error } = await supabaseClient.functions.invoke("create-user", {
      body: { email, password, full_name }
    });
    // Network/non-2xx errors surface here; try to read the function's message.
    if (error) {
      let msg = error.message || "Failed to create user.";
      try { const body = await error.context?.json?.(); if (body?.error) msg = body.error; } catch (_) {}
      throw new Error(msg);
    }
    if (data && data.ok === false) throw new Error(data.error || "Failed to create user.");
    return data;
  },

  // ---------------- Employees (retirement tracking) ----------------
  async listEmployees() {
    const { data, error } = await supabaseClient.from("employees_view").select("*").order("name");
    if (error) throw error;
    return data;
  },
  async addEmployee(payload) {
    const { error } = await supabaseClient.from("employees").insert(payload);
    if (error) throw error;
  },
  async updateEmployee(id, payload) {
    const { error } = await supabaseClient.from("employees").update(payload).eq("id", id);
    if (error) throw error;
  },
  async deleteEmployee(id) {
    const { error } = await supabaseClient.from("employees").delete().eq("id", id);
    if (error) throw error;
  },

  // ---------------- Dashboard Stats ----------------
  async getDashboardStats() {
    const { data, error } = await supabaseClient.from("projects_view").select("*");
    if (error) throw error;

    const stats = {
      total: data.length,
      ongoing: data.filter(p => p.status === "Ongoing").length,
      completed: data.filter(p => p.status === "Completed").length,
      universityFunded: data.filter(p => p.funding_type === "University Funded").length,
      externalFunded: data.filter(p => p.funding_type === "External Funded").length,
      totalFunding: data.reduce((sum, p) => sum + Number(p.project_cost || 0), 0),
      byStatus: {},
      byFundingType: {}, byFundingTypeCost: {},
      byAgency: {},      byAgencyCost: {},
      byYear: {},        byYearCost: {},
      byCollege: {},     byCollegeCost: {},
      byDept: {},        byDeptCost: {},
      recent: [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
    };

    data.forEach(p => {
      const cost = Number(p.project_cost || 0);
      stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
      if (p.funding_type) {
        stats.byFundingType[p.funding_type] = (stats.byFundingType[p.funding_type] || 0) + 1;
        stats.byFundingTypeCost[p.funding_type] = (stats.byFundingTypeCost[p.funding_type] || 0) + cost;
      }
      const agency = p.funding_agency_name || "Unspecified";
      stats.byAgency[agency] = (stats.byAgency[agency] || 0) + 1;
      stats.byAgencyCost[agency] = (stats.byAgencyCost[agency] || 0) + cost;
      if (p.start_date) {
        const yr = new Date(p.start_date).getFullYear();
        if (!Number.isNaN(yr)) {
          stats.byYear[yr] = (stats.byYear[yr] || 0) + 1;
          stats.byYearCost[yr] = (stats.byYearCost[yr] || 0) + cost;
        }
      }
      const college = p.college_name || "Unspecified";
      stats.byCollege[college] = (stats.byCollege[college] || 0) + 1;
      stats.byCollegeCost[college] = (stats.byCollegeCost[college] || 0) + cost;
      const dept = p.department_name || "Unspecified";
      stats.byDept[dept] = (stats.byDept[dept] || 0) + 1;
      stats.byDeptCost[dept] = (stats.byDeptCost[dept] || 0) + cost;
    });

    return stats;
  }
};
