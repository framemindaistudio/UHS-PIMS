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
  { key: "employees",  label: "Employees",         icon: "bi-person-badge",  href: "employees.html" },
  { key: "reports",    label: "Reports",           icon: "bi-file-earmark-bar-graph", href: "reports.html" },
  { key: "users",      label: "Users",             icon: "bi-people",        href: "users.html", adminOnly: true },
  { key: "profile",    label: "Profile",           icon: "bi-person-circle", href: "profile.html" },
];

function renderSidebar(activeKey) {
  const mount = document.getElementById("uhs-sidebar-mount");
  if (!mount) return;

  const links = SIDEBAR_LINKS.map(link => `
    <a href="${link.href}" class="uhs-nav-link ${link.key === activeKey ? "active" : ""} ${link.adminOnly ? "admin-only" : ""}">
      <i class="bi ${link.icon}"></i>
      <span>${link.label}</span>
    </a>
  `).join("");

  const brand = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.branding) || {};
  const logoMark = brand.logoUrl
    ? `<div class="logo-circle logo-circle-img"><img src="${brand.logoUrl}" alt="Logo"></div>`
    : `<div class="logo-circle"><i class="bi bi-flower1"></i></div>`;
  const footerName = brand.footerName || "University of Horticultural Sciences";

  mount.innerHTML = `
    <div class="uhs-sidebar" id="uhsSidebar">
      <div class="uhs-sidebar-brand">
        ${logoMark}
        <div class="brand-text">
          <div class="b1">UHS-PIMS</div>
          <div class="b2">Project Information System</div>
        </div>
      </div>
      <nav class="uhs-nav">
        ${links}
        <a href="#" id="helpLink" class="uhs-nav-link mt-3">
          <i class="bi bi-question-circle"></i>
          <span>Help &amp; Guide</span>
        </a>
        <a href="#" id="logoutLink" class="uhs-nav-link text-warning">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </a>
      </nav>
      <div class="uhs-sidebar-footer">
        ${footerName}
      </div>
    </div>
    <div class="uhs-sidebar-overlay" id="uhsSidebarOverlay"></div>
  `;

  document.getElementById("helpLink").addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof Onboarding !== "undefined") {
      Onboarding.open();
    } else {
      // Onboarding script not on this page — go to dashboard where it lives
      window.location.href = SIDEBAR_LINKS[0].href;
    }
  });

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

  // Apply read-only gating for non-admin (viewer) accounts.
  (async () => {
    try {
      if (typeof Auth !== "undefined" && !(await Auth.isAdmin())) {
        document.body.classList.add("role-viewer");
      }
    } catch (_) { /* leave as admin-capable; RLS still enforces writes */ }
  })();
}

function toggleSidebar() {
  document.getElementById("uhsSidebar").classList.toggle("show");
  document.getElementById("uhsSidebarOverlay").classList.toggle("show");
}
