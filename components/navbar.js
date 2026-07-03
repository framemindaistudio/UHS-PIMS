/**
 * UHS-RIMS — Topbar Component
 * Renders into <div id="uhs-topbar-mount"></div>
 * Usage: renderTopbar("Dashboard")
 */
async function renderTopbar(title) {
  const mount = document.getElementById("uhs-topbar-mount");
  if (!mount) return;

  const brand = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.branding) || {};
  const university = brand.university
    || (typeof APP_CONFIG !== "undefined" && APP_CONFIG.university)
    || "University of Horticultural Sciences, Bagalkot";

  mount.innerHTML = `
    <div class="uhs-topbar">
      <div class="d-flex align-items-center gap-2">
        <button class="uhs-sidebar-toggle" onclick="toggleSidebar()">
          <i class="bi bi-list"></i>
        </button>
        <div class="uhs-topbar-titles">
          <h1>${title}</h1>
          <div class="uhs-topbar-univ">${university}</div>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="uhs-theme-toggle" id="uhsThemeToggle" title="Toggle dark mode" aria-label="Toggle dark mode">
          <i class="bi bi-moon-stars"></i>
        </button>
        <span class="d-none d-sm-inline text-muted small" id="uhsUserEmail"></span>
        <div class="logo-circle bg-success-subtle text-success d-flex align-items-center justify-content-center rounded-circle" style="width:36px;height:36px;">
          <i class="bi bi-person-fill"></i>
        </div>
      </div>
    </div>
  `;

  // Theme toggle — reflect current theme and swap on click.
  const themeBtn = document.getElementById("uhsThemeToggle");
  if (themeBtn && typeof Theme !== "undefined") {
    const setIcon = () => {
      themeBtn.innerHTML = Theme.get() === "dark"
        ? `<i class="bi bi-sun"></i>`
        : `<i class="bi bi-moon-stars"></i>`;
    };
    setIcon();
    themeBtn.addEventListener("click", () => { Theme.toggle(); setIcon(); });
  }

  const email = await Auth.currentUserEmail();
  const el = document.getElementById("uhsUserEmail");
  if (el) el.textContent = email;
}
