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
  nodeWidth: 122,
  nodeHeight: 44,
  padding: 26,

  // bucket: degradado vertical “glass”
  bucketGradientFrom: "rgba(99,102,241,.35)", // indigo-500/40
  bucketGradientTo: "rgba(30,41,59,.60)", // slate-800/60

  // node: degradado horizontal “cristal”
  nodeGradientFrom: "rgba(56,189,248,.55)", // sky-400/55
  nodeGradientTo: "rgba(20,184,166,.55)", // teal-500/55

  shadowColor: "#000",
  shadowBlur: 8,

  bucketStroke: "rgba(165,180,252,.45)", // indigo-200/45
  nodeStroke: "rgba(203,213,225,.65)", // slate-300/65
  textColor: "#e2e8f0", // slate-200
  fontSize: 14,
  radius: 14,

  nodeFill: "#0f172a", // fallback fill (slate-950)
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

/* ①  aire entre la base del bucket y el primer nodo */
const BUCKET_NODE_GAP = 40;

/* ②  aire entre dos nodos de la misma cadena            */
const BASE_NODE_GAP = 50;

/* ③  regla: a partir del 4.º nodo ensancha 2 px por nivel */
export function nodeGap(order: number) {
  return order < 3 ? BASE_NODE_GAP : BASE_NODE_GAP + (order - 2) * 2;
}

/* ④  posiciones ---------------------------------------- */
export function posY(d: FlatNode, s: StyleConfig) {
  return (
    s.padding * 1.5 + // margen superior global
    s.bucketHeight + // tapa del bucket
    BUCKET_NODE_GAP + // aire extra (①)
    d.order * (s.nodeHeight + nodeGap(d.order))
  );
}

/* ---------- Layout centralizado ---------- */
interface Layout {
  svgWidth: number;
  svgHeight: number;
  topOffset: number;
  bucketStartY: number;
  yOffset: number;
  stepY: number;
  deepestOrder: number;
}

/** Calcula TODA la geometría con una sola fuente de verdad */
function getLayout(
  s: StyleConfig,
  slots: number,
  maxChain: number,
  panelH: number
): Layout {
  const svgWidth = s.padding + slots * (s.bucketWidth + s.padding);
  const topOffset = slots ? panelH + s.padding * 2 : s.padding;
  const deepestOrder = Math.max(0, maxChain - 1);
  const stepY = s.nodeHeight + nodeGap(deepestOrder);

  const svgHeight =
    s.bucketHeight +
    BUCKET_NODE_GAP +
    maxChain * stepY +
    s.padding * 3 +
    topOffset;

  const bucketStartY = topOffset + s.padding;
  const yOffset = bucketStartY - s.padding * 1.5;

  return {
    svgWidth,
    svgHeight,
    topOffset,
    bucketStartY,
    yOffset,
    stepY,
    deepestOrder,
  };
}

/** Guarda valores de layout en data-* del <svg> para que otros helpers los lean */
function stashLayoutOnSvg(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  layout: Layout,
  s: StyleConfig
) {
  svg
    .attr("data-top-offset", String(layout.topOffset))
    .attr("data-bucket-start-y", String(layout.bucketStartY))
    .attr("data-y-offset", String(layout.yOffset))
    .attr("data-node-width", String(s.nodeWidth))
    .attr("data-node-height", String(s.nodeHeight));
}

/** Lee un número de data-* con fallback seguro */
function readDataNumber(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  key: string,
  fallback: number
) {
  const v = svg.attr(key);
  const n = v == null ? NaN : +v;
  return Number.isFinite(n) ? n : fallback;
}

/* ---------- drawHashTable ---------- */
export function drawHashTable(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  buckets: HashNode[][],
  memory: number[], // ← direcciones de cada bucket
  style?: Partial<StyleConfig>,
  activeBucketIdx?: number
) {
  let root = svg.select<SVGGElement>("g.ht-root");
  if (root.empty()) {
    root = svg.append("g").attr("class", "ht-root");
  }

  /* fusiona estilos */
  const s: StyleConfig = { ...DEFAULT_STYLE, ...(style ?? {}) };
  const {
    bucketWidth,
    bucketHeight,
    padding,
    bucketGradientFrom,
    bucketGradientTo,
    shadowColor,
    shadowBlur,
    bucketStroke,
    textColor,
    fontSize,
    radius,
  } = s;

  /* ---------- defs (una vez) ---------- */
  if (svg.select("defs").empty()) {
    const defs = svg.append("defs");

    // Sombra general
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

    // Gradiente del bucket
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

    // Gradiente (no usado directo, mantenido por compatibilidad)
    const gN = defs
      .append("linearGradient")
      .attr("id", "nodeGrad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    gN.append("stop").attr("offset", "0%").attr("stop-color", "#E53935");
    gN.append("stop").attr("offset", "100%").attr("stop-color", "#D32F2F");

    // Marcador de flecha estándar
    defs
      .append("marker")
      .attr("id", "ht-arrow")
      .attr("viewBox", "0 0 6 6")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("refX", 3)
      .attr("refY", 3)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,0 L6,3 L0,6 Z")
      .attr("fill", bucketStroke);

    // Marcadores para flechas laterales (insert)
    defs
      .append("marker")
      .attr("id", "arrow-right-dash")
      .attr("viewBox", "0 0 6 6")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("refX", 0)
      .attr("refY", 3)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,0 L6,3 L0,6 Z")
      .attr("fill", "#60A5FA");

    defs
      .append("marker")
      .attr("id", "arrow-left-dash")
      .attr("viewBox", "0 0 6 6")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("refX", 6)
      .attr("refY", 3)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M6,0 L0,3 L6,6 Z")
      .attr("fill", "#60A5FA");

    // Gradiente rojo del nodo
    const gNodeRed = defs
      .append("linearGradient")
      .attr("id", "nodeRedGrad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    gNodeRed.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444");
    gNodeRed
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#991b1b");

    // HALO animado
    const halo = defs
      .append("filter")
      .attr("id", "ht-halo")
      .attr("x", "-60%")
      .attr("y", "-60%")
      .attr("width", "220%")
      .attr("height", "220%");
    halo
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 4)
      .attr("result", "blur");
    halo
      .append("feMerge")
      .selectAll("feMergeNode")
      .data(["blur", "SourceGraphic"])
      .enter()
      .append("feMergeNode")
      .attr("in", (d) => d);
  }

  // ——— defs para flechas de inserción (si no existen) ———
  if (svg.select("#ins-tip").empty()) {
    const defs = svg.select("defs");

    // Punta reutilizable (orientación automática)
    defs
      .append("marker")
      .attr("id", "ins-tip")
      .attr("viewBox", "0 0 12 12")
      .attr("refX", 10) // dónde engancha la punta al final del path
      .attr("refY", 6)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("markerUnits", "strokeWidth")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,0 L12,6 L0,12 L3,6 Z")
      .attr("fill", "#60A5FA");

    // Glow azulado (sombra hacia afuera)
    defs
      .append("filter")
      .attr("id", "ins-glow")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", 2.2)
      .attr("flood-color", "#60A5FA")
      .attr("flood-opacity", 0.85);
  }

  /* -------------- tamaño del canvas -------------- */
  const slots = buckets.length;
  const maxChain = d3.max(buckets, (b) => b.length) ?? 1;

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

      // Construye el texto de la función hash
      let hashText = `hash = key % ${slots}`;
      // Si recibimos el índice de bucket activo, lo mostramos
      if (typeof activeBucketIdx === "number" && !isNaN(activeBucketIdx)) {
        hashText += `   →   B${activeBucketIdx}`;
      }
      g.select("text.hash-text").text(hashText);
      // ••• AÑADIR PUNTO LUMINOSO EN EL PANEL •••
      panelEnter
        .append("circle")
        .attr("class", "hash-dot")
        .attr("r", 4)
        .attr("fill", "#60A5FA");

      // Calcula las dimensiones para el fondo del panel
      const txt = g.select<SVGTextElement>("text.hash-text").node()!;
      const { width: textWidth, height: textHeight } = txt.getBBox();
      panelW = textWidth + padX * 2;
      panelH = textHeight + padY * 2;

      // Centra el grupo y actualiza el fondo
      g.attr(
        "transform",
        `translate(${padding + panelW / 2},${padding + panelH / 2})`
      );
      g.select("rect.hash-bg")
        .attr("x", -panelW / 2)
        .attr("y", -panelH / 2)
        .attr("width", panelW)
        .attr("height", panelH);

      // Centra el texto en el panel
      g.select("text.hash-text").attr("x", 0).attr("y", 0);

      // Posiciona el puntito a la izquierda del texto
      g.select("circle.hash-dot")
        .attr("cx", -panelW / 2 + 14)
        .attr("cy", 0);
    })
    .transition()
    .style("opacity", 1);

  /* ----- LAYOUT centralizado ------ */
  const layout = getLayout(s, slots, maxChain, panelH);
  const { svgWidth, svgHeight, bucketStartY, yOffset } = layout;

  svg
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .attr("width", svgWidth) // ancho fijo → tu div hará scroll
    .attr("height", svgHeight); // alto fijo

  stashLayoutOnSvg(svg, layout, s);

  /* ========== BUCKETS ========== */
  const bucketSel = svg
    .selectAll<SVGGElement, number>("g.bucket")
    .data(d3.range(buckets.length));

  /* ── defs extra (solo una vez) ───────────────────────────── */
  if (svg.select("#bucketLidGrad").empty()) {
    const defs = svg.select("defs");

    /* tapa roja con luz cenital */
    const lidGrad = defs
      .append("linearGradient")
      .attr("id", "bucketLidGrad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    lidGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ff7676");
    lidGrad.append("stop").attr("offset", "65%").attr("stop-color", "#D32F2F");

    /* cuerpo blanco con sombreado suave (top-down) */
    const bodyGrad = defs
      .append("linearGradient")
      .attr("id", "bucketBodyGrad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    bodyGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
    bodyGrad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f3f4f6"); // slate-100

    /* sombreado interior sutil */
    defs
      .append("filter")
      .attr("id", "bucketInsetShadow")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 2)
      .attr("flood-opacity", 0.25);
  }

  /* ── ENTER ──────────────────────────────────────────────── */
  const bucketEnter = bucketSel.enter().append("g").attr("class", "bucket");

  /* medidas reutilizadas */
  const w = bucketWidth;
  const h = bucketHeight;
  const r = radius;
  const half = h / 2;

  /* 1️⃣  tapa “toffee” */
  bucketEnter
    .append("path")
    .attr("class", "bucket-top-path")
    .attr(
      "d",
      `M0,${half} L0,${r} A${r},${r} 0 0,1 ${r},0
       L${w - r},0 A${r},${r} 0 0,1 ${w},${r}
       L${w},${half} Z`
    )
    .attr("fill", "url(#bucketLidGrad)");

  /* 2️⃣  cuerpo nacarado */
  bucketEnter
    .append("path")
    .attr("class", "bucket-bottom-path")
    .attr(
      "d",
      `M0,${half} L0,${h - r} A${r},${r} 0 0,0 ${r},${h}
       L${w - r},${h} A${r},${r} 0 0,0 ${w},${h - r}
       L${w},${half} Z`
    )
    .attr("fill", "url(#bucketBodyGrad)")
    .attr("stroke", "#bb2525") /* rojo más oscuro */
    .attr("stroke-width", 1.5)
    .attr("filter", "url(#bucketInsetShadow)");

  /* 2️⃣.b  destaque glossy (reflejo) */
  bucketEnter
    .append("path")
    .attr(
      "d",
      `M${r},${half + 2} 
              Q${w / 2},${half - 4} ${w - r},${half + 2}`
    )
    .attr("fill", "none")
    .attr("stroke", "#ffffffaa")
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round");

  /* 3️⃣  índice “burbuja” */
  bucketEnter
    .append("text")
    .attr("class", "bucket-index")
    .attr("x", w / 2)
    .attr("y", half / 2 + fontSize / 2)
    .attr("text-anchor", "middle")
    .style("fill", "#ffffff")
    .style("stroke", "#00000033") /* contorno sutil */
    .style("stroke-width", 1)
    .style("font-family", "Fira Code, monospace")
    .style("font-size", `${fontSize + 4}px`)
    .style("font-weight", "900")
    .text((d) => `B${d}`);

  /* 4️⃣  dirección hexadecimal */
  bucketEnter
    .append("text")
    .attr("class", "bucket-addr")
    .attr("x", w / 2)
    .attr("y", half + half / 2 + (fontSize - 2) / 2)
    .attr("text-anchor", "middle")
    .style("fill", "#374151")
    .style("font-family", "Fira Code, monospace")
    .style("font-size", `${fontSize - 2}px`)
    .style("font-weight", "600")
    .text((d) => `0x${memory[d].toString(16).toUpperCase()}`);

  // ====== MEJORAS VISUALES POR BUCKET ======
  const bucketAll = bucketEnter.merge(bucketSel as any);

  // 1) Anillo de foco para el bucket activo
  bucketAll
    .selectAll<SVGRectElement, number>("rect.active-ring")
    .data(
      (d) => (d === activeBucketIdx ? [d] : []),
      (d: any) => d
    )
    .join(
      (enter) =>
        enter
          .insert("rect", ":first-child")
          .attr("class", "active-ring")
          .attr("x", -6)
          .attr("y", -6)
          .attr("rx", radius * 1.6)
          .attr("ry", radius * 1.6)
          .attr("width", w + 12)
          .attr("height", h + 12)
          .attr("fill", "none")
          .attr("stroke", "#facc15")
          .attr("stroke-width", 3)
          .style("opacity", 0)
          .transition()
          .duration(250)
          .style("opacity", 1),
      (update) => update,
      (exit) => exit.transition().duration(180).style("opacity", 0).remove()
    );

  // 2) Barra de factor de carga (len bucket / len máxima)
  const maxLen = d3.max(buckets, (b) => b.length) ?? 1;

  // Track (fondo)
  bucketAll
    .selectAll<SVGRectElement, number>("rect.lf-track")
    .data([0])
    .join((enter) =>
      enter
        .append("rect")
        .attr("class", "lf-track")
        .attr("x", 14)
        .attr("y", h - 10)
        .attr("width", w - 28)
        .attr("height", 6)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("fill", "#ffffff22")
    );

  // Fill (valor actual)
  bucketAll
    .selectAll<SVGRectElement, number>("rect.lf-fill")
    .data((d) => [buckets[d].length])
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "lf-fill")
          .attr("x", 14)
          .attr("y", h - 10)
          .attr("height", 6)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("fill", "#60A5FA")
          .attr("width", 0)
          .transition()
          .duration(420)
          .attr("width", (len) => ((w - 28) * len) / maxLen),
      (update) =>
        update
          .transition()
          .duration(300)
          .attr("width", (len) => ((w - 28) * len) / maxLen)
    );

  // 3) Micro-hover: realza el cuerpo del bucket
  bucketAll
    .on("mouseenter", function () {
      d3.select(this)
        .select(".bucket-bottom-path")
        .interrupt()
        .transition()
        .duration(120)
        .attr("stroke-width", 2.2);
    })
    .on("mouseleave", function () {
      d3.select(this)
        .select(".bucket-bottom-path")
        .interrupt()
        .transition()
        .duration(140)
        .attr("stroke-width", 1.5);
    });
  // ====== FIN MEJORAS ======

  /* ── ANIMACIÓN “drop-in” ───────────────── */
  const isFirstCreation = !svg.attr("data-buckets-init");

  bucketEnter
    .attr("transform", (d) =>
      isFirstCreation
        ? `translate(${d * (bucketWidth + padding) + padding},
                   ${bucketStartY - 120}) scale(0.3) rotate(-25)`
        : `translate(${d * (bucketWidth + padding) + padding},
                   ${bucketStartY})`
    )
    .style("opacity", isFirstCreation ? 0 : 1);

  if (isFirstCreation) {
    bucketEnter
      .transition()
      .delay((d) => d * 90)
      .duration(900)
      .ease(d3.easeBounceOut)
      .attr(
        "transform",
        (d) =>
          `translate(${d * (bucketWidth + padding) + padding},
                   ${bucketStartY}) scale(1) rotate(0)`
      )
      .style("opacity", 1)
      .transition()
      .duration(180)
      .ease(d3.easeSinInOut)
      .attrTween("transform", function () {
        const [tx, ty] = this.getAttribute("transform")!
          .match(/translate\(([^,]+),([^)]+)\)/)!
          .slice(1)
          .map(Number);
        return (t) =>
          `translate(${tx},${ty})
         scale(${1 + 0.08 * Math.sin(Math.PI * t)} ,
               ${1 - 0.08 * Math.sin(Math.PI * t)})`;
      })
      .on("end", () => svg.attr("data-buckets-init", "1"));
  }

  /* ========== NODOS (auto-resize + centrado) ========== */
  const flat = flatten(buckets);
  const nodeSel = svg
    .selectAll<SVGGElement, FlatNode>("g.node")
    .data(flat, (d) => d.key.toString()); // clave → id

  /* ---- medidas base ------------------------------------------------ */
  const BASE_W = s.bucketWidth;
  const HEADER_H = 14; // franja “KEY / VALUE”
  const NUM_H = 19; // altura números
  const ADDR_H = 22; // franja dirección
  const BASE_H = HEADER_H + NUM_H + ADDR_H;
  const R = s.radius * 0.8;
  const HALO_PAD = 4;

  const LABEL_Y = HEADER_H / 2 + 6; // centra verticalmente (~9px)
  const NUM_Y = HEADER_H + NUM_H / 2 + 4;
  const ADDR_Y = HEADER_H + NUM_H;

  /* inicializamos ancho de referencia para posX() */
  s.nodeWidth = BASE_W;
  s.nodeHeight = BASE_H;

  /* -------- EXIT (DELETE – toon style) -------------------------- */
  const exitSel = nodeSel.exit() as d3.Selection<
    SVGGElement,
    FlatNode,
    SVGGElement,
    unknown
  >;

  exitSel
    /* 1️⃣  Dibuja la “X” roja */
    .each(function () {
      const g = d3.select<SVGGElement, unknown>(this);
      [
        { x1: 6, y1: 6, x2: BASE_W - 6, y2: BASE_H - 6 },
        { x1: BASE_W - 6, y1: 6, x2: 6, y2: BASE_H - 6 },
      ].forEach(({ x1, y1, x2, y2 }) =>
        g
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 3)
          .attr("stroke-linecap", "round")
      );
    })

    /* 2️⃣  Mini temblor (anticipación) */
    .transition()
    .duration(180)
    .ease(d3.easeSinInOut)
    .attrTween("transform", function () {
      const { x, y } = getXY(this);
      return (t) => `translate(${x + (t < 0.5 ? -5 : 5)},${y}) scale(1)`;
    })

    /* 3️⃣  Squash-&-Stretch */
    .transition()
    .duration(260)
    .attrTween("transform", function () {
      const { x, y } = getXY(this);
      return (t) =>
        `translate(${x},${y}) scale(${1 + 0.18 * t},${1 - 0.18 * t})`;
    })

    /* 4️⃣  Lanzamiento con giro y fade-out */
    .transition()
    .duration(800) // ⬅️  más lenta
    .ease(d3.easeBackIn)
    .attrTween("transform", function () {
      const { x, y } = getXY(this);
      return (t) =>
        `translate(${x + 90 * t},${y + 70 * t}) ` +
        `scale(${1 - 0.85 * t}) rotate(${-540 * t})`;
    })
    .style("opacity", 0)
    .remove();

  /* util ————————————————————————————————————————————— */
  function getXY(el: SVGGElement) {
    const d = (el as any).__data__ as FlatNode;
    return { x: posX(d, s), y: posY(d, s) + yOffset };
  }

  /* ── defs extra (una vez) ─────────────────────────── */
  if (svg.select("#nodeRadGrad").empty()) {
    const defs = svg.select("defs");

    /* gradiente radial centro-cyan → violeta (no crítico, decorativo) */
    const gRad = defs
      .append("radialGradient")
      .attr("id", "nodeRadGrad")
      .attr("cx", "30%")
      .attr("cy", "30%");
    gRad.append("stop").attr("offset", "0%").attr("stop-color", "#3cf9ff");
    gRad.append("stop").attr("offset", "100%").attr("stop-color", "#6366f1");

    /* filtro cartoon-shadow */
    defs
      .append("filter")
      .attr("id", "nodeOuterGlow")
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 3)
      .attr("stdDeviation", 3.5)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.35);
  }

  /* -------- ENTER (nuevo diseño) ------------------------------ */
  const nodeEnter = nodeSel
    .enter()
    .append("g")
    .attr("class", "node")
    .attr(
      "transform",
      (d) => `translate(${posX(d, s)},${posY(d, s) + yOffset}) scale(.25)`
    )
    .style("opacity", 0);

  /* 1️⃣ fondo degradado rojo */
  nodeEnter
    .append("rect")
    .attr("class", "bg")
    .attr("width", BASE_W)
    .attr("height", BASE_H)
    .attr("rx", R * 1.2)
    .attr("ry", R * 1.2)
    .attr("fill", "url(#nodeRedGrad)")
    .attr("stroke", "#b91c1c")
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round")
    .attr("filter", "url(#nodeOuterGlow)");

  /* 2️⃣ cartel dirección (inclinado) */
  nodeEnter
    .append("rect")
    .attr("class", "addrBox")
    .attr("x", 0)
    .attr("y", ADDR_Y - 2)
    .attr("width", BASE_W)
    .attr("height", ADDR_H + 4)
    .attr("rx", R)
    .attr("ry", R)
    .attr("fill", "#fef2f2") // rojo muy claro
    .attr("stroke", "#ef4444")
    .attr("stroke-width", 1.5)
    .attr("transform", `rotate(-2 ${BASE_W / 2} ${ADDR_Y + ADDR_H / 2})`);

  /* 3️⃣ KEY / VALUE etiquetas estilo sticker */
  [
    ["KEY", 0.26],
    ["VALUE", 0.74],
  ].forEach(([txt, fx]) => {
    nodeEnter
      .append("text")
      .attr("class", "lbl")
      .attr("x", BASE_W * (fx as number))
      .attr("y", LABEL_Y)
      .attr("text-anchor", "middle")
      .style("font-family", "Fira Code, monospace")
      .style("font-size", `${s.fontSize - 1}px`)
      .style("font-weight", "700")
      .style("letter-spacing", "0.5px")
      .style("fill", "#ffffff")
      .style("text-shadow", "1px 1px #00000066")
      .text(txt as string);
  });

  /* 4️⃣ Números KEY y VALUE */
  nodeEnter
    .append("text")
    .attr("class", "keyNum")
    .attr("x", BASE_W * 0.26)
    .attr("y", NUM_Y + 2)
    .attr("text-anchor", "middle")
    .style("font-family", "Fira Code, monospace")
    .style("font-size", `${s.fontSize + 4}px`)
    .style("font-weight", "800")
    .style("fill", "#ffffff")
    .style("text-shadow", "2px 2px #00000033")
    .text((d) => d.key);

  nodeEnter
    .append("text")
    .attr("class", "valNum")
    .attr("x", BASE_W * 0.74)
    .attr("y", NUM_Y + 2)
    .attr("text-anchor", "middle")
    .style("font-family", "Fira Code, monospace")
    .style("font-size", `${s.fontSize + 4}px`)
    .style("font-weight", "800")
    .style("fill", "#ffffff")
    .style("text-shadow", "2px 2px #00000033")
    .text((d) => d.value);

  /* 5️⃣ dirección hexadecimal */
  nodeEnter
    .append("text")
    .attr("class", "addr")
    .attr("x", BASE_W / 2)
    .attr("y", ADDR_Y + ADDR_H / 2 + 5)
    .attr("text-anchor", "middle")
    .style("font-family", "Fira Code, monospace")
    .style("font-size", `${s.fontSize - 1}px`)
    .style("fill", "#991b1b")
    .text(
      (d) =>
        `0x${(memory[d.bucketIdx] + (d.order + 1) * 4)
          .toString(16)
          .toUpperCase()}`
    );

  /* guarda value para detectar cambios */
  nodeEnter.attr("data-val", (d) => d.value);

  /* ---------- Animación + halo ---------- */
  nodeEnter
    .transition()
    .duration(650)
    .ease(d3.easeBackOut)
    .attr(
      "transform",
      (d) => `translate(${posX(d, s)},${posY(d, s) + yOffset}) scale(1)`
    )
    .style("opacity", 1)
    .on("end", (d) => flashSideArrows(svg, d, s, yOffset))
    .selection()
    .insert("rect", ":first-child") // halo
    .attr("x", -HALO_PAD)
    .attr("y", -HALO_PAD)
    .attr("width", () => s.nodeWidth + HALO_PAD * 2)
    .attr("height", BASE_H + HALO_PAD * 2)
    .attr("rx", R + HALO_PAD)
    .attr("ry", R + HALO_PAD)
    .attr("fill", "none")
    .attr("stroke", "#60A5FA")
    .attr("stroke-width", 3)
    .attr("filter", "url(#ht-halo)")
    .style("opacity", 0)
    .transition()
    .duration(220)
    .style("opacity", 0.85)
    .transition()
    .duration(600)
    .style("opacity", 0)
    .remove();

  /* ---- UPDATE (re-flow + cambios de value) ------------------ */
  const upd = nodeSel as d3.Selection<SVGGElement, FlatNode, any, any>;

  /* 1️⃣  Desplaza TODOS los nodos vivos a su nueva posición */
  upd
    .transition()
    .duration(350)
    .ease(d3.easeCubicOut)
    .attr(
      "transform",
      (d) => `translate(${posX(d, s)},${posY(d, s) + yOffset}) scale(1)`
    );

  /* 2️⃣  Para cada nodo comprueba si cambió su value.
       Solo entonces aplica bounce/flash               */
  upd.each(function (d) {
    const g = d3.select(this);

    /* refresca textos (value + dirección) */
    g.select<SVGTextElement>("text.valNum").text(d.value);
    g.select<SVGTextElement>("text.addr").text(
      `0x${(memory[d.bucketIdx] + (d.order + 1) * 4)
        .toString(16)
        .toUpperCase()}`
    );

    const prevVal = +g.attr("data-val");
    if (prevVal === d.value) return; // sin cambio → nada extra
    g.attr("data-val", d.value); // guarda nuevo value

    /* --- animación bounce después del re-flow --- */
    g.transition()
      .delay(350) // espera a que termine el re-flow
      .duration(180)
      .ease(d3.easeQuadOut)
      .attr(
        "transform",
        `translate(${posX(d, s)},${posY(d, s) + yOffset - 8}) scale(1)`
      )
      .transition()
      .duration(420)
      .ease(d3.easeBounceOut)
      .attr(
        "transform",
        `translate(${posX(d, s)},${posY(d, s) + yOffset}) scale(1)`
      );

    /* flash de color en el número */
    g.select<SVGTextElement>("text.valNum")
      .transition()
      .delay(350)
      .duration(100)
      .style("fill", "#f472b6") // rosa-500
      .transition()
      .duration(300)
      .style("fill", "#ffffff");

    /* anillo animado alrededor */
    const ring = g
      .insert("circle", ":first-child")
      .attr("cx", s.nodeWidth / 2)
      .attr("cy", BASE_H / 2)
      .attr("r", Math.max(s.nodeWidth, BASE_H) / 2 + 4)
      .attr("fill", "none")
      .attr("stroke", "#facc15") // amarillo-400
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "6 4")
      .style("opacity", 0);

    ring
      .transition()
      .delay(350)
      .duration(120)
      .style("opacity", 0.8)
      .transition()
      .duration(380)
      .style("opacity", 0)
      .remove();
  });

  /* ───────── LÍNEAS bucket ↕ cadena (todas las secciones) ───────── */
  const FROM_BUCKET = 8; // separación bajo la tapa del bucket
  const INTO_NODE = 6; // pequeña intrusión dentro del nodo
  const COLOR = "#8b5cf6";
  const WIDTH = 4;
  const DASH = "6 4";

  // capa detrás de todos los nodos (se crea una sola vez)
  let chainLayer = svg.select<SVGGElement>("g.chain-lines");
  if (chainLayer.empty()) {
    chainLayer = svg
      .insert("g", "g.node") // queda detrás de los nodos
      .attr("class", "chain-lines")
      .attr("pointer-events", "none");
  }

  interface Seg {
    id: string;
    d: string;
  }
  const segs: Seg[] = [];

  // agrupamos los nodos por bucket y los ordenamos por 'order'
  const grouped = d3.group(flat, (n) => n.bucketIdx);
  for (const [bi, arrRaw] of grouped) {
    const arr = [...arrRaw].sort((a, b) => a.order - b.order);
    if (!arr.length) continue;

    const x =
      posX({ bucketIdx: bi as number, order: 0 } as any, s) + s.nodeWidth / 2;

    // tramo: bucket → primer nodo (hasta su borde superior)
    const yBucket = bucketStartY + bucketHeight + FROM_BUCKET;
    const yFirstTop = posY(arr[0], s) + yOffset + INTO_NODE;
    segs.push({ id: `b2f-${bi}`, d: `M${x},${yBucket} L${x},${yFirstTop}` });

    // tramos: entre nodos consecutivos (base del i → techo del i+1)
    for (let k = 0; k < arr.length - 1; k++) {
      const a = arr[k];
      const b = arr[k + 1];
      const yA = posY(a, s) + yOffset + s.nodeHeight - INTO_NODE;
      const yB = posY(b, s) + yOffset + INTO_NODE;
      segs.push({ id: `lnk-${bi}-${k}`, d: `M${x},${yA} L${x},${yB}` });
    }
  }

  // pintamos / actualizamos sin limpiar toda la capa (evita parpadeos)
  const paths = chainLayer
    .selectAll<SVGPathElement, Seg>("path.chain-line")
    .data(segs, (d: any) => d.id);

  paths
    .enter()
    .append("path")
    .attr("class", "chain-line")
    .attr("fill", "none")
    .attr("stroke", COLOR)
    .attr("stroke-width", WIDTH)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", DASH)
    .attr("d", (d) => d.d);

  paths.attr("d", (d) => d.d);

  paths.exit().remove();
  /* ─────────────────────────────────────────────────────────── */
}

/** Flecha caricaturesca que “sale del bucket y apunta al nodo” */
function drawGetArrow(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  target: FlatNode,
  s: StyleConfig
) {
  const x = posX(target, s) + s.nodeWidth / 2;

  // Lee del SVG lo que ya calculó drawHashTable
  const bucketStartY = readDataNumber(
    svg,
    "data-bucket-start-y",
    s.padding * 3
  );
  const yOffset = readDataNumber(svg, "data-y-offset", s.padding);

  const bucketY = bucketStartY + s.bucketHeight + 10;

  // “justo encima del nodo”
  const NODE_TOP_PAD = -6;
  const nodeTop = posY(target, s) + yOffset + NODE_TOP_PAD;

  const yMid = (bucketY + nodeTop) / 2;

  const pathData = `M${x},${bucketY}
                    C${x},${yMid - 24} ${x},${yMid + 24} ${x},${nodeTop}`;

  // ——— línea animada ———
  svg
    .append("path")
    .attr("class", "get-arrow")
    .attr("d", pathData)
    .attr("fill", "none")
    .attr("stroke", "#facc15")
    .attr("stroke-width", 4)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", "12 8")
    .attr("stroke-dashoffset", 160)
    .style("opacity", 0.9)
    .transition()
    .duration(500)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .transition()
    .delay(700)
    .duration(300)
    .style("opacity", 0)
    .remove();

  // ——— punta amarilla ———
  svg
    .append("polygon")
    .attr("class", "get-arrow-tip")
    .attr(
      "points",
      `${x},${nodeTop} ${x - 7},${nodeTop - 14} ${x + 7},${nodeTop - 14}`
    )
    .attr("fill", "#facc15")
    .style("opacity", 0)
    .transition()
    .delay(450)
    .duration(150)
    .style("opacity", 1)
    .transition()
    .delay(400)
    .duration(300)
    .style("opacity", 0)
    .remove();
}

/** Resalta UN solo nodo para GET (toon-style) */
export function animateGet(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  queryKey: number | null,
  s: StyleConfig
) {
  const hitColor = "#facc15"; // 🟡 amarillo (tw: yellow-400)
  const restoreFill = "url(#nodeRedGrad)";
  const restoreStroke = "#b91c1c";

  /* 1️⃣  Restaura el nodo que estaba activo */
  svg
    .selectAll<SVGGElement, unknown>("g.node.active-get")
    .classed("active-get", false)
    .select<SVGRectElement>("rect.bg")
    .transition()
    .duration(220)
    .attr("fill", restoreFill)
    .attr("stroke", restoreStroke)
    .attr("stroke-width", 3)
    .attr("transform", "scale(1)");

  // Si no hay nueva key, limpiamos y salimos
  if (queryKey == null) {
    svg.selectAll(".get-arrow, .get-arrow-tip").remove();
    return;
  }

  /* 2️⃣  Nuevo nodo objetivo */
  const g = svg
    .selectAll<SVGGElement, FlatNode>("g.node")
    .filter((d) => d.key === queryKey)
    .classed("active-get", true);

  /* 3️⃣  Animación de pulso + cambio a amarillo */
  const bg = g.select<SVGRectElement>("rect.bg");
  bg.transition()
    .duration(140)
    .ease(d3.easeQuadOut)
    .attr("transform", "scale(1.12)")
    .attr("fill", hitColor)
    .attr("stroke", "#fde68a") // borde amarillo claro
    .transition()
    .duration(440)
    .ease(d3.easeBounceOut)
    .attr("transform", "scale(1)");

  /* 4️⃣  Halo blanco de flash */
  g.insert("rect", ":first-child")
    .attr("x", -6)
    .attr("y", -6)
    .attr("width", s.nodeWidth + 12)
    .attr("height", s.nodeHeight + 12)
    .attr("rx", s.radius + 6)
    .attr("ry", s.radius + 6)
    .attr("fill", "none")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 4)
    .style("opacity", 0)
    .transition()
    .duration(90)
    .style("opacity", 0.9)
    .transition()
    .duration(260)
    .style("opacity", 0)
    .remove();

  /* 5️⃣  Flecha animada */
  svg.selectAll(".get-arrow, .get-arrow-tip").remove();
  drawGetArrow(svg, g.datum()!, s);
}

function flashSideArrows(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  d: FlatNode,
  s: StyleConfig,
  yOffset: number
) {
  // 1) limpiar efectos anteriores
  svg.selectAll(".insert-arrow, .insert-arrow-head").interrupt().remove();

  // 2) geometría base
  const addrH = s.fontSize - 2 + 6;
  const kvH = s.nodeHeight - addrH;
  const yMid = posY(d, s) + yOffset + kvH / 2;

  const xLeft = posX(d, s);
  const xRight = xLeft + s.nodeWidth;

  const arrowLen = 52; // cuánto sobresale hacia fuera
  const curve = 12; // curvatura vertical

  const leftStart = xLeft - arrowLen;
  const leftEnd = xLeft + 2;
  const rightStart = xRight + arrowLen;
  const rightEnd = xRight - 2;

  // 3) helper para dibujar y animar cada flecha
  function draw(dir: "left" | "right") {
    const x0 = dir === "left" ? leftStart : rightStart;
    const x1 = dir === "left" ? leftEnd : rightEnd;
    const bend = dir === "left" ? -curve : curve; // panza hacia afuera

    // línea curva (quadratic bezier)
    const dPath = `M${x0},${yMid} Q${(x0 + x1) / 2},${yMid + bend} ${x1},${yMid}`;

    const path = svg
      .append("path")
      .attr("class", "insert-arrow")
      .attr("d", dPath)
      .attr("fill", "none")
      .attr("stroke", "#93c5fd") // azul suave
      .attr("stroke-width", 3.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("stroke-dasharray", "10 6") // guiones más elegantes
      .style("opacity", 0.95);

    // animación: “draw-on” usando dashoffset
    const L = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr("stroke-dasharray", L)
      .attr("stroke-dashoffset", L)
      .transition()
      .duration(420)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .transition()
      .delay(240)
      .duration(220)
      .style("opacity", 0)
      .remove();

    // punta personalizada (triángulo redondeado)
    const headW = 11; // largo de la punta
    const headH = 7; // alto de la punta
    const points =
      dir === "left"
        ? // apunta hacia la derecha
          `${x1},${yMid} ${x1 - headW},${yMid - headH} ${x1 - headW},${yMid + headH}`
        : // apunta hacia la izquierda
          `${x1},${yMid} ${x1 + headW},${yMid - headH} ${x1 + headW},${yMid + headH}`;

    svg
      .append("polygon")
      .attr("class", "insert-arrow-head")
      .attr("points", points)
      .attr("fill", "#60A5FA")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 1)
      .style("opacity", 0)
      .transition()
      .duration(280)
      .style("opacity", 1)
      .transition()
      .delay(220)
      .duration(220)
      .style("opacity", 0)
      .remove();
  }

  draw("left");
  draw("right");
}

/** Dibuja una “X” roja sobre el nodo eliminado */
export function drawRemoveMark(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  target: FlatNode,
  style: StyleConfig
) {
  // calcula posición y tamaño del nodo
  const x = posX(target, style);
  const y = posY(target, style);
  const w = style.nodeWidth;
  const h = style.nodeHeight;
  const strokeWidth = 3;
  const pad = 4;

  // primera línea diagonal
  svg
    .append("line")
    .attr("class", "remove-mark")
    .attr("x1", x + pad)
    .attr("y1", y + pad)
    .attr("x2", x + w - pad)
    .attr("y2", y + h - pad)
    .attr("stroke", "#ef4444")
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linecap", "round");

  // segunda línea diagonal
  svg
    .append("line")
    .attr("class", "remove-mark")
    .attr("x1", x + w - pad)
    .attr("y1", y + pad)
    .attr("x2", x + pad)
    .attr("y2", y + h - pad)
    .attr("stroke", "#ef4444")
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linecap", "round");
}
