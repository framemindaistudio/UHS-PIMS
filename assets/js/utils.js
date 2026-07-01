/**
 * UHS-PIMS — Shared Utilities
 */
const Utils = {
  formatCurrency(value) {
    if (value === null || value === undefined) return "—";
    return "₹" + Number(value).toLocaleString("en-IN");
  },

  formatCurrencyCompact(value) {
    const n = Number(value || 0);
    if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2).replace(/\.00$/, "") + " Cr";
    if (n >= 100000)   return "₹" + (n / 100000).toFixed(2).replace(/\.00$/, "") + " L";
    return "₹" + n.toLocaleString("en-IN");
  },

  formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  },

  statusBadge(status) {
    const map = {
      Ongoing: "badge-ongoing",
      Completed: "badge-completed",
      Proposed: "badge-proposed",
      Terminated: "badge-terminated"
    };
    const cls = map[status] || "badge-ongoing";
    return `<span class="badge-status ${cls}">${status}</span>`;
  },

  debounce(fn, delay = 350) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

  toast(message, type = "success") {
    const containerId = "uhsToastContainer";
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "toast-container position-fixed bottom-0 end-0 p-3";
      container.style.zIndex = 1080;
      document.body.appendChild(container);
    }
    const config = {
      success: { cls: "uhs-toast-success", icon: "bi-check-circle-fill" },
      error:   { cls: "uhs-toast-error",   icon: "bi-exclamation-octagon-fill" },
      warning: { cls: "uhs-toast-warning", icon: "bi-exclamation-triangle-fill" }
    }[type] || { cls: "uhs-toast-success", icon: "bi-check-circle-fill" };

    const delay = 3500;
    const toastEl = document.createElement("div");
    toastEl.className = `toast uhs-toast ${config.cls} border-0`;
    toastEl.setAttribute("role", "alert");
    toastEl.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi ${config.icon} uhs-toast-icon"></i>
        <div class="toast-body flex-grow-1">${this.escapeHtml(message)}</div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
      <div class="uhs-toast-progress" style="animation-duration:${delay}ms;"></div>`;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  },

  /**
   * Promise-based styled confirmation dialog — replaces native confirm().
   * Resolves true if confirmed, false otherwise.
   */
  confirm({ title = "Are you sure?", message = "", confirmText = "Confirm", cancelText = "Cancel", danger = false, icon = "bi-question-circle" } = {}) {
    return new Promise((resolve) => {
      const id = "uhsConfirmModal";
      document.getElementById(id)?.remove();

      const wrap = document.createElement("div");
      wrap.className = "modal fade";
      wrap.id = id;
      wrap.tabIndex = -1;
      wrap.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-body text-center p-4">
              <div class="uhs-confirm-icon ${danger ? "danger" : ""}"><i class="bi ${icon}"></i></div>
              <h6 class="fw-bold mt-3 mb-1">${this.escapeHtml(title)}</h6>
              <p class="text-muted small mb-4">${this.escapeHtml(message)}</p>
              <div class="d-flex gap-2 justify-content-center">
                <button type="button" class="btn btn-outline-secondary px-4" data-uhs-cancel>${this.escapeHtml(cancelText)}</button>
                <button type="button" class="btn ${danger ? "btn-danger" : "btn-uhs-primary"} px-4" data-uhs-ok>${this.escapeHtml(confirmText)}</button>
              </div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(wrap);
      const modal = new bootstrap.Modal(wrap);
      let result = false;
      wrap.querySelector("[data-uhs-ok]").addEventListener("click", () => { result = true; modal.hide(); });
      wrap.querySelector("[data-uhs-cancel]").addEventListener("click", () => modal.hide());
      wrap.addEventListener("hidden.bs.modal", () => { wrap.remove(); resolve(result); });
      modal.show();
    });
  },

  /**
   * Returns HTML string of shimmer skeleton rows for a loading table.
   */
  skeletonRows(cols, rows = 5) {
    const cell = `<td><span class="uhs-skeleton"></span></td>`;
    const row = `<tr class="uhs-skeleton-row">${cell.repeat(cols)}</tr>`;
    return row.repeat(rows);
  },

  computeDurationMonths(start, end) {
    if (!start || !end) return null;
    const s = new Date(start), e = new Date(end);
    return Math.max(0, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()));
  },

  getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
};
