window.initPolygons = function () {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const selector = document.getElementById("polygon-sides");
  const cutButton = document.getElementById("polygon-cut");
  const feedback = document.getElementById("polygon-feedback");
  let vertices = [],
    lines = [],
    dragged = null,
    cutMode = false;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#c28cdd";
    ctx.lineWidth = 3;
    lines.forEach((line) => {
      const a = vertices[line.v1],
        b = vertices[line.v2];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    vertices.forEach((v, i) => {
      ctx.fillStyle = "#c28cdd";
      ctx.beginPath();
      ctx.arc(v.x, v.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a6a0ad";
      ctx.font = "14px monospace";
      ctx.fillText(String(i + 1).padStart(2, "0"), v.x + 16, v.y + 5);
    });
    feedback.textContent = `${vertices.length} vértices / ${lines.length} arestas`;
  }
  function reset() {
    const n = Number(selector.value),
      cx = canvas.width / 2,
      cy = canvas.height / 2,
      radius = 200;
    vertices = Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
    lines = vertices.map((_, i) => ({ v1: i, v2: (i + 1) % n }));
    dragged = null;
    draw();
  }
  function position(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  }
  function cut(point) {
    const tolerance =
      (14 * canvas.width) / canvas.getBoundingClientRect().width;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i],
        a = vertices[line.v1],
        b = vertices[line.v2];
      const dx = b.x - a.x,
        dy = b.y - a.y,
        length = Math.hypot(dx, dy);
      if (!length) continue;
      const t =
        ((point.x - a.x) * dx + (point.y - a.y) * dy) / (length * length);
      const x = a.x + t * dx,
        y = a.y + t * dy;
      if (
        t > 0.1 &&
        t < 0.9 &&
        Math.hypot(point.x - x, point.y - y) < tolerance
      ) {
        const gap = Math.min(15, length * 0.08),
          index = vertices.length;
        vertices.push(
          { x: x - (dx / length) * gap, y: y - (dy / length) * gap },
          { x: x + (dx / length) * gap, y: y + (dy / length) * gap },
        );
        lines.splice(
          i,
          1,
          { v1: line.v1, v2: index },
          { v1: index + 1, v2: line.v2 },
        );
        draw();
        return;
      }
    }
    feedback.textContent = "Toque mais perto de uma aresta para cortar.";
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const point = position(event);
    if (cutMode) return cut(point);
    const tolerance =
      (20 * canvas.width) / canvas.getBoundingClientRect().width;
    const index = vertices.findIndex(
      (v) => Math.hypot(v.x - point.x, v.y - point.y) < tolerance,
    );
    if (index !== -1) {
      dragged = index;
      canvas.setPointerCapture(event.pointerId);
    }
  });
  canvas.addEventListener("pointermove", (event) => {
    if (dragged === null) return;
    const point = position(event);
    vertices[dragged] = {
      x: Math.max(12, Math.min(canvas.width - 30, point.x)),
      y: Math.max(12, Math.min(canvas.height - 12, point.y)),
    };
    draw();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
    canvas.addEventListener(type, () => {
      dragged = null;
    }),
  );
  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    cut(position(event));
  });
  cutButton.addEventListener("click", () => {
    cutMode = !cutMode;
    cutButton.setAttribute("aria-pressed", String(cutMode));
    cutButton.textContent = cutMode ? "✂ Modo: cortar" : "✂ Modo: mover";
    canvas.style.cursor = cutMode ? "crosshair" : "grab";
  });
  selector.addEventListener("change", reset);
  document.getElementById("polygon-reset").addEventListener("click", reset);
  canvas.style.cursor = "grab";
  reset();
};
