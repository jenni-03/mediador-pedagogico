// src/shared/utils/draw/heapDrawActions.ts
import { select, easePolyInOut, type Selection } from "d3";
import { TreeLinkData } from "../../../types";
import {
  SVG_BINARY_TREE_VALUES,
  SVG_STYLE_VALUES,
} from "../../constants/consts";

/* ───────────────────────── Config & timings ───────────────────────── */
const R = SVG_BINARY_TREE_VALUES?.NODE_RADIUS ?? 25;
const HIGHLIGHT = SVG_BINARY_TREE_VALUES?.HIGHLIGHT_COLOR ?? "#D72638";
const STROKE_COLOR = SVG_STYLE_VALUES?.RECT_STROKE_COLOR ?? "#D72638";
const STROKE_WIDTH = SVG_STYLE_VALUES?.RECT_STROKE_WIDTH ?? 1.2;
type LevelOrderSkin = "slate" | "indigo" | "emerald";

type LevelOrderStyle = {
  skin?: LevelOrderSkin;
  label?: string | null; // texto sobre la bandeja (p.e. "Level-order")
  showRail?: boolean; // línea base bajo las celdas
  glossy?: boolean; // gradiente sutil en celda/bandeja
  indexPill?: boolean; // índice como “píldora” en slot y/o celda
};

const SKIN = {
  slate: {
    trayBg: "rgba(15,23,42,0.55)",
    trayStroke: "#475569",
    cellBg0: "#0f172a",
    cellBg1: "#142033",
    cellStroke: "#475569",
    text: "#e2e8f0",
    index: "#94a3b8",
    glow: "url(#heap-glow)",
  },
  indigo: {
    trayBg: "rgba(30,41,59,0.55)",
    trayStroke: "#6366f1",
    cellBg0: "#111827",
    cellBg1: "#1f2a44",
    cellStroke: "#6366f1",
    text: "#e5e7eb",
    index: "#a5b4fc",
    glow: "url(#heap-glow)",
  },
  emerald: {
    trayBg: "rgba(6, 24, 19, 0.55)",
    trayStroke: "#34d399",
    cellBg0: "#0b1c18",
    cellBg1: "#102821",
    cellStroke: "#34d399",
    text: "#ecfdf5",
    index: "#6ee7b7",
    glow: "url(#heap-glow)",
  },
} as const;

function pickSkin(style?: LevelOrderStyle) {
  const name = style?.skin ?? "slate";
  return SKIN[name as keyof typeof SKIN] ?? SKIN.slate;
}
// Índices (lane/pill) — misma paleta que el skin
function indexPill(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  txt: string,
  color: string
) {
  // texto para medir
  const t = g
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-weight", 700)
    .style("font-size", "11px")
    .style("fill", color)
    .text(txt);

  const bb = (t.node() as SVGGraphicsElement).getBBox();
  g.insert("rect", "text")
    .attr("x", bb.x - 7)
    .attr("y", bb.y - 3)
    .attr("width", bb.width + 14)
    .attr("height", bb.height + 6)
    .attr("rx", 10)
    .attr("ry", 10)
    .style("fill", "rgba(148,163,184,0.10)")
    .style("stroke", "rgba(148,163,184,0.32)")
    .style("stroke-width", 1)
    .style("filter", "drop-shadow(0 1px 4px rgba(0,0,0,0.28))");
}

// Altura real de la bandeja (usa el mismo cálculo que ensureTray)
function trayHeight() {
  return R * 1.8;
}

const COLORS = {
  target: "#ef4444", // nodo a borrar
  replacer: "#22c55e", // nodo que sube (último)
};

const DUR = {
  caption: 320,
  placeDrop: 900,
  comparePulse: 420,
  compareHold: 780,
  swapPayloadFade: 260,
  swapMove: 1200,
  linkFade: 340,
  settle: 640,
  previewHold: 820,
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
function safeEnd<T extends { end: () => Promise<any> }>(t: T) {
  return t.end().catch(() => null);
}

/* ───────────────────────── Helpers (DOM) ───────────────────────── */

function gNode(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string
) {
  return treeG.select<SVGGElement>(
    `g.heap-node#${CSS.escape(id)}, g.heap-node[id="${id}"]`
  );
}
function gLink(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  parentId: string,
  childId: string
) {
  // 1) intenta por id (compat)
  const byId = treeG.select<SVGGElement>(
    `g.heap-link#link-${CSS.escape(parentId)}-${CSS.escape(childId)}`
  );
  if (!byId.empty()) return byId;

  // 2) fallback robusto por data-attrs (nuevo)
  return treeG.select<SVGGElement>(
    `g.heap-link[data-source="${parentId}"][data-target="${childId}"]`
  );
}
function nodeXYGlobal(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string
): { x: number; y: number } | null {
  const node = gNode(treeG, id).node();
  const svg = svgRoot(treeG)?.node();
  if (!node || !svg) return null;

  // (0,0) en el sistema local del nodo → al sistema del SVG raíz
  const pt = (svg as any).createSVGPoint?.();
  if (!pt || !(node as any).getCTM) {
    // fallback: local (puede desviarse si hay transform del árbol)
    return nodeXY(treeG, id);
  }
  pt.x = 0;
  pt.y = 0;
  const ctm = (node as any).getCTM();
  const gpt = pt.matrixTransform(ctm);
  return { x: gpt.x, y: gpt.y };
}
function normalizeRelation(
  raw: string | undefined | null,
  fallback: ">" | "<" | ">=" | "<=" | "="
): ">" | "<" | ">=" | "<=" | "=" {
  const t = (raw ?? "").trim();
  const map: Record<string, ">" | "<" | ">=" | "<=" | "="> = {
    ">": ">",
    gt: ">",
    greater: ">",
    mayor: ">",
    "≫": ">",
    "<": "<",
    lt: "<",
    less: "<",
    menor: "<",
    "≪": "<",
    ">=": ">=",
    "≥": ">=",
    gte: ">=",
    mayor_igual: ">=",
    "<=": "<=",
    "≤": "<=",
    lte: "<=",
    menor_igual: "<=",
    "=": "=",
    "==": "=",
    "===": "=",
    eq: "=",
    igual: "=",
  };
  return (
    map[t] ?? (["<", ">", "<=", ">=", "="].includes(t) ? (t as any) : fallback)
  );
}
function numericTextOf(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  id: string
): number | null {
  const t = nodeTextSel(treeG, id);
  if (t.empty()) return null;
  const v = Number(t.text());
  return Number.isFinite(v) ? v : null;
}

function inferRelationFromValues(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  childId: string,
  parentId: string
): ">" | "<" | "=" | null {
  const a = numericTextOf(treeG, childId);
  const b = numericTextOf(treeG, parentId);
  if (a == null || b == null) return null;
  if (a > b) return ">";
  if (a < b) return "<";
  return "=";
}

function nodeXY(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string
): { x: number; y: number } | null {
  const node = gNode(treeG, id).node();
  if (!node) return null;
  const tf = node.transform.baseVal.consolidate();
  if (!tf) return null;
  const { e: x, f: y } = tf.matrix;
  return { x, y };
}
function setNodeXY(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  x: number,
  y: number
) {
  gNode(treeG, id).attr("transform", `translate(${x}, ${y})`);
}

function nodeTextSel(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string
) {
  let t = gNode(treeG, id).select<SVGTextElement>("text.node-value");
  if (t.empty()) t = gNode(treeG, id).select<SVGTextElement>("text.value");
  if (t.empty()) t = gNode(treeG, id).select<SVGTextElement>("text");
  return t;
}
function setNodeText(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  v: number | string
) {
  const t = nodeTextSel(treeG, id);
  if (!t.empty()) t.text(String(v));
}

function svgRoot(
  treeG: Selection<SVGGElement, unknown, null, undefined>
): Selection<SVGSVGElement, unknown, null, undefined> | null {
  const svg = treeG.node()?.ownerSVGElement ?? null;
  return svg ? select<SVGSVGElement, unknown>(svg) : null;
}
function ensureCoach(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
  svg.attr("overflow", "visible");
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");
  let layer = svg.select<SVGGElement>("g.heap-coach");
  if (layer.empty()) {
    layer = svg
      .append("g")
      .attr("class", "heap-coach")
      .style("pointer-events", "none")
      .style("opacity", 1)
      .attr("transform", null); // sin offset
  }
  return { layer };
}
async function clearCoach(
  svg: Selection<SVGSVGElement, unknown, null, undefined> | null
) {
  if (!svg) return;
  const layer = svg.select<SVGGElement>("g.heap-coach");
  await safeEnd(
    layer
      .selectAll(".coach-badge,.value-bubble,.beam,.bullseye,.node-halo")
      .transition()
      .duration(120)
      .style("opacity", 0)
  );
  layer
    .selectAll(".coach-badge,.value-bubble,.node-halo,.bullseye,.beam")
    .remove();
}

/* ───────────────────────── Links helpers ───────────────────────── */

function updateLinkPath(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  parentId: string,
  childId: string,
  r = R
) {
  const p = nodeXY(treeG, parentId);
  const c = nodeXY(treeG, childId);
  if (!p || !c) return;
  gLink(treeG, parentId, childId)
    .select<SVGPathElement>("path.tree-link")
    .attr("d", curvedLinkPath(p, c, r, 0.35)); // 👈 curva
}

function updateAllLinks(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  r = R
) {
  treeG.selectAll<SVGGElement, unknown>("g.heap-link").each(function () {
    const g = select(this as SVGGElement);
    const parentId = g.attr("data-source");
    const childId = g.attr("data-target");
    if (!parentId || !childId) return;
    updateLinkPath(treeG, parentId, childId, r);
  });
}
async function fadeLinksTouching(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  ids: string[],
  toOpacity: number,
  dur = DUR.linkFade
) {
  await safeEnd(
    treeG
      .selectAll<SVGGElement, unknown>("g.heap-link")
      .filter(function () {
        const id = (this as SVGGElement).id || "";
        return ids.some(
          (x) => id.startsWith(`link-${x}-`) || id.endsWith(`-${x}`)
        );
      })
      .transition()
      .duration(dur)
      .style("opacity", toOpacity)
  );
}

/* ───────────────────────── Visual flourishes ───────────────────────── */

async function pulseNode(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  stroke = HIGHLIGHT,
  r = R
) {
  const g = gNode(treeG, id);
  const circle = g.select<SVGCircleElement>("circle.node-container");
  if (circle.empty()) return;

  const ring = g
    .append("circle")
    .attr("class", "pulse-ring")
    .attr("r", r + 2)
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", 2)
    .style("opacity", 0.9);

  await Promise.all([
    safeEnd(
      circle
        .transition()
        .duration(DUR.comparePulse)
        .attr("stroke", stroke)
        .attr("stroke-width", 2)
    ),
    safeEnd(
      ring
        .transition()
        .duration(DUR.comparePulse + 200)
        .attr("r", r + 12)
        .style("opacity", 0)
        .remove()
    ),
  ]);

  await safeEnd(
    circle
      .transition()
      .duration(160)
      .attr("stroke", STROKE_COLOR)
      .attr("stroke-width", STROKE_WIDTH)
  );
}

function glowLinkOnce(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  parentId: string,
  childId: string
) {
  const link = gLink(treeG, parentId, childId).select<SVGPathElement>(
    "path.tree-link"
  );
  if (link.empty()) return;

  const baseStroke = link.attr("stroke") || "#64748b";
  const baseWidth = Number(link.attr("stroke-width") || 2);
  const len = (link.node() as SVGPathElement).getTotalLength?.() ?? 100;

  link
    .attr("stroke", HIGHLIGHT)
    .attr("stroke-width", baseWidth + 1.2)
    .attr("stroke-dasharray", `${len / 6},${len / 3}`)
    .attr("stroke-dashoffset", len)
    .transition()
    .duration(DUR.linkFade + 420)
    .ease(easePolyInOut)
    .attr("stroke-dashoffset", 0)
    .transition()
    .duration(180)
    .attr("stroke", baseStroke)
    .attr("stroke-width", baseWidth)
    .on("end", () => {
      link.attr("stroke-dasharray", null).attr("stroke-dashoffset", null);
    });
}

async function haloOnce(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  color = HIGHLIGHT,
  r = R
) {
  const g = gNode(treeG, id);
  if (g.empty()) return;
  const halo = g
    .append("circle")
    .attr("class", "node-halo")
    .attr("r", r + 2)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .style("opacity", 0.85);
  await safeEnd(
    halo
      .transition()
      .duration(360)
      .attr("r", r + 12)
      .style("opacity", 0)
      .remove()
  );
}
// Hojas a partir de links (preferido)
function leafIdsFromLinks(links: TreeLinkData[]): string[] {
  const parents = new Set<string>();
  const children = new Set<string>();
  for (const l of links ?? []) {
    parents.add(l.sourceId);
    children.add(l.targetId);
  }
  // hoja = aparece como child pero nunca como parent
  return [...children].filter((id) => !parents.has(id));
}

// Fallback: hojas leyendo la capa de links del DOM
function leafIdsFromDOM(
  treeG: Selection<SVGGElement, unknown, null, undefined>
): string[] {
  const parents = new Set<string>();
  const children = new Set<string>();
  treeG.selectAll<SVGGElement, unknown>("g.heap-link").each(function () {
    const g = select(this as SVGGElement);
    const s = g.attr("data-source");
    const t = g.attr("data-target");
    if (s) parents.add(s);
    if (t) children.add(t);
  });

  // si no hay links en DOM, no sabemos; devolvemos vacío
  if (!parents.size && !children.size) return [];

  return [...children].filter((id) => !parents.has(id));
}

// “chispas” (mini círculos) siguiendo una trayectoria
function spawnTrail(
  layer: Selection<SVGGElement, unknown, null, undefined>,
  getXY: (t: number) => { x: number; y: number },
  life = 420
) {
  let t = 0;
  const id = setInterval(() => {
    t += 0.08;
    if (t > 1) {
      clearInterval(id);
      return;
    }
    const { x, y } = getXY(Math.max(0, t - 0.02));
    const dot = layer
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 2.2)
      .style("fill", "#e2e8f0")
      .style("opacity", 0.75);
    dot.transition().duration(life).style("opacity", 0).attr("r", 0.4).remove();
  }, 28);
}

/** “Burbuja” que viaja de A→B con el valor (para payload swap) */
async function flyValueBubble(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  fromId: string,
  toId: string
) {
  const A = nodeXY(treeG, fromId);
  const B = nodeXY(treeG, toId);
  const ta = nodeTextSel(treeG, fromId);
  if (!A || !B || ta.empty()) return;

  const val = ta.text();
  const g = svgRoot(treeG)?.select("g.heap-coach");
  if (!g) return;
  const bubble = g
    .append("text")
    .attr("class", "value-bubble")
    .attr("x", A.x)
    .attr("y", A.y)
    .style("font-size", "14px")
    .style("font-weight", 700)
    .style("fill", "#e2e8f0")
    .style("opacity", 0.95)
    .text(val);

  await safeEnd(
    bubble
      .transition()
      .duration(Math.max(380, DUR.swapMove * 0.6))
      .ease(easePolyInOut)
      .attr("x", B.x)
      .attr("y", B.y)
      .style("opacity", 0)
      .remove()
  );
}

async function swapPayloadText(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  aId: string,
  bId: string
) {
  const ta = nodeTextSel(treeG, aId);
  const tb = nodeTextSel(treeG, bId);
  if (ta.empty() || tb.empty()) return;

  const va = ta.text();
  const vb = tb.text();

  await Promise.all([
    pulseNode(treeG, aId),
    pulseNode(treeG, bId),
    flyValueBubble(treeG, aId, bId),
    flyValueBubble(treeG, bId, aId),
    safeEnd(ta.transition().duration(DUR.swapPayloadFade).style("opacity", 0)),
    safeEnd(tb.transition().duration(DUR.swapPayloadFade).style("opacity", 0)),
  ]);

  ta.text(vb);
  tb.text(va);

  await Promise.all([
    safeEnd(ta.transition().duration(DUR.swapPayloadFade).style("opacity", 1)),
    safeEnd(tb.transition().duration(DUR.swapPayloadFade).style("opacity", 1)),
  ]);
}

// solo lo usa insert cuando el transcript NO es de payload
async function swapMoveGroups(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  aId: string,
  bId: string
) {
  const A = nodeXY(treeG, aId);
  const B = nodeXY(treeG, bId);
  if (!A || !B) return;

  const ga = gNode(treeG, aId);
  const gb = gNode(treeG, bId);

  const midX = (A.x + B.x) / 2;
  const midY = (A.y + B.y) / 2;
  const dx = B.x - A.x,
    dy = B.y - A.y;
  const dist = Math.hypot(dx, dy);
  const lift = Math.min(36, Math.max(16, dist * 0.22));

  const C1 = { x: midX, y: midY - lift }; // A→B
  const C2 = { x: midX, y: midY + lift }; // B→A

  const svg = svgRoot(treeG);
  if (!svg) return;
  const layer = svg.select<SVGGElement>("g.heap-coach");

  const bezier = (P0: any, P1: any, P2: any) => (t: number) => ({
    x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
    y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
  });

  const pathA = bezier(A, C1, B);
  const pathB = bezier(B, C2, A);

  spawnTrail(layer, pathA);
  spawnTrail(layer, pathB);

  const scaleAt = (t: number) => {
    const sx = 1 + 0.12 * Math.sin(Math.PI * t);
    const sy = 2 - sx;
    return { sx, sy };
  };

  const tA = safeEnd(
    ga
      .transition()
      .duration(DUR.swapMove)
      .ease(easePolyInOut)
      .tween("pos+scale", () => {
        return (tt: number) => {
          const { x, y } = pathA(tt);
          const { sx, sy } = scaleAt(tt);
          ga.attr("transform", `translate(${x}, ${y}) scale(${sx},${sy})`);
        };
      })
      .on("end", () => ga.attr("transform", `translate(${B.x}, ${B.y})`))
  );

  const tB = safeEnd(
    gb
      .transition()
      .duration(DUR.swapMove)
      .ease(easePolyInOut)
      .tween("pos+scale", () => {
        return (tt: number) => {
          const { x, y } = pathB(tt);
          const { sx, sy } = scaleAt(tt);
          gb.attr("transform", `translate(${x}, ${y}) scale(${sx},${sy})`);
        };
      })
      .on("end", () => gb.attr("transform", `translate(${A.x}, ${A.y})`))
  );

  await Promise.all([tA, tB]);
  ga.attr("transform", `translate(${B.x}, ${B.y})`);
  gb.attr("transform", `translate(${A.x}, ${A.y})`);
}

/* ───────────────────────── Link badges ───────────────────────── */

function drawLinkBadge(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  childId: string,
  parentId: string,
  label: string,
  opts?: { offset?: number; padX?: number; padY?: number; className?: string }
) {
  const svg = svgRoot(treeG);
  if (!svg) return;
  ensureCoach(svg);

  // ⬇️ usar posiciones globales
  const a = nodeXYGlobal(treeG, childId);
  const b = nodeXYGlobal(treeG, parentId);
  if (!a || !b) return;

  const dx = b.x - a.x,
    dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L,
    uy = dy / L;
  const nx = -uy,
    ny = ux;

  const offset = opts?.offset ?? 12;
  const padX = opts?.padX ?? 8;
  const padY = opts?.padY ?? 4;
  const className = opts?.className ?? "compare";

  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const cx = mid.x + nx * offset;
  const cy = mid.y + ny * offset;

  const layer = svg.select<SVGGElement>("g.heap-coach");
  const badge = layer
    .append("g")
    .attr("class", `coach-badge ${className}`)
    .style("opacity", 0)
    .attr("transform", `translate(${cx}, ${cy}) scale(0.6)`);

  const txt = badge
    .append("text")
    .attr("class", "coach-badge-text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-weight", 700)
    .style("font-size", "12px")
    .style("fill", "#e2e8f0")
    .text(label);

  const bb = (txt.node() as SVGGraphicsElement).getBBox();
  const w = bb.width + padX * 2;
  const h = bb.height + padY * 2;

  badge
    .insert("rect", "text")
    .attr("class", "coach-badge-bg")
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("x", -w / 2)
    .attr("y", -h / 2)
    .attr("width", w)
    .attr("height", h)
    .style("fill", "rgba(30,41,59,0.85)")
    .style("stroke", "#475569")
    .style("stroke-width", 1.2)
    .style("filter", "drop-shadow(0 1px 4px rgba(0,0,0,0.35))");

  badge
    .transition()
    .duration(140)
    .style("opacity", 0.95)
    .attr("transform", `translate(${cx}, ${cy}) scale(1.08)`)
    .transition()
    .duration(120)
    .attr("transform", `translate(${cx}, ${cy}) scale(1.0)`);
}

async function clearLinkBadges(
  treeG: Selection<SVGGElement, unknown, null, undefined>
) {
  const svg = svgRoot(treeG);
  if (!svg) return;
  await safeEnd(
    svg
      .selectAll("g.heap-coach .coach-badge")
      .transition()
      .duration(120)
      .style("opacity", 0)
  );
  svg.selectAll("g.heap-coach .coach-badge").remove();
}

function drawCompareBadge(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  childId: string,
  parentId: string,
  relation?: string
) {
  const op =
    relation && ["<", ">", "<=", ">=", "="].includes(relation) ? relation : ">";
  drawLinkBadge(treeG, childId, parentId, op, { className: "compare" });
}

function highlightLinkOnce(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  parentId: string,
  childId: string
) {
  const link = gLink(treeG, parentId, childId).select<SVGPathElement>(
    "path.tree-link"
  );
  if (link.empty()) return;

  const len = (link.node() as SVGPathElement).getTotalLength?.() ?? 80;
  link
    .attr("stroke-dasharray", `${len / 6},${len / 3}`)
    .attr("stroke-dashoffset", len)
    .transition()
    .duration(DUR.linkFade + 400)
    .ease(easePolyInOut)
    .attr("stroke-dashoffset", 0)
    .on("end", () => {
      link.attr("stroke-dasharray", null).attr("stroke-dashoffset", null);
    });
}

/* ───────────────────────── Reconstrucción level-order ───────────────────────── */

function currentLevelOrderIds(linksData: TreeLinkData[]): string[] {
  const sources = new Set<string>();
  const targets = new Set<string>();
  for (const l of linksData) {
    sources.add(l.sourceId);
    targets.add(l.targetId);
  }
  let rootId: string | null = null;
  for (const s of sources) {
    if (!targets.has(s)) {
      rootId = s;
      break;
    }
  }
  if (!rootId) return [];

  const kids = new Map<string, string[]>();
  for (const l of linksData) {
    if (!kids.has(l.sourceId)) kids.set(l.sourceId, []);
    kids.get(l.sourceId)!.push(l.targetId);
  }

  const out: string[] = [];
  const q: string[] = [rootId];
  while (q.length) {
    const id = q.shift()!;
    out.push(id);
    const ch = kids.get(id) ?? [];
    for (const c of ch) q.push(c);
  }
  return out;
}

function buildIndexToXYFromDOM(
  linksData: TreeLinkData[],
  positionsById: Map<string, { x: number; y: number }>
): Map<number, { x: number; y: number }> {
  const byIndex = new Map<number, { x: number; y: number }>();
  const ids = currentLevelOrderIds(linksData);
  ids.forEach((id, i) => {
    const p = positionsById.get(id);
    if (p) byIndex.set(i, { x: p.x, y: p.y });
  });
  return byIndex;
}

/* ───────────────────────── Snapshots & layout ───────────────────────── */

function setSnapshotTexts(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  snapshot: Array<{ id: string; value: number }>
) {
  const map = new Map(snapshot.map((x) => [x.id, x.value]));
  treeG.selectAll<SVGGElement, unknown>("g.heap-node").each(function () {
    const id =
      (this as SVGGElement).id ||
      (this as SVGGElement).getAttribute("id") ||
      "";
    if (!id) return;
    const v = map.get(id);
    if (v == null) return;
    select(this)
      .selectAll<SVGTextElement, unknown>("text.node-value, text.value, text")
      .text(String(v));
  });
}

async function repositionAll(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  positionsById: Map<string, { x: number; y: number }>,
  r = R
) {
  const tNodes = safeEnd(
    treeG
      .selectAll<SVGGElement, unknown>("g.heap-node")
      .transition()
      .duration(DUR.settle)
      .ease(easePolyInOut)
      .attr("transform", function () {
        const id =
          (this as SVGGElement).id ||
          (this as SVGGElement).getAttribute("id") ||
          "";
        const p = id ? positionsById.get(id) : undefined;
        return p ? `translate(${p.x}, ${p.y})` : select(this).attr("transform");
      })
  );

  // Capa de enlaces (siempre la misma)
  const L = ensureLinksLayer(treeG);

  // Limpia enlaces “legacy” que no estén en la capa (por compatibilidad)
  treeG.selectAll<SVGGElement, unknown>(":scope > g.heap-link").remove();

  // JOIN de enlaces en la capa
  const linkSel = L.selectAll<SVGGElement, TreeLinkData>("g.heap-link").data(
    linksData,
    (d: any) => `link-${d.sourceId}-${d.targetId}`
  );

  linkSel.exit().remove();

  const linkEnter = linkSel
    .enter()
    .append("g")
    .attr("class", "heap-link")
    .attr("id", (d) => `link-${d.sourceId}-${d.targetId}`)
    .attr("data-source", (d) => d.sourceId)
    .attr("data-target", (d) => d.targetId)
    .style("opacity", 0);

  linkEnter
    .append("path")
    .attr("class", "tree-link")
    .attr("fill", "none")
    .attr("stroke", STROKE_COLOR)
    .attr("stroke-width", Math.max(1.6, STROKE_WIDTH))
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("vector-effect", "non-scaling-stroke")
    .style("pointer-events", "none")
    // evitar “flechas” heredadas
    .attr("marker-start", null)
    .attr("marker-mid", null)
    .attr("marker-end", null)
    .attr("d", (d) => {
      const s = positionsById.get(d.sourceId)!;
      const t = positionsById.get(d.targetId)!;
      return curvedLinkPath(s, t, r, 0.35);
    });

  const linkMerged = linkEnter
    .merge(linkSel as any)
    .attr("data-source", (d) => d.sourceId)
    .attr("data-target", (d) => d.targetId);

  const tLinks = safeEnd(
    linkMerged
      .select<SVGPathElement>("path.tree-link")
      .transition()
      .duration(DUR.settle)
      .ease(easePolyInOut)
      .attr("stroke", STROKE_COLOR)
      .attr("stroke-width", Math.max(1.6, STROKE_WIDTH))
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("marker-start", null)
      .attr("marker-mid", null)
      .attr("marker-end", null)
      .attr("d", (d) => {
        const s = positionsById.get(d.sourceId)!;
        const t = positionsById.get(d.targetId)!;
        return curvedLinkPath(s, t, r, 0.35);
      })
  );

  const fadeAll = safeEnd(
    linkMerged.transition().duration(DUR.linkFade).style("opacity", 1)
  );

  await Promise.all([tNodes, tLinks, fadeAll]);
}

/* ───────────────────────── Insert: normalización+player ───────────────────────── */

type StepCompare = {
  kind: "compare";
  childId: string;
  parentId: string;
  relation?: string;
  raw: any;
};
type StepSwap = { kind: "swap"; aId: string; bId: string; raw: any };
type StepAppend = { kind: "append"; id: string; index: number; raw: any };
type NormStep = StepCompare | StepSwap | StepAppend;

function normalizeSteps(steps: any[]): NormStep[] {
  const out: NormStep[] = [];
  for (const s of steps ?? []) {
    if (
      s.type === "append" &&
      s.item?.id != null &&
      typeof s.index === "number"
    ) {
      out.push({ kind: "append", id: s.item.id, index: s.index, raw: s });
      continue;
    }
    if (s.type === "compareUp") {
      out.push({
        kind: "compare",
        childId: s.childId,
        parentId: s.parentId,
        relation: s.relation,
        raw: s,
      });
      continue;
    }
    if (s.type === "swapUp") {
      out.push({ kind: "swap", aId: s.aId, bId: s.bId, raw: s });
      continue;
    }
    if (s.type === "compare" && s.dir === "up") {
      out.push({
        kind: "compare",
        childId: s.childId,
        parentId: s.parentId,
        relation: s.op ?? s.relation,
        raw: s,
      });
      continue;
    }
    if (s.type === "swap" && s.dir === "up") {
      out.push({
        kind: "swap",
        aId: s.aId ?? s.childId,
        bId: s.bId ?? s.parentId,
        raw: s,
      });
      continue;
    }
  }
  return out;
}

function isPayloadTranscript(t: any): boolean {
  if (!t?.initial || !t?.final) return true;
  const mapI = new Map<string, number>(
    t.initial.map((it: any, i: number) => [it.id, i])
  );
  const mapF = new Map<string, number>(
    t.final.map((it: any, i: number) => [it.id, i])
  );
  for (const [id, i] of mapI) {
    const j = mapF.get(id);
    if (j != null && j !== i) return false;
  }
  return true;
}

async function playInsert(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  steps: any[],
  payloadMode: boolean,
  transcript?: any // 👈 nuevo
) {
  const norm = normalizeSteps(steps);

  for (const s of norm) {
    if (s.kind === "append") {
      await pulseNode(treeG, s.id);
      await wait(120);
      continue;
    }
    if (s.kind === "compare") {
      // default para INSERT: max-heap ⇒ ">", min-heap ⇒ "<"
      const isMax = pickIsMaxHeap(s.raw, transcript) ?? false;
      const defaultOp: ">" | "<" = isMax ? ">" : "<";

      // 1) intenta inferir por texto de los nodos
      const inferred = inferRelationFromValues(treeG, s.childId, s.parentId);
      // 2) usa pista del transcript si existe; si no, cae al default
      const hinted = normalizeRelation(s.relation ?? s.raw?.op, defaultOp);

      // ✅ prioriza lo inferido; luego lo sugerido; luego el default
      const rel = inferred ?? hinted ?? defaultOp;

      drawCompareBadge(treeG, s.childId, s.parentId, rel);

      await Promise.all([
        pulseNode(treeG, s.childId),
        pulseNode(treeG, s.parentId),
      ]);
      await wait(DUR.compareHold + 120);
      await clearLinkBadges(treeG);
      continue;
    }

    if (s.kind === "swap") {
      morphLastBadgeToIn(treeG, "⇅");
      glowLinkOnce(treeG, s.bId, s.aId);
      await fadeLinksTouching(treeG, [s.aId, s.bId], 0);
      await haloOnce(treeG, s.aId);
      if (payloadMode) {
        await swapPayloadText(treeG, s.aId, s.bId);
      } else {
        await swapMoveGroups(treeG, s.aId, s.bId);
        updateAllLinks(treeG);
      }
      await fadeLinksTouching(treeG, [s.aId, s.bId], 1);
      await wait(140);
      await clearLinkBadges(treeG);
      continue;
    }
  }
}

/* ───────────────────────── Delete: normalización+player ───────────────────────── */

type DStepSelectTarget = { kind: "selectTarget"; targetId: string; raw: any };
type DStepReplaceNode = {
  kind: "replaceNode";
  targetId: string;
  withId: string;
  raw: any;
};
type DStepRemoveLast = { kind: "removeLast"; removedId: string; raw: any };
type DStepCompareDown = {
  kind: "compareDown";
  parentId: string;
  childId: string;
  relation?: string;
  raw: any;
};
type DStepSwapDown = { kind: "swapDown"; aId: string; bId: string; raw: any };
type DStepPickChild = {
  kind: "pickChild";
  parentId: string;
  leftId?: string;
  rightId?: string;
  chosen?: "left" | "right" | "none";
  raw: any;
};
type NormDelStep =
  | DStepSelectTarget
  | DStepReplaceNode
  | DStepRemoveLast
  | DStepCompareDown
  | DStepSwapDown
  | DStepPickChild;

function normalizeDeleteSteps(steps: any[]): NormDelStep[] {
  const out: NormDelStep[] = [];
  const delayedRemove: DStepRemoveLast[] = [];

  for (const s of steps ?? []) {
    if (s.type === "selectTarget" && s.targetId) {
      out.push({ kind: "selectTarget", targetId: s.targetId, raw: s });
      continue;
    }
    if (s.type === "replaceNode" && s.targetId && s.withId) {
      out.push({
        kind: "replaceNode",
        targetId: s.targetId,
        withId: s.withId,
        raw: s,
      });
      continue;
    }
    if (s.type === "removeLast" && s.removedId) {
      delayedRemove.push({
        kind: "removeLast",
        removedId: s.removedId,
        raw: s,
      });
      continue;
    }
    if (s.type === "compareDown" && s.parentId && s.childId) {
      out.push({
        kind: "compareDown",
        parentId: s.parentId,
        childId: s.childId,
        relation: s.relation,
        raw: s,
      });
      continue;
    }
    if (s.type === "swapDown" && s.aId && s.bId) {
      out.push({ kind: "swapDown", aId: s.aId, bId: s.bId, raw: s });
      continue;
    }
    if (s.type === "compare" && s.dir === "down") {
      out.push({
        kind: "compareDown",
        parentId: s.parentId ?? s.array?.[s.parentIndex]?.id,
        childId: s.childId,
        relation: s.op ?? s.relation,
        raw: s,
      });
      continue;
    }
    if (s.type === "swap" && s.dir === "down") {
      out.push({
        kind: "swapDown",
        aId: s.aId ?? s.parentId,
        bId: s.bId ?? s.childId,
        raw: s,
      });
      continue;
    }
    if (s.type === "pickChild") {
      const parentId =
        s.parentId ??
        (s.array && typeof s.parentIndex === "number"
          ? s.array[s.parentIndex]?.id
          : undefined);
      out.push({
        kind: "pickChild",
        parentId: parentId ?? "",
        leftId: s.leftId,
        rightId: s.rightId,
        chosen: s.chosen,
        raw: s,
      });
      continue;
    }
  }

  // 👇 Esto garantiza que removeLast NUNCA corra antes del spotlight/heapify
  return [...out, ...delayedRemove];
}

function idInSnapshot(
  snapshot: Array<{ id: string; value: number }> | undefined,
  id: string
): boolean {
  return !!snapshot?.some((it) => it.id === id);
}

/** implosión limpia (para removeLast) */
async function implodeNode(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  color = HIGHLIGHT
) {
  const g = gNode(treeG, id);
  if (g.empty()) return;
  const { x, y } = nodeXY(treeG, id)!;

  const svg = svgRoot(treeG);
  if (svg) {
    const layer = svg.select<SVGGElement>("g.heap-coach");
    const ring = layer
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", R + 14)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .style("opacity", 0.9);
    safeEnd(
      ring
        .transition()
        .duration(360)
        .ease(easePolyInOut)
        .attr("r", 0.1)
        .style("opacity", 0)
        .remove()
    );
  }

  await safeEnd(
    g
      .transition()
      .duration(360)
      .ease(easePolyInOut)
      .tween("shrink", () => {
        return (t: number) => {
          const k = 1 - 0.7 * t;
          g.attr("transform", `translate(${x}, ${y}) scale(${k})`);
          g.style("opacity", String(1 - t));
        };
      })
      .remove()
  );
}
/* ───────────────────────── Laser helpers ───────────────────────── */

async function laserAlongLink(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  parentId: string,
  childId: string,
  opts?: {
    speed?: number; // px/s
    dotR?: number; // radio cabeza
    trail?: boolean; // chispas
    tailWidth?: number; // grosor cola
    color?: string; // color principal
  }
) {
  const svg = svgRoot(treeG);
  const linkG = gLink(treeG, parentId, childId);
  const link = linkG.select<SVGPathElement>("path.tree-link");
  if (!svg || link.empty()) return;

  ensureCoach(svg);
  ensureFxDefs(svg);

  const path = link.node()!;
  const len = path.getTotalLength();
  const color = opts?.color ?? HIGHLIGHT;

  // Actualiza el gradiente de cola a los puntos del path (userSpaceOnUse)
  const p0 = path.getPointAtLength(0);
  const p1 = path.getPointAtLength(len);
  const lg = svg.select("#laser-tail");
  lg.attr("x1", p0.x).attr("y1", p0.y).attr("x2", p1.x).attr("y2", p1.y);

  const speed = Math.max(220, opts?.speed ?? 720);
  const dur = Math.round((len / speed) * 1000);

  // Cola (misma geometría del path) + glow + flecha
  const tail = linkG
    .append<SVGPathElement>("path")
    .attr("class", "beam comet-tail")
    .attr("d", link.attr("d"))
    .attr("fill", "none")
    .attr("stroke", "url(#laser-tail)")
    .attr("stroke-width", opts?.tailWidth ?? 5)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("marker-end", "url(#arrow-cap)")
    .attr("vector-effect", "non-scaling-stroke")
    .style("opacity", 0.0)
    .style("filter", "url(#heap-glow)")
    .style("mix-blend-mode", "screen");

  // Cabeza (cometa)
  const head = linkG
    .append<SVGCircleElement>("circle")
    .attr("class", "beam comet-head")
    .attr("r", opts?.dotR ?? 3.6)
    .attr("cx", p0.x)
    .attr("cy", p0.y)
    .style("fill", color)
    .style("filter", "url(#heap-glow)")
    .style("mix-blend-mode", "screen")
    .style("pointer-events", "none");

  // Breve fade-in de la cola
  await safeEnd(tail.transition().duration(120).style("opacity", 0.85));

  // Estela de chispas (opcional)
  let trailId: any = null;
  if (opts?.trail !== false) {
    const start = performance.now();
    trailId = setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / dur);
      const pt = path.getPointAtLength(t * len);
      const spark = linkG
        .append("circle")
        .attr("class", "beam comet-spark")
        .attr("cx", pt.x)
        .attr("cy", pt.y)
        .attr("r", 3.4)
        .style("fill", "url(#crumb-radial)")
        .style("opacity", 0.95)
        .style("pointer-events", "none")
        .style("mix-blend-mode", "screen");
      spark
        .transition()
        .duration(420)
        .attr("r", 0.1)
        .style("opacity", 0)
        .remove();
    }, 42);
  }

  // Animación de la cabeza siguiendo el path real
  await safeEnd(
    head
      .transition()
      .duration(dur)
      .ease(easePolyInOut)
      .tween("follow-path", () => {
        return (t: number) => {
          const pt = path.getPointAtLength(t * len);
          head.attr("cx", pt.x).attr("cy", pt.y);
          // La cola “recorta”: length proporcional para simular arrastre
          const cut = Math.max(0, len * (t - 0.2));

          // Hack liviano: usamos stroke-dasharray/ofs para “recorte”
          tail
            .attr("stroke-dasharray", `${Math.max(0, len * t)}, ${len}`)
            .attr("stroke-dashoffset", `${-cut}`);
        };
      })
  );

  if (trailId) clearInterval(trailId);

  await Promise.all([
    safeEnd(head.transition().duration(120).style("opacity", 0).remove()),
    safeEnd(tail.transition().duration(160).style("opacity", 0).remove()),
  ]);
}

function dropBreadcrumb(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string
) {
  const g = gNode(treeG, id);
  if (g.empty()) return;

  const crumb = g
    .append("circle")
    .attr("class", "crumb")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", R - 6)
    .attr("fill", "none")
    .attr("stroke", "url(#laser-tail)")
    .attr("stroke-width", 3)
    .style("opacity", 0.0)
    .style("filter", "url(#heap-glow)")
    .style("mix-blend-mode", "screen");

  crumb
    .transition()
    .duration(140)
    .style("opacity", 0.9)
    .transition()
    .duration(720)
    .attr("r", R + 8)
    .style("opacity", 0)
    .remove();
}
async function portalPulse(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  color = HIGHLIGHT
) {
  const g = gNode(treeG, id);
  if (g.empty()) return;
  const k = g.append("g").attr("class", "portal");

  const ring = (r0: number, r1: number, dur: number) =>
    k
      .append("circle")
      .attr("r", r0)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .style("opacity", 0.9)
      .transition()
      .duration(dur)
      .ease(easePolyInOut)
      .attr("r", r1)
      .style("opacity", 0)
      .remove();

  await Promise.all([
    safeEnd(ring(R + 2, R + 14, 360)),
    safeEnd(ring(R + 10, R + 24, 540)),
  ]);

  k.remove();
}

/** cambia el label del último badge visible (p.e. ">" → "⇅") */
function morphLastBadgeToIn(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  label: string
) {
  const svg = svgRoot(treeG);
  if (!svg) return;
  const layer = svg.select<SVGGElement>("g.heap-coach");
  const b = layer.select<SVGGElement>("g.coach-badge:last-of-type");
  if (b.empty()) return;
  const t = b.select<SVGTextElement>("text.coach-badge-text");
  const m = b.attr("transform") || "";
  b.transition()
    .duration(90)
    .attr("transform", `${m} scale(0.86)`)
    .transition()
    .duration(110)
    .on("start", () => t.text(label))
    .attr("transform", m);
}

/* ───────────────────────── Ripple layout (JOIN completo) ───────────────────────── */
function ensureLinksLayer(
  treeG: Selection<SVGGElement, unknown, null, undefined>
) {
  let layer = treeG.select<SVGGElement>("g.heap-links-layer");
  if (layer.empty()) {
    layer = treeG
      .insert<SVGGElement>("g", ":first-child")
      .attr("class", "heap-links-layer");
  }
  return layer;
}

async function repositionWithRipple(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  positionsById: Map<string, { x: number; y: number }>,
  pivotId: string | null,
  r = R
) {
  const pivot = pivotId ? nodeXY(treeG, pivotId) : null;
  const baseDelay = 18;

  // NODOS (ripple)
  const transNodes = safeEnd(
    treeG
      .selectAll<SVGGElement, unknown>("g.heap-node")
      .transition()
      .delay(function () {
        if (!pivot) return 0;
        const id =
          (this as SVGGElement).id ||
          (this as SVGGElement).getAttribute("id") ||
          "";
        const p = positionsById.get(id);
        if (!p) return 0;
        const d = Math.hypot(p.x - pivot.x, p.y - pivot.y);
        return Math.min(220, (d / 40) * baseDelay);
      })
      .duration(DUR.settle)
      .ease(easePolyInOut)
      .attr("transform", function () {
        const id =
          (this as SVGGElement).id ||
          (this as SVGGElement).getAttribute("id") ||
          "";
        const p = id ? positionsById.get(id) : undefined;
        return p ? `translate(${p.x}, ${p.y})` : select(this).attr("transform");
      })
  );

  // Capa de enlaces (siempre la misma)
  const L = ensureLinksLayer(treeG);
  // Limpia enlaces sueltos fuera de la capa
  treeG.selectAll<SVGGElement, unknown>(":scope > g.heap-link").remove();

  // JOIN de enlaces en la capa
  const linkSel = L.selectAll<SVGGElement, TreeLinkData>("g.heap-link").data(
    linksData,
    (d: any) => `link-${d.sourceId}-${d.targetId}`
  );

  linkSel.exit().remove();

  const linkEnter = linkSel
    .enter()
    .append("g")
    .attr("class", "heap-link")
    .attr("id", (d) => `link-${d.sourceId}-${d.targetId}`)
    .attr("data-source", (d) => d.sourceId)
    .attr("data-target", (d) => d.targetId)
    .style("opacity", 0);

  linkEnter
    .append("path")
    .attr("class", "tree-link")
    .attr("fill", "none")
    .attr("stroke", STROKE_COLOR)
    .attr("stroke-width", Math.max(1.6, STROKE_WIDTH))
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("vector-effect", "non-scaling-stroke")
    .style("pointer-events", "none")
    .attr("marker-start", null)
    .attr("marker-mid", null)
    .attr("marker-end", null)
    .attr("d", (d) => {
      const s = positionsById.get(d.sourceId)!;
      const t = positionsById.get(d.targetId)!;
      return curvedLinkPath(s, t, r, 0.35);
    });

  const linkMerged = linkEnter
    .merge(linkSel as any)
    .attr("data-source", (d) => d.sourceId)
    .attr("data-target", (d) => d.targetId);

  const transLinks = safeEnd(
    linkMerged
      .select<SVGPathElement>("path.tree-link")
      .transition()
      .delay(function (d) {
        if (!pivot) return 0;
        const s = positionsById.get(d.sourceId)!;
        const t = positionsById.get(d.targetId)!;
        const mx = (s.x + t.x) / 2;
        const my = (s.y + t.y) / 2;
        const d0 = Math.hypot(mx - pivot.x, my - pivot.y);
        return Math.min(220, (d0 / 40) * baseDelay);
      })
      .duration(DUR.settle)
      .ease(easePolyInOut)
      .attr("stroke", STROKE_COLOR)
      .attr("stroke-width", Math.max(1.6, STROKE_WIDTH))
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("marker-start", null)
      .attr("marker-mid", null)
      .attr("marker-end", null)
      .attr("d", (d) => {
        const s = positionsById.get(d.sourceId)!;
        const t = positionsById.get(d.targetId)!;
        return curvedLinkPath(s, t, r, 0.35);
      })
  );

  const fadeAll = safeEnd(
    linkMerged.transition().duration(DUR.linkFade).style("opacity", 1)
  );

  await Promise.all([transNodes, transLinks, fadeAll]);
}

// ── Construye enlaces padre→hijo usando índices level-order del snapshot
function linksFromSnapshot(
  snap: Array<{ id: string; index?: number; hidden?: boolean }>
): TreeLinkData[] {
  if (!Array.isArray(snap) || snap.length === 0) return [];

  const hasDenseIndex = snap.every(
    (it, _i) => !it.hidden && typeof it.index === "number" && it.index >= 0
  );

  const idAtIndex = new Map<number, string>();

  if (hasDenseIndex) {
    for (const it of snap) {
      if (!it.hidden) idAtIndex.set(it.index!, it.id);
    }
  } else {
    // fallback: asume que snap ya viene en level-order
    snap.forEach((it, i) => {
      if (!it.hidden) idAtIndex.set(i, it.id);
    });
  }

  const links: TreeLinkData[] = [];
  // Usa el índice “efectivo” (denso) para conectar 2*i+1 / 2*i+2
  for (let i = 0; i < idAtIndex.size; i++) {
    const id = idAtIndex.get(i);
    if (!id) continue;
    const L = idAtIndex.get(2 * i + 1);
    const R = idAtIndex.get(2 * i + 2);
    if (L) links.push({ sourceId: id, targetId: L });
    if (R) links.push({ sourceId: id, targetId: R });
  }
  return links;
}

/* ───────────────────────── Players públicos ───────────────────────── */

async function bounceTo(
  sel: Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  overshoot = 10,
  t = DUR.placeDrop
) {
  await safeEnd(
    sel
      .transition()
      .duration(Math.round(t * 0.75))
      .ease(easePolyInOut)
      .attr("transform", `translate(${x}, ${y + overshoot})`)
  );
  await safeEnd(
    sel
      .transition()
      .duration(Math.round(t * 0.25))
      .ease(easePolyInOut)
      .attr("transform", `translate(${x}, ${y})`)
  );
}

async function moveGroupToNode(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  fromId: string,
  toId: string
) {
  const dst = nodeXY(treeG, toId);
  if (!dst) return;
  await bounceTo(gNode(treeG, fromId), dst.x, dst.y, 10, DUR.placeDrop);
  setNodeXY(treeG, fromId, dst.x, dst.y);
}

export async function animateHeapInsert(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  data: { transcript: any; linksData: TreeLinkData[] },
  positions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>,
  r = R
) {
  try {
    const { transcript, linksData } = data;
    const svg = svgRoot(treeG);
    const appendRaw = (transcript.steps || []).find(
      (s: any) => s.type === "append"
    );
    const insertedId: string | null = appendRaw?.item?.id ?? null;
    const insertedValue: number | null = appendRaw?.item?.value ?? null;
    const insertedIndex: number | null =
      typeof appendRaw?.index === "number" ? appendRaw.index : null;

    if (!transcript?.initial || !Array.isArray(transcript.steps)) {
      await repositionAll(treeG, linksData, positions, r);
      return;
    }

    // 0) Oculta links para evitar ruido
    treeG.selectAll<SVGGElement, unknown>("g.heap-link").style("opacity", 0);

    // 1) Colocar todos según snapshot inicial (por índice level-order)
    const idxXY = buildIndexToXYFromDOM(linksData, positions);
    transcript.initial.forEach((it: any, i: number) => {
      const p = idxXY.get(i);
      if (p) setNodeXY(treeG, it.id, p.x, p.y);
    });
    setSnapshotTexts(treeG, transcript.initial);
    updateAllLinks(treeG, r);

    // 1.a) Coloca y fija el texto del nuevo nodo usando 'append'
    if (insertedId && insertedIndex != null) {
      const p = idxXY.get(insertedIndex);
      if (p) {
        if (insertedValue != null)
          setNodeText(treeG, insertedId, insertedValue);
        setNodeXY(treeG, insertedId, p.x, p.y);
      }
    }

    // 1.b) Drop animado del recién insertado
    if (insertedId && insertedIndex != null) {
      const slot = idxXY.get(insertedIndex);
      if (slot) {
        setNodeXY(treeG, insertedId, slot.x, slot.y - 72);
        await bounceTo(
          gNode(treeG, insertedId),
          slot.x,
          slot.y,
          10,
          DUR.placeDrop
        );

        const pIdx = Math.floor((insertedIndex - 1) / 2);
        if (pIdx >= 0 && transcript.initial[pIdx]) {
          const parentId = transcript.initial[pIdx].id;
          const linkG = gLink(treeG, parentId, insertedId);
          linkG.style("opacity", 0);
          updateLinkPath(treeG, parentId, insertedId, r);
          await safeEnd(
            linkG.transition().duration(DUR.linkFade).style("opacity", 1)
          );
          highlightLinkOnce(treeG, parentId, insertedId);
        }
      }
    }

    // 3) Reproducir compare/swap
    const payloadMode = isPayloadTranscript(transcript);
    await playInsert(treeG, transcript.steps, payloadMode, transcript);

    // 4) Asentar estado final (posiciones + textos) y mostrar links
    await repositionAll(treeG, linksData, positions, r);
    if (transcript.final) setSnapshotTexts(treeG, transcript.final);
    await safeEnd(
      treeG
        .selectAll<SVGGElement, unknown>("g.heap-link")
        .transition()
        .duration(DUR.settle)
        .style("opacity", 1)
    );

    await clearCoach(svg);
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/* ───────────────────────── Delete (coreografía nueva) ───────────────────────── */

async function playDelete(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  transcript: any
) {
  const steps = normalizeDeleteSteps(transcript?.steps ?? []);

  // Actores
  const sel = steps.find((s) => s.kind === "selectTarget") as
    | DStepSelectTarget
    | undefined;
  const rep = steps.find((s) => s.kind === "replaceNode") as
    | DStepReplaceNode
    | undefined;

  const targetId = sel?.targetId ?? rep?.targetId;
  const replacerId = rep?.withId;

  // Spotlight target → replacer (sin “flecha”)
  if (targetId) {
    await pulseNode(treeG, targetId, COLORS.target, R);
    await wait(140);
  }
  if (targetId && replacerId) {
    await pulseNode(treeG, replacerId, COLORS.replacer, R);
    // ❌ antes: beamBetween(treeG, replacerId, targetId);
    // ✅ dejemos un halo suave sobre el target para marcar el reemplazo
    await haloOnce(treeG, targetId, COLORS.replacer, R);
    await wait(160);

    // replaceNode: solo payload swap (sube el valor)
    await pulseNode(treeG, replacerId, COLORS.replacer, R);
    await haloOnce(treeG, targetId, COLORS.replacer, R);

    // mover el grupo del reemplazante a la posición del target
    await moveGroupToNode(treeG, replacerId, targetId);

    // el target desaparece del heap tras el replace+pop → implosionarlo ya
    await implodeNode(treeG, targetId, COLORS.target);
    await wait(120);
  }

  // Heapify-down (todo sin depender de g.heap-link existentes)
  for (const s of steps) {
    if (s.kind === "pickChild") {
      const chosenId =
        s.chosen === "left"
          ? s.leftId
          : s.chosen === "right"
            ? s.rightId
            : null;

      if (chosenId) {
        await Promise.all([
          pulseNode(treeG, s.parentId, HIGHLIGHT, R),
          pulseNode(treeG, chosenId, HIGHLIGHT, R),
        ]);
      } else {
        await pulseNode(treeG, s.parentId, HIGHLIGHT, R);
      }
      await wait(160);
      continue;
    }

    if (s.kind === "compareDown") {
      // default para DELETE (heapify-down): max-heap ⇒ "<", min-heap ⇒ ">"
      const isMax = pickIsMaxHeap(s.raw, transcript) ?? false;
      const defaultOp: "<" | ">" = isMax ? "<" : ">";

      const hinted = normalizeRelation(
        s.relation ?? (s as any).raw?.op,
        defaultOp
      );
      const inferred = inferRelationFromValues(treeG, s.childId, s.parentId);

      const rel = inferred ?? hinted ?? defaultOp;

      drawCompareBadge(treeG, s.childId, s.parentId, rel);
      await Promise.all([
        pulseNode(treeG, s.parentId, HIGHLIGHT, R),
        pulseNode(treeG, s.childId, HIGHLIGHT, R),
      ]);
      await wait(DUR.compareHold);
      await clearLinkBadges(treeG);
      continue;
    }

    if (s.kind === "swapDown") {
      morphLastBadgeToIn(treeG, "⇅");
      // ❌ antes: glowLinkOnce(treeG, s.aId, s.bId);
      await swapPayloadText(treeG, s.aId, s.bId); // solo payload
      await wait(120);
      await clearLinkBadges(treeG);
      continue;
    }
  }

  // removeLast → implosiona si ese id ya no aparece en final
  for (const s of steps) {
    if (s.kind === "removeLast") {
      const still = idInSnapshot(transcript?.final, s.removedId);
      if (!still) {
        await implodeNode(treeG, s.removedId, HIGHLIGHT);
        await wait(100);
      }
    }
  }

  await clearCoach(svgRoot(treeG));
}
function pickIsMaxHeap(meta?: any, t?: any): boolean | undefined {
  return (
    meta?.maxHeap ??
    (meta?.heapType != null ? meta.heapType === "max" : undefined) ??
    t?.maxHeap ??
    (t?.heapType != null ? t.heapType === "max" : undefined)
  );
}

/** Reposiciona todo con efecto “ripple” y teje links */
export async function animateHeapDelete(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  data: {
    deletedId: string;
    updatedRootId: string | null;
    linksData: TreeLinkData[];
    heapFix?: any | null;
    transcript?: any | null;
    preview?: {
      fromId?: string;
      toId?: string;
      fromXY?: { x: number; y: number };
      toXY?: { x: number; y: number };
      fromValue?: number | string;
    };
    initialLinksData?: TreeLinkData[];
    initialPositionsById?: Map<string, { x: number; y: number }>;
  },
  positions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>,
  r = R
) {
  try {
    const { deletedId, transcript } = data;
    const svg = svgRoot(treeG);

    // Detectar actores para posibles "ghosts"
    const stepsNorm = normalizeDeleteSteps(transcript?.steps ?? []);
    const sel = stepsNorm.find((s) => s.kind === "selectTarget") as
      | DStepSelectTarget
      | undefined;
    const rep = stepsNorm.find((s) => s.kind === "replaceNode") as
      | DStepReplaceNode
      | undefined;
    const targetId = sel?.targetId ?? rep?.targetId ?? null;
    const replacerId = rep?.withId ?? null;

    /* 0) Escenario inicial: snapshot inicial en sus XY previas */
    if (transcript?.initial && Array.isArray(transcript.initial)) {
      const pos0 =
        data.initialPositionsById /* proviene del useEffect (prevRoot) */ ??
        positions; /* último recurso */

      // Asegura existencia de target/replacer por si React ya los removió del DOM
      [targetId, replacerId].forEach((id) => {
        if (!id) return;
        if (gNode(treeG, id).empty()) {
          const snap = transcript.initial.find((x: any) => x.id === id);
          const p = snap ? pos0.get(id) : null;
          if (snap && p) ensureGhostNode(treeG, id, snap.value, p, r);
        }
      });

      // Colocar todos los del snapshot inicial
      for (const it of transcript.initial) {
        const p = pos0.get(it.id);
        if (p) setNodeXY(treeG, it.id, p.x, p.y);
      }

      // Ocultamos links mientras mostramos "pasado"
      treeG.selectAll<SVGGElement, unknown>("g.heap-link").style("opacity", 0);

      setSnapshotTexts(treeG, transcript.initial);
      updateAllLinks(treeG, r);
    }

    // 1) Coreografía delete (spotlight, replace, heapify-down, removeLast)
    if (transcript?.kind === "delete") {
      await playDelete(treeG, transcript);
    }

    // 2) Snapshot final → fijar textos antes del relayout
    if (transcript?.final) {
      setSnapshotTexts(treeG, transcript.final);
      await wait(200);
    }

    // 3) Reposicionar a layout FINAL + JOIN de links
    const fromFinal = transcript?.final
      ? linksFromSnapshot(transcript.final)
      : [];
    const linksForJoin = fromFinal.length ? fromFinal : data.linksData;

    await repositionWithRipple(
      treeG,
      linksForJoin,
      positions,
      data.updatedRootId ?? deletedId,
      r
    );

    // Asegurar visibilidad y geometría final de todos los links (redundante pero seguro)
    await safeEnd(
      treeG
        .selectAll("g.heap-link")
        .transition()
        .duration(180)
        .style("opacity", 1)
    );
    updateAllLinks(treeG, r);

    // 4) Limpieza
    treeG.selectAll<SVGGElement, unknown>("g.heap-node.ghost").remove();
    await clearCoach(svg);
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}
/* ───────────────────────── Search helpers ───────────────────────── */

// Mapa child -> parent leyendo la capa de links actual
function parentMapFromDOM(
  treeG: Selection<SVGGElement, unknown, null, undefined>
): Map<string, string> {
  const map = new Map<string, string>();
  treeG.selectAll<SVGGElement, unknown>("g.heap-link").each(function () {
    const g = select(this as SVGGElement);
    const p = g.attr("data-source");
    const c = g.attr("data-target");
    if (p && c) map.set(c, p);
  });
  return map;
}

// Devuelve ids desde la raíz hasta target (incluyendo target)
function pathRootTo(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  targetId: string
): string[] {
  const pm = parentMapFromDOM(treeG);
  const path: string[] = [];
  let cur: string | undefined = targetId;
  while (cur) {
    path.push(cur);
    cur = pm.get(cur);
  }
  return path.reverse();
}

// Atenúa todo salvo los ids indicados (si excludeIds vacío, atenúa todo)
function dimNodesAndLinks(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  excludeIds = new Set<string>(),
  opacity = 0.2
) {
  treeG
    .selectAll<SVGGElement, unknown>("g.heap-node")
    .transition()
    .duration(160)
    .style("opacity", function () {
      const id =
        (this as SVGGElement).id ||
        (this as SVGGElement).getAttribute("id") ||
        "";
      return excludeIds.has(id) ? 1 : opacity;
    });

  treeG
    .selectAll<SVGGElement, unknown>("g.heap-link")
    .transition()
    .duration(160)
    .style("opacity", function () {
      const g = select(this as SVGGElement);
      const s = g.attr("data-source");
      const t = g.attr("data-target");
      return s && t && (excludeIds.has(s) || excludeIds.has(t)) ? 1 : opacity;
    });
}

// Pequeño bounce local (no cambia layout final)
async function nudgeBounce(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  t = 360
) {
  const g = gNode(treeG, id);
  const xy = nodeXY(treeG, id);
  if (!xy) return;
  await safeEnd(
    g
      .transition()
      .duration(Math.round(t * 0.55))
      .ease(easePolyInOut)
      .attr("transform", `translate(${xy.x}, ${xy.y + 8})`)
  );
  await safeEnd(
    g
      .transition()
      .duration(Math.round(t * 0.45))
      .ease(easePolyInOut)
      .attr("transform", `translate(${xy.x}, ${xy.y})`)
  );
}

// Dianas concéntricas “bullseye”
async function drawBullseye(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  color = HIGHLIGHT
) {
  const g = gNode(treeG, id);
  if (g.empty()) return;

  // Grupo local al nodo para los anillos
  const layer = g.append<SVGGElement>("g").attr("class", "bullseye");

  const rings = [R + 2, R + 10, R + 18];
  const fades = rings.map((rr, i) =>
    layer
      .append("circle")
      .attr("class", "bullseye-ring")
      // IMPORTANTE: centro local del nodo => (0,0)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", rr)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.6 - i * 0.4)
      .attr("vector-effect", "non-scaling-stroke")
      .style("opacity", 0.85 - i * 0.25)
      .transition()
      .duration(540 + i * 120)
      .ease(easePolyInOut)
      .style("opacity", 0)
      .attr("r", rr + 10)
      .remove()
  );

  await Promise.all(fades.map(safeEnd));
  // Cuando todos acaban, eliminamos el contenedor (por limpieza)
  layer.remove();
}
function ensureFxDefs(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Glow suave para trazos
  if (defs.select("#heap-glow").empty()) {
    defs
      .append("filter")
      .attr("id", "heap-glow")
      .append("feGaussianBlur")
      .attr("stdDeviation", 2.2)
      .attr("result", "blur");
  }

  // Cola del cometa: gradiente lineal (se actualiza por path)
  if (defs.select("#laser-tail").empty()) {
    const lg = defs
      .append("linearGradient")
      .attr("id", "laser-tail")
      .attr("gradientUnits", "userSpaceOnUse");
    lg.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#D72638")
      .attr("stop-opacity", 0.85);
    lg.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#D72638")
      .attr("stop-opacity", 0.0);
  }

  // Migas: radial para puntitos suaves
  if (defs.select("#crumb-radial").empty()) {
    const rg = defs.append("radialGradient").attr("id", "crumb-radial");
    rg.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#e2e8f0")
      .attr("stop-opacity", 0.9);
    rg.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#e2e8f0")
      .attr("stop-opacity", 0.0);
  }

  // Flecha sutil al final de la cola
  if (defs.select("#arrow-cap").empty()) {
    const m = defs
      .append("marker")
      .attr("id", "arrow-cap")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", "8")
      .attr("refY", "5")
      .attr("markerWidth", "6")
      .attr("markerHeight", "6")
      .attr("orient", "auto-start-reverse");
    m.append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#D72638")
      .attr("opacity", 0.8);
  }
}
function ensureLoCellGradient(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  c0: string,
  c1: string
) {
  const id = `lo-cell-grad-${c0}-${c1}`;
  if (svg.select(`#${CSS.escape(id)}`).empty()) {
    let defs = svg.select<SVGDefsElement>("defs");
    if (defs.empty()) defs = svg.append("defs");
    const lg = defs
      .append("linearGradient")
      .attr("id", id)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    lg.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", c1)
      .attr("stop-opacity", 0.22);
    lg.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", c0)
      .attr("stop-opacity", 1);
  }
}

/* ───────────────────────── Ghost helper ───────────────────────── */

function ensureGhostNode(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  value: number | string,
  xy: { x: number; y: number },
  r = R
) {
  if (!gNode(treeG, id).empty()) return null;

  const g = treeG
    .append<SVGGElement>("g")
    .attr("class", "heap-node ghost")
    .attr("id", id)
    .attr("transform", `translate(${xy.x}, ${xy.y})`)
    .style("opacity", 1);

  g.append("circle")
    .attr("class", "node-container")
    .attr("r", r)
    .attr("fill", "#0f172a")
    .attr("stroke", STROKE_COLOR)
    .attr("stroke-width", STROKE_WIDTH);

  g.append("text")
    .attr("class", "node-value")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-weight", SVG_STYLE_VALUES?.ELEMENT_TEXT_WEIGHT ?? "600")
    .style("font-size", SVG_STYLE_VALUES?.ELEMENT_TEXT_SIZE ?? "16px")
    .style("fill", "#e2e8f0")
    .text(String(value));

  return g;
}

/* ───────────────────────── Search ───────────────────────── */

export async function animateHeapSearch(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  targetIds: string[],
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>,
  r = R
) {
  try {
    const svg = svgRoot(treeG);
    ensureCoach(svg!);

    // Atenuar para dar foco
    dimNodesAndLinks(treeG);

    for (const targetId of targetIds) {
      const path = pathRootTo(treeG, targetId);
      const focusSet = new Set<string>(path);
      dimNodesAndLinks(treeG, focusSet, 0.15);

      // recorre raíz→nodo con láser hop por hop
      for (let i = 0; i < path.length; i++) {
        const id = path[i];
        await pulseNode(treeG, id, HIGHLIGHT, r);

        if (i > 0) {
          const parent = path[i - 1];
          // brillo base del link
          glowLinkOnce(treeG, parent, id);
          // cometa creativo
          await laserAlongLink(treeG, parent, id, {
            speed: 760,
            dotR: 3.6,
            trail: true,
            tailWidth: 5,
            color: HIGHLIGHT,
          });
        }

        // llegada al nodo
        await portalPulse(treeG, id, HIGHLIGHT);
        dropBreadcrumb(treeG, id);
      }

      // llegada: halo + diana + micro bounce
      await haloOnce(treeG, targetId, HIGHLIGHT, r);
      await drawBullseye(treeG, targetId, HIGHLIGHT);
      await nudgeBounce(treeG, targetId, 340);

      await wait(140);
    }

    // restaurar
    await safeEnd(
      treeG
        .selectAll<SVGGElement, unknown>("g.heap-node, g.heap-link")
        .transition()
        .duration(180)
        .style("opacity", 1)
    );
    await clearCoach(svg || null);
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/* ───────────────────────── Level Order (UI/anim) ───────────────────────── */
const LO = {
  prePulse: 240, // antes de destacar el nodo
  markerBlink: 260, // “parpadeo” del slot destino
  chip: 720, // vuelo de la ficha (más lento y claro)
  placePopIn: 140, // aparición de la celda en el array
  placeSettle: 140, // asentamiento de la celda
  between: 220, // pausa entre elementos
  finalHold: 3000, // ⬅️ mantener array visible 3s al final
  cleanup: 320, // salida del overlay/bandeja
};

type LevelOrderTranscript = {
  kind: "levelOrder";
  /** orden en level-order */
  order: Array<{ id: string; value?: number; index?: number }>;
};

type LevelOrderOpts = {
  orderIds?: string[];
  linksData?: TreeLinkData[];
  band?: { gapY?: number; cellW?: number; cellH?: number; r?: number };
  tray?: {
    left?: number;
    y?: number;
    spacing?: number;
    gutterLeft?: number;
    padFromLeaves?: number;
  };
  style?: LevelOrderStyle; // ⬅️ NUEVO
  transcript?: LevelOrderTranscript | null;
};

function allNodePositions(
  treeG: Selection<SVGGElement, unknown, null, undefined>
): Array<{ id: string; x: number; y: number }> {
  const out: Array<{ id: string; x: number; y: number }> = [];
  treeG.selectAll<SVGGElement, unknown>("g.heap-node").each(function () {
    const id =
      (this as SVGGElement).id ||
      (this as SVGGElement).getAttribute("id") ||
      "";
    if (!id) return;
    const tf = (this as SVGGElement).transform.baseVal.consolidate();
    if (!tf) return;
    out.push({ id, x: tf.matrix.e, y: tf.matrix.f });
  });
  return out;
}

function levelsFromLinks(links: TreeLinkData[]): string[][] {
  // BFS con separación por niveles
  const kids = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const l of links) {
    if (!kids.has(l.sourceId)) kids.set(l.sourceId, []);
    kids.get(l.sourceId)!.push(l.targetId);
    indeg.set(l.targetId, (indeg.get(l.targetId) ?? 0) + 1);
    indeg.set(l.sourceId, indeg.get(l.sourceId) ?? 0);
  }
  const roots = [...indeg.entries()]
    .filter(([, d]) => d === 0)
    .map(([id]) => id);
  const root = roots[0]; // heap: único root
  if (!root) return [];
  const out: string[][] = [];
  const q: string[] = [root];
  while (q.length) {
    const size = q.length;
    const layer: string[] = [];
    for (let i = 0; i < size; i++) {
      const u = q.shift()!;
      layer.push(u);
      for (const v of kids.get(u) ?? []) q.push(v);
    }
    out.push(layer);
  }
  return out;
}

function ensureTray(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  y: number,
  left: number,
  width: number,
  style?: LevelOrderStyle
) {
  ensureFxDefs(svg);
  let tray = svg.select<SVGGElement>("g.levelorder-tray");
  if (tray.empty()) {
    tray = svg
      .append("g")
      .attr("class", "levelorder-tray")
      .style("pointer-events", "none");
  }
  const sk = pickSkin(style);
  const glossy = style?.glossy !== false;
  const showRail = style?.showRail !== false;
  const label = style?.label ?? null;

  const h = R * 1.8;
  const rx = 12;
  const pad = 12;

  // Fondo “glassy”
  const rect = tray
    .selectAll<SVGRectElement, unknown>("rect.tray-bg")
    .data([0]);
  rect
    .enter()
    .append("rect")
    .attr("class", "tray-bg")
    .merge(rect as any)
    .attr("x", left - pad)
    .attr("y", y - h / 2)
    .attr("width", Math.max(width + 2 * pad, 60))
    .attr("height", h)
    .attr("rx", rx)
    .attr("ry", rx)
    .style("fill", sk.trayBg)
    .style("stroke", sk.trayStroke)
    .style("stroke-width", 1.2)
    .style("filter", "drop-shadow(0 2px 8px rgba(0,0,0,0.35))")
    .style("opacity", 0.95);

  // Brillo suave (opcional)
  const gloss = tray
    .selectAll<SVGRectElement, unknown>("rect.tray-gloss")
    .data(glossy ? [0] : []);
  gloss
    .enter()
    .append("rect")
    .attr("class", "tray-gloss")
    .merge(gloss as any)
    .attr("x", left - pad + 6)
    .attr("y", y - h / 2 + 6)
    .attr("width", Math.max(width + 2 * pad - 12, 40))
    .attr("height", Math.max(18, h * 0.35))
    .attr("rx", rx - 6)
    .attr("ry", rx - 6)
    .style("fill", "rgba(255,255,255,0.05)")
    .style("stroke", "none")
    .style("opacity", 1);

  // Rail (línea base) opcional
  const rail = tray
    .selectAll<SVGLineElement, unknown>("line.tray-rail")
    .data(showRail ? [0] : []);
  rail
    .enter()
    .append("line")
    .attr("class", "tray-rail")
    .merge(rail as any)
    .attr("x1", left - pad + 10)
    .attr("x2", left - pad + 10 + Math.max(width + 2 * pad - 20, 40))
    .attr("y1", y + h * 0.26)
    .attr("y2", y + h * 0.26)
    .attr("stroke", sk.trayStroke)
    .attr("stroke-width", 1)
    .attr("opacity", 0.65);

  // Etiqueta discreta
  const labelSel = tray
    .selectAll<SVGTextElement, unknown>("text.tray-label")
    .data(label ? [label] : []);
  labelSel
    .enter()
    .append("text")
    .attr("class", "tray-label")
    .merge(labelSel as any)
    .attr("x", left - pad + 10)
    .attr("y", y - h * 0.45)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "ideographic")
    .style("font-weight", 600)
    .style("font-size", "11px")
    .style("fill", sk.index)
    .text(label ?? "");

  return tray;
}

function drawLevelBand(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  ids: string[],
  color = "rgba(99,102,241,0.18)"
) {
  if (!ids.length) return;
  const pts = ids
    .map((id) => nodeXYGlobal(treeG, id))
    .filter(Boolean) as Array<{ x: number; y: number }>;
  if (!pts.length) return;

  const y = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  const xs = pts.map((p) => p.x);
  const left = Math.min(...xs) - (R + 10);
  const right = Math.max(...xs) + (R + 10);
  const w = Math.max(40, right - left);
  const h = R * 2.2;

  const svg = svgRoot(treeG)!;
  ensureCoach(svg);
  let bands = svg.select<SVGGElement>("g.level-bands");
  if (bands.empty())
    bands = svg
      .append("g")
      .attr("class", "level-bands")
      .style("pointer-events", "none");

  const g = bands.append("g").attr("class", "level-band").style("opacity", 0);
  g.append("rect")
    .attr("x", left)
    .attr("y", y - h / 2)
    .attr("width", w)
    .attr("height", h)
    .attr("rx", 16)
    .attr("ry", 16)
    .style("fill", color)
    .style("stroke", "rgba(99,102,241,0.35)")
    .style("stroke-width", 1)
    .style("filter", "url(#heap-glow)");

  g.transition()
    .duration(220)
    .style("opacity", 1)
    .transition()
    .delay(80 + ids.length * 40)
    .duration(380)
    .style("opacity", 0)
    .remove();
}

function makeSlotMarker(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  xy: { x: number; y: number },
  cell: { w: number; h: number; r: number },
  index?: number,
  style?: LevelOrderStyle,
  indexY?: number // ⬅️ NUEVO: coordenada Y absoluta para la lane
) {
  const sk = pickSkin(style);
  let layer = svg.select<SVGGElement>("g.heap-levelorder-guides");
  if (layer.empty()) {
    layer = svg
      .append("g")
      .attr("class", "heap-levelorder-guides")
      .style("pointer-events", "none");
  }

  const g = layer
    .append<SVGGElement>("g")
    .attr("class", "lo-slot-marker")
    .attr("transform", `translate(${xy.x}, ${xy.y}) scale(0.96)`)
    .style("opacity", 0);

  g.append("rect")
    .attr("x", -cell.w / 2)
    .attr("y", -cell.h / 2)
    .attr("width", cell.w)
    .attr("height", cell.h)
    .attr("rx", cell.r)
    .attr("ry", cell.r)
    .style("fill", "none")
    .style("stroke", sk.index)
    .style("stroke-width", 1.4)
    .style("stroke-dasharray", "5,4")
    .style("filter", sk.glow);

  if (index != null && Number.isFinite(indexY)) {
    // Píldora de índice en Y absoluta (lane), no pegada a la celda
    const pill = layer
      .append<SVGGElement>("g")
      .attr("class", "lo-slot-index")
      .attr("transform", `translate(${xy.x}, ${indexY!})`)
      .style("opacity", 0);

    indexPill(pill, String(index), sk.index);

    pill.transition().duration(140).style("opacity", 0.95);
    // Se limpia cuando el marker se remueve
    (g as any)._indexPill = pill;
  }

  return g;
}

// ✅ flyChipFromNode con índice en la "index lane" (no pegado al chip)
async function flyChipFromNode(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string,
  to: { x: number; y: number },
  valColor: string,
  chipBg = "rgba(30,41,59,0.95)",
  chipStroke = "#475569",
  index?: number,
  durationMs: number = LO.chip,
  indexLaneY?: number // ⬅️ Y absoluta de la lane
) {
  const svg = svgRoot(treeG)!;
  ensureCoach(svg);
  ensureFxDefs(svg);
  const coach = svg.select<SVGGElement>("g.heap-coach");

  const p = nodeXYGlobal(treeG, nodeId);
  const tSel = nodeTextSel(treeG, nodeId);
  if (!p || tSel.empty()) return;
  const value = tSel.text();

  const g = coach
    .append("g")
    .attr("class", "lo-chip")
    .attr("transform", `translate(${p.x}, ${p.y}) scale(0.82)`)
    .style("opacity", 0);

  const padX = 10,
    padY = 6;
  const tmp = g
    .append("text")
    .style("font-weight", 700)
    .style("font-size", "13px")
    .style("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text(value);

  const bb = (tmp.node() as SVGGraphicsElement).getBBox();
  const w = Math.max(28, bb.width + padX * 2);
  const h = Math.max(22, bb.height + padY * 2);
  tmp.remove();

  g.append("rect")
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("x", -w / 2)
    .attr("y", -h / 2)
    .attr("width", w)
    .attr("height", h)
    .style("fill", chipBg)
    .style("stroke", chipStroke)
    .style("stroke-width", 1.2)
    .style("filter", "url(#heap-glow)");

  g.append("text")
    .style("font-weight", 700)
    .style("font-size", "13px")
    .style("fill", valColor)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text(value);

  // ⬅️ Índice en la "index lane" (no pegado al chip)
  if (index != null && Number.isFinite(indexLaneY)) {
    const lanePill = coach
      .append<SVGGElement>("g")
      .attr("class", "lo-chip-index")
      .attr("transform", `translate(${to.x}, ${indexLaneY!})`)
      .style("opacity", 0);
    indexPill(lanePill, String(index), "#94a3b8");
    await safeEnd(lanePill.transition().duration(120).style("opacity", 0.95));
    // Se desvanece antes de aterrizar la celda
    setTimeout(
      () => {
        safeEnd(
          lanePill.transition().duration(160).style("opacity", 0).remove()
        );
      },
      Math.max(120, durationMs * 0.65)
    );
  }

  // arco suave (bezier) + micro-respiración
  const mid = { x: (p.x + to.x) / 2, y: Math.min(p.y, to.y) - 24 };
  await safeEnd(g.transition().duration(120).style("opacity", 1));
  await safeEnd(
    g
      .transition()
      .duration(durationMs)
      .ease(easePolyInOut)
      .tween("pos", () => (tt: number) => {
        const x =
          (1 - tt) * (1 - tt) * p.x +
          2 * (1 - tt) * tt * mid.x +
          tt * tt * to.x;
        const y =
          (1 - tt) * (1 - tt) * p.y +
          2 * (1 - tt) * tt * mid.y +
          tt * tt * to.y;
        const k = 0.92 + 0.08 * Math.sin(Math.PI * tt);
        g.attr("transform", `translate(${x}, ${y}) scale(${k})`);
      })
  );
}

// ✅ animateHeapGetLevelOrder con laneY y píldora de índice en la lane
export async function animateHeapGetLevelOrder(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  opts: LevelOrderOpts,
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
  const bail = () => {
    try {
      resetQueryValues();
    } catch {}
    try {
      setIsAnimating(false);
    } catch {}
  };

  const svg = svgRoot(treeG);
  if (!svg) {
    console.warn("[LO] svgRoot(treeG) es null");
    bail();
    return;
  }

  const t = opts.transcript as LevelOrderTranscript | undefined | null;
  const hasT =
    !!t &&
    t.kind === "levelOrder" &&
    Array.isArray(t.order) &&
    t.order.length > 0;

  const order = hasT
    ? t!.order.map((x) => x.id)
    : opts.orderIds && opts.orderIds.length
      ? opts.orderIds
      : currentLevelOrderIds(opts.linksData ?? []);

  const labelById = new Map<string, string>();
  const indexById = new Map<string, number>();
  if (hasT) {
    t!.order.forEach((x, i) => {
      if (x.value != null) labelById.set(x.id, String(x.value));
      indexById.set(x.id, typeof x.index === "number" ? x.index : i);
    });
  }

  if (!order.length) {
    console.warn("[LO] order vacío");
    bail();
    return;
  }
  const pts = allNodePositions(treeG);
  if (!pts.length) {
    console.warn("[LO] No hay g.heap-node en el DOM");
    bail();
    return;
  }

  setIsAnimating(true);

  try {
    ensureCoach(svg);
    ensureFxDefs(svg);

    const xs = pts.map((p) => p.x).filter(Number.isFinite);
    const ys = pts.map((p) => p.y).filter(Number.isFinite);
    const minX = Math.min(...xs);
    const maxY = Math.max(...ys);

    const cellW = opts.band?.cellW ?? 46;
    const cellH = opts.band?.cellH ?? 28;
    const cellR = opts.band?.r ?? 8;
    const gapY = opts.band?.gapY ?? 24;

    const left = Number.isFinite(opts.tray?.left!)
      ? (opts.tray!.left as number)
      : minX - 6;
    const padFromLeaves = (opts as any)?.tray?.padFromLeaves ?? 16;

    const y = Number.isFinite(opts.tray?.y!)
      ? (opts.tray!.y as number)
      : (() => {
          const leafIds =
            (opts.linksData && opts.linksData.length
              ? leafIdsFromLinks(opts.linksData)
              : leafIdsFromDOM(treeG)) ?? [];
          const leafYs = leafIds
            .map((id) => nodeXYGlobal(treeG, id)?.y)
            .filter((v): v is number => Number.isFinite(v));
          const base = leafYs.length ? Math.max(...leafYs) : maxY;
          return base + R + gapY + padFromLeaves;
        })();

    const spacing = Number.isFinite(opts.tray?.spacing!)
      ? (opts.tray!.spacing as number)
      : cellW + 14;

    const slots = order.map((_, i) => ({ x: left + i * spacing, y }));
    if (!slots.every((s) => Number.isFinite(s.x) && Number.isFinite(s.y))) {
      console.warn("[LO] Slots no finitos");
      bail();
      return;
    }

    // ⬅️ laneY para colocar los índices (bajo la bandeja)
    const laneY = y + trayHeight() / 2 + 14;

    // Ajuste fino de la bandeja al ancho real de los slots
    fitTrayToSlots(svg, slots, cellW, opts.style, 14);

    // Banda por nivel (efímera)
    const linksForBands =
      (opts.linksData && opts.linksData.length
        ? opts.linksData
        : hasT
          ? linksFromSnapshot(
              t!.order.map((o, i) => ({
                id: o.id,
                index: typeof o.index === "number" ? o.index : i,
              }))
            )
          : []) ?? [];
    const levels = linksForBands.length ? levelsFromLinks(linksForBands) : [];
    for (const ids of levels) drawLevelBand(treeG, ids);

    // Skin + gradiente para celdas
    const sk = pickSkin(opts.style);
    const glossy = opts.style?.glossy !== false;
    ensureLoCellGradient(svg, sk.cellBg0, sk.cellBg1);

    // Capa de celdas del array (limpia si quedó algo)
    let bandG = svg.select<SVGGElement>("g.heap-levelorder-band");
    if (bandG.empty()) {
      bandG = svg
        .append("g")
        .attr("class", "heap-levelorder-band")
        .style("pointer-events", "none");
    }
    bandG.selectAll("g.cell").remove();

    // Bucle pedagógico
    for (let i = 0; i < order.length; i++) {
      const id = order[i];

      // 0) Pulso + breve pausa para foco
      await pulseNode(treeG, id);
      await wait(LO.prePulse);

      // 1) Valor + índice efectivo
      const textVal = labelById.has(id)
        ? (labelById.get(id) as string)
        : (() => {
            const tSel = nodeTextSel(treeG, id);
            return tSel.empty() ? id : tSel.text();
          })();
      if (labelById.has(id)) setNodeText(treeG, id, textVal);
      const effIndex = indexById.has(id) ? (indexById.get(id) as number) : i;

      // 2) Marker del slot (sin índice, solo marco visual)
      const marker = makeSlotMarker(
        svg,
        slots[i],
        { w: cellW, h: cellH, r: cellR },
        undefined,
        opts.style
      );

      await safeEnd(
        marker
          .transition()
          .duration(LO.markerBlink)
          .style("opacity", 0.95)
          .attr(
            "transform",
            `translate(${slots[i].x}, ${slots[i].y}) scale(1.06)`
          )
          .transition()
          .duration(120)
          .attr(
            "transform",
            `translate(${slots[i].x}, ${slots[i].y}) scale(1.0)`
          )
      );

      // 3) Vuelo de la ficha con la píldora de índice en la lane
      await flyChipFromNode(
        treeG,
        id,
        slots[i],
        "#e2e8f0",
        "rgba(30,41,59,0.95)",
        "#475569",
        effIndex,
        LO.chip,
        laneY
      );

      // 4) Concretar celda en el array
      const cell = bandG
        .append<SVGGElement>("g")
        .attr("class", "cell")
        .attr("transform", `translate(${slots[i].x}, ${slots[i].y}) scale(0.9)`)
        .style("opacity", 0);

      cell
        .append("rect")
        .attr("rx", cellR)
        .attr("ry", cellR)
        .attr("x", -cellW / 2)
        .attr("y", -cellH / 2)
        .attr("width", cellW)
        .attr("height", cellH)
        .style(
          "fill",
          glossy ? `url(#lo-cell-grad-${sk.cellBg0}-${sk.cellBg1})` : sk.cellBg0
        )
        .style("stroke", sk.cellStroke)
        .style("stroke-width", 1.2);

      cell
        .append("rect")
        .attr("rx", Math.max(0, cellR - 2))
        .attr("ry", Math.max(0, cellR - 2))
        .attr("x", -cellW / 2 + 2)
        .attr("y", -cellH / 2 + 2)
        .attr("width", Math.max(0, cellW - 4))
        .attr("height", Math.max(0, cellH - 4))
        .style("fill", "none")
        .style("stroke", "rgba(255,255,255,0.06)")
        .style("stroke-width", 1)
        .style("pointer-events", "none");

      cell
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("fill", sk.text)
        .style("font-weight", 700)
        .style("font-size", "12px")
        .text(String(textVal));

      // ⬅️ Píldora de índice FINAL también en la lane (no bajo la celda)
      if (opts.style?.indexPill && Number.isFinite(laneY)) {
        const pill = bandG
          .append<SVGGElement>("g")
          .attr("class", "cell-index")
          .attr("transform", `translate(${slots[i].x}, ${laneY})`)
          .style("opacity", 0);
        indexPill(pill, String(effIndex), sk.index);
        await safeEnd(pill.transition().duration(140).style("opacity", 0.95));
      }

      await safeEnd(
        cell
          .transition()
          .duration(LO.placePopIn)
          .style("opacity", 1)
          .attr(
            "transform",
            `translate(${slots[i].x}, ${slots[i].y}) scale(1.06)`
          )
          .transition()
          .duration(LO.placeSettle)
          .attr("transform", `translate(${slots[i].x}, ${slots[i].y}) scale(1)`)
      );

      await safeEnd(
        marker.transition().duration(140).style("opacity", 0).remove()
      );
      const pill = (marker as any)._indexPill as
        | d3.Selection<SVGGElement, unknown, null, undefined>
        | undefined;
      if (pill) pill.transition().duration(120).style("opacity", 0).remove();

      await wait(LO.between);
    }

    await wait(LO.finalHold);

    await Promise.all([
      safeEnd(
        svg
          .selectAll<SVGGElement, unknown>("g.heap-levelorder-band")
          .transition()
          .duration(LO.cleanup)
          .style("opacity", 0)
          .remove() as any
      ),
      safeEnd(
        svg
          .selectAll<SVGGElement, unknown>("g.levelorder-tray")
          .transition()
          .duration(LO.cleanup)
          .style("opacity", 0)
          .remove() as any
      ),
      safeEnd(
        svg
          .selectAll<SVGGElement, unknown>("g.levelorder-index-lane")
          .transition()
          .duration(LO.cleanup)
          .style("opacity", 0)
          .remove() as any
      ),
      safeEnd(
        svg
          .selectAll<SVGGElement, unknown>("g.level-bands")
          .transition()
          .duration(LO.cleanup)
          .style("opacity", 0)
          .remove() as any
      ),
      safeEnd(
        svg
          .selectAll<SVGGElement, unknown>("g.heap-levelorder-guides")
          .transition()
          .duration(LO.cleanup)
          .style("opacity", 0)
          .remove() as any
      ),
      safeEnd(
        svg
          .selectAll<
            SVGGElement,
            unknown
          >("g.heap-coach g.lo-chip, g.heap-coach .coach-badge, g.heap-coach .node-halo")
          .transition()
          .duration(LO.cleanup)
          .style("opacity", 0)
          .remove() as any
      ),
    ]);

    await clearCoach(svg);
  } finally {
    try {
      resetQueryValues();
    } finally {
      setIsAnimating(false);
    }
  }
}

/* ───────── Ajuste “inteligente” de la bandeja ───────── */

function fitTrayToSlots(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  slots: Array<{ x: number; y: number }>,
  cellW: number,
  style?: LevelOrderStyle,
  extraPad = 12
) {
  if (!slots.length) return;
  const leftMost = slots[0].x;
  const rightMost = slots[slots.length - 1].x;
  const y = slots[0].y;
  const width = rightMost - leftMost + cellW;

  // reusar ensureTray pero recalculando “left” y “width” exactos
  ensureTray(svg, y, leftMost - extraPad, width + 2 * extraPad, style);
}

// ── Curva cúbica con sesgo/curvatura adaptativos (estable en niveles profundos)
function curvedLinkPath(
  p: { x: number; y: number }, // centro padre
  c: { x: number; y: number }, // centro hijo
  r: number,
  kBase = 0.3 // curvatura base (0.22–0.38)
): string {
  const dx = c.x - p.x,
    dy = c.y - p.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L,
    uy = dy / L; // tangente
  const nx = -uy; // normal

  // Entrar/salir tangencial al borde del círculo
  let sx = p.x + ux * r,
    sy = p.y + uy * r;
  let ex = c.x - ux * r,
    ey = c.y - uy * r;

  // >>> Sesgo lateral ADAPTATIVO:
  //   - cuando |dx| es pequeño (casi vertical), el sesgo se reduce
  //   - acotado para no invadir niveles vecinos
  const horiz = Math.abs(dx);
  const vert = Math.abs(dy) + 1e-6;
  const slope = Math.min(1, horiz / vert); // 0: vertical puro, 1: diagonal marcada

  // sesgo máximo ~0.45r pero escalado por "slope"
  const biasMax = 0.45 * r;
  const biasMin = 0.1 * r;
  const bias = Math.max(biasMin, Math.min(biasMax, biasMax * slope));

  // firma izquierda/derecha (según el hijo)
  const side = dx < 0 ? -1 : 1;

  // aplicamos sesgo en la normal, no en X cruda
  sx += nx * side * bias;
  ex += nx * side * bias * 0.55;

  // >>> Curvatura ADAPTATIVA:
  // más “panza” si hay buena separación vertical; menos si casi no la hay
  const k = Math.max(
    0.18,
    Math.min(0.42, kBase * (0.6 + 0.8 * (vert / (vert + horiz))))
  );

  // Puntos de control: desplazamiento en el eje Y global para estabilidad
  const c1x = sx,
    c1y = sy + (ey - sy) * k;
  const c2x = ex,
    c2y = ey - (ey - sy) * k;

  return `M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`;
}
