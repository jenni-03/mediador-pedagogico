// src/shared/utils/draw/hashTableDrawActions.ts
import * as d3 from "d3";

/* ---------- Tipos ---------- */
export interface HashNode {
  key: number;
  value: number;
}

export interface StyleConfig {
  bucketWidth: number;
  bucketHeight: number;
  nodeWidth: number;
  nodeHeight: number;
  padding: number;
  bucketGradientFrom: string;
  bucketGradientTo: string;
  nodeGradientFrom: string;
  nodeGradientTo: string;
  shadowColor: string;
  shadowBlur: number;
  bucketStroke: string;
  nodeStroke: string;
  textColor: string;
  fontSize: number;
  radius: number;
  nodeFill: string;
  hitFill: string;
}

/* ---------- Estilo por defecto ---------- */
export const DEFAULT_STYLE: StyleConfig = {
  bucketWidth: 130,
  bucketHeight: 54,
  nodeWidth: 96,
  nodeHeight: 44,
  padding: 26,

  // bucket: degradado vertical “glass”
  bucketGradientFrom: "rgba(99,102,241,.35)", // indigo‑500/40
  bucketGradientTo: "rgba(30,41,59,.60)", // slate‑800/60

  // node: degradado horizontal “cristal”
  nodeGradientFrom: "rgba(56,189,248,.55)", // sky‑400/55
  nodeGradientTo: "rgba(20,184,166,.55)", // teal‑500/55

  shadowColor: "#000",
  shadowBlur: 8,

  bucketStroke: "rgba(165,180,252,.45)", // indigo‑200/45
  nodeStroke: "rgba(203,213,225,.65)", // slate‑300/65
  textColor: "#e2e8f0", // slate‑200
  fontSize: 14,
  radius: 14,

  nodeFill: "#0f172a", // fallback fill (slate‑950)
  hitFill: "#16ff70", // verde neón para GET
};

/* ---------- helpers ---------- */
type FlatNode = HashNode & { bucketIdx: number; order: number };
export const flatten = (b: HashNode[][]): FlatNode[] =>
  b.flatMap((bucket, i) =>
    bucket.map((n, j) => ({ ...n, bucketIdx: i, order: j }))
  );

/* nuevas utilidades de posición */
export function posX(d: FlatNode, s: StyleConfig) {
  return (
    d.bucketIdx * (s.bucketWidth + s.padding) +
    s.padding +
    (s.bucketWidth - s.nodeWidth) / 2
  );
}
const nodeExtraGap = 8; // px adicionales entre nodos

export function posY(d: FlatNode, s: StyleConfig) {
  return (
    s.padding * 1.5 +
    s.bucketHeight +
    s.padding +
    d.order * (s.nodeHeight + s.padding + nodeExtraGap)
  );
}

/* ---------- drawHashTable ---------- */
export function drawHashTable(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  buckets: HashNode[][],
  memory: number[], // ← direcciones de cada bucket
  style?: Partial<StyleConfig>
) {
  /* fusiona estilos */
  const s: StyleConfig = { ...DEFAULT_STYLE, ...(style ?? {}) };
  const {
    bucketWidth,
    bucketHeight,
    nodeWidth,
    nodeHeight,
    padding,
    bucketGradientFrom,
    bucketGradientTo,
    nodeGradientFrom,
    nodeGradientTo,
    shadowColor,
    shadowBlur,
    bucketStroke,
    nodeStroke,
    textColor,
    fontSize,
    radius,
  } = s;

  /* ---------- defs (una vez) ---------- */
  if (svg.select("defs").empty()) {
    const defs = svg.append("defs");

    defs
      .append("filter")
      .attr("id", "ht-shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", shadowBlur)
      .attr("flood-color", shadowColor)
      .attr("flood-opacity", 0.4);

    const gB = defs
      .append("linearGradient")
      .attr("id", "bucketGrad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gB.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", bucketGradientFrom);
    gB.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", bucketGradientTo);

    const gN = defs
      .append("linearGradient")
      .attr("id", "nodeGrad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    gN.append("stop").attr("offset", "0%").attr("stop-color", nodeGradientFrom);
    gN.append("stop").attr("offset", "100%").attr("stop-color", nodeGradientTo);

    defs
      .append("marker")
      .attr("id", "ht-arrow")
      .attr("viewBox", "0 0 6 6") // ← añade viewBox para que escale bien
      .attr("markerWidth", 6) // ← alto y ancho = 6 px
      .attr("markerHeight", 6)
      .attr("refX", 3) // ← centro del viewBox
      .attr("refY", 3)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,0 L6,3 L0,6 Z") // triángulo equilátero
      .attr("fill", bucketStroke);
  }

  /* ---------- canvas size ---------- */
  const slots = buckets.length;
  const maxChain = d3.max(buckets, (b) => b.length) ?? 1;
  const svgWidth = slots * (bucketWidth + padding) + padding;

  /*   HASH-PANEL  ─────────────────────────────────────────────── */
  const panelData = slots ? [null] : [];
  const panel = svg
    .selectAll<SVGGElement, unknown>("g.hash-panel")
    .data(panelData);

  const panelEnter = panel
    .enter()
    .append("g")
    .attr("class", "hash-panel")
    .style("opacity", 0);

  // fondo tipo tarjeta
  panelEnter
    .append("rect")
    .attr("class", "hash-bg")
    .attr("rx", radius * 1.5)
    .attr("ry", radius * 1.5)
    .attr("fill", "#22334488") // azul oscuro semitransparente
    .attr("stroke", "#ffffff55") // borde blanco muy suave
    .attr("stroke-width", 1);

  // texto
  panelEnter
    .append("text")
    .attr("class", "hash-text")
    .style("font-family", "monospace")
    .style("font-size", `${fontSize + 2}px`)
    .style("font-weight", "600")
    .style("fill", textColor)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle");

  const padX = 12,
    padY = 8;
  let panelW = 0,
    panelH = 0;

  panel
    .merge(panelEnter)
    .each(function () {
      const g = d3.select<SVGGElement, unknown>(this);
      // actualiza texto
      g.select("text.hash-text").text(`hash = key % ${slots}`);
      // mide
      const txt = g.select<SVGTextElement>("text.hash-text").node()!;
      const { width: w, height: h } = txt.getBBox();
      panelW = w + padX * 2;
      panelH = h + padY * 2;
      // pon el grupo centrado en el margen izquierdo
      g.attr(
        "transform",
        `translate(${padding + panelW / 2},${padding + panelH / 2})`
      );
      // actualiza fondo centrado en (0,0)
      g.select("rect.hash-bg")
        .attr("x", -panelW / 2)
        .attr("y", -panelH / 2)
        .attr("width", panelW)
        .attr("height", panelH);
      // deja el texto en (0,0)
      g.select("text.hash-text").attr("x", 0).attr("y", 0);
    })
    .transition()
    .style("opacity", 1);

  /* ----- ahora reserva espacio arriba para el panel ------ */
  const topOffset = slots ? panelH + padding * 2 : padding;

  svg
    .attr("width", svgWidth)
    .attr(
      "height",
      maxChain * (nodeHeight + padding) + bucketHeight + padding * 3 + topOffset
    );

  // y-inicial de los buckets
  const bucketStartY = topOffset + padding;
  const yOffset = bucketStartY - s.padding * 1.5;
  /* ========== BUCKETS ========== */

  const bucketSel = svg
    .selectAll<SVGGElement, number>("g.bucket")
    .data(d3.range(buckets.length));

  const bucketEnter = bucketSel
    .enter()
    .append("g")
    .attr("class", "bucket")
    .attr(
      "transform",
      (d) =>
        `translate(${d * (bucketWidth + padding) + padding},${bucketStartY})`
    );

  /* dirección (arriba) */
  bucketEnter
    .append("text")
    .attr("class", "bucket-addr")
    .attr("x", bucketWidth / 2)
    .attr("y", -fontSize * 0.6)
    .attr("text-anchor", "middle")
    .style("font-size", `${fontSize}px`)
    .style("fill", textColor)
    .text((d) => `0x${memory[d].toString(16).toUpperCase()}`);

  /* rectángulo */
  bucketEnter
    .append("rect")
    .attr("class", "bucket-bg")
    .attr("width", bucketWidth)
    .attr("height", bucketHeight)
    .attr("rx", radius)
    .attr("ry", radius)
    .attr("fill", "url(#bucketGrad)")
    .attr("stroke", bucketStroke)
    .attr("stroke-width", 1.2)
    .attr("filter", "url(#ht-shadow)");

  bucketEnter
    .append("rect")
    .attr("class", "bucket-halo")
    .attr("width", bucketWidth - 4)
    .attr("height", bucketHeight - 4)
    .attr("x", 2)
    .attr("y", 2)
    .attr("rx", radius - 2)
    .attr("ry", radius - 2)
    .attr("fill", "transparent")
    .attr("stroke", bucketStroke)
    .attr("stroke-width", 2)
    .attr("opacity", 0.35);

  /* índice dentro */
  bucketEnter
    .append("text")
    .attr("x", bucketWidth / 2)
    .attr("y", bucketHeight / 2 + fontSize / 2)
    .attr("text-anchor", "middle")
    .style("font-size", `${fontSize + 2}px`)
    .style("font-weight", "700")
    .style("fill", textColor)
    .text((d) => `B${d}`);

  /* ========== NODOS ========== */
  const flat = flatten(buckets);
  const nodeSel = svg
    .selectAll<SVGGElement, FlatNode>("g.node")
    .data<FlatNode>(flat, (d) => d.key.toString()); // usamos key como id

  // 1) Parámetros de alturas
  const addrH = fontSize - 2 + 6; // altura de la franja de dirección
  const kvH = nodeHeight - addrH; // resto para key+value
  const halfW = nodeWidth / 2; // mitad del ancho

  // ---- EXIT ----
  (
    nodeSel.exit() as d3.Selection<
      SVGGElement,
      FlatNode,
      SVGSVGElement,
      unknown
    >
  )
    .transition()
    .duration(250)
    .style("opacity", 0)
    .attr(
      "transform",
      (d) => `translate(${posX(d, s)},${posY(d, s) + yOffset}) scale(.3)`
    )
    .remove();

  // ---- ENTER ----
  const nodeEnter = nodeSel
    .enter()
    .append("g")
    .attr("class", "node")
    .attr(
      "transform",
      (d) => `translate(${posX(d, s)},${posY(d, s) + yOffset}) scale(.3)`
    )
    .style("opacity", 0);

  // a) fondo key+value
  nodeEnter
    .append("rect")
    .attr("class", "node-kv-bg")
    .attr("width", nodeWidth)
    .attr("height", kvH)
    .attr("rx", radius / 2)
    .attr("ry", radius / 2)
    .attr("fill", "url(#nodeGrad)")
    .attr("stroke", nodeStroke);

  // b) divisor vertical
  nodeEnter
    .append("line")
    .attr("class", "kv-divider")
    .attr("x1", halfW)
    .attr("y1", 0)
    .attr("x2", halfW)
    .attr("y2", kvH)
    .attr("stroke", nodeStroke)
    .attr("stroke-width", 1);

  // c) texto KEY (izquierda)
  nodeEnter
    .append("text")
    .attr("class", "txt-key")
    .attr("x", halfW / 2)
    .attr("y", kvH / 2 + fontSize / 2 - 2)
    .attr("text-anchor", "middle")
    .style("fill", textColor)
    .style("font-size", `${fontSize}px`)
    .style("font-weight", 600)
    .text((d) => d.key);

  // d) texto VALUE (derecha)
  nodeEnter
    .append("text")
    .attr("class", "txt-val")
    .attr("x", halfW + halfW / 2)
    .attr("y", kvH / 2 + fontSize / 2 - 2)
    .attr("text-anchor", "middle")
    .style("fill", textColor)
    .style("font-size", `${fontSize}px`)
    .text((d) => d.value);

  // e) rectángulo de dirección (abajo)
  nodeEnter
    .append("rect")
    .attr("class", "node-addr-bg")
    .attr("y", kvH)
    .attr("width", nodeWidth)
    .attr("height", addrH)
    .attr("fill", "#1A1A1F")
    .attr("stroke", nodeStroke)
    .attr("rx", 0)
    .attr("ry", 0);

  // f) texto DIRECCIÓN
  nodeEnter
    .append("text")
    .attr("class", "txt-addr")
    .attr("x", halfW)
    .attr("y", kvH + addrH / 2 + (fontSize - 2) / 2)
    .attr("text-anchor", "middle")
    .style("fill", "#a0a0a0")
    .style("font-size", `${fontSize - 2}px`)
    .text(
      (d) =>
        `0x${(memory[d.bucketIdx] + (d.order + 1) * 4)
          .toString(16)
          .toUpperCase()}`
    );

  // g) animación de entrada
  nodeEnter
    .transition()
    .duration(250)
    .attr(
      "transform",
      (d) => `translate(${posX(d, s)},${posY(d, s) + yOffset}) scale(1)`
    )
    .style("opacity", 1);

  // ---- UPDATE ----
  nodeSel
    .transition()
    .duration(250)
    .attr(
      "transform",
      (d) => `translate(${posX(d, s)},${posY(d, s) + yOffset})`
    )
    .each(function (d) {
      const g = d3.select(this);
      g.select<SVGTextElement>("text.txt-key").text(d.key);
      g.select<SVGTextElement>("text.txt-val").text(d.value);
      g.select<SVGTextElement>("text.txt-addr").text(
        `0x${(memory[d.bucketIdx] + (d.order + 1) * 4)
          .toString(16)
          .toUpperCase()}`
      );
    });

  // ── Parámetros ────────────────────────────────────────────────
  const arrowGap = 4; // separación desde el borde de cada rect
  const arrowStrokeW = 2; // grosor de la línea
  const arrowCap = "round"; // extremos redondeados

  // 0) elimina flechas anteriores
  svg.selectAll("path.chain").remove();

  // 1) prepara un array combinado de “bucket→primer nodo” y “nodo→nodo”:
  const chainData: { x: number; y1: number; y2: number }[] = [];

  // 1a) bucket → primer nodo
  buckets.forEach((bucket, bi) => {
    if (bucket.length === 0) return;
    // centro X del bucket
    const bx = padding + bi * (bucketWidth + padding) + bucketWidth / 2;
    // Y de salida: justo debajo del bucket
    const by1 = bucketStartY + bucketHeight + arrowGap;
    // Y de llegada: justo encima del primer nodo (order=0)
    const firstNode = flat.find((fn) => fn.bucketIdx === bi && fn.order === 0)!;
    const fnY = posY(firstNode, s) + yOffset - arrowGap;
    chainData.push({ x: bx, y1: by1, y2: fnY });
  });

  // 1b) nodo → siguiente nodo
  flat.forEach((fn) => {
    if (fn.order === 0) return;
    const cx = posX(fn, s) + nodeWidth / 2;
    // padre:
    const parent = { ...fn, order: fn.order - 1 };
    const py1 = posY(parent, s) + yOffset + nodeHeight + arrowGap;
    const py2 = posY(fn, s) + yOffset - arrowGap;
    chainData.push({ x: cx, y1: py1, y2: py2 });
  });

  // 2) dibuja TODO de una vez, usando join para manejar enter/update/exit
  svg
    .selectAll("path.chain")
    .data(chainData)
    .join(
      (enter) =>
        enter.append("path").attr("class", "chain").attr("fill", "none"),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr("d", (d) => `M${d.x},${d.y1} V${d.y2}`)
    .attr("stroke", bucketStroke)
    .attr("stroke-width", arrowStrokeW)
    .attr("stroke-linecap", arrowCap)
    .attr("marker-end", "url(#ht-arrow)");
}

/* ---------- Highlight ---------- */
export function animateHighlight(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  queryKey: number | null,
  colors: { nodeFill: string; hitFill: string }
) {
  svg
    .selectAll<SVGRectElement, HashNode>("g.node rect")
    .transition()
    .duration(250)
    .attr("fill", (d) =>
      d.key === queryKey ? colors.hitFill : colors.nodeFill
    )
    .attr("stroke-width", (d) => (d.key === queryKey ? 3 : 1.5));
}
/* ── NUEVA FUNCIÓN: Dibuja flecha para GET ─────────────────── */
export function drawSearchArrow(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  target: FlatNode,
  style: StyleConfig
) {
  const centerX = posX(target, style) + style.nodeWidth / 2;
  const bottomY = posY(target, style) + style.nodeHeight;

  svg
    .append("line")
    .attr("class", "search-arrow")
    .attr("x1", centerX)
    .attr("y1", 0)
    .attr("x2", centerX)
    .attr("y2", bottomY)
    .attr("stroke", style.hitFill)
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#ht-arrow)");
}
/** Dibuja una “X” roja sobre el nodo eliminado */
export function drawRemoveMark(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  target: FlatNode,
  style: StyleConfig
) {
  const x = posX(target, style);
  const y = posY(target, style);
  const w = style.nodeWidth;
  const h = style.nodeHeight;

  // Línea diagonal 1
  svg
    .append("line")
    .attr("class", "remove-mark")
    .attr("x1", x + 4)
    .attr("y1", y + 4)
    .attr("x2", x + w - 4)
    .attr("y2", y + h - 4)
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round");

  // Línea diagonal 2
  svg
    .append("line")
    .attr("class", "remove-mark")
    .attr("x1", x + w - 4)
    .attr("y1", y + 4)
    .attr("x2", x + 4)
    .attr("y2", y + h - 4)
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round");
}
