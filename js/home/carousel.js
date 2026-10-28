window.initProjectCarousel = function () {
  const track = document.getElementById("project-track");
  if (!track) return;
  const slides = [...track.querySelectorAll(".project-slide")];
  const thumbnails = [...document.querySelectorAll("[data-project-index]")];
  const position = document.getElementById("project-position");
  let current = 0;
  let scrollTimer;
  function update(index) {
    current = index;
    thumbnails.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    slides.forEach((slide, i) => {
      slide.inert = i !== index;
      slide
        .querySelectorAll("a")
        .forEach((link) => (link.tabIndex = i === index ? 0 : -1));
    });
    position.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")} — ${slides[index].querySelector("h3").textContent}`;
  }
  function goTo(index, instant = false) {
    update((index + slides.length) % slides.length);
    const reducedMotion =
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("motion-paused");
    track.scrollTo({
      left: current * track.clientWidth,
      behavior: instant || reducedMotion ? "instant" : "smooth",
    });
  }
  document
    .querySelector("[data-project-prev]")
    .addEventListener("click", () => goTo(current - 1));
  document
    .querySelector("[data-project-next]")
    .addEventListener("click", () => goTo(current + 1));
  thumbnails.forEach((button, index) =>
    button.addEventListener("click", () => goTo(index)),
  );
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(current - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(current + 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      goTo(slides.length - 1);
    }
  });
  track.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(
        () =>
          update(
            Math.max(
              0,
              Math.min(
                slides.length - 1,
                Math.round(track.scrollLeft / track.clientWidth),
              ),
            ),
          ),
        150,
      );
    },
    { passive: true },
  );
  const resize = new ResizeObserver(() => goTo(current, true));
  resize.observe(track);
  update(0);
  return () => {
    clearTimeout(scrollTimer);
    resize.disconnect();
  };
};
