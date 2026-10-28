const routes = {
  "/": {
    page: "pages/home.html",
    css: "css/home/style.css",
    script: "js/home/carousel.js",
    init: "initProjectCarousel",
    title: "Início",
    nav: "/homepol",
  },
  "/homepol": {
    page: "pages/home.html",
    css: "css/home/style.css",
    script: "js/home/carousel.js",
    init: "initProjectCarousel",
    title: "Início",
  },
  "/sobre": {
    page: "pages/sobre.html",
    css: "css/sobre/style.css",
    title: "Sobre mim",
  },
  "/projetos": {
    page: "pages/projetos.html",
    css: "css/projetos/style.css",
    title: "Projetos",
  },
  "/contato": { page: "pages/contato.html", title: "Contato" },
  "/galeria": {
    page: "pages/galeria.html",
    css: "css/galeria/style.css",
    title: "Galeria",
  },
  "/meta": {
    page: "pages/meta.html",
    css: "css/meta/style.css",
    title: "Meta",
  },
  "/visualizator": {
    page: "pages/visualizator.html",
    css: "css/visualizator/style.css",
    title: "Visualizator",
    script: "js/visualizator/visualizator.js",
    init: "initVisualizer",
  },
  "/minicoin": {
    page: "pages/miniCoin.html",
    css: "css/minicoin/style.css",
    title: "MiniCoin",
  },
  "/retas-e-poligonos": {
    page: "pages/poligonos.html",
    css: "css/retas-e-poligonos/style.css",
    title: "Retas e polígonos",
    script: "js/retas-e-poligonos/retas-e-poligonos.js",
    init: "initPolygons",
  },
};
let disposeRoute = () => {};
let routeRequest;
let navigationVersion = 0;
const scriptCache = new Map();
function loadScript(src) {
  if (!scriptCache.has(src)) {
    const pending = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        scriptCache.delete(src);
        reject(new Error("Falha ao carregar o experimento."));
      };
      document.body.appendChild(script);
    });
    scriptCache.set(src, pending);
  }
  return scriptCache.get(src);
}
async function loadRoute() {
  const version = ++navigationVersion;
  disposeRoute();
  disposeRoute = () => {};
  routeRequest?.abort();
  routeRequest = new AbortController();
  const path = window.location.hash.slice(1) || "/";
  const route = routes[path];
  const app = document.getElementById("app");
  window.closePortfolioMenu?.();
  app.setAttribute("aria-busy", "true");
  app.innerHTML =
    '<p class="route-loading">&gt; carregando<span class="cursor">_</span></p>';
  document.querySelectorAll("[data-route]").forEach((link) => {
    const active = link.dataset.route === (route?.nav || path);
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.getElementById("current-page").textContent =
    route?.title.toLocaleLowerCase("pt-BR") || "404";
  document.title = `${route?.title || "Página não encontrada"} — Patrick Lemes`;
  try {
    if (!route) throw new Error("Página não encontrada");
    const response = await fetch(route.page, { signal: routeRequest.signal });
    if (!response.ok) throw new Error("Página não encontrada");
    const html = await response.text();
    if (version !== navigationVersion) return;
    document.getElementById("page-css")?.remove();
    if (route.css) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = route.css;
      css.id = "page-css";
      const ready = new Promise((resolve) => {
        css.onload = resolve;
        css.onerror = resolve;
      });
      document.head.appendChild(css);
      await ready;
    }
    if (version !== navigationVersion) return;
    app.innerHTML = html;
    app.dataset.page = path;
    if (path === "/galeria") window.initGallery?.();
    if (route.script) {
      await loadScript(route.script);
      if (version !== navigationVersion) return;
      const cleanup = window[route.init]?.();
      if (typeof cleanup === "function") disposeRoute = cleanup;
    }
    app.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (error) {
    if (error.name === "AbortError" || version !== navigationVersion) return;
    app.innerHTML =
      '<div class="error-state"><div class="eyebrow">Erro de conexão ou rota</div><h1>Ops, esse caminho não carregou.</h1><p>Tente novamente. Para abrir o projeto localmente, use um servidor HTTP.</p><a class="button" href="#/homepol">Voltar ao início →</a></div>';
    app.focus({ preventScroll: true });
    console.error(error);
  } finally {
    if (version === navigationVersion) app.removeAttribute("aria-busy");
  }
}
window.addEventListener("hashchange", loadRoute);
window.addEventListener("DOMContentLoaded", loadRoute);
