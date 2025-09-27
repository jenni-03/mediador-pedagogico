import * as d3 from "d3";
import { HierarchyNode } from "d3";
import { BHierarchy, TreeLinkData, TraversalNodeType } from "../../../types";

import { drawTraversalSequence as baseDrawTraversalSequence } from "./btreeDrawActionsUtilities";

import {
  drawBNodesRect,
  drawBTreeLinks as baseDrawBTreeLinks,
  buildBTreeLinksFromHierarchy,
  childAnchorFor,
  topCenterAnchorOfChild,
} from "./btreeDrawActionsUtilities";

/* ─────────────────────────── Visual & timing ─────────────────────────── */
const B_ANIM = {
  popIn: 220,
  popSettle: 180,
  reflow: 900,
  easeOut: d3.easeCubicOut,
  easeBack: d3.easeBackOut.overshoot(1.35),
};

/* Colores/estilos auxiliares para insert */
const INS = {
  slotGlow: "#60a5fa", // azulito
  pathDim: 0.35, // opacidad resto
  pathStroke: "#93c5fd", // stroke camino
  linkPulse: "#7dd3fc", // cian claro
  confetti: "#93c5fd",
};

/* ─────────────────────────── Defs (skins) ─────────────────────────── */
export function ensureBTreeSkinDefs(
  _svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  // Placeholder por si luego agregas gradientes/sombras específicas.
}

/* ─────────────────────────── Dibujo de nodos B ─────────────────────────── */
export function drawBTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<BHierarchy>[],
  positions: Map<string, { x: number; y: number }>
) {
  nodes.forEach((d) => {
    positions.set(d.data.id, { x: d.x!, y: d.y! });
  });
  drawBNodesRect(g, nodes, positions);
}

/* ─────────────────────────── Enlaces B-tree ─────────────────────────── */
export const drawBTreeLinks = baseDrawBTreeLinks;

/* ─────────────────────────── Reflow específico B-tree ─────────────────────────── */
export async function repositionBTreeNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: HierarchyNode<BHierarchy>,
  nodes: HierarchyNode<BHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  // 👉 sincroniza el cache con las posiciones nuevas
  nodes.forEach((d) => {
    nodePositions.set(d.data.id, { x: d.x!, y: d.y! });
  });

  await treeG
    .selectAll<SVGGElement, HierarchyNode<BHierarchy>>("g.node")
    .data(nodes, (d) => d.data.id)
    .transition()
    .duration(900)
    .ease(d3.easeCubicOut)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id)!;
      return `translate(${p.x}, ${p.y})`;
    })
    .end();

  // Redibuja links con el cache ya actualizado
  baseDrawBTreeLinks(treeG, root, nodePositions);
}

export function settleBTreeNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: HierarchyNode<BHierarchy>,
  nodes: HierarchyNode<BHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  // Coloca TODOS los nodos en su x,y final SIN transición
  treeG
    .selectAll<SVGGElement, HierarchyNode<BHierarchy>>("g.node")
    .data(nodes, (d) => d.data.id)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id)!;
      return `translate(${p.x}, ${p.y})`;
    });

  // Redibuja links inmediatamente
  baseDrawBTreeLinks(treeG, root, nodePositions);
}

/* ─────────────────────────── Crear raíz ─────────────────────────── */
export async function animateBCreateRoot(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  rootId: string,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);
    const g = treeG.select<SVGGElement>(`g#${rootId}`);
    if (g.empty()) return;

    const body = g.select<SVGRectElement>("rect.b-body");
    if (!body.empty()) {
      await body
        .transition()
        .duration(B_ANIM.popIn)
        .ease(B_ANIM.easeBack)
        .attrTween("transform", () =>
          d3.interpolateString("scale(0.94)", "scale(1.05)")
        )
        .transition()
        .duration(B_ANIM.popSettle)
        .ease(B_ANIM.easeOut)
        .attr("transform", "scale(1)")
        .end();
    }
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

async function popBody(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string
) {
  const body = treeG.select<SVGRectElement>(`g#${nodeId} rect.b-body`);
  if (body.empty()) return;
  await body
    .transition()
    .duration(200)
    .ease(B_ANIM.easeBack)
    .attrTween("transform", () =>
      d3.interpolateString("scale(1.0)", "scale(1.06)")
    )
    .transition()
    .duration(160)
    .ease(B_ANIM.easeOut)
    .attr("transform", "scale(1)")
    .end();
}

/* “Slide-in / grow” del slot + confetti */
async function animateSlotGrow(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string,
  slotIndex: number
) {
  const slotG = treeG.select<SVGGElement>(
    `g#${nodeId} g.slots g#${nodeId}#k${slotIndex}`
  );
  const box = slotG.select<SVGRectElement>("rect.slot-box");
  if (box.empty()) return;

  const gw = +box.attr("width");
  const gh = +box.attr("height");

  // Rect overlay que crece de 0 → ancho
  const grow = slotG
    .append("rect")
    .attr("class", "slot-grow")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", gh)
    .attr("width", 0)
    .attr("fill", INS.slotGlow)
    .attr("opacity", 0.15);

  await grow
    .transition()
    .duration(240)
    .ease(B_ANIM.easeOut)
    .attr("width", gw)
    .attr("opacity", 0.28)
    .end();

  // Brillo de borde del slot real
  const origStroke = box.attr("stroke");
  const origW = box.attr("stroke-width");
  await box
    .transition()
    .duration(180)
    .attr("stroke", INS.slotGlow)
    .attr("stroke-width", (+origW || 1.1) + 0.9)
    .end();
  await box
    .transition()
    .duration(220)
    .attr("stroke", origStroke ?? "#374151")
    .attr("stroke-width", origW ?? "1.1")
    .end();

  // Confetti sutil (6 puntitos)
  const cx = gw / 2;
  const cy = gh / 2;
  const N = 6;
  const particles = d3.range(N).map((i) => ({
    angle: (i / N) * Math.PI * 2 + Math.random() * 0.6,
    r: 6 + Math.random() * 6,
  }));

  const conf = slotG
    .selectAll("circle.slot-spark")
    .data(particles)
    .enter()
    .append("circle")
    .attr("class", "slot-spark")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", 0.8)
    .attr("fill", INS.confetti)
    .attr("opacity", 0);

  await conf
    .transition()
    .duration(260)
    .ease(B_ANIM.easeOut)
    .attr("opacity", 0.95)
    .attr("cx", (d) => cx + Math.cos(d.angle) * d.r)
    .attr("cy", (d) => cy + Math.sin(d.angle) * d.r)
    .end();

  conf.transition().duration(220).attr("opacity", 0).remove();

  // Desaparece overlay suave
  await grow.transition().duration(220).attr("opacity", 0).remove().end();
}

/* ─────────────────────────── Insertar: “camino + flecha + drop del slot” ─────────────────────────── */
export async function animateBInsertNode(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    newNodeId: string;
    rootHierarchy: HierarchyNode<BHierarchy>;
    nodesData: HierarchyNode<BHierarchy>[];
    /** índice del slot donde quedó la nueva clave (para el drop). Si falta, solo se hace el camino y pop. */
    slotIndex?: number | null;
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);

    // 0) Coloca todo en su posición final (sin reflow posterior).
    settleBTreeNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );

    // 1) Defs y overlay de inserción (en el <svg>)
    const svg = getSVGFromTreeG(treeG);
    if (svg) ensureBInsertDefs(svg);
    const overlay = ensureInsertOverlay(treeG);

    // 2) Camino raíz → nodo destino (como en el 2-3)
    const byId = new Map<string, HierarchyNode<BHierarchy>>();
    params.rootHierarchy.each((n) => byId.set(n.data.id, n));
    const target = byId.get(params.newNodeId);
    if (!target) {
      await popBody(treeG, params.newNodeId);
      return;
    }
    const pathNodes = params.rootHierarchy.path(target);
    const buildPath = bPathBuilderFactory(params.rootHierarchy, nodePositions);

    // Atenúa resto
    const allNodes = treeG.selectAll<SVGGElement, unknown>("g.node");
    await allNodes.transition().duration(160).style("opacity", 0.35).end();

    // Recorre la ruta con glow y segmentos “dibujados”
    for (let i = 0; i < pathNodes.length; i++) {
      const id = pathNodes[i].data.id;
      const gNode = treeG.select<SVGGElement>(`g#${id}`);
      const rect =
        gNode.select<SVGRectElement>("rect.b-body").node() ||
        gNode.select<SVGRectElement>("rect").node();

      // traemos a foco el nodo
      await gNode.transition().duration(120).style("opacity", 1).end();

      if (rect) {
        const sel = d3.select(rect as SVGRectElement);
        const origStroke = sel.attr("stroke");
        const origW = sel.attr("stroke-width");

        // glow breve + stroke
        await sel
          .transition()
          .duration(150)
          .attr("stroke", "#7aa2ff")
          .attr("stroke-width", (+origW || 1.4) + 1)
          .end();
        d3.select(rect as SVGElement).attr("filter", "url(#bInsertGlow)");
        await new Promise((r) => setTimeout(r, 120));
        d3.select(rect as SVGElement).attr("filter", null);

        await sel
          .transition()
          .duration(140)
          .attr("stroke", origStroke ?? null)
          .attr("stroke-width", origW ?? null)
          .end();
      }

      // Dibuja el segmento al siguiente (si existe)
      if (i < pathNodes.length - 1) {
        const fromId = id;
        const toId = pathNodes[i + 1].data.id;

        const seg = overlay
          .append("path")
          .attr("class", "b-insert-seg")
          .attr("d", buildPath(fromId, toId))
          .attr("fill", "none")
          .attr("stroke", "url(#bInsertStrokeGrad)")
          .attr("stroke-width", 2.2)
          .attr("stroke-linecap", "round")
          .attr("marker-end", "url(#bInsertArrow)");

        const len = (seg.node() as SVGPathElement).getTotalLength();
        seg
          .attr("stroke-dasharray", `${len} ${len}`)
          .attr("stroke-dashoffset", len)
          .style("opacity", 0.95);

        await seg
          .transition()
          .duration(460) // ← aquí la “línea que se dibuja”
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0)
          .end();

        // vuelve a atenuarse si aún no es el último
        await gNode.transition().duration(100).style("opacity", 0.7).end();
      }
    }

    // 3) Llegada al nodo destino: drop del slot (sin mostrar el texto hasta el final)
    if (typeof params.slotIndex === "number") {
      await animateSlotGrow(treeG, params.newNodeId, params.slotIndex);
    } else {
      // fallback si no tenemos índice de slot
      await popBody(treeG, params.newNodeId);
    }

    // 4) Limpieza y restaurar opacidades
    overlay.selectAll("*").remove();
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .transition()
      .duration(180)
      .style("opacity", 1)
      .end();
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Búsqueda (camino + glow + flecha) ─────────────────────────── */
export async function animateBSearchPath(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: HierarchyNode<BHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  if (!path.length) {
    resetQueryValues?.();
    return;
  }

  try {
    setIsAnimating?.(true);

    // Defs (glow, gradiente, flecha) y overlay de trazo
    const svg = getSVGFromTreeG(treeG);
    if (svg) ensureBInsertDefs(svg);
    const overlay = ensureInsertOverlay(treeG);

    // El root real es el primero de la ruta
    const root = path[0].ancestors().slice(-1)[0] as HierarchyNode<BHierarchy>;
    const buildPath = bPathBuilderFactory(root, nodePositions);

    // Atenúa todos los nodos
    const all = treeG.selectAll<SVGGElement, unknown>("g.node");
    await all.transition().duration(160).style("opacity", INS.pathDim).end();

    // Recorre la ruta dibujando segmentos y aplicando glow al pasar
    for (let i = 0; i < path.length; i++) {
      const id = path[i].data.id;
      const g = treeG.select<SVGGElement>(`g#${id}`);
      const body =
        g.select<SVGRectElement>("rect.b-body").node() ||
        g.select<SVGRectElement>("rect").node();

      await g.transition().duration(120).style("opacity", 1).end();

      if (body) {
        const sel = d3.select(body as SVGRectElement);
        const origStroke = sel.attr("stroke");
        const origW = sel.attr("stroke-width");

        // Glow breve
        await sel
          .transition()
          .duration(150)
          .attr("stroke", "#7aa2ff")
          .attr("stroke-width", (+origW || 1.4) + 1)
          .end();

        d3.select(body as SVGElement).attr("filter", "url(#bInsertGlow)");
        await new Promise((r) => setTimeout(r, 120));
        d3.select(body as SVGElement).attr("filter", null);

        await sel
          .transition()
          .duration(140)
          .attr("stroke", origStroke ?? null)
          .attr("stroke-width", origW ?? null)
          .end();
      }

      if (i < path.length - 1) {
        const fromId = id;
        const toId = path[i + 1].data.id;

        const seg = overlay
          .append("path")
          .attr("class", "b-search-seg")
          .attr("d", buildPath(fromId, toId))
          .attr("fill", "none")
          .attr("stroke", "url(#bInsertStrokeGrad)")
          .attr("stroke-width", 2.2)
          .attr("stroke-linecap", "round")
          .attr("marker-end", "url(#bInsertArrow)");

        const len = (seg.node() as SVGPathElement).getTotalLength();
        seg
          .attr("stroke-dasharray", `${len} ${len}`)
          .attr("stroke-dashoffset", len)
          .style("opacity", 0.95);

        await seg
          .transition()
          .duration(460)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0)
          .end();

        await g.transition().duration(100).style("opacity", 0.7).end();
      }
    }

    // Pop sutil en el destino
    const lastId = path[path.length - 1].data.id;
    await popBody(treeG, lastId);

    // Limpieza + restaurar opacidades
    overlay.selectAll("*").remove();
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .transition()
      .duration(160)
      .style("opacity", 1)
      .end();
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Banda de recorrido ─────────────────────────── */
export const drawTraversalSequence = baseDrawTraversalSequence;

/* ─────────────────────────── Links helper ─────────────────────────── */
export function buildLinksFromBHierarchy(
  root: HierarchyNode<BHierarchy>
): TreeLinkData[] {
  const { links } = buildBTreeLinksFromHierarchy(root);
  return links;
}

/* ─────────────────────────── Path builder “entre claves” (opcional) ─────────────────────────── */
export function bPathBuilderFactory(
  root: HierarchyNode<BHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>
) {
  const { indexMap } = buildBTreeLinksFromHierarchy(root);
  const byId = new Map<string, HierarchyNode<BHierarchy>>();
  root.each((n) => byId.set(n.data.id, n));

  return function bPathBuilder(sourceId: string, targetId: string): string {
    const parent = byId.get(sourceId);
    const child = byId.get(targetId);
    if (!parent || !child) return "";

    const idx = indexMap.get(`${parent.data.id}->${child.data.id}`) ?? 0;
    const s = childAnchorFor(parent, nodePositions, idx);
    const t = topCenterAnchorOfChild(child, nodePositions);

    const sy = s.y;
    const ty = t.y - 6;

    const midY = (sy + ty) / 2;
    return `M${s.x},${sy} C ${s.x},${midY} ${t.x},${midY} ${t.x},${ty}`;
  };
}
/* ─────────────────────────── Defs para INSERT estilo “search 2-3” ─────────────────────────── */
function ensureBInsertDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  if (defs.select("#bInsertGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "bInsertGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    const m = f.append("feMerge");
    m.append("feMergeNode").attr("in", "blur");
    m.append("feMergeNode").attr("in", "SourceGraphic");
  }

  if (defs.select("#bInsertArrow").empty()) {
    const m = defs
      .append<SVGMarkerElement>("marker")
      .attr("id", "bInsertArrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse");
    m.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#7aa2ff");
  }

  if (defs.select("#bInsertStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bInsertStrokeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#7aa2ff");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#22d3ee");
  }
}

/* Overlay específico de inserción (independiente del de chips) */
function ensureInsertOverlay(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  let overlay = treeG.select<SVGGElement>("g.b-insert-overlay");
  if (overlay.empty()) {
    overlay = treeG
      .append("g")
      .attr("class", "b-insert-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();
  return overlay;
}

/* Atajo para obtener el <svg> desde treeG */
function getSVGFromTreeG(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const svgEl = treeG.node()?.ownerSVGElement as SVGSVGElement | null;
  return svgEl ? d3.select(svgEl) : null;
}

/* ─────────────────────────── Defs para TRAVERSAL (runner sin líneas) ─────────────────────────── */
function ensureBTraversalDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  if (defs.select("#bRunnerGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "bRunnerGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 2.4)
      .attr("result", "blur");
    const merge = f.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
  }

  if (defs.select("#bRunnerGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bRunnerGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#e6f1ff");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#7aa2ff");
  }
}

/* ─────────────────────────── Animación de RECORRIDO (runner estilo 2-3) ─────────────────────────── */
export async function animateBTraversal(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  order: TraversalNodeType[],
  seqG: d3.Selection<SVGGElement, unknown, null, undefined>,
  seqPositions: Map<string, { x: number; y: number }>,
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: (b: boolean) => void,
  opts: {
    runnerRadius?: number;
    runnerSpeed?: number;
    strokeColor?: string;
    bounce?: boolean;
    stepDelay?: number;
    bandPadding?: number;
    textSize?: string;
    textWeight?: number;
    textColor?: string;
  } = {}
) {
  const {
    runnerRadius = 6,
    runnerSpeed = 420,
    strokeColor = "#8aa0ff",
    bounce = true,
    stepDelay = 60,
    bandPadding = 38,
    textSize = "14px",
    textWeight = 800,
    textColor = "#f9fafb",
  } = opts;

  if (!order || order.length === 0) return;

  setIsAnimating(true);
  ensureBTraversalDefs(svg);

  let overlay = treeG.select<SVGGElement>("g.b-traverse-overlay");
  if (overlay.empty()) {
    overlay = treeG
      .append("g")
      .attr("class", "b-traverse-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();

  const normalizeNodeId = (id: string) => {
    const i = id.indexOf("#"); // soporta ids tipo "n-5#k1"
    return i === -1 ? id : id.slice(0, i);
  };
  const getCenter = (id: string) => nodePositions.get(id) ?? { x: 0, y: 0 };

  const startNodeId = normalizeNodeId(order[0].id);
  const start = getCenter(startNodeId);
  const runner = overlay
    .append("circle")
    .attr("class", "b-runner")
    .attr("r", runnerRadius)
    .attr("cx", start.x)
    .attr("cy", start.y)
    .attr("fill", "url(#bRunnerGrad)")
    .attr("filter", "url(#bRunnerGlow)")
    .style("opacity", 0.95);

  const allNodes = treeG.selectAll<SVGGElement, unknown>("g.node");

  // Crea la etiqueta en la banda si falta
  const ensureBandLabel = (
    rawId: string,
    i: number,
    value: string | number
  ) => {
    let label = seqG.select<SVGTextElement>(`text[id="${rawId}"]`);
    if (label.empty()) {
      const pos = { x: i * bandPadding, y: 0 };
      seqPositions.set(rawId, pos);
      label = seqG
        .append("text")
        .attr("class", "seq")
        .attr("id", rawId)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "alphabetic")
        .style("pointer-events", "none")
        .style("paint-order", "stroke")
        .style("stroke", "#0b1220")
        .style("stroke-width", 1.4)
        .attr("fill", textColor)
        .style("font-weight", textWeight as any)
        .style("font-size", textSize)
        .style("opacity", 0)
        .attr("transform", `translate(${pos.x}, ${pos.y})`)
        .text(String(value));
    }
    return label;
  };

  try {
    seqG.style("opacity", 1);
    await allNodes
      .transition()
      .duration(150)
      .style("opacity", 0.35)
      .end()
      .catch(() => {});

    for (let i = 0; i < order.length; i++) {
      const rawId = order[i].id;
      const nodeId = normalizeNodeId(rawId);

      const gNode = treeG.select<SVGGElement>(`g#${nodeId}`);
      const rect =
        gNode.select<SVGRectElement>("rect.b-body").node() ||
        gNode.select<SVGRectElement>("rect").node();

      if (!gNode.empty()) {
        await gNode
          .transition()
          .duration(120)
          .style("opacity", 1)
          .end()
          .catch(() => {});
      }
      if (rect) {
        const sel = d3.select(rect as SVGRectElement);
        const origStroke = sel.attr("stroke");
        const origW = sel.attr("stroke-width");

        await sel
          .transition()
          .duration(140)
          .attr("stroke", strokeColor)
          .attr("stroke-width", (+origW || 1.5) + 1)
          .end()
          .catch(() => {});

        if (bounce) {
          await sel
            .transition()
            .duration(150)
            .ease(d3.easeBackOut.overshoot(1.35))
            .attr("transform", "scale(1.03)")
            .transition()
            .duration(150)
            .ease(d3.easeCubicOut)
            .attr("transform", "scale(1)")
            .end()
            .catch(() => {});
        }

        await sel
          .transition()
          .duration(120)
          .attr("stroke", origStroke ?? null)
          .attr("stroke-width", origW ?? null)
          .end()
          .catch(() => {});
      }

      const label = ensureBandLabel(rawId, i, String(order[i].value));
      if (label.style("opacity") === "" || label.style("opacity") === "0") {
        const pos = seqPositions.get(rawId)!;
        await label
          .attr("transform", `translate(${pos.x}, ${pos.y}) scale(0.9)`)
          .style("opacity", 0)
          .transition()
          .duration(380)
          .ease(d3.easeBackOut.overshoot(1.2))
          .style("opacity", 1)
          .attr("transform", `translate(${pos.x}, ${pos.y}) scale(1)`)
          .end()
          .catch(() => {});
      }

      if (i < order.length - 1) {
        const nextNodeId = normalizeNodeId(order[i + 1].id);
        const a = getCenter(nodeId);
        const b = getCenter(nextNodeId);

        await runner
          .transition()
          .duration(runnerSpeed)
          .ease(d3.easeCubicOut)
          .tween("pos", function () {
            const ix = d3.interpolateNumber(a.x, b.x);
            const iy = d3.interpolateNumber(a.y, b.y);
            return (t: number) =>
              d3
                .select(this as SVGCircleElement)
                .attr(
                  "transform",
                  `translate(${ix(t) - start.x}, ${iy(t) - start.y})`
                );
          })
          .end()
          .catch(() => {});

        if (!gNode.empty()) {
          await gNode
            .transition()
            .duration(100)
            .style("opacity", 0.6)
            .end()
            .catch(() => {});
        }
        if (stepDelay) await new Promise((r) => setTimeout(r, stepDelay));
      }
    }
  } catch (e) {
    console.error("[animateBTraversal]", e);
  } finally {
    overlay.selectAll("*").remove();
    runner.remove();
    await allNodes
      .transition()
      .duration(160)
      .style("opacity", 1)
      .end()
      .catch(() => {});
    resetQueryValues();
    setIsAnimating(false);
  }
}

// ───────── helpers visuales para delete ─────────
function ensureBDeleteDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  if (defs.select("#bDelGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bDelGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#fee2e2"); // rojo muy claro
    g.append("stop").attr("offset", "100%").attr("stop-color", "#f87171"); // rojo
  }
}

function ensureDeleteOverlay(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  let overlay = treeG.select<SVGGElement>("g.b-delete-overlay");
  if (overlay.empty()) {
    overlay = treeG
      .append("g")
      .attr("class", "b-delete-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();
  return overlay;
}

// Pequeño pulso al rectángulo “body” del nodo
async function pulseNodeBodyOnce(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string
) {
  const body =
    treeG.select<SVGRectElement>(`g#${nodeId} rect.b-body`).node() ||
    treeG.select<SVGRectElement>(`g#${nodeId} rect`).node();
  if (!body) return;
  const sel = d3.select(body as SVGRectElement);
  await sel
    .transition()
    .duration(130)
    .ease(d3.easeBackOut.overshoot(1.3))
    .attr("transform", "scale(1.03)")
    .end()
    .catch(() => {});
  await sel
    .transition()
    .duration(130)
    .ease(d3.easeCubicOut)
    .attr("transform", "scale(1)")
    .end()
    .catch(() => {});
}

// Saca el slot (kIndex) del nodo: sube un poco, encoge y desaparece
async function animateSlotExit(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string,
  keyIndex: number
) {
  const slotG = treeG.select<SVGGElement>(
    `g#${nodeId} g.slots g#${nodeId}#k${keyIndex}`
  );
  if (slotG.empty()) return;
  const box = slotG.select<SVGRectElement>("rect.slot-box");

  // leve tint rojo para marcar “salida”
  if (!box.empty()) {
    const orig = box.attr("fill");
    await box
      .transition()
      .duration(140)
      .attr("fill", orig || "#111827")
      .attr("opacity", 0.9)
      .end()
      .catch(() => {});
  }

  await slotG
    .transition()
    .duration(320)
    .ease(d3.easeCubicOut)
    .attr("transform", "translate(0,-8) scale(0.86)")
    .style("opacity", 0)
    .end()
    .catch(() => {});
  slotG.remove();

  // pequeña vibración del cuerpo del nodo
  await pulseNodeBodyOnce(treeG, nodeId);
}

// “Chip” que viaja de un nodo a otro (centro a centro)
async function moveChipBetween(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  from: { x: number; y: number },
  via: { x: number; y: number } | null,
  to: { x: number; y: number },
  speed = 420
) {
  const chip = overlay
    .append("circle")
    .attr("r", 6)
    .attr("cx", from.x)
    .attr("cy", from.y)
    .attr("fill", "url(#bDelGrad)")
    .attr("filter", "url(#bRunnerGlow)")
    .style("opacity", 0.95);

  const fly = async (
    A: { x: number; y: number },
    B: { x: number; y: number }
  ) => {
    await chip
      .transition()
      .duration(speed)
      .ease(d3.easeCubicOut)
      .tween("pos", function () {
        const ix = d3.interpolateNumber(A.x, B.x);
        const iy = d3.interpolateNumber(A.y, B.y);
        return function (t: number) {
          d3.select(this as SVGCircleElement)
            .attr("cx", ix(t))
            .attr("cy", iy(t));
        };
      })
      .end()
      .catch(() => {});
  };

  if (via) {
    await fly(from, via);
    await fly(via, to);
  } else {
    await fly(from, to);
  }

  chip.transition().duration(160).style("opacity", 0).remove();
}

// ───────── animación mejorada de delete ─────────
export async function animateBDeleteSmart(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    // estado anterior y nuevo
    prevRoot: HierarchyNode<BHierarchy>;
    nextRoot: HierarchyNode<BHierarchy>;
    nextNodes: HierarchyNode<BHierarchy>[];
    // slot eliminado (si lo sabemos)
    deleteHit?: { nodeId: string; keyIndex: number } | null;
    // pasos de corrección (borrow/merge) opcionales
    fixSteps?: Array<
      | {
          type: "borrowL" | "borrowR";
          parentId: string;
          fromId: string;
          toId: string;
        }
      | {
          type: "mergeL" | "mergeR";
          parentId: string;
          leftId: string;
          rightId: string;
        }
      | { type: "contractRoot"; newRootId: string }
    >;
  },
  nextPositions: Map<string, { x: number; y: number }>, // posiciones del layout NUEVO
  prevPositions: Map<string, { x: number; y: number }>, // posiciones del layout PREVIO
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);

    // 0) Coloca TODO en posiciones PREVIAS para que el reflow tenga delta visible
    settleBTreeNodes(
      treeG,
      params.prevRoot,
      params.prevRoot.descendants() as any,
      prevPositions
    );

    // Defs + overlay
    const svg = getSVGFromTreeG(treeG);
    if (svg) {
      ensureBInsertDefs(svg);
      ensureBTraversalDefs(svg);
      ensureBDeleteDefs(svg);
    }
    const overlay = ensureDeleteOverlay(treeG);

    // 1) Quitar visualmente la clave (si conocemos nodo y slot)
    if (params.deleteHit) {
      await animateSlotExit(
        treeG,
        params.deleteHit.nodeId,
        params.deleteHit.keyIndex
      );
    }

    // 2) Borrow / Merge (si hay log), si no, una degradación sutil
    if (params.fixSteps && params.fixSteps.length) {
      for (const step of params.fixSteps) {
        if (step.type === "borrowL" || step.type === "borrowR") {
          const from =
            prevPositions.get(step.fromId) ?? nextPositions.get(step.fromId)!;
          const parent =
            prevPositions.get(step.parentId) ??
            nextPositions.get(step.parentId)!;
          const to =
            prevPositions.get(step.toId) ?? nextPositions.get(step.toId)!;

          await moveChipBetween(overlay, from, parent, to, 420);
          await pulseNodeBodyOnce(treeG, step.parentId);
          await pulseNodeBodyOnce(treeG, step.toId);
        } else if (step.type === "mergeL" || step.type === "mergeR") {
          const left = step.leftId;
          const right = step.rightId;

          // caída de la separadora desde el padre hacia el izquierdo
          const p =
            prevPositions.get(step.parentId) ??
            nextPositions.get(step.parentId)!;
          const l = prevPositions.get(left) ?? nextPositions.get(left)!;
          await moveChipBetween(overlay, p, null, l, 360);

          // hermano derecho se “apaga” (absorción visual)
          const gRight = treeG.select<SVGGElement>(`g#${right}`);
          await gRight
            .transition()
            .duration(260)
            .ease(d3.easeCubicOut)
            .attr("transform", "scale(0.94)")
            .style("opacity", 0.15)
            .end()
            .catch(() => {});
        } else if (step.type === "contractRoot") {
          // contracción de raíz: leve fade del viejo root
          const gAll = treeG.selectAll<SVGGElement, unknown>("g.node");
          await gAll
            .transition()
            .duration(160)
            .style("opacity", 0.7)
            .end()
            .catch(() => {});
        }
      }
    } else {
      // modo simple
      await treeG
        .selectAll<SVGGElement, unknown>("g.node")
        .transition()
        .duration(140)
        .style("opacity", 0.9)
        .end()
        .catch(() => {});
    }

    // 3) Reflow hacia el NUEVO layout (ahora sí anima)
    await repositionBTreeNodes(
      treeG,
      params.nextRoot,
      params.nextNodes,
      nextPositions
    );

    // 4) Limpieza + restaurar opacidades
    overlay.selectAll("*").remove();
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .end()
      .catch(() => {});
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}
