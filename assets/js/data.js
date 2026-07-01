/**
 * UHS-PIMS — Data Service Layer
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
  async listProjects(filters = {}) {
    let query = supabaseClient.from("projects_view").select("*").order("created_at", { ascending: false });

    if (filters.search) {
      const s = filters.search.replace(/[%,]/g, "");
      query = query.or(
        `title.ilike.%${s}%,principal_investigator.ilike.%${s}%,department_name.ilike.%${s}%,college_name.ilike.%${s}%,funding_agency_name.ilike.%${s}%`
      );
    }
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.fundingType) query = query.eq("funding_type", filters.fundingType);
    if (filters.departmentId) query = query.eq("department_id", filters.departmentId);
    if (filters.collegeId) query = query.eq("college_id", filters.collegeId);
    if (filters.fundingAgencyId) query = query.eq("funding_agency_id", filters.fundingAgencyId);
    if (filters.year) {
      query = query.gte("start_date", `${filters.year}-01-01`).lte("start_date", `${filters.year}-12-31`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
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
  async updateProject(id, payload) {
    const { error } = await supabaseClient.from("projects").update(payload).eq("id", id);
    if (error) throw error;
  },
  async deleteProject(id) {
    const { error } = await supabaseClient.from("projects").delete().eq("id", id);
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
      byAgency: {},
      recent: [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
    };

    data.forEach(p => {
      stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
      const agency = p.funding_agency_name || "Unspecified";
      stats.byAgency[agency] = (stats.byAgency[agency] || 0) + 1;
    });

    return stats;
  }
};
