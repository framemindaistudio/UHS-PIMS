/**
 * UHS-PIMS — Topbar Component
 * Renders into <div id="uhs-topbar-mount"></div>
 * Usage: renderTopbar("Dashboard")
 */
async function renderTopbar(title) {
  const mount = document.getElementById("uhs-topbar-mount");
  if (!mount) return;

  mount.innerHTML = `
    <div class="uhs-topbar">
      <div class="d-flex align-items-center gap-2">
        <button class="uhs-sidebar-toggle" onclick="toggleSidebar()">
          <i class="bi bi-list"></i>
        </button>
        <h1>${title}</h1>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="d-none d-sm-inline text-muted small" id="uhsUserEmail"></span>
        <div class="logo-circle bg-success-subtle text-success d-flex align-items-center justify-content-center rounded-circle" style="width:36px;height:36px;">
          <i class="bi bi-person-fill"></i>
        </div>
      </div>
    </div>
  `;

  const email = await Auth.currentUserEmail();
  const el = document.getElementById("uhsUserEmail");
  if (el) el.textContent = email;
}
