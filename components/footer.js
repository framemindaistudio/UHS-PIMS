/**
 * UHS-RIMS — Footer Component
 * Renders into <div id="uhs-footer-mount"></div>
 */
function renderFooter() {
  const mount = document.getElementById("uhs-footer-mount");
  if (!mount) return;
  const year = new Date().getFullYear();
  const brand = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.branding) || {};
  const univ = brand.footerName || "University of Horticultural Sciences, Bagalkot";
  const appName = brand.appName || "UHS-RIMS";
  mount.innerHTML = `
    <footer class="text-center text-muted small py-3 border-top bg-white">
      &copy; ${year} ${univ} — ${appName}
    </footer>
  `;
}
