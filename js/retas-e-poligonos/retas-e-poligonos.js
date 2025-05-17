

var ctx = document.getElementById("canvas").getContext("2d");
var offset = 0;

let vertices = [];
let lines = [];

let dragging = { lineIdx: null, point: null, vertexIdx: null };

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    lines.forEach(line => {
        const a = vertices[line.v1];
        const b = vertices[line.v2];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    vertices.forEach(v => {
        ctx.fillStyle = "gray";
        ctx.beginPath();
        ctx.arc(v.x, v.y, 7, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function getMousePos(evt) {
    const rect = ctx.canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function isNearPoint(mx, my, px, py, radius = 5) {
    return Math.hypot(mx - px, my - py) < radius;
}

function isNearLine(mx, my, line, tolerance = 8) {
    // Calcula distância ponto-reta
    const { x1, y1, x2, y2 } = line;
    const A = mx - x1;
    const B = my - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dist = Math.hypot(mx - xx, my - yy);
    return { near: dist < tolerance, px: xx, py: yy, t: param };
}

ctx.canvas.addEventListener("mousedown", function(evt) {
    const { x, y } = getMousePos(evt);
    for (let i = 0; i < vertices.length; i++) {
        if (isNearPoint(x, y, vertices[i].x, vertices[i].y, 10)) {
            dragging.vertexIdx = i;
            return;
        }
    }
});

ctx.canvas.addEventListener("mousemove", function(evt) {
    if (dragging.vertexIdx !== null) {
        const { x, y } = getMousePos(evt);
        vertices[dragging.vertexIdx].x = x;
        vertices[dragging.vertexIdx].y = y;
        draw();
    }
});

ctx.canvas.addEventListener("mouseup", function() {
    dragging.vertexIdx = null;
});

ctx.canvas.addEventListener("contextmenu", function(evt) {
    evt.preventDefault();
    const { x, y } = getMousePos(evt);
    for (let i = 0; i < lines.length; i++) {
        const a = vertices[lines[i].v1];
        const b = vertices[lines[i].v2];
        const res = isNearLine(x, y, { x1: a.x, y1: a.y, x2: b.x, y2: b.y });
        if (res.near && res.t > 0.1 && res.t < 0.9) {
            // Distância do "buraco" ao redor do ponto de clique
            const gapSize = 15;

            // Direção da linha
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy);
            const dirX = dx / len;
            const dirY = dy / len;

            // Ponto antes do clique
            const px1 = res.px - dirX * gapSize;
            const py1 = res.py - dirY * gapSize;

            // Ponto depois do clique
            const px2 = res.px + dirX * gapSize;
            const py2 = res.py + dirY * gapSize;

            const idx1 = vertices.length;
            const idx2 = vertices.length + 1;
            vertices.push({ x: px1, y: py1 });
            vertices.push({ x: px2, y: py2 });

            const old = lines[i];
            // Substitui a linha original por duas novas com espaço entre elas
            lines.splice(i, 1,
                { v1: old.v1, v2: idx1 },
                { v1: idx2, v2: old.v2 }
            );
            draw();
            break;
        }
    }
});


function gerarPoligono(n) {
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;
    const r = Math.min(cx, cy) * 0.7;
    vertices = [];
    lines = [];
    for (let i = 0; i < n; i++) {
        const ang = 2 * Math.PI * i / n - Math.PI / 2;
        vertices.push({
            x: cx + r * Math.cos(ang),
            y: cy + r * Math.sin(ang)
        });
    }
    for (let i = 0; i < n; i++) {
        lines.push({
            v1: i,
            v2: (i + 1) % n
        });
    }
}

window.onload = function() {
    let n = 0;
    while (n < 3 || n > 8) {
        n = parseInt(prompt("Digite o número de lados do polígono (3 a 8):"), 10);
        if (isNaN(n)) n = 0;
    }
    gerarPoligono(n);
    draw();
};

//draw();