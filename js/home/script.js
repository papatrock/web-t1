(() => {
  const body = document.body;
  const menuToggle = document.getElementById("menu-toggle");
  const backdrop = document.querySelector(".menu-backdrop");
  const sidebar = document.getElementById("sidebar");
  const collapseButton = document.querySelector("[data-resize-btn]");
  const mobile = window.matchMedia("(max-width: 760px)");
  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const readSetting = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const saveSetting = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Preferências são opcionais. */
    }
  };

  function closeMenu(returnFocus = false) {
    body.classList.remove("menu-open");
    if (backdrop) backdrop.hidden = true;
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menu");
    if (sidebar) sidebar.inert = mobile.matches;
    if (returnFocus) menuToggle?.focus();
  }
  window.closePortfolioMenu = closeMenu;
  menuToggle?.addEventListener("click", () => {
    if (body.classList.contains("menu-open")) return closeMenu(true);
    body.classList.add("menu-open");
    backdrop.hidden = false;
    sidebar.inert = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu");
    sidebar.querySelector("a").focus();
  });
  backdrop?.addEventListener("click", () => closeMenu(true));
  sidebar?.addEventListener("click", (event) => {
    if (event.target.closest("a") && mobile.matches) closeMenu(true);
  });
  document.addEventListener("keydown", (event) => {
    if (!body.classList.contains("menu-open")) return;
    if (event.key === "Escape") closeMenu(true);
    if (event.key === "Tab") {
      const items = [...sidebar.querySelectorAll("a, button")].filter(
        (element) => element.getClientRects().length,
      );
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  function setCollapsed(collapsed) {
    body.classList.toggle("sidebar-collapsed", collapsed && !mobile.matches);
    collapseButton?.setAttribute("aria-expanded", String(!collapsed));
    collapseButton?.setAttribute(
      "aria-label",
      collapsed ? "Expandir navegação" : "Recolher navegação",
    );
  }
  collapseButton?.addEventListener("click", () => {
    const collapsed = !body.classList.contains("sidebar-collapsed");
    setCollapsed(collapsed);
    saveSetting("portfolio-sidebar", String(collapsed));
  });
  function syncViewport() {
    closeMenu();
    setCollapsed(readSetting("portfolio-sidebar") === "true");
  }
  mobile.addEventListener("change", syncViewport);
  syncViewport();

  const motionToggle = document.getElementById("motion-toggle");
  function setMotion(paused) {
    document.documentElement.classList.toggle("motion-paused", paused);
    motionToggle?.setAttribute("aria-pressed", String(paused));
    motionToggle?.setAttribute(
      "title",
      paused ? "Ativar animações" : "Pausar animações",
    );
    const label = document.getElementById("motion-label");
    if (label) label.textContent = paused ? "animações off" : "animações on";
  }
  setMotion(
    readSetting("portfolio-motion") === "paused" || motionPreference.matches,
  );
  motionPreference.addEventListener("change", () =>
    setMotion(
      motionPreference.matches || readSetting("portfolio-motion") === "paused",
    ),
  );
  motionToggle?.addEventListener("click", () => {
    const paused =
      !document.documentElement.classList.contains("motion-paused");
    saveSetting("portfolio-motion", paused ? "paused" : "running");
    setMotion(paused);
  });
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
