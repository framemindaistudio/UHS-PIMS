/**
 * UHS-PIMS — First-time Onboarding Guide
 * Shows a step-by-step welcome tour the first time the app is opened on a
 * device/browser (tracked in localStorage, per role). Content adapts to the
 * signed-in user's role: admins get the full workflow tour, read-only
 * viewers get a browse/report-focused tour. Replayable anytime via
 * Onboarding.open() (wired to the sidebar "Help & Guide" link).
 */
const Onboarding = {
  STORAGE_KEY: "uhs-pims:onboarded:v2",

  // Full tour for admins (read + write).
  ADMIN_STEPS: [
    {
      icon: "bi-flower1",
      title: "Welcome to UHS-PIMS",
      text: "Your central hub for managing every horticultural research project — from proposal to publication. This quick guide walks you through how everything fits together. It takes about a minute."
    },
    {
      icon: "bi-bank2",
      title: "Step 1 — Set up your master data",
      text: "Start under <b>Colleges</b>, then <b>Departments</b> (each links to a college), then <b>Funding Agencies</b> (ICAR, DST, University, etc.). Setting these up first means they're ready to pick from when you add projects."
    },
    {
      icon: "bi-flower3",
      title: "Step 2 — Add & manage projects",
      text: "Go to <b>Projects → Add Project</b> to record a study: title, investigators, designation, department, funding, cost, timeline and status. Use the search box and filters to find any project instantly, and the pencil/trash icons to edit or remove."
    },
    {
      icon: "bi-speedometer2",
      title: "Step 3 — Read your dashboard",
      text: "The <b>Dashboard</b> gives you live totals, total sanctioned funding, status and funding-agency charts, and your most recent projects — updated automatically as you add data."
    },
    {
      icon: "bi-file-earmark-bar-graph",
      title: "Step 4 — Generate reports",
      text: "Under <b>Reports</b>, filter by year, status, funding type, department, college, designation or duration, then export the result to <b>PDF</b> or <b>Excel</b> in one click — ready to share or print."
    },
    {
      icon: "bi-person-circle",
      title: "Step 5 — Your account & users",
      text: "Open <b>Profile</b> to change your password. New accounts are created in Supabase and default to read-only; an admin promotes them if needed. Replay this guide anytime from <b>Help &amp; Guide</b> in the sidebar."
    }
  ],

  // Focused tour for read-only viewers (no create/edit/delete).
  VIEWER_STEPS: [
    {
      icon: "bi-flower1",
      title: "Welcome to UHS-PIMS",
      text: "You have <b>read-only access</b> — you can browse every research project and generate reports, but not add or change data. Here's a quick tour of what you can do. It takes under a minute."
    },
    {
      icon: "bi-search",
      title: "Browse & search projects",
      text: "Open <b>Projects</b> to see all research projects. Use the search box and the status / funding / department filters to find exactly what you need, and click a project to view its full details."
    },
    {
      icon: "bi-speedometer2",
      title: "Read the dashboard",
      text: "The <b>Dashboard</b> shows live totals, total sanctioned funding, and status &amp; funding-agency charts — a quick overview of the whole research portfolio."
    },
    {
      icon: "bi-file-earmark-bar-graph",
      title: "Generate & export reports",
      text: "Under <b>Reports</b>, filter by year, status, funding type, department, college, designation or duration, then export to <b>PDF</b> or <b>Excel</b> in one click."
    },
    {
      icon: "bi-person-circle",
      title: "Your account",
      text: "Open <b>Profile</b> to change your password. To add or edit project data, contact your DR Office administrator. Replay this guide anytime from <b>Help &amp; Guide</b> in the sidebar."
    }
  ],

  steps: [],
  _current: 0,
  _modal: null,
  _role: "admin",
  _storageKey: null,

  async _resolve() {
    let role = "admin";
    try { if (typeof Auth !== "undefined") role = (await Auth.getRole()) || "admin"; } catch (_) {}
    this._role = role;
    this.steps = role === "admin" ? this.ADMIN_STEPS : this.VIEWER_STEPS;
    this._storageKey = this.STORAGE_KEY + ":" + role;
  },

  _ensureDom() {
    if (document.getElementById("uhsOnboarding")) return;
    const wrap = document.createElement("div");
    wrap.className = "modal fade";
    wrap.id = "uhsOnboarding";
    wrap.tabIndex = -1;
    wrap.setAttribute("data-bs-backdrop", "static");
    wrap.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content uhs-onboard">
          <button type="button" class="uhs-onboard-skip" id="uhsOnboardSkip">Skip</button>
          <div class="uhs-onboard-body">
            <div class="uhs-onboard-icon"><i class="bi" id="uhsOnboardIcon"></i></div>
            <h4 id="uhsOnboardTitle"></h4>
            <p id="uhsOnboardText"></p>
          </div>
          <div class="uhs-onboard-foot">
            <div class="uhs-onboard-dots" id="uhsOnboardDots"></div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary btn-sm px-3" id="uhsOnboardBack">Back</button>
              <button type="button" class="btn btn-uhs-primary btn-sm px-3" id="uhsOnboardNext">Next</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    this._modal = new bootstrap.Modal(wrap);
    document.getElementById("uhsOnboardSkip").addEventListener("click", () => this._finish());
    document.getElementById("uhsOnboardBack").addEventListener("click", () => this._go(this._current - 1));
    document.getElementById("uhsOnboardNext").addEventListener("click", () => {
      if (this._current === this.steps.length - 1) this._finish();
      else this._go(this._current + 1);
    });
  },

  _render() {
    const s = this.steps[this._current];
    document.getElementById("uhsOnboardIcon").className = "bi " + s.icon;
    document.getElementById("uhsOnboardTitle").textContent = s.title;
    document.getElementById("uhsOnboardText").innerHTML = s.text;
    document.getElementById("uhsOnboardBack").style.visibility = this._current === 0 ? "hidden" : "visible";
    document.getElementById("uhsOnboardNext").textContent =
      this._current === this.steps.length - 1 ? "Get started" : "Next";
    document.getElementById("uhsOnboardDots").innerHTML =
      this.steps.map((_, i) => `<span class="dot ${i === this._current ? "active" : ""}"></span>`).join("");
  },

  _go(i) {
    this._current = Math.max(0, Math.min(this.steps.length - 1, i));
    this._render();
  },

  _finish() {
    try { localStorage.setItem(this._storageKey || (this.STORAGE_KEY + ":" + this._role), "1"); } catch (_) {}
    this._modal?.hide();
  },

  /** Manually open the tour from step 0 (used by the Help link). */
  async open() {
    await this._resolve();
    this._ensureDom();
    this._current = 0;
    this._render();
    this._modal.show();
  },

  /** Auto-show on first visit for this device/browser + role. */
  async init() {
    await this._resolve();
    let seen = null;
    try { seen = localStorage.getItem(this._storageKey); } catch (_) {}
    if (!seen) this.open();
  }
};
