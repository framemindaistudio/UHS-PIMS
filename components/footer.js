/**
 * UHS-PIMS — Footer Component
 * Renders into <div id="uhs-footer-mount"></div>
 */
function renderFooter() {
  const mount = document.getElementById("uhs-footer-mount");
  if (!mount) return;
  const year = new Date().getFullYear();
  mount.innerHTML = `
    <footer class="text-center text-muted small py-3 border-top bg-white">
      &copy; ${year} University of Horticultural Sciences — UHS-PIMS
    </footer>
  `;
}
