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
  glow: "#f87171",
  glowSoft: "rgba(248,113,113,0.28)",
  stroke0: "#fb7185",
  stroke1: "#fca5a5",
  dust: "#fecaca",
  runner: "#fee2e2",
  dimOthers: 0.35,
};
/* ─────────── Timing compacto para RANGE ─────────── */
const RNG_TIMING = {
  dim: 120, // atenuar todo
  focus: 90, // enfocar nodo/hoja
  beam: 420, // beam raíz→hoja
  bandReveal: 180, // banda “marcador” horizontal
  scan: 300, // barrido vertical
  ribbon: 480, // cinta “aurora” entre hojas
  tickDur: 180, // dibujar ✓ del slot
  tickStagger: 55, // separación entre ✓ vecinos
};

/* ─────────────────────────── Visual & timing extra para SEARCH ─────────────────────────── */
const SRCH = {
  ringColor: "#60a5fa",
  beamWidth: 3.2,
  stripeWidth: 1.6,
  fadeOthers: 0.22,
  visitedOpacity: 0.92,
  ringCount: 2,
  ringMaxR: 16,
  ringDur: 420,
};
/* ─────────────────────────── Paleta LEVEL-ORDER ─────────────────────────── */
const LOR = {
  accent0: "#a78bfa", // violet-400
  accent1: "#c084fc", // violet-300
  fadeOthers: 0.22,
  visitedOpacity: 0.92,
  beamWidth: 3.0,
  bandEdge: "rgba(167,139,250,0.00)",
  bandCore: "rgba(192,132,252,0.45)",
  chainWidth: 2.4,
};

/* ─────────────────────────── Defs para LEVEL-ORDER ─────────────────────────── */
function ensureLevelDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  if (defs.select("#bpLevelStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpLevelStrokeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", LOR.accent0);
    g.append("stop").attr("offset", "100%").attr("stop-color", LOR.accent1);
  }

  if (defs.select("#bpLevelSpotGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpLevelSpotGrad");
    g.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(167,139,250,0.65)");
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(167,139,250,0)");
  }

  if (defs.select("#bpLevelGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "bpLevelGlow")
      .attr("x", "-80%")
      .attr("y", "-80%")
      .attr("width", "260%")
      .attr("height", "260%");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 2.4)
      .attr("result", "b");
    const m = f.append("feMerge");
    m.append("feMergeNode").attr("in", "b");
    m.append("feMergeNode").attr("in", "SourceGraphic");
  }

  if (defs.select("#bpLevelBandGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpLevelBandGrad");
    g.attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    g.append("stop").attr("offset", "0%").attr("stop-color", LOR.bandEdge);
    g.append("stop").attr("offset", "50%").attr("stop-color", LOR.bandCore);
    g.append("stop").attr("offset", "100%").attr("stop-color", LOR.bandEdge);
  }
}

/* ─────────────────────────── Overlay/Cleanup LEVEL-ORDER ─────────────────────────── */
function ensureLevelOverlay(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const svg = getSVGFromTreeG(treeG);
  if (!svg) {
    let ov = treeG.select<SVGGElement>("g.bp-level-overlay");
    if (ov.empty()) {
      ov = treeG
        .append("g")
        .attr("class", "bp-level-overlay")
        .style("pointer-events", "none");
    } else {
      ov.selectAll("*").remove();
    }
    ov.raise();
    return ov;
  }

  let root = svg.select<SVGGElement>("g.bp-overlays-root");
  if (root.empty()) {
    root = svg
      .append("g")
      .attr("class", "bp-overlays-root")
      .style("pointer-events", "none")
      .style("isolation", "isolate");
  }
  root.attr("transform", treeG.attr("transform") || null);

  let overlay = root.select<SVGGElement>("g.bp-level-overlay");
  if (overlay.empty()) {
    overlay = root
      .append("g")
      .attr("class", "bp-level-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();
  return overlay;
}

/* ─────────────────────────── Limpieza LEVEL-ORDER (añado clases nuevas) ─────────────────────────── */
function clearLevelArtifacts(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const svg = getSVGFromTreeG(treeG);
  if (!svg) return;
  const SEL =
    ".bp-level-tree-beam," +
    ".bp-level-tree-runner," +
    ".bp-level-tree-spot," +
    ".bp-level-band," + // fill sutil
    ".bp-level-band-core," + // trazo principal
    ".bp-level-band-under," + // glow inferior
    ".bp-level-chain," +
    ".bp-level-chain-under";
  svg.selectAll<SVGElement, unknown>(SEL).interrupt().remove();
}

/* ─────────────────────────── Helpers de geometría para LEVEL-ORDER ─────────────────────────── */
function bodyCenterAbs(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string
): { x: number; y: number } | null {
  const g = treeG.select<SVGGElement>(`g#${cssEsc(nodeId)}`);
  if (g.empty()) return null;
  const t = getTranslateXY(g);
  const body =
    g.select<SVGRectElement>("rect.bp-body").node() ||
    g.select<SVGRectElement>("rect").node();
  if (!body) return null;
  const r = d3.select(body as SVGRectElement);
  const x = t.x + (+r.attr("x") || 0);
  const y = t.y + (+r.attr("y") || 0);
  const w = +r.attr("width") || (body as any).getBBox?.().width || 0;
  const h = +r.attr("height") || (body as any).getBBox?.().height || 0;
  return { x: x + w / 2, y: y + h / 2 };
}

function bodyBandBBoxForLevel(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeIds: string[]
) {
  let L = Infinity,
    R = -Infinity,
    T = Infinity,
    B = -Infinity;
  let any = false;

  nodeIds.forEach((id) => {
    const g = treeG.select<SVGGElement>(`g#${cssEsc(id)}`);
    if (g.empty()) return;
    const t = getTranslateXY(g);
    const body =
      g.select<SVGRectElement>("rect.bp-body").node() ||
      g.select<SVGRectElement>("rect").node();
    if (!body) return;

    const r = d3.select(body as SVGRectElement);
    const x = t.x + (+r.attr("x") || 0);
    const y = t.y + (+r.attr("y") || 0);
    const w = +r.attr("width") || (body as any).getBBox?.().width || 0;
    const h = +r.attr("height") || (body as any).getBBox?.().height || 0;

    L = Math.min(L, x);
    R = Math.max(R, x + w);
    T = Math.min(T, y);
    B = Math.max(B, y + h);
    any = true;
  });

  if (!any) return null;
  const padX = 10;
  const padY = 6;
  return { x: L - padX, y: T - padY, w: R - L + padX * 2, h: B - T + padY * 2 };
}

/* ─────────────────────────── Beam violeta padre→hijo ─────────────────────────── */
async function runLevelBeamOnTreeLink(
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

  if (!core.empty()) {
    const origStroke = core.attr("stroke");
    const origW = +core.attr("stroke-width") || 2;
    core
      .interrupt()
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke", LOR.accent0)
      .attr("stroke-width", origW + 1)
      .transition()
      .duration(160)
      .attr("stroke", origStroke ?? null)
      .attr("stroke-width", origW);
    if (!halo.empty())
      halo
        .interrupt()
        .transition()
        .duration(dur)
        .style("opacity", 1)
        .transition()
        .duration(160)
        .style("opacity", 0.95);
  }

  const beam = overlay
    .append("path")
    .attr("class", "bp-level-tree-beam")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpLevelStrokeGrad)")
    .attr("stroke-width", LOR.beamWidth)
    .attr("stroke-linecap", "round")
    .attr("vector-effect", "non-scaling-stroke")
    .style("opacity", 0.98);

  beam.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len);

  const runner = overlay
    .append("circle")
    .attr("class", "bp-level-tree-runner")
    .attr("r", 3.6)
    .attr("fill", "url(#bpRunnerGrad)")
    .style("filter", "url(#bpLevelGlow)")
    .style("opacity", 0.95);
  const spot = overlay
    .append("circle")
    .attr("class", "bp-level-tree-spot")
    .attr("r", 12)
    .attr("fill", "url(#bpLevelSpotGrad)")
    .style("opacity", 0.4);

  const p0 = corePath.getPointAtLength(0);
  runner.attr("cx", p0.x).attr("cy", p0.y);
  spot.attr("cx", p0.x).attr("cy", p0.y);

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
        runner.transition().duration(120).style("opacity", 0).remove().end(),
        spot.transition().duration(160).style("opacity", 0).remove().end(),
      ])
    );

  await Promise.all([beamT, runnerT]);
  beam.remove();
  if (tempPath) tempPath.remove();
}

/* ─────────────────────────── Cadena suave entre nodos del mismo nivel ─────────────────────────── */
async function drawLevelChainSegment(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  a: { x: number; y: number },
  b: { x: number; y: number },
  dur = 320
) {
  const d = `M${a.x},${a.y} L${b.x},${b.y}`;

  const under = overlay
    .append("path")
    .attr("class", "bp-level-chain-under")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", LOR.accent1)
    .attr("stroke-width", LOR.chainWidth + 2.6)
    .attr("opacity", 0.2)
    .attr("filter", "url(#bpLevelGlow)")
    .attr("vector-effect", "non-scaling-stroke");

  const guide = overlay
    .append("path")
    .attr("class", "bp-level-chain")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpLevelStrokeGrad)")
    .attr("stroke-width", LOR.chainWidth)
    .attr("stroke-linecap", "round")
    .attr("opacity", 0.98)
    .attr("vector-effect", "non-scaling-stroke");

  const el = guide.node() as SVGPathElement;
  const len = el.getTotalLength();
  guide
    .attr("stroke-dasharray", `${len} ${len}`)
    .attr("stroke-dashoffset", len);
  under
    .attr("stroke-dasharray", `${len} ${len}`)
    .attr("stroke-dashoffset", len);

  await Promise.all([
    guide
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    under
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
  ]);

  await Promise.all([
    guide.transition().duration(140).attr("opacity", 0.88).end(),
    under.transition().duration(140).attr("opacity", 0.18).end(),
  ]);
}

/* ─────────────────────────── Banda horizontal de nivel (cápsula ligera) ─────────────────────────── */
async function sweepLevelBand(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeIds: string[],
  dur = 420
) {
  const bb = bodyBandBBoxForLevel(treeG, nodeIds);
  if (!bb) return;

  // Banda más delgada y centrada verticalmente
  const H = Math.min(26, Math.max(12, bb.h * 0.55));
  const y = bb.y + (bb.h - H) / 2;
  const yMid = y + H / 2;
  const padX = 8; // no tocar bordes exactos
  const x0 = bb.x + padX;
  const x1 = bb.x + bb.w - padX;
  const L = Math.max(0, x1 - x0);
  if (L <= 0) return;

  // 1) Glow inferior (muy tenue), no tapa: blend en "screen"
  const under = overlay
    .append("line")
    .attr("class", "bp-level-band-under")
    .attr("x1", x0)
    .attr("x2", x1)
    .attr("y1", yMid)
    .attr("y2", yMid)
    .attr("stroke", LOR.accent1)
    .attr("stroke-width", H + 8)
    .attr("stroke-linecap", "round")
    .attr("vector-effect", "non-scaling-stroke")
    .style("mix-blend-mode", "screen")
    .style("opacity", 0.14);

  under.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L);

  // 2) Núcleo de la banda (revelado con dash, caps redondeados)
  const core = overlay
    .append("line")
    .attr("class", "bp-level-band-core")
    .attr("x1", x0)
    .attr("x2", x1)
    .attr("y1", yMid)
    .attr("y2", yMid)
    .attr("stroke", "url(#bpLevelStrokeGrad)")
    .attr("stroke-width", H - 2)
    .attr("stroke-linecap", "round")
    .attr("vector-effect", "non-scaling-stroke")
    .style("mix-blend-mode", "screen")
    .style("opacity", 0.9);

  core.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L);

  // 3) Relleno sutil (gradiente vertical), sólo atmósfera
  const fill = overlay
    .append("rect")
    .attr("class", "bp-level-band")
    .attr("x", x0)
    .attr("y", y)
    .attr("width", L)
    .attr("height", H)
    .attr("rx", H / 2)
    .attr("ry", H / 2)
    .attr("fill", "url(#bpLevelBandGrad)")
    .style("filter", "url(#bpLevelGlow)")
    .style("mix-blend-mode", "screen")
    .style("opacity", 0); // aparece después del sweep
  (fill as any).lower?.(); // queda por debajo del core dentro del overlay

  // Animaciones: sweep del core y del glow; el fill hace fade-in corto
  await Promise.all([
    core
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    under
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    fill.transition().duration(140).style("opacity", 0.55).end(),
  ]);

  // Baja de intensidad final (que no tape nada)
  await Promise.all([
    core.transition().duration(160).style("opacity", 0.62).end(),
    under.transition().duration(160).style("opacity", 0.12).end(),
    fill.transition().duration(160).style("opacity", 0.25).end(),
  ]);
}

/* ─────────────────────────── LEVEL-ORDER (BFS por niveles) ─────────────────────────── */
export async function animateBPlusGetLevelOrder(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    nodesData: HierarchyNode<BPlusHierarchy>[];
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  if (!params?.rootHierarchy || !params?.nodesData?.length) {
    resetQueryValues?.();
    return;
  }

  try {
    setIsAnimating?.(true);

    // posiciona todo
    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );

    const svg = getSVGFromTreeG(treeG);
    if (svg) {
      ensureBPInsertDefs(svg); // runner glow/grad
      ensureLevelDefs(svg);
    }

    // overlay + limpieza
    const overlay = ensureLevelOverlay(treeG);
    clearLevelArtifacts(treeG);

    // Atenúa todo
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .interrupt()
      .transition()
      .duration(140)
      .style("opacity", LOR.fadeOthers)
      .end();

    // Agrupamos por nivel usando depth
    const all = params.rootHierarchy.descendants();
    const maxDepth = d3.max(all, (n) => n.depth) ?? 0;
    const byLevel: Array<HierarchyNode<BPlusHierarchy>[]> = [];
    for (let d = 0; d <= maxDepth; d++) {
      const level = all.filter((n) => n.depth === d);
      // ordena por X real para recorrido L→R
      level.sort((a, b) => {
        const ax = nodePositions.get(a.data.id)?.x ?? 0;
        const bx = nodePositions.get(b.data.id)?.x ?? 0;
        return ax - bx;
      });
      byLevel.push(level);
    }

    const builder = bPlusPathBuilderFactory(
      params.rootHierarchy,
      nodePositions
    );

    // Recorremos cada nivel
    for (let d = 0; d < byLevel.length; d++) {
      const level = byLevel[d];
      if (!level.length) continue;

      const ids = level.map((n) => n.data.id);

      // Banda de nivel
      await sweepLevelBand(overlay, treeG, ids, 420);

      // Para cada nodo del nivel (izq→der): ping + cadena entre vecinos
      let prevC: { x: number; y: number } | null = null;
      for (let i = 0; i < level.length; i++) {
        const id = level[i].data.id;

        const gNode = treeG.select<SVGGElement>(`g#${cssEsc(id)}`);
        await gNode.transition().duration(100).style("opacity", 1).end();
        await pingNode(treeG, id, LOR.accent0);

        const c = bodyCenterAbs(treeG, id);
        if (prevC && c) {
          await drawLevelChainSegment(overlay, prevC, c, 300);
        }
        if (c) prevC = c;
      }

      // Breve “enqueue”: beams a hijos (rápidos) de cada nodo del nivel
      for (const n of level) {
        const id = n.data.id;
        const kids = (n.children ?? []) as HierarchyNode<BPlusHierarchy>[];
        for (const ch of kids) {
          await runLevelBeamOnTreeLink(
            treeG,
            overlay,
            id,
            ch.data.id,
            420,
            builder(id, ch.data.id)
          );
        }
      }

      // Marcar el nivel como visitado
      for (const n of level) {
        const g = treeG.select<SVGGElement>(`g#${cssEsc(n.data.id)}`);
        await g
          .transition()
          .duration(80)
          .style("opacity", LOR.visitedOpacity)
          .end();
      }
    }

    // Restauración
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .interrupt()
      .transition()
      .duration(160)
      .style("opacity", 1)
      .end();

    // (Opcional) limpiar artefactos si quieres no dejar la banda/cadena
    // clearLevelArtifacts(treeG);
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Defs (skins/overlays extra para acciones) ─────────────────────────── */
export function ensureBPlusSkinDefs(
  _svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  // Placeholder
}

/* ─────────────────────────── Dibujo de nodos B+ (usa utilidades) ─────────────────────────── */
export function drawBPlusNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<BPlusHierarchy>[],
  positions: Map<string, { x: number; y: number }>
) {
  nodes.forEach((d) => {
    positions.set(d.data.id, { x: d.x!, y: d.y! });
  });
  drawBPlusNodesRounded(g, nodes, positions);
}

/* ─────────────────────────── Enlaces B+ (usa utilidades) ─────────────────────────── */
export const drawBPlusLinks = baseDrawBPlusLinks;

function slotGroupSelInLeaf(leafId: string, k: number) {
  // id REAL del grupo de slot: "<leafId>#k<k>"
  const composed = `${leafId}#k${k}`;
  return `g.slots g#${cssEsc(composed)}`;
}

/* helper: capa de links real o fallback */
function getLinksLayerFrom(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const layer = treeG.select<SVGGElement>("g.links-layer");
  return layer.empty() ? treeG : layer;
}

/* ─────────────────────────── Reflow específico B+ ─────────────────────────── */
export async function repositionBPlusNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: HierarchyNode<BPlusHierarchy>,
  nodes: HierarchyNode<BPlusHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  const prev = new Map(nodePositions);

  nodes.forEach((d) => {
    nodePositions.set(d.data.id, { x: d.x!, y: d.y! });
  });

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

  const linksLayer = getLinksLayerFrom(treeG);
  tweenBPlusLinksDuringReflow(
    linksLayer,
    root,
    prev,
    nodePositions,
    BP_ANIM.reflow,
    BP_ANIM.easeOut
  );

  await nodesT;

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

  const linksLayer = getLinksLayerFrom(treeG);
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
    const g = treeG.select<SVGGElement>(`g#${cssEsc(rootId)}`);
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
  const gLink = treeG.select<SVGGElement>(
    `g#${cssEsc(`tlink-${fromId}-${toId}`)}`
  );
  const core = gLink.select<SVGPathElement>("path.tree-link");
  const halo = gLink.select<SVGPathElement>("path.tree-link-halo");
  if (core.empty()) return;

  const corePath = core.node() as SVGPathElement;
  const d = core.attr("d")!;
  const len = corePath.getTotalLength();

  const origStroke = core.attr("stroke");
  const origW = +core.attr("stroke-width") || 2;
  core
    .interrupt()
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke", "#7dd3fc")
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
    .attr("vector-effect", "non-scaling-stroke")
    .style("opacity", 0.95)
    .attr("marker-end", null as any);

  const trailT = trail
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0)
    .end()
    .then(() =>
      trail.transition().duration(160).style("opacity", 0).remove().end()
    );

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
    leafId: string;
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    nodesData: HierarchyNode<BPlusHierarchy>[];
    slotIndex?: number | null;
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  if (!params?.rootHierarchy || !params?.nodesData?.length) {
    resetQueryValues?.();
    return;
  }

  try {
    setIsAnimating?.(true);

    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );

    const svg = getSVGFromTreeG(treeG);
    if (svg) ensureBPInsertDefs(svg);
    const overlay = ensureInsertOverlay(treeG);

    const byId = new Map<string, HierarchyNode<BPlusHierarchy>>();
    params.rootHierarchy.each((n) => byId.set(n.data.id, n));

    const target = byId.get(params.leafId);

    const allNodes = treeG.selectAll<SVGGElement, unknown>("g.node");
    await allNodes.transition().duration(160).style("opacity", 0.35).end();

    let pathNodes: HierarchyNode<BPlusHierarchy>[] = [];
    if (target) {
      pathNodes = params.rootHierarchy.path(target);
      for (let i = 0; i < pathNodes.length; i++) {
        const id = pathNodes[i].data.id;
        const gNode = treeG.select<SVGGElement>(`g#${cssEsc(id)}`);
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

        if (i < pathNodes.length - 1) {
          const fromId = id;
          const toId = pathNodes[i + 1].data.id;
          await runCometOnLink(treeG, overlay, fromId, toId, 460);
          await gNode.transition().duration(100).style("opacity", 0.7).end();
        }
      }
    }

    if (typeof params.slotIndex === "number" && target) {
      await animateSlotGrow(treeG, params.leafId, params.slotIndex);
    } else {
      await popBody(treeG, params.leafId);
    }

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

/** “Beam” de SEARCH sin marker-end: flecha móvil con posición inicial segura */
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

  const beam = overlay
    .append("path")
    .attr("class", "bp-search-beam")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpInsertStrokeGrad)")
    .attr("stroke-width", SRCH.beamWidth)
    .attr("stroke-linecap", "round")
    .attr("vector-effect", "non-scaling-stroke")
    .style("opacity", 0.98)
    .attr("marker-end", null as any);

  beam.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len);

  const stripes = overlay
    .append("path")
    .attr("class", "bp-search-stripes")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpScanStripeGrad)")
    .attr("stroke-width", SRCH.stripeWidth)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", "6 10")
    .attr("vector-effect", "non-scaling-stroke")
    .style("opacity", 0.65)
    .attr("marker-end", null as any);

  const spot = overlay
    .append("circle")
    .attr("class", "bp-search-spot")
    .attr("r", 14)
    .attr("fill", "url(#bpSearchSpotGrad)")
    .style("opacity", 0.45);
  const arrow = overlay
    .append("path")
    .attr("class", "bp-search-arrowhead")
    .attr("d", "M 0 -4 L 8 0 L 0 4 Z")
    .attr("fill", INS.pathStrokeGrad1)
    .style("opacity", 0.95);
  const runner = overlay
    .append("circle")
    .attr("class", "bp-search-runner")
    .attr("r", 4)
    .attr("fill", "url(#bpRunnerGrad)")
    .style("filter", "url(#bpRunnerGlow)")
    .style("opacity", 0.95);

  const p0 = corePath.getPointAtLength(0);
  const p1 = corePath.getPointAtLength(Math.max(0.002 * len, 0.5));
  const ang0 = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;

  runner.attr("cx", p0.x).attr("cy", p0.y);
  spot.attr("cx", p0.x).attr("cy", p0.y);
  arrow.attr("transform", `translate(${p0.x},${p0.y}) rotate(${ang0})`);

  const beamT = beam
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
      stripes.transition().duration(180).style("opacity", 0).remove().end()
    );

  const moverT = runner
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .tween("pos", () => (tt: number) => {
      const L = tt * len;
      const p = corePath!.getPointAtLength(L);
      const q = corePath!.getPointAtLength(Math.max(0, L - 0.002 * len));
      const ang = (Math.atan2(p.y - q.y, p.x - q.x) * 180) / Math.PI;
      runner.attr("cx", p.x).attr("cy", p.y);
      spot.attr("cx", p.x).attr("cy", p.y);
      arrow.attr("transform", `translate(${p.x},${p.y}) rotate(${ang})`);
    })
    .end()
    .then(() =>
      Promise.all([
        runner.transition().duration(140).style("opacity", 0).remove().end(),
        spot.transition().duration(200).style("opacity", 0).remove().end(),
        arrow.transition().duration(200).style("opacity", 0).remove().end(),
      ])
    );

  await Promise.all([beamT, stripesT, moverT]);
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

    const all = treeG.selectAll<SVGGElement, unknown>("g.node");
    await all
      .transition()
      .duration(140)
      .style("opacity", SRCH.fadeOthers)
      .end();

    for (let i = 0; i < path.length; i++) {
      const curId = path[i].data.id;

      const gCur = treeG.select<SVGGElement>(`g#${cssEsc(curId)}`);
      await gCur
        .interrupt()
        .transition()
        .duration(90)
        .style("opacity", 1)
        .end();

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

        await gCur
          .interrupt()
          .transition()
          .duration(90)
          .style("opacity", SRCH.visitedOpacity)
          .end();
      }
    }

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

/** Ping elegante: borde redondeado “respirando” sin cubrir el contenido */
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

  g.raise();

  const sel = d3.select(body as SVGRectElement);

  // Geometría del cuerpo
  const bx = +sel.attr("x") || 0;
  const by = +sel.attr("y") || 0;
  const bw = +sel.attr("width") || (body as any).getBBox?.().width || 0;
  const bh = +sel.attr("height") || (body as any).getBBox?.().height || 0;
  const rx = +sel.attr("rx") || 8;
  const ry = +sel.attr("ry") || rx;

  // Un poquito de “pad” para que el borde respire por fuera del cuerpo
  const padOuter = 6;
  const padInner = 2;

  // 1) Glow muy suave sólo con strokelines (sin filtros ni rellenos)
  const haloUnder = g
    .append("rect")
    .attr("class", "bp-ping-outline-under")
    .attr("x", bx - padOuter)
    .attr("y", by - padOuter)
    .attr("width", bw + padOuter * 2)
    .attr("height", bh + padOuter * 2)
    .attr("rx", rx + padOuter)
    .attr("ry", ry + padOuter)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 6)
    .style("opacity", 0)
    .style("mix-blend-mode", "screen");
  (haloUnder as any).lower?.();

  // 2) Borde visible que “revela” con un barrido sutil
  const ring = g
    .append("rect")
    .attr("class", "bp-ping-outline")
    .attr("x", bx - padInner)
    .attr("y", by - padInner)
    .attr("width", bw + padInner * 2)
    .attr("height", bh + padInner * 2)
    .attr("rx", rx + padInner)
    .attr("ry", ry + padInner)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .style("opacity", 0.95)
    .style("mix-blend-mode", "screen");

  // Revelado con dash-offset (efecto “sweep” alrededor del rect redondeado)
  const perimeter = 2 * (bw + padInner * 2) + 2 * (bh + padInner * 2); // aproximado (ok para dash)
  const dash = Math.max(14, perimeter * 0.18);

  ring
    .attr("stroke-dasharray", `${dash} ${perimeter}`)
    .attr("stroke-dashoffset", perimeter);

  // 3) Pequeño pulso del stroke del cuerpo (sin pintar nada dentro)
  const origStroke = sel.attr("stroke");
  const origW = +sel.attr("stroke-width") || 1.2;

  // Animaciones en paralelo: halo suave + barrido + pulso del borde interno
  await Promise.all([
    haloUnder.transition().duration(160).style("opacity", 0.35).end(),
    ring
      .transition()
      .duration(360)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    sel
      .transition()
      .duration(140)
      .attr("stroke", color)
      .attr("stroke-width", origW + 0.8)
      .end(),
  ]);

  // Fade out suave y restauración
  await Promise.all([
    haloUnder.transition().duration(220).style("opacity", 0).remove().end(),
    ring.transition().duration(180).style("opacity", 0).remove().end(),
    sel
      .transition()
      .duration(120)
      .attr("stroke", origStroke ?? null)
      .attr("stroke-width", origW)
      .end(),
  ]);
}

/** Corre una “ascua” sobre el link real; si no existe, usa un path de fallback. */
async function runEmberOnLink(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromId: string,
  toId: string,
  dur = 420,
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

  if (!core.empty()) {
    const origStroke = core.attr("stroke");
    const origW = +core.attr("stroke-width") || 2;
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
    .attr("vector-effect", "non-scaling-stroke")
    .style("opacity", 0.95)
    .attr("marker-end", null as any);

  const trailT = trail
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("stroke-dashoffset", 0)
    .end()
    .then(() =>
      trail.transition().duration(140).style("opacity", 0).remove().end()
    );

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
  accent0: "#34d399",
  accent1: "#10b981",
  slotGlow: "#22c55e",
  fadeOthers: 0.22,
  visitedOpacity: 0.95,
  beamWidth: 3.0,
  stripeWidth: 1.4,
  crumb: "#34d399",
  crumbSoft: "rgba(52,211,153,0.35)",
  scanEdge: "rgba(134,239,172,0.0)",
  scanCore: "rgba(134,239,172,0.45)",
};
/* ─────────────────────────── Paleta INORDER ─────────────────────────── */
const INO = {
  accent0: "#f59e0b", // amber-500
  accent1: "#fbbf24", // amber-400
  slotGlow: "#f59e0b",
  fadeOthers: 0.2,
  visitedOpacity: 0.92,
  beamWidth: 2.8,
  chainWidth: 2.2,
  scanEdge: "rgba(251,191,36,0.00)",
  scanCore: "rgba(251,191,36,0.45)",
};

// ─────────────────────────── Defs para RANGE (incluye marcador y bleed) ───────────────────────────
export function ensureRangeDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Gradiente general de RANGE (verde)
  if (defs.select("#bpRangeStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpRangeStrokeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", RNG.accent0);
    g.append("stop").attr("offset", "100%").attr("stop-color", RNG.accent1);
  }

  // Spotlight del runner
  if (defs.select("#bpRangeSpotGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpRangeSpotGrad");
    g.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(134,239,172,0.65)");
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(134,239,172,0)");
  }

  // Gradiente de escaneo vertical dentro de hoja
  if (defs.select("#bpRangeScanGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpRangeScanGrad");
    g.attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    g.append("stop").attr("offset", "0%").attr("stop-color", RNG.scanEdge);
    g.append("stop").attr("offset", "50%").attr("stop-color", RNG.scanCore);
    g.append("stop").attr("offset", "100%").attr("stop-color", RNG.scanEdge);
  }

  // Banda "marcador" (resaltador) y su leve bleed
  if (defs.select("#bpRangeMarkerGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpRangeMarkerGrad");
    g.attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    g.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(16,185,129,0.28)");
    g.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "rgba(52,211,153,0.38)");
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(16,185,129,0.28)");
  }
  if (defs.select("#bpHighlighterBleed").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "bpHighlighterBleed")
      .attr("x", "-30%")
      .attr("y", "-50%")
      .attr("width", "160%")
      .attr("height", "200%");
    f.append("feGaussianBlur").attr("stdDeviation", 1.2).attr("result", "b");
    const m = f.append("feMerge");
    m.append("feMergeNode").attr("in", "b");
    m.append("feMergeNode").attr("in", "SourceGraphic");
  }

  // ── NUEVO: Gradientes y filtro para el "Aurora Ribbon" ───────────────────
  if (defs.select("#bpAuroraGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpAuroraGrad");
    g.attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#34d399");
    g.append("stop").attr("offset", "50%").attr("stop-color", "#10b981");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#34d399");
  }
  if (defs.select("#bpAuroraDashGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpAuroraDashGrad");
    g.attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    g.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(255,255,255,0.0)");
    g.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "rgba(255,255,255,0.5)");
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(255,255,255,0.0)");
  }
  if (defs.select("#bpAuroraBloom").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "bpAuroraBloom")
      .attr("x", "-100%")
      .attr("y", "-100%")
      .attr("width", "300%")
      .attr("height", "300%");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 6)
      .attr("result", "b1");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 2)
      .attr("result", "b2");
    const m = f.append("feMerge");
    m.append("feMergeNode").attr("in", "b1");
    m.append("feMergeNode").attr("in", "b2");
    m.append("feMergeNode").attr("in", "SourceGraphic");
  }
}
// ─────────────────────────── Defs para INORDER (ámbar/perlas) ───────────────────────────
function ensureInOrderDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Gradiente de trazo principal (ámbar)
  if (defs.select("#bpInOrderStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpInOrderStrokeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", INO.accent0);
    g.append("stop").attr("offset", "100%").attr("stop-color", INO.accent1);
  }

  // Spotlight del runner
  if (defs.select("#bpInOrderSpotGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpInOrderSpotGrad");
    g.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(251,191,36,0.65)");
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(251,191,36,0)");
  }

  // Gradiente de “perla”
  if (defs.select("#bpInOrderBeadGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpInOrderBeadGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#fff8e1");
    g.append("stop").attr("offset", "100%").attr("stop-color", INO.accent1);
  }

  // Filtro de glow amable
  if (defs.select("#bpInOrderGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "bpInOrderGlow")
      .attr("x", "-80%")
      .attr("y", "-80%")
      .attr("width", "260%")
      .attr("height", "260%");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 2.4)
      .attr("result", "b");
    const m = f.append("feMerge");
    m.append("feMergeNode").attr("in", "b");
    m.append("feMergeNode").attr("in", "SourceGraphic");
  }

  // Barrido vertical cálido dentro de la hoja
  if (defs.select("#bpInOrderScanGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "bpInOrderScanGrad");
    g.attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    g.append("stop").attr("offset", "0%").attr("stop-color", INO.scanEdge);
    g.append("stop").attr("offset", "50%").attr("stop-color", INO.scanCore);
    g.append("stop").attr("offset", "100%").attr("stop-color", INO.scanEdge);
  }
}
/** Centro absoluto del slot k dentro de leafId (coordenadas del treeG) */
function slotCenterAbs(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  k: number
): { x: number; y: number } | null {
  const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
  if (gLeaf.empty()) return null;
  const leafT = getTranslateXY(gLeaf);

  const sG = gLeaf.select<SVGGElement>(slotGroupSelInLeaf(leafId, k));
  if (sG.empty()) return null;
  const sT = getTranslateXY(sG);

  const box = sG.select<SVGRectElement>("rect.slot-box");
  if (box.empty()) return null;

  const x = sT.x + (+box.attr("x") || 0) + (+box.attr("width") || 0) / 2;
  const y = sT.y + (+box.attr("y") || 0) + (+box.attr("height") || 0) / 2;
  return { x: leafT.x + x, y: leafT.y + y };
}

/** Beam ámbar sobre link del árbol (root→hijo) */
async function runInOrderBeamOnTreeLink(
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

  if (!core.empty()) {
    const origStroke = core.attr("stroke");
    const origW = +core.attr("stroke-width") || 2;
    core
      .interrupt()
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke", INO.accent0)
      .attr("stroke-width", origW + 1)
      .transition()
      .duration(160)
      .attr("stroke", origStroke ?? null)
      .attr("stroke-width", origW);
    if (!halo.empty())
      halo
        .interrupt()
        .transition()
        .duration(dur)
        .style("opacity", 1)
        .transition()
        .duration(160)
        .style("opacity", 0.95);
  }

  const beam = overlay
    .append("path")
    .attr("class", "bp-inorder-tree-beam")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpInOrderStrokeGrad)")
    .attr("stroke-width", INO.beamWidth)
    .attr("stroke-linecap", "round")
    .attr("vector-effect", "non-scaling-stroke")
    .style("opacity", 0.98);

  beam.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len);

  const runner = overlay
    .append("circle")
    .attr("class", "bp-inorder-tree-runner")
    .attr("r", 3.6)
    .attr("fill", "url(#bpInOrderBeadGrad)")
    .style("filter", "url(#bpInOrderGlow)")
    .style("opacity", 0.95);
  const spot = overlay
    .append("circle")
    .attr("class", "bp-inorder-tree-spot")
    .attr("r", 12)
    .attr("fill", "url(#bpInOrderSpotGrad)")
    .style("opacity", 0.4);

  const p0 = corePath.getPointAtLength(0);
  runner.attr("cx", p0.x).attr("cy", p0.y);
  spot.attr("cx", p0.x).attr("cy", p0.y);

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
        runner.transition().duration(120).style("opacity", 0).remove().end(),
        spot.transition().duration(160).style("opacity", 0).remove().end(),
      ])
    );

  await Promise.all([beamT, runnerT]);
  beam.remove();
  if (tempPath) tempPath.remove();
}

/** Curva entre hojas (cintilla guía ámbar) */
async function runInOrderCurvedGuideOnBelt(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromLeafId: string,
  toLeafId: string,
  dur = 600,
  keepTrail = true
) {
  const d = beltPathBetweenLeaves(treeG, fromLeafId, toLeafId);
  if (!d) return;

  const under = overlay
    .append("path")
    .attr("class", "bp-inorder-belt-under")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpInOrderStrokeGrad)")
    .attr("stroke-width", INO.beamWidth + 8)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("filter", "url(#bpInOrderGlow)")
    .attr("opacity", 0.2)
    .attr("vector-effect", "non-scaling-stroke");

  const guide = overlay
    .append("path")
    .attr("class", "bp-inorder-belt-guide")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpInOrderStrokeGrad)")
    .attr("stroke-width", INO.beamWidth + 1.4)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("opacity", 0.98)
    .attr("vector-effect", "non-scaling-stroke");

  const el = guide.node() as SVGPathElement;
  const len = el.getTotalLength();
  guide
    .attr("stroke-dasharray", `${len} ${len}`)
    .attr("stroke-dashoffset", len);
  under
    .attr("stroke-dasharray", `${len} ${len}`)
    .attr("stroke-dashoffset", len);

  const head = overlay
    .append("path")
    .attr("class", "bp-inorder-arrowhead")
    .attr("d", "M 0 -6 L 12 0 L 0 6 Z")
    .attr("fill", INO.accent0)
    .attr("stroke", "rgba(0,0,0,0.10)")
    .attr("stroke-width", 0.8)
    .attr("pointer-events", "none");

  const p0 = el.getPointAtLength(Math.max(0.001 * len, 0.5));
  const p1 = el.getPointAtLength(Math.max(0.003 * len, 1.5));
  const a0 = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;
  head.attr("transform", `translate(${p0.x},${p0.y}) rotate(${a0})`);

  await Promise.all([
    guide
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    under
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    head
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .tween("pos", () => (tt: number) => {
        const L = Math.max(0, Math.min(1, tt)) * len;
        const p = el.getPointAtLength(L);
        const q = el.getPointAtLength(Math.max(0, L - 0.002 * len));
        const ang = (Math.atan2(p.y - q.y, p.x - q.x) * 180) / Math.PI;
        head.attr("transform", `translate(${p.x},${p.y}) rotate(${ang})`);
      })
      .end(),
  ]);

  if (keepTrail) {
    await Promise.all([
      guide.transition().duration(200).attr("opacity", 0.55).end(),
      under.transition().duration(200).attr("opacity", 0.22).end(),
      head.transition().duration(140).attr("opacity", 0).remove().end(),
    ]);
  } else {
    await Promise.all([
      guide.transition().duration(200).attr("opacity", 0).remove().end(),
      under.transition().duration(200).attr("opacity", 0).remove().end(),
      head.transition().duration(140).attr("opacity", 0).remove().end(),
    ]);
  }
}
/** ✓ sobre un slot concreto (con ripple), con delay para hacer “cascada” pedagógica */
async function tickRangeSlot(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  slotIndex: number,
  delay = 0,
  dur = RNG_TIMING.tickDur
) {
  const c = slotCenterAbs(treeG, leafId, slotIndex);
  if (!c) return;

  // pequeño anillo suave
  const ring = overlay
    .append("circle")
    .attr("class", "bp-range-tick-ring")
    .attr("cx", c.x)
    .attr("cy", c.y)
    .attr("r", 0)
    .attr("fill", "none")
    .attr("stroke", RNG.accent1)
    .attr("stroke-width", 1.1)
    .style("opacity", 0.0);

  const path = overlay
    .append("path")
    .attr("class", "bp-range-tick")
    .attr("d", "M -5 0 L -1 4 L 6 -6") // ✓
    .attr("fill", "none")
    .attr("stroke", "url(#bpRangeStrokeGrad)")
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("transform", `translate(${c.x},${c.y}) scale(0.9)`)
    .style("opacity", 0.95);

  const len = (path.node() as SVGPathElement).getTotalLength();
  path.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len);

  await Promise.all([
    ring
      .transition()
      .delay(delay)
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("r", 9)
      .style("opacity", 0.55)
      .end()
      .then(() =>
        ring.transition().duration(140).style("opacity", 0).remove().end()
      ),
    path
      .transition()
      .delay(delay)
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end()
      .then(() => path.transition().duration(160).style("opacity", 0.8).end()),
  ]);
}

/** Dispara ticks en todos los índices [i0..i1] con “cascada” */
function tickRangeSlotsInLeaf(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  i0: number,
  i1: number
) {
  const ps: Array<Promise<any>> = [];
  for (let i = i0, k = 0; i <= i1; i++, k++) {
    ps.push(
      tickRangeSlot(overlay, treeG, leafId, i, k * RNG_TIMING.tickStagger)
    );
  }
  return Promise.all(ps);
}

/** Barrido vertical cálido dentro del cuerpo de una hoja (versión InOrder) */
async function scanLeafBodyInOrder(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  dur = 400
) {
  const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
  const body =
    gLeaf.select<SVGRectElement>("rect.bp-body").node() ||
    gLeaf.select<SVGRectElement>("rect").node();
  if (!body) return;

  const r = d3.select(body);
  const bx = (+r.attr("x") || 0) + 3;
  const by = (+r.attr("y") || 0) + 3;
  const bw = (+r.attr("width") || 0) - 6;
  const bh = (+r.attr("height") || 0) - 6;

  const band = gLeaf
    .append("rect")
    .attr("class", "bp-inorder-scanband")
    .attr("x", bx - 12)
    .attr("y", by)
    .attr("width", 10)
    .attr("height", bh)
    .attr("fill", "url(#bpInOrderScanGrad)")
    .style("opacity", 0.0);

  await band
    .transition()
    .duration(120)
    .style("opacity", 0.9)
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("x", bx + bw + 2)
    .end();

  await band.transition().duration(160).style("opacity", 0).remove().end();
}


/** Segmento de cadena (entre dos perlas) con reveal elástico */
async function drawInOrderChainSegment(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  a: { x: number; y: number },
  b: { x: number; y: number },
  dur = 380
) {
  const d = `M${a.x},${a.y} L${b.x},${b.y}`;

  const under = overlay
    .append("path")
    .attr("class", "bp-inorder-chain-under")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", INO.accent1)
    .attr("stroke-width", INO.chainWidth + 2.8)
    .attr("opacity", 0.2)
    .attr("filter", "url(#bpInOrderGlow)")
    .attr("vector-effect", "non-scaling-stroke");

  const guide = overlay
    .append("path")
    .attr("class", "bp-inorder-chain")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpInOrderStrokeGrad)")
    .attr("stroke-width", INO.chainWidth)
    .attr("stroke-linecap", "round")
    .attr("opacity", 0.98)
    .attr("vector-effect", "non-scaling-stroke");

  const el = guide.node() as SVGPathElement;
  const len = el.getTotalLength();
  guide
    .attr("stroke-dasharray", `${len} ${len}`)
    .attr("stroke-dashoffset", len);
  under
    .attr("stroke-dasharray", `${len} ${len}`)
    .attr("stroke-dashoffset", len);

  await Promise.all([
    guide
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    under
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
  ]);

  await Promise.all([
    guide.transition().duration(160).attr("opacity", 0.88).end(),
    under.transition().duration(160).attr("opacity", 0.18).end(),
  ]);
}

/* ───────────── LIMPIEZA: añade nuevas clases al clear de INORDER ───────────── */
function clearInOrderArtifacts(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const svg = getSVGFromTreeG(treeG);
  if (!svg) return;
  const SEL =
    ".bp-inorder-tree-beam," +
    ".bp-inorder-tree-runner," +
    ".bp-inorder-tree-spot," +
    ".bp-inorder-scanband," +
    ".bp-inorder-chain," +
    ".bp-inorder-chain-under," +
    ".bp-inorder-belt-guide," +
    ".bp-inorder-belt-under," +
    ".bp-inorder-arrowhead," +
    // ⬇️ nuevos
    ".bp-inorder-slot-halo," +
    ".bp-inorder-slot-ring," +
    ".bp-inorder-underline";
  svg.selectAll<SVGElement, unknown>(SEL).interrupt().remove();
}

/* Overlay específico RANGE */
function ensureRangeOverlay(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const svg = getSVGFromTreeG(treeG)!;

  let root = svg.select<SVGGElement>("g.bp-overlays-root");
  if (root.empty()) {
    root = svg
      .append("g")
      .attr("class", "bp-overlays-root")
      .style("pointer-events", "none")
      .style("isolation", "isolate"); // ⬅️ importante para 'screen'
  }
  root.attr("transform", treeG.attr("transform") || null);

  root.select("g.bp-range-overlay").remove();
  const overlay = root
    .append("g")
    .attr("class", "bp-range-overlay")
    .style("pointer-events", "none");
  overlay.raise();
  return overlay;
}

function ensureLeafClip(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string
): string | null {
  const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
  const body =
    gLeaf.select<SVGRectElement>("rect.bp-body").node() ||
    gLeaf.select<SVGRectElement>("rect").node();
  if (!body) return null;

  const r = d3.select(body as SVGRectElement);
  const t = getTranslateXY(gLeaf);

  const x = t.x + (+r.attr("x") || 0) + 1;
  const y = t.y + (+r.attr("y") || 0) + 1;
  const w = (+r.attr("width") || (body as any).getBBox?.().width || 0) - 2;
  const h = (+r.attr("height") || (body as any).getBBox?.().height || 0) - 2;
  const rx = +r.attr("rx") || 8;
  const ry = +r.attr("ry") || rx;

  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  const clipId = `bpClip-${leafId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  let cp = defs.select<SVGClipPathElement>(`#${clipId}`);
  if (cp.empty()) {
    cp = defs
      .append<SVGClipPathElement>("clipPath")
      .attr("id", clipId)
      .attr("class", "bp-leaf-clip")
      .attr("clipPathUnits", "userSpaceOnUse");
    cp.append("rect");
  }
  cp.select("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width", w)
    .attr("height", h)
    .attr("rx", rx)
    .attr("ry", ry);
  return `url(#${clipId})`;
}

/** Mata cualquier artefacto de RANGE que haya quedado (paths, bands, runners, etc.) */
function clearRangeArtifacts(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const svg = getSVGFromTreeG(treeG);
  if (!svg) return;

  const SEL =
    ".bp-range-ribbon-under," +
    ".bp-range-ribbon-seg," +
    ".bp-range-curve-under," +
    ".bp-range-curve," +
    ".bp-range-arrowhead-mobile," +
    ".bp-range-marker-band," +
    ".bp-range-tree-beam," +
    ".bp-range-tree-runner," +
    ".bp-range-tree-spot," +
    ".bp-range-scanband," +
    // Aurora:
    ".bp-range-aurora-under," +
    ".bp-range-aurora-core," +
    ".bp-range-aurora-dash," +
    ".bp-range-aurora-spark," +
    // ⬇️ NUEVO: ticks por slot
    ".bp-range-tick," +
    ".bp-range-tick-ring";

  svg.selectAll<SVGElement, unknown>(SEL).interrupt().remove();

  // elimina overlays específicos si quedaron colgados
  svg.selectAll("g.bp-overlays-root g.bp-range-overlay").interrupt().remove();
  svg.selectAll("g.bp-scanfrom-overlay").interrupt().remove();

  // restaura opacidades en nodos por si quedaron atenuados
  svg
    .selectAll<SVGGElement, unknown>("g.node")
    .interrupt()
    .style("opacity", null);
}

/* ─────────────────────────── SCANFROM (armonizado con RANGE) ─────────────────────────── */
export async function animateBPlusScanFrom(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    nodesData: HierarchyNode<BPlusHierarchy>[];
    start: number;
    limit: number;
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  if (!params?.nodesData?.length || params.limit <= 0) {
    resetQueryValues?.();
    return;
  }
  const leaves = getLeaves(params.nodesData);
  if (!leaves.length) {
    resetQueryValues?.();
    return;
  }

  const byId = new Map<string, HierarchyNode<BPlusHierarchy>>();
  params.rootHierarchy.each((n) => byId.set(n.data.id, n));

  const orderedLeaves = orderLeavesByX(leaves, nodePositions);

  function findStartLeafAndIndex(
    ordered: HierarchyNode<BPlusHierarchy>[],
    start: number
  ): { leaf: HierarchyNode<BPlusHierarchy>; index: number } | null {
    for (const lf of ordered) {
      const keys = (lf.data.keys as number[]) || [];
      if (!keys.length) continue;
      if (keys[keys.length - 1] < start) continue;
      const idxFound = keys.findIndex((k) => k >= start);
      const idx = idxFound === -1 ? keys.length : Math.max(0, idxFound);
      return { leaf: lf, index: idx };
    }
    return null;
  }

  const startLoc = findStartLeafAndIndex(orderedLeaves, params.start);
  if (!startLoc) {
    resetQueryValues?.();
    return;
  }

  // helpers de brillo/soft como en RANGE
  const brightenLeaf = async (leafId: string) => {
    const g = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
    await g.interrupt().transition().duration(90).style("opacity", 1).end();
    await pingNode(treeG, leafId, RNG.accent0);
  };
  const softenLeafVisited = async (leafId: string) => {
    const g = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
    await g
      .interrupt()
      .transition()
      .duration(90)
      .style("opacity", RNG.visitedOpacity)
      .end();
  };

  try {
    setIsAnimating?.(true);

    // Coloca todo en su sitio y limpia restos previos (igual que RANGE)
    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );
    clearRangeArtifacts(treeG);

    const svg = getSVGFromTreeG(treeG)!;
    if (svg) {
      ensureBPInsertDefs(svg);
      ensureRangeDefs(svg);
    }

    // Usa el MISMO overlay que RANGE
    const overlay = ensureRangeOverlay(treeG);

    // Atenúa todo
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .interrupt()
      .transition()
      .duration(140)
      .style("opacity", RNG.fadeOthers)
      .end();

    // Beam verde raíz → hoja de inicio (igual que RANGE)
    const builder = bPlusPathBuilderFactory(
      params.rootHierarchy,
      nodePositions
    );
    const pathToStart = params.rootHierarchy.path(startLoc.leaf);
    for (let i = 0; i < pathToStart.length; i++) {
      const curId = pathToStart[i].data.id;
      const gCur = treeG.select<SVGGElement>(`g#${cssEsc(curId)}`);

      await gCur.transition().duration(100).style("opacity", 1).end();
      await pingNode(treeG, curId, RNG.accent0);

      if (i < pathToStart.length - 1) {
        const nxtId = pathToStart[i + 1].data.id;
        await runRangeBeamOnTreeLink(
          treeG,
          overlay,
          curId,
          nxtId,
          520,
          builder(curId, nxtId)
        );
        await gCur
          .transition()
          .duration(90)
          .style("opacity", RNG.visitedOpacity)
          .end();
      }
    }

    // Recorrido secuencial: banda por tramo + cinta "Aurora" entre centros
    let remaining = params.limit;
    let curLeaf: HierarchyNode<BPlusHierarchy> = startLoc.leaf;
    let idx = Math.min(
      startLoc.index,
      ((curLeaf.data.keys as number[]) || []).length - 1
    );
    if (idx < 0) idx = 0;

    let prevCenter: { x: number; y: number } | null = null;

    while (remaining > 0 && curLeaf) {
      await brightenLeaf(curLeaf.data.id);

      const keys = (curLeaf.data.keys as number[]) || [];
      if (!keys.length || idx >= keys.length) {
        await scanLeafBody(treeG, curLeaf.data.id, 380);
        await softenLeafVisited(curLeaf.data.id);
      } else {
        const take = Math.min(remaining, keys.length - idx);
        const i0 = idx;
        const i1 = idx + take - 1;

        // 🔧 paintRangeMarkerBand devuelve { cx, cy }, lo mapeamos a { x, y }
        const c = await paintRangeMarkerBand(
          overlay,
          treeG,
          curLeaf.data.id,
          i0,
          i1,
          360
        );
        // Fallback como en RANGE: si no hubo banda, calculamos bbox
        const bbNow = c
          ? null
          : bandBBoxForSlotRange(treeG, curLeaf.data.id, i0, i1);
        const curCenter: { x: number; y: number } | null = c
          ? { x: c.cx, y: c.cy }
          : bbNow
            ? { x: bbNow.cx, y: bbNow.cy }
            : null;

        if (prevCenter && curCenter) {
          await drawRibbonSegment(overlay, prevCenter, curCenter, 560);
        }

        await scanLeafBody(treeG, curLeaf.data.id, 380);

        // Avance de contadores + actualización del "centro previo"
        prevCenter = curCenter || prevCenter;
        remaining -= take;

        await softenLeafVisited(curLeaf.data.id);
      }

      if (remaining <= 0) break;
      const nxtId = nextLeafId(curLeaf, byId, orderedLeaves);
      if (!nxtId) break;

      curLeaf = byId.get(nxtId)!;
      idx = 0;
    }

    // Cleanup fuerte y restauración (igual que RANGE)
    clearRangeArtifacts(treeG);
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .interrupt()
      .transition()
      .duration(160)
      .style("opacity", 1)
      .end();
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* Helpers */
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

/* Beam verde sobre link del árbol */
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

  const beam = overlay
    .append("path")
    .attr("class", "bp-range-tree-beam")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpRangeStrokeGrad)")
    .attr("stroke-width", RNG.beamWidth)
    .attr("stroke-linecap", "round")
    .attr("vector-effect", "non-scaling-stroke")
    .style("opacity", 0.98)
    .attr("marker-end", null as any);

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

  const p0 = corePath.getPointAtLength(0);
  runner.attr("cx", p0.x).attr("cy", p0.y);
  spot.attr("cx", p0.x).attr("cy", p0.y);

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

/* ─────────────────────────── RANGE (marcador + cinta continua) ─────────────────────────── */
export async function animateBPlusRange(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    nodesData: HierarchyNode<BPlusHierarchy>[];
    from: number;
    to: number;
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  let from = Math.min(params.from, params.to);
  let to = Math.max(params.from, params.to);

  if (!params?.nodesData?.length) {
    resetQueryValues?.();
    return;
  }
  const leaves = params.nodesData.filter((n) => n.data.isLeaf);
  if (!leaves.length) {
    resetQueryValues?.();
    return;
  }

  const leavesOrdered = orderLeavesByX(leaves, nodePositions);
  const { start, end } = findStartEndLeaves(leavesOrdered, from, to);
  if (!start || !end) {
    resetQueryValues?.();
    return;
  }

  const byId = new Map<string, HierarchyNode<BPlusHierarchy>>();
  params.rootHierarchy.each((n) => byId.set(n.data.id, n));

  const brightenLeaf = async (leafId: string) => {
    const g = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
    await g
      .interrupt()
      .transition()
      .duration(RNG_TIMING.focus)
      .style("opacity", 1)
      .end();
    await pingNode(treeG, leafId, RNG.accent0);
  };
  const softenLeafVisited = async (leafId: string) => {
    const g = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
    await g
      .interrupt()
      .transition()
      .duration(RNG_TIMING.focus)
      .style("opacity", RNG.visitedOpacity)
      .end();
  };

  try {
    setIsAnimating?.(true);

    // Coloca nodos en posición final y limpia residuos anteriores
    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );
    clearRangeArtifacts(treeG);

    const svg = getSVGFromTreeG(treeG)!;
    ensureRangeDefs(svg);

    const overlay = ensureRangeOverlay(treeG);

    // 1) Atenúa todo
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .interrupt()
      .transition()
      .duration(RNG_TIMING.dim)
      .style("opacity", RNG.fadeOthers)
      .end();

    // 2) Raíz → hoja(start) con beams verdes ágiles
    const builder = bPlusPathBuilderFactory(
      params.rootHierarchy,
      nodePositions
    );
    const pathToStart = params.rootHierarchy.path(start);
    for (let i = 0; i < pathToStart.length; i++) {
      const id = pathToStart[i].data.id;
      const gNode = treeG.select<SVGGElement>(`g#${cssEsc(id)}`);

      await gNode
        .interrupt()
        .transition()
        .duration(RNG_TIMING.focus)
        .style("opacity", 1)
        .end();

      await pingNode(treeG, id, RNG.accent0);

      if (i < pathToStart.length - 1) {
        const nxt = pathToStart[i + 1].data.id;
        await runRangeBeamOnTreeLink(
          treeG,
          overlay,
          id,
          nxt,
          RNG_TIMING.beam,
          builder(id, nxt)
        );
        await gNode
          .interrupt()
          .transition()
          .duration(RNG_TIMING.focus)
          .style("opacity", RNG.visitedOpacity)
          .end();
      }
    }

    // 3) Plan de bandas (por hoja)
    type BandPlan = { leafId: string; i0: number; i1: number };
    const bandsPlan: BandPlan[] = [];
    {
      let cur: HierarchyNode<BPlusHierarchy> | null = start;
      while (cur) {
        const keys = (cur.data.keys as number[]) || [];
        if (keys.length) {
          const idxs = indicesInRange(keys, from, to);
          if (idxs.length)
            bandsPlan.push({
              leafId: cur.data.id,
              i0: Math.min(...idxs),
              i1: Math.max(...idxs),
            });
        }
        if (cur.data.id === end.data.id) break;
        const nxtId = nextLeafId(cur, byId, leavesOrdered);
        if (!nxtId) break;
        cur = byId.get(nxtId)!;
        if ((cur.data.keys?.[0] ?? Infinity) > to) break;
      }
    }

    // 4) Cinta "Aurora" progresiva + ✓ por slot (cascada) + scan en paralelo
    let prevCenter: { x: number; y: number } | null = null;

    for (const bp of bandsPlan) {
      await brightenLeaf(bp.leafId);

      // Banda rápida
      const c = await paintRangeMarkerBand(
        overlay,
        treeG,
        bp.leafId,
        bp.i0,
        bp.i1,
        RNG_TIMING.bandReveal
      );

      // Centro para la cinta (fallback si hiciera falta)
      const bbNow = c
        ? null
        : bandBBoxForSlotRange(treeG, bp.leafId, bp.i0, bp.i1);
      const curCenter = c
        ? { x: c.cx, y: c.cy }
        : bbNow
          ? { x: bbNow.cx, y: bbNow.cy }
          : null;

      // ✓ ticks por cada clave del rango (cascada) en paralelo con el barrido
      const ticksT = tickRangeSlotsInLeaf(
        overlay,
        treeG,
        bp.leafId,
        bp.i0,
        bp.i1
      );
      const scanT = scanLeafBody(treeG, bp.leafId, RNG_TIMING.scan);
      await Promise.all([ticksT, scanT]);

      // Cinta entre hojas (si corresponde)
      if (prevCenter && curCenter) {
        await drawRibbonSegment(
          overlay,
          prevCenter,
          curCenter,
          RNG_TIMING.ribbon
        );
      }

      await softenLeafVisited(bp.leafId);
      if (curCenter) prevCenter = curCenter;
    }

    // 5) Limpieza y restauración
    clearRangeArtifacts(treeG);
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .interrupt()
      .transition()
      .duration(160)
      .style("opacity", 1)
      .end();
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/** Barrido vertical dentro del cuerpo de una hoja (se nota que “lee” la hoja). */
async function scanLeafBody(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  dur = 320
) {
  const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
  const body =
    gLeaf.select<SVGRectElement>("rect.bp-body").node() ||
    gLeaf.select<SVGRectElement>("rect").node();
  if (!body) return;

  const r = d3.select(body);
  const bx = (+r.attr("x") || 0) + 3;
  const by = (+r.attr("y") || 0) + 3;
  const bw = (+r.attr("width") || 0) - 6;
  const bh = (+r.attr("height") || 0) - 6;

  const band = gLeaf
    .append("rect")
    .attr("class", "bp-range-scanband")
    .attr("x", bx - 12)
    .attr("y", by)
    .attr("width", 10)
    .attr("height", bh)
    .attr("fill", "url(#bpRangeScanGrad)")
    .style("mix-blend-mode", "screen") // ⬅️ no cubre
    .style("opacity", 0.0);

  await band
    .transition()
    .duration(100)
    .style("opacity", 0.7)
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("x", bx + bw + 2)
    .end();

  await band.transition().duration(140).style("opacity", 0).remove().end();
}

function ensureInOrderOverlay(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>
) {
  const svg = getSVGFromTreeG(treeG);
  if (!svg) {
    // fallback (raro): crea bajo treeG
    let ov = treeG.select<SVGGElement>("g.bp-inorder-overlay");
    if (ov.empty()) {
      ov = treeG
        .append("g")
        .attr("class", "bp-inorder-overlay")
        .style("pointer-events", "none");
    } else {
      ov.selectAll("*").remove();
    }
    ov.raise();
    return ov;
  }

  // root compartido para overlays
  let root = svg.select<SVGGElement>("g.bp-overlays-root");
  if (root.empty()) {
    root = svg
      .append("g")
      .attr("class", "bp-overlays-root")
      .style("pointer-events", "none")
      .style("isolation", "isolate");
  }
  // espejo transform del árbol
  root.attr("transform", treeG.attr("transform") || null);

  let overlay = root.select<SVGGElement>("g.bp-inorder-overlay");
  if (overlay.empty()) {
    overlay = root
      .append("g")
      .attr("class", "bp-inorder-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();
  return overlay;
}

/** Path curvo “belt” entre dos hojas (de borde derecho de la primera al borde izquierdo de la segunda). */
function beltPathBetweenLeaves(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromLeafId: string,
  toLeafId: string
): string | null {
  const gA = treeG.select<SVGGElement>(`g#${cssEsc(fromLeafId)}`);
  const gB = treeG.select<SVGGElement>(`g#${cssEsc(toLeafId)}`);
  if (gA.empty() || gB.empty()) return null;

  const aBody =
    gA.select<SVGRectElement>("rect.bp-body").node() ||
    gA.select<SVGRectElement>("rect").node();
  const bBody =
    gB.select<SVGRectElement>("rect.bp-body").node() ||
    gB.select<SVGRectElement>("rect").node();
  if (!aBody || !bBody) return null;

  const aSel = d3.select(aBody as SVGRectElement);
  const bSel = d3.select(bBody as SVGRectElement);

  const tA = getTranslateXY(gA);
  const tB = getTranslateXY(gB);

  const ax = tA.x + (+aSel.attr("x") || 0);
  const ay = tA.y + (+aSel.attr("y") || 0);
  const aw = +aSel.attr("width") || 0 || (aBody as any).getBBox?.().width || 0;
  const ah =
    +aSel.attr("height") || 0 || (aBody as any).getBBox?.().height || 0;

  const bx = tB.x + (+bSel.attr("x") || 0);
  const by = tB.y + (+bSel.attr("y") || 0);
  const bh =
    +bSel.attr("height") || 0 || (bBody as any).getBBox?.().height || 0;

  // Anclas: derecha media de A → izquierda media de B
  const a = { x: ax + aw, y: ay + ah / 2 };
  const b = { x: bx, y: by + bh / 2 };

  const dx = b.x - a.x;
  const adx = Math.abs(dx);

  // Curva que “cae” un poco por debajo de las hojas
  const dip = Math.min(72, Math.max(18, 12 + adx * 0.18));
  const midY = Math.max(a.y, b.y) + dip;

  const c1x = a.x + (dx >= 0 ? adx * 0.35 : -adx * 0.35);
  const c2x = b.x - (dx >= 0 ? adx * 0.35 : -adx * 0.35);

  return `M${a.x},${a.y} C ${c1x},${midY} ${c2x},${midY} ${b.x},${b.y}`;
}
/* ───────────── NUEVO: bbox absoluto del slot k (coordenadas del treeG) ───────────── */
function slotBoxAbs(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  k: number
): {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  ry: number;
  cx: number;
  cy: number;
} | null {
  const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
  if (gLeaf.empty()) return null;
  const leafT = getTranslateXY(gLeaf);

  const sG = gLeaf.select<SVGGElement>(slotGroupSelInLeaf(leafId, k));
  if (sG.empty()) return null;
  const sT = getTranslateXY(sG);

  const box = sG.select<SVGRectElement>("rect.slot-box");
  if (box.empty()) return null;

  const x = sT.x + (+box.attr("x") || 0);
  const y = sT.y + (+box.attr("y") || 0);
  const w = +box.attr("width") || box.node()!.getBBox().width;
  const h = +box.attr("height") || box.node()!.getBBox().height;
  const rx = +box.attr("rx") || 4;
  const ry = +box.attr("ry") || rx;

  return {
    x: leafT.x + x,
    y: leafT.y + y,
    w,
    h,
    rx,
    ry,
    cx: leafT.x + x + w / 2,
    cy: leafT.y + y + h / 2,
  };
}
/* ───────────── REEMPLAZA “pulseInOrderSlotPearl” por un marcador que no tapa ───────────── */
/** Marca de slot sin cubrir el valor: outline + subrayado; devuelve ancla bajo el slot */
async function pulseInOrderSlotMarker(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  slotIndex: number
): Promise<{ x: number; y: number } | null> {
  const b = slotBoxAbs(treeG, leafId, slotIndex);
  if (!b) return null;

  // Ancla de cadena: centrado y unos px por DEBAJO del slot
  const anchorOffset = Math.min(16, Math.max(10, b.h * 0.55));
  const anchor = { x: b.cx, y: b.y + b.h + anchorOffset };

  // 1) Halo exterior suave (no fill, blend screen)
  const pad = 3;
  const halo = overlay
    .append("rect")
    .attr("class", "bp-inorder-slot-halo")
    .attr("x", b.x - pad)
    .attr("y", b.y - pad)
    .attr("width", b.w + pad * 2)
    .attr("height", b.h + pad * 2)
    .attr("rx", b.rx + pad)
    .attr("ry", b.ry + pad)
    .attr("fill", "none")
    .attr("stroke", INO.accent1)
    .attr("stroke-width", 5)
    .style("opacity", 0)
    .style("mix-blend-mode", "screen");

  // 2) Outline que se “revela” alrededor del slot (sin rellenar nada)
  const ring = overlay
    .append("rect")
    .attr("class", "bp-inorder-slot-ring")
    .attr("x", b.x + 0.5)
    .attr("y", b.y + 0.5)
    .attr("width", b.w - 1)
    .attr("height", b.h - 1)
    .attr("rx", b.rx)
    .attr("ry", b.ry)
    .attr("fill", "none")
    .attr("stroke", "url(#bpInOrderStrokeGrad)")
    .attr("stroke-width", 1.8)
    .style("opacity", 0.95)
    .style("mix-blend-mode", "screen");

  const perimeter = 2 * (b.w - 1) + 2 * (b.h - 1);
  const dash = Math.max(14, perimeter * 0.2);
  ring
    .attr("stroke-dasharray", `${dash} ${perimeter}`)
    .attr("stroke-dashoffset", perimeter);

  // 3) Subrayado micro-cápsula bajo el slot (no interfiere con el texto)
  const uW = Math.min(22, Math.max(12, b.w * 0.35));
  const uy = b.y + b.h + Math.max(6, b.h * 0.22);
  const underline = overlay
    .append("line")
    .attr("class", "bp-inorder-underline")
    .attr("x1", b.cx - uW / 2)
    .attr("x2", b.cx + uW / 2)
    .attr("y1", uy)
    .attr("y2", uy)
    .attr("stroke", "url(#bpInOrderStrokeGrad)")
    .attr("stroke-width", 2.4)
    .attr("stroke-linecap", "round")
    .style("opacity", 0)
    .style("mix-blend-mode", "screen");

  await Promise.all([
    halo.transition().duration(160).style("opacity", 0.35).end(),
    ring
      .transition()
      .duration(320)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    underline.transition().duration(220).style("opacity", 0.95).end(),
  ]);

  await Promise.all([
    halo.transition().duration(200).style("opacity", 0).remove().end(),
    ring.transition().duration(180).style("opacity", 0).remove().end(),
    underline.transition().duration(180).style("opacity", 0.55).end(), // lo dejamos tenue un instante
  ]);

  return anchor;
}

/* ─────────────────────────── GetInOrder (versión “Necklace”) ─────────────────────────── */
export async function animateBPlusGetInOrder(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    nodesData: HierarchyNode<BPlusHierarchy>[];
    maxKeys?: number;
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  if (!params?.rootHierarchy || !params?.nodesData?.length) {
    resetQueryValues?.();
    return;
  }

  try {
    setIsAnimating?.(true);

    // Coloca todo en su sitio
    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );

    const svg = getSVGFromTreeG(treeG);
    if (svg) {
      ensureBPInsertDefs(svg);
      ensureRangeDefs(svg);
      ensureInOrderDefs(svg);
    }

    // Overlay y limpieza fuerte de residuos previos
    const overlay = ensureInOrderOverlay(treeG);
    clearInOrderArtifacts(treeG);

    // Hojas ordenadas por X (in-order)
    const leaves = params.nodesData.filter((n) => n.data.isLeaf);
    if (!leaves.length) return;
    const ordered = orderLeavesByX(leaves as any, nodePositions);

    // Atenúa todo ligeramente
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .interrupt()
      .transition()
      .duration(140)
      .style("opacity", INO.fadeOthers)
      .end();

    // Guía desde la raíz a la primera hoja con beam ámbar
    const builder = bPlusPathBuilderFactory(
      params.rootHierarchy,
      nodePositions
    );
    const pathToFirst = params.rootHierarchy.path(ordered[0]);
    for (let i = 0; i < pathToFirst.length; i++) {
      const id = pathToFirst[i].data.id;
      const gNode = treeG.select<SVGGElement>(`g#${cssEsc(id)}`);
      await gNode.transition().duration(90).style("opacity", 1).end();
      await pingNode(treeG, id, INO.accent0);

      if (i < pathToFirst.length - 1) {
        const nxt = pathToFirst[i + 1].data.id;
        await runInOrderBeamOnTreeLink(
          treeG,
          overlay,
          id,
          nxt,
          500,
          builder(id, nxt)
        );
        await gNode
          .transition()
          .duration(80)
          .style("opacity", INO.visitedOpacity)
          .end();
      }
    }

    // Secuencia de “perlas” encadenadas
    let remaining = Number.isFinite(params.maxKeys!)
      ? Math.max(0, params.maxKeys as number)
      : Number.POSITIVE_INFINITY;

    let prevPearl: { x: number; y: number } | null = null;

    for (let li = 0; li < ordered.length && remaining > 0; li++) {
      const leaf = ordered[li];
      const leafId = leaf.data.id;

      // Enfoca hoja y barrido cálido
      const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
      await gLeaf.transition().duration(90).style("opacity", 1).end();
      await pingNode(treeG, leafId, INO.accent0);

      const scanT = scanLeafBodyInOrder(treeG, leafId, 400);

      // Perlas para cada clave (hasta agotar límite)
      const klen = leaf.data.keys?.length ?? 0;
      for (let i = 0; i < klen && remaining > 0; i++) {
        const anchor = await pulseInOrderSlotMarker(overlay, treeG, leafId, i);
        if (anchor && prevPearl) {
          await drawInOrderChainSegment(overlay, prevPearl, anchor, 360);
        }
        if (anchor) prevPearl = anchor;
      }

      await scanT;

      // Si todavía hay más y existe siguiente hoja, guiamos con curva por el belt
      if (remaining > 0 && li + 1 < ordered.length) {
        await runInOrderCurvedGuideOnBelt(
          treeG,
          overlay,
          leafId,
          ordered[li + 1].data.id,
          600,
          true
        );
        await gLeaf
          .transition()
          .duration(90)
          .style("opacity", INO.visitedOpacity)
          .end();
      } else {
        await gLeaf
          .transition()
          .duration(90)
          .style("opacity", INO.visitedOpacity)
          .end();
      }
    }

    // Restauración suave (dejamos la cadena tenue un instante)
    await treeG
      .selectAll<SVGGElement, unknown>("g.node")
      .interrupt()
      .transition()
      .duration(160)
      .style("opacity", 1)
      .end();

    // (Opcional) borra artefactos si no quieres dejar el “collar” visible:
    // clearInOrderArtifacts(treeG);
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── BORRADO ─────────────────────────── */
export async function animateBPlusDelete(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    leafId: string;
    slotIndex: number | null;
    rootHierarchy: HierarchyNode<BPlusHierarchy>;
    nodesData: HierarchyNode<BPlusHierarchy>[];
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  if (!params?.rootHierarchy || !params?.nodesData?.length) {
    resetQueryValues?.();
    return;
  }

  try {
    setIsAnimating?.(true);

    settleBPlusNodes(
      treeG,
      params.rootHierarchy,
      params.nodesData,
      nodePositions
    );

    const svg = getSVGFromTreeG(treeG);
    if (svg) ensureBPInsertDefs(svg);
    const overlay = ensureDeleteOverlay(treeG);

    const byId = new Map<string, HierarchyNode<BPlusHierarchy>>();
    params.rootHierarchy.each((n) => byId.set(n.data.id, n));

    const target = byId.get(params.leafId);

    const all = treeG.selectAll<SVGGElement, unknown>("g.node");
    await all
      .transition()
      .duration(140)
      .style("opacity", SRCH.fadeOthers)
      .end();

    if (target) {
      const pathNodes = params.rootHierarchy.path(target);
      const buildPath = bPlusPathBuilderFactory(
        params.rootHierarchy,
        nodePositions
      );

      for (let i = 0; i < pathNodes.length; i++) {
        const id = pathNodes[i].data.id;
        const g = treeG.select<SVGGElement>(`g#${cssEsc(id)}`);
        const body =
          g.select<SVGRectElement>("rect.bp-body").node() ||
          g.select<SVGRectElement>("rect").node();

        await g.transition().duration(110).style("opacity", 1).end();

        if (body) {
          const sel = d3.select(body as SVGRectElement);
          const origStroke = sel.attr("stroke");
          const origW = sel.attr("stroke-width");
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

        if (i < pathNodes.length - 1) {
          const fromId = id;
          const toId = pathNodes[i + 1].data.id;
          await runEmberOnLink(
            treeG,
            overlay,
            fromId,
            toId,
            420,
            buildPath(fromId, toId)
          );
          await g.transition().duration(90).style("opacity", 0.7).end();
        }
      }
    }

    if (typeof params.slotIndex === "number" && target) {
      await animateSlotCrumble(treeG, params.leafId, params.slotIndex);
    } else {
      const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(params.leafId)}`);
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
    const ty = t.y - 6;
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
      .attr("markerUnits", "userSpaceOnUse")
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

  if (defs.select("#bpDelGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpDelGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#fee2e2");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#f87171");
  }

  if (defs.select("#bpDeleteArrow").empty()) {
    const m = defs
      .append<SVGMarkerElement>("marker")
      .attr("id", "bpDeleteArrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerUnits", "userSpaceOnUse")
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

  if (defs.select("#bpSearchSpotGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "bpSearchSpotGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#93c5fd");
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(147,197,253,0)");
  }

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
    treeG.select<SVGRectElement>(`g#${cssEsc(nodeId)} rect.bp-body`).node() ||
    treeG.select<SVGRectElement>(`g#${cssEsc(nodeId)} rect`).node();
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

/* “Slot glow” sin rellenar el fondo: outline animado + pulso del borde */
async function animateSlotGrow(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string,
  slotIndex: number
) {
  const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(nodeId)}`);
  const slotG = gLeaf.select<SVGGElement>(
    slotGroupSelInLeaf(nodeId, slotIndex)
  );
  const box = slotG.select<SVGRectElement>("rect.slot-box");
  if (box.empty()) return;

  const bx = +box.attr("x") || 0;
  const by = +box.attr("y") || 0;
  const bw = +box.attr("width") || 0;
  const bh = +box.attr("height") || 0;
  const rx = +box.attr("rx") || 4;
  const ry = +box.attr("ry") || rx;

  // ——— Outline exterior (glow suave con blend, sin filtros ni fill)
  const padOuter = 4;
  const halo = slotG
    .append("rect")
    .attr("class", "slot-outline-under")
    .attr("x", bx - padOuter)
    .attr("y", by - padOuter)
    .attr("width", bw + padOuter * 2)
    .attr("height", bh + padOuter * 2)
    .attr("rx", rx + padOuter)
    .attr("ry", ry + padOuter)
    .attr("fill", "none")
    .attr("stroke", INS.slotGlow)
    .attr("stroke-width", 5)
    .style("opacity", 0)
    .style("mix-blend-mode", "screen");

  // ——— Outline principal con “reveal” alrededor del slot
  const padInner = 1.5;
  const ring = slotG
    .append("rect")
    .attr("class", "slot-outline")
    .attr("x", bx - padInner)
    .attr("y", by - padInner)
    .attr("width", bw + padInner * 2)
    .attr("height", bh + padInner * 2)
    .attr("rx", rx + padInner)
    .attr("ry", ry + padInner)
    .attr("fill", "none")
    .attr("stroke", INS.slotGlow)
    .attr("stroke-width", 2)
    .style("opacity", 0.95)
    .style("mix-blend-mode", "screen");

  // Dash para efecto “sweep”
  const perimeter = 2 * (bw + padInner * 2) + 2 * (bh + padInner * 2);
  const dash = Math.max(14, perimeter * 0.22);
  ring
    .attr("stroke-dasharray", `${dash} ${perimeter}`)
    .attr("stroke-dashoffset", perimeter);

  // Pulso del borde del slot (sin rectángulos de fondo)
  const origStroke = box.attr("stroke");
  const origW = box.attr("stroke-width");

  await Promise.all([
    halo.transition().duration(160).style("opacity", 0.35).end(),
    ring
      .transition()
      .duration(320)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    box
      .transition()
      .duration(180)
      .attr("stroke", INS.slotGlow)
      .attr("stroke-width", (+origW || 1.1) + 0.9)
      .end(),
  ]);

  // Unas chispas muy discretas (opcional)
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const N = 4;
  const particles = d3.range(N).map((i) => ({
    angle: (i / N) * Math.PI * 2 + Math.random() * 0.8,
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
    .style("mix-blend-mode", "screen")
    .attr("opacity", 0);

  await conf
    .transition()
    .duration(220)
    .ease(d3.easeCubicOut)
    .attr("opacity", 0.9)
    .attr("cx", (d) => cx + Math.cos(d.angle) * d.r)
    .attr("cy", (d) => cy + Math.sin(d.angle) * d.r)
    .end();

  // Fade out + restauración del borde original
  await Promise.all([
    conf.transition().duration(180).style("opacity", 0).remove().end(),
    halo.transition().duration(200).style("opacity", 0).remove().end(),
    ring.transition().duration(180).style("opacity", 0).remove().end(),
    box
      .transition()
      .duration(160)
      .attr("stroke", origStroke ?? "#374151")
      .attr("stroke-width", origW ?? "1.1")
      .end(),
  ]);
}

/* “Crumble & ripple & close-gap” */
async function animateSlotCrumble(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string,
  slotIndex: number
) {
  const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(nodeId)}`);
  const slotG = gLeaf.select<SVGGElement>(
    slotGroupSelInLeaf(nodeId, slotIndex)
  );
  const box = slotG.select<SVGRectElement>("rect.slot-box");
  const txt = slotG.select<SVGTextElement>("text.slot-text");
  if (box.empty()) return;

  const gw = +box.attr("width");
  const gh = +box.attr("height");

  const origW = box.attr("stroke-width");
  await box
    .transition()
    .duration(120)
    .attr("stroke", "#f87171")
    .attr("stroke-width", (+origW || 1.1) + 1.1)
    .end();

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

  await box
    .transition()
    .duration(220)
    .ease(d3.easeCubicOut)
    .attr("x", gw / 2)
    .attr("width", 0)
    .attr("stroke-width", 0)
    .end();

  dust.transition().duration(200).style("opacity", 0).remove();

  slotG.style("opacity", 0);

  const nextG = gLeaf.select<SVGGElement>(
    slotGroupSelInLeaf(nodeId, slotIndex + 1)
  );
  let gap = 0;
  if (!nextG.empty()) {
    const { x: xCur } = getTranslateXY(slotG);
    const { x: xNext } = getTranslateXY(nextG);
    gap = Math.max(0, xNext - xCur - gw);
  }
  const dx = gw + gap;

  const moves: Array<Promise<any>> = [];
  for (let k = slotIndex + 1; ; k++) {
    const gK = treeG.select<SVGGElement>(
      `g#${cssEsc(nodeId)} g.slots g#${cssEsc(nodeId)}#k${k}`
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

/** bbox absoluto (coordenadas del treeG) de la banda que cubre [i0..i1] en una hoja. */
function bandBBoxForSlotRange(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  i0: number,
  i1: number
) {
  const gLeaf = treeG.select<SVGGElement>(`g#${cssEsc(leafId)}`);
  const leafT = getTranslateXY(gLeaf);

  const s0 = gLeaf.select<SVGGElement>(slotGroupSelInLeaf(leafId, i0));
  const s1 = gLeaf.select<SVGGElement>(slotGroupSelInLeaf(leafId, i1));
  if (s0.empty() || s1.empty()) return null;

  const t0 = getTranslateXY(s0);
  const t1 = getTranslateXY(s1);

  const r0 = s0.select<SVGRectElement>("rect.slot-box");
  const r1 = s1.select<SVGRectElement>("rect.slot-box");
  if (r0.empty() || r1.empty()) return null;

  // Usa attrs (fallback a getBBox si hiciera falta)
  const x0 = t0.x + (+r0.attr("x") || 0);
  const y0 = t0.y + (+r0.attr("y") || 0);
  const w0 = +r0.attr("width") || 0 || r0.node()!.getBBox().width;
  const h0 = +r0.attr("height") || 0 || r0.node()!.getBBox().height;

  const x1 = t1.x + (+r1.attr("x") || 0);
  const y1 = t1.y + (+r1.attr("y") || 0);
  const w1 = +r1.attr("width") || 0 || r1.node()!.getBBox().width;
  const h1 = +r1.attr("height") || 0 || r1.node()!.getBBox().height;

  const left = Math.min(x0, x1);
  const right = Math.max(x0 + w0, x1 + w1);
  const top = Math.min(y0, y1);
  const height = Math.max(h0, h1);

  const x = leafT.x + left;
  const y = leafT.y + top;
  const w = right - left;
  const h = height;

  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

/** Pinta la banda “marcador” animada en esa hoja y devuelve el centro para la cinta. */
async function paintRangeMarkerBand(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  leafId: string,
  i0: number,
  i1: number,
  dur = 300
) {
  const bb = bandBBoxForSlotRange(treeG, leafId, i0, i1);
  if (!bb) return null;

  const svg = getSVGFromTreeG(treeG)!;
  const clipUrl = ensureLeafClip(svg, treeG, leafId); // ⬅️ recorta al cuerpo

  // Banda más delgada y un pelín desplazada hacia ABAJO
  const H = Math.min(20, Math.max(9, bb.h * 0.46));
  const y = bb.y + (bb.h - H) * 0.62; // cae al tercio inferior

  const band = overlay
    .append("rect")
    .attr("class", "bp-range-marker-band")
    .attr("x", bb.x)
    .attr("y", y)
    .attr("width", 0)
    .attr("height", H)
    .attr("rx", H / 2)
    .attr("ry", H / 2)
    .attr("fill", "url(#bpRangeMarkerGrad)")
    .attr("clip-path", clipUrl ?? null)
    .style("mix-blend-mode", "screen") // ← no cubre texto
    .style("opacity", 0.0);

  await band.transition().duration(100).style("opacity", 0.55).end();
  await band
    .transition()
    .duration(dur)
    .ease(d3.easeCubicOut)
    .attr("width", bb.w)
    .end();

  // Baja de intensidad final muy ligera
  await band.transition().duration(140).style("opacity", 0.35).end();

  const x = +band.attr("x"),
    w = +band.attr("width");
  const cy = y + H / 2;
  return { cx: x + w / 2, cy };
}

/** Dibuja y revela un segmento de cinta (más bajo, sin tapar texto) */
async function drawRibbonSegment(
  overlay: d3.Selection<SVGGElement, unknown, null, undefined>,
  a: { x: number; y: number },
  b: { x: number; y: number },
  dur = 480
) {
  // Anclas más bajas para no rozar texto
  const endpointOffset = 12;
  const A = { x: a.x, y: a.y + endpointOffset };
  const B = { x: b.x, y: b.y + endpointOffset };

  // Curva ∪ suave con “dip” moderado proporcional a la distancia
  const dx = B.x - A.x;
  const adx = Math.abs(dx);
  const s = dx >= 0 ? 1 : -1;

  const dip = Math.min(48, Math.max(16, 8 + adx * 0.1));
  const midY = Math.max(A.y, B.y) + dip;
  const R = Math.min(40, Math.max(14, adx * 0.18));
  const x1 = A.x + s * Math.min(R, adx * 0.45);
  const x2 = B.x - s * Math.min(R, adx * 0.45);

  const d = `M${A.x},${A.y}
             C ${A.x},${A.y + R * 0.45} ${x1},${midY} ${x1},${midY}
             L ${x2},${midY}
             C ${x2},${midY} ${B.x},${B.y + R * 0.45} ${B.x},${B.y}`;

  const under = overlay
    .append("path")
    .attr("class", "bp-range-aurora-under")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpAuroraGrad)")
    .attr("stroke-width", RNG.beamWidth + 3.5) // ⬅️ más fino
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("opacity", 0.0)
    .attr("vector-effect", "non-scaling-stroke")
    .style("mix-blend-mode", "screen");

  const core = overlay
    .append("path")
    .attr("class", "bp-range-aurora-core")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpRangeStrokeGrad)")
    .attr("stroke-width", RNG.beamWidth + 1.2) // ⬅️ más fino
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("opacity", 0.9)
    .attr("vector-effect", "non-scaling-stroke")
    .style("mix-blend-mode", "screen");

  const dash = overlay
    .append("path")
    .attr("class", "bp-range-aurora-dash")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", "url(#bpAuroraDashGrad)")
    .attr("stroke-width", RNG.beamWidth) // ⬅️ más fino
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .attr("stroke-dasharray", "8 16")
    .attr("opacity", 0.35)
    .attr("vector-effect", "non-scaling-stroke")
    .style("mix-blend-mode", "screen");

  const L = (core.node() as SVGPathElement).getTotalLength();
  const Lu = (under.node() as SVGPathElement).getTotalLength();
  core.attr("stroke-dasharray", `${L} ${L}`).attr("stroke-dashoffset", L);
  under.attr("stroke-dasharray", `${Lu} ${Lu}`).attr("stroke-dashoffset", Lu);

  const reveal = Promise.all([
    core
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .end(),
    under
      .transition()
      .duration(dur)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0)
      .attr("opacity", 0.45) // ⬅️ más bajo
      .end(),
  ]);

  const shimmer = dash
    .transition()
    .duration(dur)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", -Math.max(120, L * 0.6))
    .end();

  await Promise.all([reveal, shimmer]);

  await Promise.all([
    core.transition().duration(180).attr("opacity", 0.58).end(),
    under.transition().duration(180).attr("opacity", 0.22).end(),
    dash.transition().duration(140).attr("opacity", 0).remove().end(),
  ]);
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
