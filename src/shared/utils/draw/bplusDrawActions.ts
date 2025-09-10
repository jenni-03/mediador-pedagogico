// src/shared/utils/draw/bplusDrawActions.ts
import * as d3 from "d3";
import { HierarchyNode } from "d3";
import { BPlusHierarchy, TreeLinkData } from "../../../types";

// Banda de recorrido (re-export desde utilities)
import { drawTraversalSequence as baseDrawTraversalSequence } from "./bplusDrawActionsUtilities";

import {
  // nodos (skin B+ determinista)
  drawBPlusNodesRounded,
  // links padre→hijo B+ (determinista)
  drawBPlusLinks as baseDrawBPlusLinks,
  buildBPlusLinksFromHierarchy,
  // anclajes “entre claves” y tope del hijo
  childAnchorForBPlus,
  topCenterAnchorOfChildBPlus,
  // arista de la cadena de hojas (belt)
  drawLeafChainEdges,
  redrawBPlusLinksResponsive,
  tweenBPlusLinksDuringReflow,
} from "./bplusDrawActionsUtilities";

/* ─────────────────────────── Visual & timing (solo para acciones/anim) ─────────────────────────── */
const BP_ANIM = {
  popIn: 220,
  popSettle: 180,
  reflow: 900,
  easeOut: d3.easeCubicOut,
  easeBack: d3.easeBackOut.overshoot(1.35),
};

const INS = {
  slotGlow: "#7aa2ff",
  pathDim: 0.35,
  pathStrokeGrad0: "#7aa2ff",
  pathStrokeGrad1: "#22d3ee",
  linkPulse: "#7dd3fc",
  confetti: "#93c5fd",
};

// Paleta/params para BORRADO
const DEL = {
  glow: "#f87171", // red-400
  glowSoft: "rgba(248,113,113,0.28)",
  stroke0: "#fb7185", // rose-400
  stroke1: "#fca5a5", // rose-300
  dust: "#fecaca", // rose-200
  runner: "#fee2e2", // rose-100
  dimOthers: 0.35,
};

/* ─────────────────────────── Visual & timing extra para SEARCH ─────────────────────────── */
const SRCH = {
  ringColor: "#60a5fa",
  beamWidth: 3.2,
  stripeWidth: 1.6,
  fadeOthers: 0.22, // resto del árbol (antes 0.28)
  visitedOpacity: 0.92, // nodos ya visitados (ANTES era 0.7 en el loop)
  ringCount: 2,
  ringMaxR: 16,
  ringDur: 420,
};

/* ─────────────────────────── Defs (skins/overlays extra para acciones) ─────────────────────────── */
export function ensureBPlusSkinDefs(
  _svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  // Placeholder: gradientes/sombras adicionales para animaciones B+ si las necesitas.
}

/* ─────────────────────────── Dibujo de nodos B+ (usa utilidades) ─────────────────────────── */
export function drawBPlusNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<BPlusHierarchy>[],
  positions: Map<string, { x: number; y: number }>
) {
  // sincroniza caché de posiciones a partir de d.x/d.y
  nodes.forEach((d) => {
    positions.set(d.data.id, { x: d.x!, y: d.y! });
  });
  drawBPlusNodesRounded(g, nodes, positions);
}

/* ─────────────────────────── Enlaces B+ (usa utilidades) ─────────────────────────── */
export const drawBPlusLinks = baseDrawBPlusLinks;

/* ─────────────────────────── Reflow específico B+ ─────────────────────────── */
export async function repositionBPlusNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: HierarchyNode<BPlusHierarchy>,
  nodes: HierarchyNode<BPlusHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  // snapshot de posiciones anteriores (antes de escribir las nuevas)
  const prev = new Map(nodePositions);

  // sincroniza caché con el layout nuevo
  nodes.forEach((d) => {
    nodePositions.set(d.data.id, { x: d.x!, y: d.y! });
  });

  // anima nodos
  const nodesT = treeG
    .selectAll<SVGGElement, HierarchyNode<BPlusHierarchy>>("g.node")
    .data(nodes, (d) => d.data.id)
    .transition()
    .duration(BP_ANIM.reflow)
    .ease(BP_ANIM.easeOut)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id)!;
      return `translate(${p.x}, ${p.y})`;
    })
    .end();

  // ⬇️ en paralelo, interpola los links entre prev→nodePositions
  const linksLayer = treeG; // o tu `g.links-layer` si lo tienes
  tweenBPlusLinksDuringReflow(
    linksLayer,
    root,
    prev,
    nodePositions,
    BP_ANIM.reflow,
    BP_ANIM.easeOut
  );

  await nodesT;

  // aseguramos estado final coherente
  redrawBPlusLinksResponsive(linksLayer, root, nodePositions);
  drawLeafChainEdges(linksLayer, root, nodePositions);
}

/** Coloca todos los nodos en su x,y final SIN transición y redibuja enlaces al instante. */
export function settleBPlusNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: HierarchyNode<BPlusHierarchy>,
  nodes: HierarchyNode<BPlusHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  treeG
    .selectAll<SVGGElement, HierarchyNode<BPlusHierarchy>>("g.node")
    .data(nodes, (d) => d.data.id)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id)!;
      return `translate(${p.x}, ${p.y})`;
    });

  // ⬇️ en lugar de baseDrawBPlusLinks: siempre recalcula con las posiciones actuales
  const linksLayer = treeG; // si tienes una capa específica, usa esa selección
  redrawBPlusLinksResponsive(linksLayer, root, nodePositions);
  drawLeafChainEdges(linksLayer, root, nodePositions);
}

/* ─────────────────────────── Crear raíz (pop) ─────────────────────────── */
export async function animateBPlusCreateRoot(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  rootId: string,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);
    const g = treeG.select<SVGGElement>(`g#${rootId}`);
    if (g.empty()) return;

    const body =
      g.select<SVGRectElement>("rect.bp-body").node() ||
      g.select<SVGRectElement>("rect").node();

    if (body) {
      const sel = d3.select(body as SVGRectElement);
      await sel
        .transition()
        .duration(BP_ANIM.popIn)
        .ease(BP_ANIM.easeBack)
        .attrTween("transform", () =>
          d3.interpolateString("scale(0.94)", "scale(1.05)")
        )
        .transition()
        .duration(BP_ANIM.popSettle)
        .ease(BP_ANIM.easeOut)
        .attr("transform", "scale(1)")
        .end();
    }
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}
// Corre un “cometa” sobre el link real y le da un pulso de color
async function runCometOnLink(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromId: string,
  toId: string,
  dur = 460
) {
  const gLink = treeG.select<SVGGElement>(`g#tlink-${fromId}-${toId}`);
  const core = gLink.select<SVGPathElement>("path.tree-link");
  const halo = gLink.select<SVGPathElement>("path.tree-link-halo");
  if (core.empty()) return;

  const corePath = core.node() as SVGPathElement;
  const d = core.attr("d")!;
  const len = corePath.getTotalLength();

  // Pulso sutil del enlace real (sin crear otro marcador/arrow)
  const origStroke = core.attr("stroke");
  const origW = +core.attr("stroke-width");
  core
    .interrupt()
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke", "#7dd3fc") // INS.linkPulse
    .attr("stroke-width", origW + 1)
    .transition()
    .duration(180)
    .attr("stroke", origStroke ?? null)
    .attr("stroke-width", origW);

  if (!halo.empty())
    halo
      .interrupt()
      .transition()
      .duration(dur)
      .style("opacity", 1)
      .transition()
      .duration(180)
      .style("opacity", 0.95);

  // Estela corta que avanza (stroke-dash)
  const trail = overlay
    .append("path")
    .attr("class", "bp-insert-trail")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpInsertStrokeGrad)")
    .attr("stroke-width", 2.2)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", `${Math.max(12, len * 0.18)} ${len}`)
    .attr("stroke-dashoffset", len)
    .style("opacity", 0.95);

  const trailT = trail
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0)
    .end()
    .then(() =>
      trail.transition().duration(160).style("opacity", 0).remove().end()
    );

  // Cometa (puntito con glow) que corre por el path real
  const runner = overlay
    .append("circle")
    .attr("class", "bp-insert-runner")
    .attr("r", 3.8)
    .attr("fill", "url(#bpRunnerGrad)")
    .style("filter", "url(#bpRunnerGlow)")
    .style("opacity", 0.9);

  const runnerT = runner
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .tween("pos", () => {
      return (tt: number) => {
        const p = corePath.getPointAtLength(tt * len);
        runner.attr("cx", p.x).attr("cy", p.y);
      };
    })
    .end()
    .then(() =>
      runner.transition().duration(140).style("opacity", 0).remove().end()
    );

  await Promise.all([trailT, runnerT]);
}

/* ─────────────────────────── Insertar: camino + drop del slot hoja ─────────────────────────── */
export async function animateBPlusInsertLeaf(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    /** id del leaf donde terminó la inserción */
    leafId: string;
    /** jerarquía raíz actual ya layout-eada */
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    /** todos los nodos (descendants) para settle */
    nodesData: HierarchyNode<BPlusHierarchy>[];
    /** índice del slot recién insertado (si lo tienes); si no, hace pop del body */
    slotIndex?: number | null;
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);

    // Coloca todo en su posición final (sin animar reflow aquí)
    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );

    // Defs y overlay
    const svg = getSVGFromTreeG(treeG);
    if (svg) ensureBPInsertDefs(svg);
    const overlay = ensureInsertOverlay(treeG);

    // Camino raíz → hoja
    const byId = new Map<string, HierarchyNode<BPlusHierarchy>>();
    params.rootHierarchy.each((n) => byId.set(n.data.id, n));

    const target = byId.get(params.leafId);
    if (!target) {
      await popBody(treeG, params.leafId);
      return;
    }

    const pathNodes = params.rootHierarchy.path(target);

    // Atenúa resto
    const allNodes = treeG.selectAll<SVGGElement, unknown>("g.node");
    await allNodes.transition().duration(160).style("opacity", 0.35).end();

    // Recorre la ruta dibujando segmentos y glow sutil en nodos
    for (let i = 0; i < pathNodes.length; i++) {
      const id = pathNodes[i].data.id;
      const gNode = treeG.select<SVGGElement>(`g#${id}`);
      const body =
        gNode.select<SVGRectElement>("rect.bp-body").node() ||
        gNode.select<SVGRectElement>("rect").node();

      await gNode.transition().duration(120).style("opacity", 1).end();

      if (body) {
        const sel = d3.select(body as SVGRectElement);
        const origStroke = sel.attr("stroke");
        const origW = sel.attr("stroke-width");

        await sel
          .transition()
          .duration(150)
          .attr("stroke", INS.slotGlow)
          .attr("stroke-width", (+origW || 1.4) + 1)
          .end();

        d3.select(body as SVGElement).attr("filter", "url(#bpInsertGlow)");
        await new Promise((r) => setTimeout(r, 120));
        d3.select(body as SVGElement).attr("filter", null);

        await sel
          .transition()
          .duration(140)
          .attr("stroke", origStroke ?? null)
          .attr("stroke-width", origW ?? null)
          .end();
      }

      // segmento al siguiente nodo (pulso + cometa sobre el link real)
      if (i < pathNodes.length - 1) {
        const fromId = id;
        const toId = pathNodes[i + 1].data.id;

        await runCometOnLink(treeG, overlay, fromId, toId, 460);
        await gNode.transition().duration(100).style("opacity", 0.7).end();
      }
    }

    // Llegada a la hoja: drop del slot o pop del body
    if (typeof params.slotIndex === "number") {
      await animateSlotGrow(treeG, params.leafId, params.slotIndex);
    } else {
      await popBody(treeG, params.leafId);
    }

    // Limpia y restaura opacidades
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

/** “Beam” de SEARCH: pulso del link real + estela + rayas animadas + spotlight */
async function runSearchBeamOnLink(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromId: string,
  toId: string,
  dur = 520,
  fallbackD?: string
) {
  const gLink = treeG.select<SVGGElement>(
    `g#${cssEsc(`tlink-${fromId}-${toId}`)}`
  );
  const core = gLink.select<SVGPathElement>("path.tree-link");
  const halo = gLink.select<SVGPathElement>("path.tree-link-halo");

  let corePath: SVGPathElement | null = core.node();
  let d = core.attr("d") || "";

  let tempPath: d3.Selection<SVGPathElement, unknown, null, undefined> | null =
    null;
  if (!corePath || !d) {
    if (!fallbackD) return;
    tempPath = overlay
      .append<SVGPathElement>("path")
      .attr("d", fallbackD)
      .attr("fill", "none")
      .style("opacity", 0);
    corePath = tempPath.node()!;
    d = fallbackD;
  }

  const len = corePath.getTotalLength();

  // Pulso del link real
  if (!core.empty()) {
    const origStroke = core.attr("stroke");
    const origW = +core.attr("stroke-width") || 2;
    core
      .interrupt()
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke", INS.linkPulse)
      .attr("stroke-width", origW + 1)
      .transition()
      .duration(180)
      .attr("stroke", origStroke ?? null)
      .attr("stroke-width", origW);

    if (!halo.empty())
      halo
        .interrupt()
        .transition()
        .duration(dur)
        .style("opacity", 1)
        .transition()
        .duration(180)
        .style("opacity", 0.95);
  }

  // Beam principal (gradiente)
  const beam = overlay
    .append("path")
    .attr("class", "bp-search-beam")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpInsertStrokeGrad)")
    .attr("stroke-width", SRCH.beamWidth)
    .attr("stroke-linecap", "round")
    .attr("marker-end", "url(#bpInsertArrow)")
    .attr("stroke-dasharray", `${len} ${len}`)
    .attr("stroke-dashoffset", len)
    .style("opacity", 0.98);

  const beamT = beam
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0)
    .end();

  // Rayas de escaneo que “corren” por el beam
  const stripes = overlay
    .append("path")
    .attr("class", "bp-search-stripes")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpScanStripeGrad)")
    .attr("stroke-width", SRCH.stripeWidth)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", "6 10")
    .attr("stroke-dashoffset", 0)
    .style("opacity", 0.65);

  const stripesT = stripes
    .transition()
    .duration(dur)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", -Math.max(60, len * 0.85))
    .end()
    .then(() =>
      stripes.transition().duration(180).style("opacity", 0).remove().end()
    );

  // Runner + spotlight que lo sigue
  const spot = overlay
    .append("circle")
    .attr("class", "bp-search-spot")
    .attr("r", 14)
    .attr("fill", "url(#bpSearchSpotGrad)")
    .style("opacity", 0.45);

  const runner = overlay
    .append("circle")
    .attr("class", "bp-search-runner")
    .attr("r", 4)
    .attr("fill", "url(#bpRunnerGrad)")
    .style("filter", "url(#bpRunnerGlow)")
    .style("opacity", 0.95);

  const mover = (tt: number) => {
    const p = corePath!.getPointAtLength(tt * len);
    runner.attr("cx", p.x).attr("cy", p.y);
    spot.attr("cx", p.x).attr("cy", p.y);
  };

  const runnerT = runner
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .tween("pos", () => (t: number) => mover(t))
    .end()
    .then(() =>
      Promise.all([
        runner.transition().duration(140).style("opacity", 0).remove().end(),
        spot.transition().duration(200).style("opacity", 0).remove().end(),
      ])
    );

  await Promise.all([beamT, stripesT, runnerT]);
  beam.remove();
  if (tempPath) tempPath.remove();
}

// ─────────────────────────── Búsqueda: camino con ping, beam (sin breadcrumbs) ───────────────────────────
export async function animateBPlusSearchPath(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: HierarchyNode<BPlusHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void,
  hit?: { leafId: string; slotIndex: number } | null
) {
  if (!path.length) {
    resetQueryValues?.();
    return;
  }

  try {
    setIsAnimating?.(true);

    const svg = getSVGFromTreeG(treeG);
    if (svg) ensureBPInsertDefs(svg);

    let overlay = treeG.select<SVGGElement>("g.bp-search-overlay");
    if (overlay.empty()) {
      overlay = treeG
        .append("g")
        .attr("class", "bp-search-overlay")
        .style("pointer-events", "none");
    } else overlay.selectAll("*").remove();
    overlay.raise();

    const root = path[0]
      .ancestors()
      .slice(-1)[0] as HierarchyNode<BPlusHierarchy>;
    const buildPath = bPlusPathBuilderFactory(root, nodePositions);

    // 1) atenuar todo
    const all = treeG.selectAll<SVGGElement, unknown>("g.node");
    await all
      .transition()
      .duration(140)
      .style("opacity", SRCH.fadeOthers)
      .end();

    // 2) recorrer
    for (let i = 0; i < path.length; i++) {
      const curId = path[i].data.id;

      // ⬅️ SUBIR opacidad del nodo ACTIVO antes de resaltar
      const gCur = treeG.select<SVGGElement>(`g#${cssEsc(curId)}`);
      await gCur
        .interrupt()
        .transition()
        .duration(90)
        .style("opacity", 1)
        .end();

      // resalte (halo + anillos + glow)
      await pingNode(treeG, curId, SRCH.ringColor);

      if (i < path.length - 1) {
        const nextId = path[i + 1].data.id;

        await runSearchBeamOnLink(
          treeG,
          overlay,
          curId,
          nextId,
          520,
          buildPath(curId, nextId)
        );

        // dejar el nodo recorrido con luz suave (no apagado)
        await gCur
          .interrupt()
          .transition()
          .duration(90)
          .style("opacity", SRCH.visitedOpacity)
          .end();
      }
    }

    // llegada
    if (hit) await animateSlotGrow(treeG, hit.leafId, hit.slotIndex);
    else await popBody(treeG, path[path.length - 1].data.id);

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

// id seguro para querySelector
function cssEsc(s: string) {
  return s.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

/** “Ping” del nodo: halo detrás + glow + anillos concéntricos. */
async function pingNode(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string,
  color = SRCH.ringColor
) {
  const g = treeG.select<SVGGElement>(`g#${cssEsc(nodeId)}`);
  if (g.empty()) return;

  const body =
    g.select<SVGRectElement>("rect.bp-body").node() ||
    g.select<SVGRectElement>("rect").node();
  if (!body) return;

  g.raise(); // sobre el resto mientras “brilla”

  const sel = d3.select(body as SVGRectElement);
  const bx = +sel.attr("x") || 0;
  const by = +sel.attr("y") || 0;
  const bw = +sel.attr("width") || 0;
  const bh = +sel.attr("height") || 0;
  const rx = +sel.attr("rx") || 8;
  const ry = +sel.attr("ry") || rx;

  // halo detrás (pulso rápido)
  const halo = g
    .append("rect")
    .attr("class", "bp-search-halo")
    .attr("x", bx - 4)
    .attr("y", by - 4)
    .attr("width", bw + 8)
    .attr("height", bh + 8)
    .attr("rx", rx + 4)
    .attr("ry", ry + 4)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3.2)
    .style("filter", "url(#bpInsertGlow)")
    .style("opacity", 0);
  (halo as any).lower?.(); // intenta ponerlo por detrás del body

  await halo
    .transition()
    .duration(160)
    .style("opacity", 0.85)
    .transition()
    .duration(260)
    .style("opacity", 0)
    .remove()
    .end();

  // golpe de trazo + glow del body
  const origStroke = sel.attr("stroke");
  const origW = +sel.attr("stroke-width") || 1.2;

  await sel
    .attr("filter", "url(#bpInsertGlow)")
    .transition()
    .duration(170)
    .attr("stroke", color)
    .attr("stroke-width", origW + 1.2)
    .end();

  // anillos concéntricos desde el centro
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const rings: Array<Promise<any>> = [];
  for (let i = 0; i < SRCH.ringCount; i++) {
    const r = g
      .append("circle")
      .attr("class", "bp-search-ring")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 2)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.1)
      .style("opacity", 0.95);

    rings.push(
      r
        .transition()
        .duration(SRCH.ringDur + i * 90)
        .ease(d3.easeCubicOut)
        .attr("r", SRCH.ringMaxR + i * 5)
        .style("opacity", 0)
        .remove()
        .end()
    );
  }
  await Promise.all(rings);

  await sel
    .transition()
    .duration(120)
    .attr("stroke", origStroke ?? null)
    .attr("stroke-width", origW)
    .end();
  sel.attr("filter", null);
}

/** Corre una “ascua” sobre el link real; si no existe, usa un path de fallback. */
async function runEmberOnLink(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromId: string,
  toId: string,
  dur = 420,
  fallbackD?: string // ← NUEVO: path de respaldo
) {
  // Intenta localizar el link real dibujado por tu utility
  const gLink = treeG.select<SVGGElement>(
    `g#${cssEsc(`tlink-${fromId}-${toId}`)}`
  );
  const core = gLink.select<SVGPathElement>("path.tree-link");
  const halo = gLink.select<SVGPathElement>("path.tree-link-halo");

  let corePath: SVGPathElement | null = core.node();
  let d = core.attr("d") || "";

  // Si no hay link real (o no tiene 'd'), usa un path temporal con fallback
  let tempPath: d3.Selection<SVGPathElement, unknown, null, undefined> | null =
    null;
  if (!corePath || !d) {
    if (!fallbackD) return; // sin camino, no hay animación
    tempPath = overlay
      .append<SVGPathElement>("path")
      .attr("d", fallbackD)
      .attr("fill", "none")
      .style("opacity", 0);
    corePath = tempPath.node()!;
    d = fallbackD;
  }

  const len = corePath.getTotalLength();

  // Pulso sobre el link real (si existe)
  if (!core.empty()) {
    const origStroke = core.attr("stroke");
    const origW = +core.attr("stroke-width");
    core
      .interrupt()
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke", "#fb7185")
      .attr("stroke-width", origW + 1)
      .transition()
      .duration(160)
      .attr("stroke", origStroke ?? null)
      .attr("stroke-width", origW);

    if (!halo.empty()) {
      halo
        .interrupt()
        .transition()
        .duration(dur)
        .style("opacity", 1)
        .transition()
        .duration(160)
        .style("opacity", 0.95);
    }
  }

  // Estela
  const trail = overlay
    .append("path")
    .attr("class", "bp-delete-trail")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpDeleteStrokeGrad)")
    .attr("stroke-width", 2.4)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", `${Math.max(10, len * 0.18)} ${len}`)
    .attr("stroke-dashoffset", len)
    .style("opacity", 0.95);

  const trailT = trail
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0)
    .end()
    .then(() =>
      trail.transition().duration(140).style("opacity", 0).remove().end()
    );

  // Runner (ascua)
  const runner = overlay
    .append("circle")
    .attr("class", "bp-delete-runner")
    .attr("r", 3.6)
    .attr("fill", "url(#bpDelGrad)")
    .style("filter", "url(#bpRunnerGlow)")
    .style("opacity", 0.95);

  const runnerT = runner
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .tween("pos", () => (tt: number) => {
      const p = corePath!.getPointAtLength(tt * len);
      runner.attr("cx", p.x).attr("cy", p.y);
    })
    .end()
    .then(() =>
      runner.transition().duration(120).style("opacity", 0).remove().end()
    );

  await Promise.all([trailT, runnerT]);

  if (tempPath) tempPath.remove();
}

function getTranslateXY(gSel: d3.Selection<SVGGElement, any, any, any>) {
  const tr = gSel.attr("transform") || "";
  const m = /translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(tr);
  return { x: m ? +m[1] : 0, y: m ? +m[2] : 0 };
}

/* ─────────────────────────── Paleta RANGE ─────────────────────────── */
const RNG = {
  accent0: "#34d399", // green-400 (beam)
  accent1: "#10b981", // emerald-500 (beam mix/stripes)
  slotGlow: "#22c55e", // green-500 (slot pulse)
  fadeOthers: 0.22,
  visitedOpacity: 0.95,
  beamWidth: 3.0,
  stripeWidth: 1.4,
};

/* Gradientes/defs para RANGE (aprovechamos el ensure de insert/search) */
export function ensureRangeDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  if (defs.select("#bpRangeStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpRangeStrokeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", RNG.accent0);
    g.append("stop").attr("offset", "100%").attr("stop-color", RNG.accent1);
  }
  if (defs.select("#bpRangeSpotGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpRangeSpotGrad");
    g.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(134,239,172,0.65)"); // green-300
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(134,239,172,0)");
  }
  if (defs.select("#bpRangeArrow").empty()) {
    const m = defs
      .append<SVGMarkerElement>("marker")
      .attr("id", "bpRangeArrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse");
    m.append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", RNG.accent0);
  }
}

/* Overlay específico RANGE */
function ensureRangeOverlay(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  let overlay = treeG.select<SVGGElement>("g.bp-range-overlay");
  if (overlay.empty()) {
    overlay = treeG
      .append("g")
      .attr("class", "bp-range-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();
  return overlay;
}

/* Slot pulse para selección de rango dentro de una hoja */
async function pulseRangeSlot(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  slotIndex: number
) {
  const slotG = treeG.select<SVGGElement>(
    `g#${leafId} g.slots g#${leafId}#k${slotIndex}`
  );
  const box = slotG.select<SVGRectElement>("rect.slot-box");
  if (box.empty()) return;

  const w = +box.attr("width");
  const h = +box.attr("height");

  const fill = slotG
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", h)
    .attr("width", 0)
    .attr("fill", RNG.slotGlow)
    .style("opacity", 0.18);

  await fill
    .transition()
    .duration(180)
    .ease(d3.easeCubicOut)
    .attr("width", w)
    .style("opacity", 0.28)
    .end();

  const origStroke = box.attr("stroke");
  const origW = box.attr("stroke-width");
  await box
    .transition()
    .duration(160)
    .attr("stroke", RNG.slotGlow)
    .attr("stroke-width", (+origW || 1.1) + 0.9)
    .end();
  await box
    .transition()
    .duration(200)
    .attr("stroke", origStroke ?? "#374151")
    .attr("stroke-width", origW ?? "1.1")
    .end();

  await fill.transition().duration(160).style("opacity", 0).remove().end();
}

/* Path “corto” entre dos hojas vecinas (derecha de A → izquierda de B) */
function beltPathBetweenLeaves(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromLeafId: string,
  toLeafId: string
): string {
  const bodyA =
    treeG
      .select<SVGRectElement>(`g#${cssEsc(fromLeafId)} rect.bp-body`)
      .node() ||
    treeG.select<SVGRectElement>(`g#${cssEsc(fromLeafId)} rect`).node();
  const bodyB =
    treeG.select<SVGRectElement>(`g#${cssEsc(toLeafId)} rect.bp-body`).node() ||
    treeG.select<SVGRectElement>(`g#${cssEsc(toLeafId)} rect`).node();
  if (!bodyA || !bodyB) return "";

  const a = d3.select(bodyA),
    b = d3.select(bodyB);
  const ax = (+a.attr("x") || 0) + (+a.attr("width") || 0);
  const ay = (+a.attr("y") || 0) + (+a.attr("height") || 0) / 2;
  const bx = +b.attr("x") || 0;
  const by = (+b.attr("y") || 0) + (+b.attr("height") || 0) / 2;
  const midX = (ax + bx) / 2;

  return `M${ax},${ay} C ${midX},${ay} ${midX},${by} ${bx},${by}`;
}

/* “Beam” verde por el belt hoja→hoja */
async function runRangeBeamOnBelt(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromLeafId: string,
  toLeafId: string,
  dur = 520
) {
  const d = beltPathBetweenLeaves(treeG, fromLeafId, toLeafId);
  if (!d) return;

  const p = overlay
    .append("path")
    .attr("class", "bp-range-beam")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpRangeStrokeGrad)")
    .attr("stroke-width", RNG.beamWidth)
    .attr("stroke-linecap", "round")
    .attr("marker-end", "url(#bpRangeArrow)")
    .style("opacity", 0.98);

  const len = (p.node() as SVGPathElement).getTotalLength();
  p.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len);

  const stripes = overlay
    .append("path")
    .attr("class", "bp-range-stripes")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpRangeStrokeGrad)")
    .attr("stroke-width", RNG.stripeWidth)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", "6 10")
    .style("opacity", 0.6);

  const spot = overlay
    .append("circle")
    .attr("class", "bp-range-spot")
    .attr("r", 12)
    .attr("fill", "url(#bpRangeSpotGrad)")
    .style("opacity", 0.4);

  const runner = overlay
    .append("circle")
    .attr("class", "bp-range-runner")
    .attr("r", 4)
    .attr("fill", "url(#bpRunnerGrad)")
    .style("filter", "url(#bpRunnerGlow)")
    .style("opacity", 0.95);

  const pathEl = p.node() as SVGPathElement;

  const beamT = p
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0)
    .end();

  const stripesT = stripes
    .transition()
    .duration(dur)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", -Math.max(60, len * 0.85))
    .end()
    .then(() =>
      stripes.transition().duration(160).style("opacity", 0).remove().end()
    );

  const runnerT = runner
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .tween("pos", () => (tt: number) => {
      const pt = pathEl.getPointAtLength(tt * len);
      runner.attr("cx", pt.x).attr("cy", pt.y);
      spot.attr("cx", pt.x).attr("cy", pt.y);
    })
    .end()
    .then(() =>
      Promise.all([
        runner.transition().duration(140).style("opacity", 0).remove().end(),
        spot.transition().duration(200).style("opacity", 0).remove().end(),
      ])
    );

  await Promise.all([beamT, stripesT, runnerT]);
  p.remove();
}

/* Helpers para encontrar hojas e índices de slots del rango */
function getLeaves(nodes: HierarchyNode<BPlusHierarchy>[]) {
  return nodes.filter((n) => n.data.isLeaf);
}
function nextLeafId(
  leaf: HierarchyNode<BPlusHierarchy>,
  byId: Map<string, HierarchyNode<BPlusHierarchy>>,
  orderedLeaves: HierarchyNode<BPlusHierarchy>[]
): string | null {
  const id =
    (leaf.data as any).nextLeafId ??
    (leaf.data as any).nextLeaf ??
    (leaf.data as any).next ??
    null;
  if (id && byId.has(id)) return id;

  // fallback: siguiente por X (posición visual)
  const idx = orderedLeaves.findIndex((l) => l.data.id === leaf.data.id);
  if (idx >= 0 && idx + 1 < orderedLeaves.length)
    return orderedLeaves[idx + 1].data.id;
  return null;
}
function orderLeavesByX(
  leaves: HierarchyNode<BPlusHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  return [...leaves].sort((a, b) => {
    const ax = nodePositions.get(a.data.id)?.x ?? 0;
    const bx = nodePositions.get(b.data.id)?.x ?? 0;
    return ax - bx;
  });
}
function findStartEndLeaves(
  leavesOrdered: HierarchyNode<BPlusHierarchy>[],
  from: number,
  to: number
) {
  let start: HierarchyNode<BPlusHierarchy> | null = null;
  let end: HierarchyNode<BPlusHierarchy> | null = null;

  for (const lf of leavesOrdered) {
    const keys = (lf.data.keys as number[]) || [];
    if (!keys.length) continue;
    const minK = keys[0],
      maxK = keys[keys.length - 1];
    if (start === null && maxK >= from) start = lf;
    if (minK <= to) end = lf;
  }
  return { start, end };
}
function indicesInRange(keys: number[], from: number, to: number) {
  const res: number[] = [];
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] >= from && keys[i] <= to) res.push(i);
  }
  return res;
}
/* Beam verde sobre el link árbol (padre→hijo). Usa el link real y,
   si no existe, cae al path “entre claves” del factory B+ */
async function runRangeBeamOnTreeLink(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromId: string,
  toId: string,
  dur: number,
  fallbackD?: string
) {
  const gLink = treeG.select<SVGGElement>(
    `g#${cssEsc(`tlink-${fromId}-${toId}`)}`
  );
  const core = gLink.select<SVGPathElement>("path.tree-link");
  const halo = gLink.select<SVGPathElement>("path.tree-link-halo");

  let corePath: SVGPathElement | null = core.node();
  let d = core.attr("d") || "";

  let tempPath: d3.Selection<SVGPathElement, unknown, null, undefined> | null =
    null;
  if (!corePath || !d) {
    if (!fallbackD) return;
    tempPath = overlay
      .append<SVGPathElement>("path")
      .attr("d", fallbackD)
      .attr("fill", "none")
      .style("opacity", 0);
    corePath = tempPath.node()!;
    d = fallbackD;
  }

  const len = corePath.getTotalLength();

  // Pulso sutil del link real hacia verde
  if (!core.empty()) {
    const origStroke = core.attr("stroke");
    const origW = +core.attr("stroke-width") || 2;
    core
      .interrupt()
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke", RNG.accent0)
      .attr("stroke-width", origW + 1)
      .transition()
      .duration(180)
      .attr("stroke", origStroke ?? null)
      .attr("stroke-width", origW);

    if (!halo.empty())
      halo
        .interrupt()
        .transition()
        .duration(dur)
        .style("opacity", 1)
        .transition()
        .duration(180)
        .style("opacity", 0.95);
  }

  // Beam
  const beam = overlay
    .append("path")
    .attr("class", "bp-range-tree-beam")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpRangeStrokeGrad)")
    .attr("stroke-width", RNG.beamWidth)
    .attr("stroke-linecap", "round")
    .attr("marker-end", "url(#bpRangeArrow)")
    .style("opacity", 0.98);

  beam.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len);

  const runner = overlay
    .append("circle")
    .attr("class", "bp-range-tree-runner")
    .attr("r", 4)
    .attr("fill", "url(#bpRunnerGrad)")
    .style("filter", "url(#bpRunnerGlow)")
    .style("opacity", 0.95);

  const spot = overlay
    .append("circle")
    .attr("class", "bp-range-tree-spot")
    .attr("r", 12)
    .attr("fill", "url(#bpRangeSpotGrad)")
    .style("opacity", 0.4);

  const beamT = beam
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0)
    .end();

  const runnerT = runner
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .tween("pos", () => (tt: number) => {
      const p = corePath!.getPointAtLength(tt * len);
      runner.attr("cx", p.x).attr("cy", p.y);
      spot.attr("cx", p.x).attr("cy", p.y);
    })
    .end()
    .then(() =>
      Promise.all([
        runner.transition().duration(140).style("opacity", 0).remove().end(),
        spot.transition().duration(200).style("opacity", 0).remove().end(),
      ])
    );

  await Promise.all([beamT, runnerT]);
  beam.remove();
  if (tempPath) tempPath.remove();
}

/* ─────────────────────────── RANGE: camino a 'from' + barrido por belt ─────────────────────────── */
export async function animateBPlusRange(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    nodesData: HierarchyNode<BPlusHierarchy>[];
    from: number;
    to: number;
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void, // ← NO la usamos para no limpiar tu banda
  setIsAnimating?: (b: boolean) => void
) {
  // normaliza límites
  let from = Math.min(params.from, params.to);
  let to = Math.max(params.from, params.to);

  try {
    setIsAnimating?.(true);

    // Asegura posiciones actuales y dibuja links coherentes
    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );

    // Defs + overlay
    const svg = getSVGFromTreeG(treeG);
    if (svg) {
      ensureBPInsertDefs(svg); // runner glow reutilizado
      ensureRangeDefs(svg);
    }
    const overlay = ensureRangeOverlay(treeG);

    // Mapa id→nodo y hojas ordenadas (para fallback de nextLeaf)
    const byId = new Map<string, HierarchyNode<BPlusHierarchy>>();
    params.rootHierarchy.each((n) => byId.set(n.data.id, n));

    const leaves = getLeaves(params.nodesData);
    if (!leaves.length) return;

    const leavesOrdered = orderLeavesByX(leaves, nodePositions);
    const { start, end } = findStartEndLeaves(leavesOrdered, from, to);

    if (!start || !end) {
      // nada que mostrar dentro del rango
      return;
    }

    // 1) Atenúa todo
    const all = treeG.selectAll<SVGGElement, unknown>("g.node");
    await all.transition().duration(140).style("opacity", RNG.fadeOthers).end();

    // 2) Recorre raíz→hoja(start) con pings verdes + beam verde
    const builder = bPlusPathBuilderFactory(
      params.rootHierarchy,
      nodePositions
    );
    const pathToStart = params.rootHierarchy.path(start);

    for (let i = 0; i < pathToStart.length; i++) {
      const id = pathToStart[i].data.id;
      const gNode = treeG.select<SVGGElement>(`g#${cssEsc(id)}`);

      await gNode.transition().duration(100).style("opacity", 1).end();
      await pingNode(treeG, id, RNG.accent0); // ping en verde

      if (i < pathToStart.length - 1) {
        const nxt = pathToStart[i + 1].data.id;
        await runRangeBeamOnTreeLink(
          treeG,
          overlay,
          id,
          nxt,
          520,
          builder(id, nxt)
        );
        // deja “visitado” sin apagarlo demasiado
        await gNode
          .transition()
          .duration(90)
          .style("opacity", RNG.visitedOpacity)
          .end();
      }
    }

    // 3) Selecciona slots de la hoja start en [from, to]
    const doPulseInLeaf = async (
      leaf: HierarchyNode<BPlusHierarchy>,
      lo: number,
      hi: number
    ) => {
      const keys = (leaf.data.keys as number[]) || [];
      const idxs = indicesInRange(keys, lo, hi);
      for (const k of idxs) {
        await pulseRangeSlot(treeG, leaf.data.id, k);
      }
    };
    await doPulseInLeaf(start, from, to);

    // 4) Barrido por el belt: avanzar nextLeaf resaltando claves hasta superar 'to'
    let cur: HierarchyNode<BPlusHierarchy> = start;
    while (cur.data.id !== end.data.id) {
      const nxtId = nextLeafId(cur, byId, leavesOrdered);
      if (!nxtId) break;

      await runRangeBeamOnBelt(treeG, overlay, cur.data.id, nxtId);
      cur = byId.get(nxtId)!;

      // en hojas intermedias: todo lo ≤ to
      await doPulseInLeaf(cur, from, to);
      if ((cur.data.keys?.[cur.data.keys.length - 1] ?? -Infinity) >= to) break;
    }

    // 5) Limpieza y restaurar opacidades
    overlay.selectAll("*").remove();
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .transition()
      .duration(160)
      .style("opacity", 1)
      .end();
  } finally {
    resetQueryValues?.(); // 🔔 apaga query.range y demás triggers
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── BORRADO: camino rojo + “dust & vacuum” del slot ─────────────────────────── */
/**
 * Anima un borrado de clave en una hoja B+. Recorre el camino en rojo y desintegra el slot.
 * Llamada ideal: antes de aplicar cambios al dato y al layout. Después haces reflow con tus utilidades.
 */
export async function animateBPlusDelete(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    /** id de la hoja donde está el slot a borrar */
    leafId: string;
    /** índice del slot dentro de la hoja (0..n-1) */
    slotIndex: number | null;
    /** jerarquía raíz actual ya layout-eada */
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    /** todos los nodos (descendants) para settle visual previo */
    nodesData: HierarchyNode<BPlusHierarchy>[];
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);

    // Fijamos todo donde está
    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );

    // Defs y overlay
    const svg = getSVGFromTreeG(treeG);
    if (svg) ensureBPInsertDefs(svg); // también crea defs de delete
    const overlay = ensureDeleteOverlay(treeG);

    // Mapa id->nodo
    const byId = new Map<string, HierarchyNode<BPlusHierarchy>>();
    params.rootHierarchy.each((n) => byId.set(n.data.id, n));

    const target = byId.get(params.leafId);
    if (!target) return;

    // Camino raíz → hoja
    const pathNodes = params.rootHierarchy.path(target);

    const buildPath = bPlusPathBuilderFactory(
      params.rootHierarchy,
      nodePositions
    );

    // 1) Atenúa todo; iremos iluminando la ruta
    const all = treeG.selectAll<SVGGElement, unknown>("g.node");
    await all
      .transition()
      .duration(140)
      .style("opacity", SRCH.fadeOthers)
      .end();

    for (let i = 0; i < pathNodes.length; i++) {
      const id = pathNodes[i].data.id;
      const g = treeG.select<SVGGElement>(`g#${id}`);
      const body =
        g.select<SVGRectElement>("rect.bp-body").node() ||
        g.select<SVGRectElement>("rect").node();

      await g.transition().duration(110).style("opacity", 1).end();

      if (body) {
        const sel = d3.select(body as SVGRectElement);
        const origStroke = sel.attr("stroke");
        const origW = sel.attr("stroke-width");

        // glow rojo breve
        await sel
          .transition()
          .duration(140)
          .attr("stroke", DEL.glow)
          .attr("stroke-width", (+origW || 1.4) + 1)
          .end();

        await sel
          .transition()
          .duration(120)
          .attr("stroke", origStroke ?? null)
          .attr("stroke-width", origW ?? null)
          .end();
      }

      // segmento al siguiente (pulso + “ascua” sobre el link real)
      if (i < pathNodes.length - 1) {
        const fromId = id;
        const toId = pathNodes[i + 1].data.id;
        await runEmberOnLink(
          treeG,
          overlay,
          fromId,
          toId,
          420,
          buildPath(fromId, toId) // ← fallback si no encuentra el link real
        );
        await g.transition().duration(90).style("opacity", 0.7).end();
      }
    }

    // 2) Slot crumble (o cuerpo si no llega índice)
    if (typeof params.slotIndex === "number") {
      await animateSlotCrumble(treeG, params.leafId, params.slotIndex);
    } else {
      // Si por alguna razón no tenemos el índice, hacemos un “shrink” del cuerpo de la hoja
      const gLeaf = treeG.select<SVGGElement>(`g#${params.leafId}`);
      const body =
        gLeaf.select<SVGRectElement>("rect.bp-body").node() ||
        gLeaf.select<SVGRectElement>("rect").node();
      if (body) {
        const sel = d3.select(body as SVGRectElement);
        await sel
          .transition()
          .duration(220)
          .ease(BP_ANIM.easeBack)
          .attrTween("transform", () =>
            d3.interpolateString("scale(1.0)", "scale(0.92)")
          )
          .end();
        await sel
          .transition()
          .duration(200)
          .ease(BP_ANIM.easeOut)
          .attr("transform", "scale(1)")
          .end();
      }
    }

    // 3) Limpieza y restaurar opacidad
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

/* ─────────────────────────── Path builder “entre claves” (B+) ─────────────────────────── */
export function bPlusPathBuilderFactory(
  root: HierarchyNode<BPlusHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>
) {
  const { childIndexMap } = buildBPlusLinksFromHierarchy(root);
  const byId = new Map<string, HierarchyNode<BPlusHierarchy>>();
  root.each((n) => byId.set(n.data.id, n));

  return function bPlusPathBuilder(sourceId: string, targetId: string): string {
    const parent = byId.get(sourceId);
    const child = byId.get(targetId);
    if (!parent || !child) return "";

    const idx = childIndexMap.get(`${parent.data.id}->${child.data.id}`) ?? 0;
    const s = childAnchorForBPlus(parent, nodePositions, idx);
    const t = topCenterAnchorOfChildBPlus(child, nodePositions);

    const sy = s.y;
    const ty = t.y - 6; // pequeño ajuste como en B
    const midY = (sy + ty) / 2;

    return `M${s.x},${sy} C ${s.x},${midY} ${t.x},${midY} ${t.x},${ty}`;
  };
}

/* ─────────────────────────── Defs para INSERT + DELETE estilo B+ ─────────────────────────── */
function ensureBPInsertDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Glow azulado para insert/search
  if (defs.select("#bpInsertGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "bpInsertGlow")
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

  if (defs.select("#bpInsertArrow").empty()) {
    const m = defs
      .append<SVGMarkerElement>("marker")
      .attr("id", "bpInsertArrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse");
    m.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#7aa2ff");
  }

  if (defs.select("#bpInsertStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpInsertStrokeGrad");
    g.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", INS.pathStrokeGrad0);
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", INS.pathStrokeGrad1);
  }

  if (defs.select("#bpRunnerGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "bpRunnerGlow")
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

  if (defs.select("#bpRunnerGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpRunnerGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#e6f1ff");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#7aa2ff");
  }

  // Gradiente rojo suave para delete (para chispas o runners)
  if (defs.select("#bpDelGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpDelGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#fee2e2");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#f87171");
  }

  // Arrow y stroke gradient para el camino de borrado
  if (defs.select("#bpDeleteArrow").empty()) {
    const m = defs
      .append<SVGMarkerElement>("marker")
      .attr("id", "bpDeleteArrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse");
    m.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", DEL.glow);
  }

  if (defs.select("#bpDeleteStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpDeleteStrokeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", DEL.stroke0);
    g.append("stop").attr("offset", "100%").attr("stop-color", DEL.stroke1);
  }

  // Gradiente radial para spotlight del runner (nuevo)
  if (defs.select("#bpSearchSpotGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpSearchSpotGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#93c5fd"); // azul claro
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(147,197,253,0)");
  }

  // Rayas de escaneo (gradiente sutil para las stripes)
  if (defs.select("#bpScanStripeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpScanStripeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#93c5fd");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#22d3ee");
  }
}

/* ─────────────────────────── Overlays específicos ─────────────────────────── */
function ensureInsertOverlay(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  let overlay = treeG.select<SVGGElement>("g.bp-insert-overlay");
  if (overlay.empty()) {
    overlay = treeG
      .append("g")
      .attr("class", "bp-insert-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();
  return overlay;
}

function ensureDeleteOverlay(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  let overlay = treeG.select<SVGGElement>("g.bp-delete-overlay");
  if (overlay.empty()) {
    overlay = treeG
      .append("g")
      .attr("class", "bp-delete-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();
  return overlay;
}

/* helpers comunes */
function getSVGFromTreeG(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const svgEl = treeG.node()?.ownerSVGElement as SVGSVGElement | null;
  return svgEl ? d3.select(svgEl) : null;
}

async function popBody(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string
) {
  const body =
    treeG.select<SVGRectElement>(`g#${nodeId} rect.bp-body`).node() ||
    treeG.select<SVGRectElement>(`g#${nodeId} rect`).node();
  if (!body) return;
  const sel = d3.select(body as SVGRectElement);
  await sel
    .transition()
    .duration(200)
    .ease(BP_ANIM.easeBack)
    .attrTween("transform", () =>
      d3.interpolateString("scale(1.0)", "scale(1.06)")
    )
    .transition()
    .duration(160)
    .ease(BP_ANIM.easeOut)
    .attr("transform", "scale(1)")
    .end();
}

/* “Slide-in / grow” del slot + confetti sutil (igual que B, adaptado a bp-body) */
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
    .ease(BP_ANIM.easeOut)
    .attr("width", gw)
    .attr("opacity", 0.28)
    .end();

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
    .ease(BP_ANIM.easeOut)
    .attr("opacity", 0.95)
    .attr("cx", (d) => cx + Math.cos(d.angle) * d.r)
    .attr("cy", (d) => cy + Math.sin(d.angle) * d.r)
    .end();

  conf.transition().duration(220).attr("opacity", 0).remove();
  await grow.transition().duration(220).attr("opacity", 0).remove().end();
}

/* “Crumble & ripple & close-gap”: desintegra el slot y desliza hermanos */
async function animateSlotCrumble(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string,
  slotIndex: number
) {
  const slotG = treeG.select<SVGGElement>(
    `g#${nodeId} g.slots g#${nodeId}#k${slotIndex}`
  );
  const box = slotG.select<SVGRectElement>("rect.slot-box");
  const txt = slotG.select<SVGTextElement>("text.slot-text");
  if (box.empty()) return;

  const gw = +box.attr("width");
  const gh = +box.attr("height");

  // Pulso rojo

  const origW = box.attr("stroke-width");
  await box
    .transition()
    .duration(120)
    .attr("stroke", "#f87171")
    .attr("stroke-width", (+origW || 1.1) + 1.1)
    .end();

  // Polvo
  const cx = gw / 2;
  const cy = gh / 2;
  const N = 10;
  const particles = d3.range(N).map((i) => ({
    angle: (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.8,
    r: 8 + Math.random() * 10,
    size: 0.9 + Math.random() * 1.2,
    vy: -4 - Math.random() * 4,
  }));

  const dust = slotG
    .selectAll("circle.slot-dust")
    .data(particles)
    .enter()
    .append("circle")
    .attr("class", "slot-dust")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", (d) => d.size)
    .attr("fill", "#fecaca")
    .attr("opacity", 0);

  await Promise.all([
    txt.transition().duration(160).style("opacity", 0).end(),
    dust
      .transition()
      .duration(260)
      .ease(d3.easeCubicOut)
      .attr("opacity", 0.95)
      .attr("cx", (d) => cx + Math.cos(d.angle) * d.r)
      .attr("cy", (d) => cy + Math.sin(d.angle) * d.r + d.vy)
      .end(),
  ]);

  // Ripple/onda que se disipa
  const ripple = slotG
    .append("circle")
    .attr("class", "slot-ripple")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("r", 0)
    .attr("fill", "none")
    .attr("stroke", "#f87171")
    .attr("stroke-width", 1.4)
    .style("opacity", 0.55);

  ripple
    .transition()
    .duration(260)
    .ease(d3.easeCubicOut)
    .attr("r", Math.max(gw, gh))
    .style("opacity", 0)
    .remove();

  // Colapso del slot hacia su centro
  await box
    .transition()
    .duration(220)
    .ease(d3.easeCubicOut)
    .attr("x", gw / 2)
    .attr("width", 0)
    .attr("stroke-width", 0)
    .end();

  dust.transition().duration(200).style("opacity", 0).remove();

  // Deja invisible el grupo del slot (lo quitará el redraw)
  slotG.style("opacity", 0);

  // ── Cerrar hueco: deslizar los slots a la derecha hacia la izquierda ──
  // Distancia a mover = ancho del borrado + gap real hasta el siguiente
  const nextG = treeG.select<SVGGElement>(
    `g#${nodeId} g.slots g#${nodeId}#k${slotIndex + 1}`
  );
  let gap = 0;
  if (!nextG.empty()) {
    const { x: xCur } = getTranslateXY(slotG);
    const { x: xNext } = getTranslateXY(nextG);
    gap = Math.max(0, xNext - xCur - gw);
  }
  const dx = gw + gap; // si es el último, gap≈0

  const moves: Array<Promise<any>> = [];
  // Desliza todos los posteriores: k = slotIndex+1, slotIndex+2, ...
  for (let k = slotIndex + 1; ; k++) {
    const gK = treeG.select<SVGGElement>(
      `g#${nodeId} g.slots g#${nodeId}#k${k}`
    );
    if (gK.empty()) break;
    const { x, y } = getTranslateXY(gK);
    moves.push(
      gK
        .transition()
        .duration(280)
        .ease(d3.easeCubicOut)
        .attr("transform", `translate(${x - dx}, ${y})`)
        .end()
    );
  }
  await Promise.all(moves);
}

/* ─────────────────────────── Banda de recorrido ─────────────────────────── */
export const drawTraversalSequence = baseDrawTraversalSequence;

/* ─────────────────────────── Links helper ─────────────────────────── */
export function buildLinksFromBPlusHierarchy(
  root: HierarchyNode<BPlusHierarchy>
): TreeLinkData[] {
  const { treeLinks } = buildBPlusLinksFromHierarchy(root);
  return treeLinks;
}
