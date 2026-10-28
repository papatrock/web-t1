window.initGallery = function () {
  const container = document.getElementById("gallery-container");
  const dialog = document.getElementById("photo-dialog");
  const expanded = document.getElementById("expanded-photo");
  const counter = document.getElementById("photo-counter");
  if (!container || !dialog) return;
  // O registro 62 do acervo original usa GIF.
  const photoSource = (number) =>
    `images/galeria/${number}.${number === 62 ? "gif" : "jpg"}`;
  let current = 1;
  function showPhoto(number) {
    current = ((number - 1 + 66) % 66) + 1;
    expanded.src = photoSource(current);
    expanded.alt = `Fotografia ${current} da galeria de Patrick Lemes`;
    counter.textContent = `${String(current).padStart(2, "0")} / 66`;
  }
  const fragment = document.createDocumentFragment();
  for (let number = 1; number <= 66; number++) {
    const button = document.createElement("button");
    button.className = "gallery-item";
    button.setAttribute("aria-label", `Ampliar fotografia ${number}`);
    const img = document.createElement("img");
    img.src = photoSource(number);
    img.alt = `Fotografia ${number} da galeria`;
    img.loading = "lazy";
    img.decoding = "async";
    const label = document.createElement("span");
    label.textContent = String(number).padStart(2, "0");
    label.setAttribute("aria-hidden", "true");
    button.append(img, label);
    button.addEventListener("click", () => {
      showPhoto(number);
      dialog.showModal();
    });
    fragment.appendChild(button);
  }
  container.replaceChildren(fragment);
  const previousOverflow = document.body.style.overflow;
  container.addEventListener("click", () => {
    if (dialog.open) document.body.style.overflow = "hidden";
  });
  dialog.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
  });
  // O diálogo também pode ser removido pela navegação do histórico.
  window.addEventListener(
    "hashchange",
    () => {
      document.body.style.overflow = previousOverflow;
    },
    { once: true },
  );
  dialog
    .querySelector("[data-photo-close]")
    .addEventListener("click", () => dialog.close());
  dialog
    .querySelector("[data-photo-prev]")
    .addEventListener("click", () => showPhoto(current - 1));
  dialog
    .querySelector("[data-photo-next]")
    .addEventListener("click", () => showPhoto(current + 1));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(current - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(current + 1);
    }
  });
};
