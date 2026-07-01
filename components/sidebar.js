/**
 * UHS-PIMS — Sidebar Component
 * Renders the left navigation sidebar into <div id="uhs-sidebar-mount"></div>
 * Usage: call renderSidebar("dashboard") with the current page key.
 */
const SIDEBAR_LINKS = [
  { key: "dashboard",  label: "Dashboard",        icon: "bi-speedometer2",   href: "dashboard.html" },
  { key: "projects",   label: "Projects",          icon: "bi-flower3",       href: "projects.html" },
  { key: "departments",label: "Departments",       icon: "bi-diagram-3",     href: "departments.html" },
  { key: "colleges",   label: "Colleges",          icon: "bi-bank2",         href: "colleges.html" },
  { key: "funding",    label: "Funding Agencies",  icon: "bi-cash-coin",     href: "funding.html" },
  { key: "reports",    label: "Reports",           icon: "bi-file-earmark-bar-graph", href: "reports.html" },
  { key: "profile",    label: "Profile",           icon: "bi-person-circle", href: "profile.html" },
];

function renderSidebar(activeKey) {
  const mount = document.getElementById("uhs-sidebar-mount");
  if (!mount) return;

  const links = SIDEBAR_LINKS.map(link => `
    <a href="${link.href}" class="uhs-nav-link ${link.key === activeKey ? "active" : ""}">
      <i class="bi ${link.icon}"></i>
      <span>${link.label}</span>
    </a>
  `).join("");

  mount.innerHTML = `
    <div class="uhs-sidebar" id="uhsSidebar">
      <div class="uhs-sidebar-brand">
        <div class="logo-circle"><i class="bi bi-flower1"></i></div>
        <div class="brand-text">
          <div class="b1">UHS-PIMS</div>
          <div class="b2">Project Information System</div>
        </div>
      </div>
      <nav class="uhs-nav">
        ${links}
        <a href="#" id="logoutLink" class="uhs-nav-link text-warning mt-3">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </a>
      </nav>
      <div class="uhs-sidebar-footer">
        University of Horticultural Sciences
      </div>
    </div>
    <div class="uhs-sidebar-overlay" id="uhsSidebarOverlay"></div>
  `;

  document.getElementById("logoutLink").addEventListener("click", async (e) => {
    e.preventDefault();
    const ok = await Utils.confirm({
      title: "Log out?",
      message: "You'll need to sign in again to access UHS-PIMS.",
      confirmText: "Log out",
      danger: true,
      icon: "bi-box-arrow-right"
    });
    if (ok) await Auth.logout();
  });

  const overlay = document.getElementById("uhsSidebarOverlay");
  overlay.addEventListener("click", () => {
    document.getElementById("uhsSidebar").classList.remove("show");
    overlay.classList.remove("show");
  });
}

function toggleSidebar() {
  document.getElementById("uhsSidebar").classList.toggle("show");
  document.getElementById("uhsSidebarOverlay").classList.toggle("show");
}
