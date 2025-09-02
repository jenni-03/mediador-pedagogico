// src/shared/utils/draw/TwoThreeTreeDrawActions.ts
import * as d3 from "d3";
import { HierarchyNode } from "d3";
import {
  HierarchyNodeData,
  TreeLinkData,
  TraversalNodeType,
} from "../../../types";
import {
  ensureTwoThreeNeoDefs,
  drawTwoThreeNodesNeo,
} from "./twoThreeDrawActionsUtilities";

/* ───────── Animación ───────── */
const TT_ANIM = {
  popIn: 220,
  popSettle: 180,
  reflow: 900,
  easeIn: d3.easeCubicIn,
  easeOut: d3.easeCubicOut,
  easeIO: d3.easeCubicInOut,
  easeBack: d3.easeBackOut.overshoot(1.35),
};

const DEFAULT_STROKE = "#3b4252";
const DEFAULT_STROKE_W = 2;

function waitEnd(t: d3.Transition<any, any, any, any>) {
  return t.end().catch(() => {});
}

/* ───────── Utilidades DOM ───────── */
/** Elimina duplicados de g.node (mismo id) y re-encadena el datum actual. */
function normalizeNodeDom(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number[]>>[]
) {
  const seen = new Set<string>();
  layer.selectAll<SVGGElement, unknown>("g.node").each(function () {
    const id = (this as SVGGElement).id;
    if (!id) return;
    if (seen.has(id)) d3.select(this).remove();
    else seen.add(id);
  });

  // rebind del datum fresco al g#id efectivo
  for (const n of nodes) {
    layer.select<SVGGElement>(`g#${n.data.id}`).datum(n as any);
  }
}

/* ───────── Helpers de puertos ───────── */
/** Lee ancho/alto de la caja desde el DOM del nodo (con fallback). */
function getBoxSize(nodeG: d3.Selection<SVGGElement, any, any, any>) {
  const w = +(nodeG.attr("data-box-w") || 64);
  const h = +(nodeG.attr("data-box-h") || 36);
  return { w, h };
}

/** Construye un mapa padre→[ids de hijos] ordenado por X actual (lo que se ve). */
function buildChildOrderMap(
  nodes: d3.HierarchyNode<HierarchyNodeData<number[]>>[],
  positions: Map<string, { x: number; y: number }>
) {
  const byParent = new Map<string, string[]>();
  for (const n of nodes) {
    const pid = n.parent?.data.id;
    if (!pid) continue;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid)!.push(n.data.id);
  }
  for (const [_pid, arr] of byParent) {
    arr.sort((a, b) => (positions.get(a)?.x ?? 0) - (positions.get(b)?.x ?? 0));
  }
  return byParent;
}

/** Devuelve el índice del hijo target dentro del padre. Usa orderMap si existe. */
function getChildIndex(
  parentId: string,
  targetId: string,
  orderMap?: Map<string, string[]>
): number {
  if (orderMap && orderMap.has(parentId)) {
    const idx = orderMap.get(parentId)!.indexOf(targetId);
    return Math.max(0, idx);
  }
  // Fallback: datum del DOM (puede ir 1 frame atrasado)
  const parentG = d3.select<SVGGElement, any>(`g#${parentId}`);
  const datum = parentG.datum() as
    | HierarchyNode<HierarchyNodeData<number[]>>
    | undefined;

  if (datum && datum.children && datum.children.length) {
    const idx = datum.children.findIndex((c) => c.data.id === targetId);
    return Math.max(0, idx === -1 ? 0 : idx);
  }
  return 0;
}

/** Coordenadas de salida (puerto) en el borde inferior del padre. */
function getSourcePort(
  parentId: string,
  targetId: string,
  positions: Map<string, { x: number; y: number }>,
  orderMap?: Map<string, string[]>
) {
  const parentG = d3.select<SVGGElement, any>(`g#${parentId}`);
  const { w, h } = getBoxSize(parentG);

  // nº de claves del padre (para repartir puertos). Si no hay datum, asume 1.
  const mPlus1 = (() => {
    const datum = parentG.datum() as
      | HierarchyNode<HierarchyNodeData<number[]>>
      | undefined;
    const m = datum?.data?.value?.length ?? 1;
    return m + 1;
  })();

  const idx = getChildIndex(parentId, targetId, orderMap); // 0..m
  const cx = positions.get(parentId)?.x ?? 0;
  const cy = positions.get(parentId)?.y ?? 0;

  // Puertos equiespaciados con margen
  const localX = -w / 2 + ((idx + 1) * w) / (mPlus1 + 1);
  const x = cx + localX;
  const y = cy + h / 2;
  return { x, y };
}

/** Coordenadas de entrada en el borde superior del hijo (centro superior). */
function getTargetEntry(
  childId: string,
  positions: Map<string, { x: number; y: number }>
) {
  const childG = d3.select<SVGGElement, any>(`g#${childId}`);
  const { h } = getBoxSize(childG);
  const cx = positions.get(childId)?.x ?? 0;
  const cy = positions.get(childId)?.y ?? 0;
  return { x: cx, y: cy - h / 2 };
}

/** Path curvo usando puertos (padre→hijo). */
function twoThreeLinkPath(
  parentId: string,
  childId: string,
  positions: Map<string, { x: number; y: number }>,
  orderMap?: Map<string, string[]>
) {
  const s = getSourcePort(parentId, childId, positions, orderMap);
  const t = getTargetEntry(childId, positions);
  const midY = (s.y + t.y) / 2;
  return `M${s.x},${s.y} C ${s.x},${midY} ${t.x},${midY} ${t.x},${t.y}`;
}

/* ───────── Defs del skin 2-3 ───────── */
export function ensureTwoThreeSkinDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  ensureTwoThreeNeoDefs(svg);
}

/* ───────── Dibujo de nodos 2-3 ───────── */
/**
 * Sembramos posiciones SOLO si no existen (no pisamos animaciones previas)
 * y nos aseguramos de que los enters aparezcan ya en su (x,y) final.
 */
export function drawTwoThreeTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number[]>>[],
  positions: Map<string, { x: number; y: number }>
) {
  // 0) Podar posiciones de nodos que ya no existen
  const liveIds = new Set(nodes.map((n) => n.data.id));
  for (const id of Array.from(positions.keys())) {
    if (!liveIds.has(id)) positions.delete(id);
  }

  // 1) Sembrar posiciones faltantes con el layout actual
  for (const d of nodes) {
    const id = d.data.id;
    if (!positions.has(id)) {
      positions.set(id, { x: d.x!, y: d.y! });
    }
  }

  // 2) Dibujo/actualización visual
  drawTwoThreeNodesNeo(g, nodes as any, positions);

  // 2.5) Normalizar DOM: dedupe + rebind datum
  normalizeNodeDom(g, nodes);

  // 3) Posicionar cada nodo por id (sin data-join adicional)
  for (const d of nodes) {
    const id = d.data.id;
    const p = positions.get(id) ?? { x: d.x!, y: d.y! };
    g.select<SVGGElement>(`g#${id}`).attr(
      "transform",
      `translate(${p.x}, ${p.y})`
    );
  }
}

/* ───────── Enlaces con puertos ───────── */
export function drawTreeLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>,
  nodes: d3.HierarchyNode<HierarchyNodeData<number[]>>[],
  opts?: { strokeColor?: string; strokeWidth?: number }
) {
  const stroke = opts?.strokeColor ?? DEFAULT_STROKE;
  const width = opts?.strokeWidth ?? DEFAULT_STROKE_W;

  // (defensivo) si falta alguna posición, filtra ese link
  const safeLinks = linksData.filter(
    (d) => positions.has(d.sourceId) && positions.has(d.targetId)
  );

  // Mapa de puertos por orden visual
  const orderMap = buildChildOrderMap(nodes, positions);

  g.selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(safeLinks, (d) => `link-${d.sourceId}-${d.targetId}`)
    .join(
      (enter) => {
        const gLink = enter
          .append("g")
          .attr("class", "link")
          .attr("id", (d) => `link-${d.sourceId}-${d.targetId}`);

        gLink
          .append("path")
          .attr("class", "tree-link")
          .attr("fill", "none")
          .attr("stroke", stroke)
          .attr("stroke-width", width)
          .attr("stroke-linecap", "round")
          .attr("d", (d) =>
            twoThreeLinkPath(d.sourceId, d.targetId, positions, orderMap)
          );

        return gLink;
      },
      (update) => {
        update
          .select<SVGPathElement>("path.tree-link")
          .attr("stroke", stroke)
          .attr("stroke-width", width)
          .attr("d", (d) =>
            twoThreeLinkPath(d.sourceId, d.targetId, positions, orderMap)
          );
        return update;
      },
      (exit) => exit.transition().duration(200).style("opacity", 0).remove()
    );
}

/* ───────── Reflow (nodos + enlaces) ───────── */
export async function repositionTwoThreeTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number[]>>[],
  links: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>
) {
  const orderMap = buildChildOrderMap(nodes, positions);

  const p1 = g
    .selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number[]>>>(
      "g.node"
    )
    .data(nodes, (d: any) => d.data.id)
    .transition()
    .duration(TT_ANIM.reflow)
    .ease(TT_ANIM.easeIO)
    .attr("transform", (d) => {
      const p = positions.get(d.data.id)!;
      return `translate(${p.x}, ${p.y})`;
    })
    .end();

  const p2 = g
    .selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(links, (d) => `link-${d.sourceId}-${d.targetId}`)
    .select<SVGPathElement>("path.tree-link")
    .transition()
    .duration(TT_ANIM.reflow)
    .ease(TT_ANIM.easeIO)
    .attr("d", (d) =>
      twoThreeLinkPath(d.sourceId, d.targetId, positions, orderMap)
    )
    .end();

  await Promise.all([p1, p2]);
}

/* ───────── Versión instantánea (sin animación) para recolocar ───────── */
function applyPositionsInstant(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number[]>>[],
  links: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>
) {
  const orderMap = buildChildOrderMap(nodes, positions);

  g.selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number[]>>>("g.node")
    .data(nodes, (d: any) => d.data.id)
    .attr("transform", (d) => {
      const p = positions.get(d.data.id)!;
      return `translate(${p.x}, ${p.y})`;
    });

  g.selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(links, (d) => `link-${d.sourceId}-${d.targetId}`)
    .select<SVGPathElement>("path.tree-link")
    .attr("d", (d) =>
      twoThreeLinkPath(d.sourceId, d.targetId, positions, orderMap)
    );
}

/* ───────── Secuencia de recorrido y animaciones ───────── */
export function drawTraversalSequence(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  values: TraversalNodeType[],
  opts: {
    seqPositions: Map<string, { x: number; y: number }>;
    padding?: number;
    textSize?: string;
    textWeight?: number;
    textColor?: string;
  }
) {
  const {
    seqPositions,
    padding = 38,
    textSize = "14px",
    textWeight = 800,
    textColor = "#f9fafb",
  } = opts;

  const outlineColor = "#0b1220";
  const outlineWidth = 1.4;

  g.selectAll<SVGTextElement, TraversalNodeType>("text.seq")
    .data(values, (d) => d.id)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("class", "seq")
          .attr("id", (d) => d.id)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "alphabetic")
          .style("pointer-events", "none")
          .style("paint-order", "stroke")
          .style("stroke", outlineColor)
          .style("stroke-width", outlineWidth)
          .attr("fill", textColor)
          .style("font-weight", textWeight as any)
          .style("font-size", textSize)
          .style("opacity", 0)
          .attr("transform", (d, i) => {
            const x = i * padding;
            const y = 0;
            seqPositions.set(d.id, { x, y });
            return `translate(${x}, ${y})`;
          })
          .text((d) => d.value),
      (update) =>
        update
          .style("paint-order", "stroke")
          .style("stroke", outlineColor)
          .style("stroke-width", outlineWidth)
          .attr("fill", textColor)
          .style("font-weight", textWeight as any)
          .style("font-size", textSize)
          .style("opacity", 0)
          .attr("transform", (d, i) => {
            const x = i * padding;
            const y = 0;
            seqPositions.set(d.id, { x, y });
            return `translate(${x}, ${y})`;
          })
          .text((d) => d.value),
      (exit) => exit.each((d) => seqPositions.delete(d.id)).remove()
    );
}

export async function animateTreeTraversal(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  seqG: d3.Selection<SVGGElement, unknown, null, undefined>,
  targetNodes: TraversalNodeType[],
  seqPositions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: (b: boolean) => void,
  opts: {
    strokeColor?: string;
    pulse?: boolean;
    bounce?: boolean;
    rippleCount?: number;
    rippleExpand?: number;
    valuePopScale?: number;
    stepDelay?: number;
  } = {}
) {
  const {
    strokeColor = "#8aa0ff",
    pulse = true,
    bounce = true,
    rippleCount = 2,
    rippleExpand = 14,
    valuePopScale = 1.18,
    stepDelay = 70,
  } = opts;

  seqG.style("opacity", 1);
  setIsAnimating(true);

  const allNodes = treeG.selectAll<SVGGElement, unknown>("g.node");
  await waitEnd(allNodes.transition().duration(120).style("opacity", 0.35));

  for (let i = 0; i < targetNodes.length; i++) {
    const id = targetNodes[i].id;

    const rect =
      treeG.select<SVGRectElement>(`g#${id} rect.tt-box`).node() ||
      treeG.select<SVGRectElement>(`g#${id} rect`).node();
    if (!rect) continue;

    const sel = d3.select(rect);
    const nodeG = treeG.select<SVGGElement>(`g#${id}`);
    const seqText = seqG.select<SVGTextElement>(`text#${id}`);

    await waitEnd(nodeG.transition().duration(120).style("opacity", 1));

    const origStroke = sel.attr("stroke");
    const origW = sel.attr("stroke-width");
    await waitEnd(
      sel
        .transition()
        .duration(150)
        .attr("stroke", strokeColor)
        .attr("stroke-width", (+origW || 1.5) + 1)
    );

    if (bounce) {
      await waitEnd(
        sel
          .transition()
          .duration(150)
          .ease(TT_ANIM.easeBack)
          .attr("transform", "scale(1.03)")
          .transition()
          .duration(150)
          .ease(TT_ANIM.easeOut)
          .attr("transform", "scale(1)")
      );
    }

    const centerText = nodeG.select<SVGTextElement>("text.value");
    if (!centerText.empty()) {
      const cur = parseFloat(centerText.style("font-size") || "12");
      await waitEnd(
        centerText
          .transition()
          .duration(150)
          .ease(d3.easeBackOut.overshoot(1.18))
          .style("font-size", `${cur * valuePopScale}px`)
          .transition()
          .duration(150)
          .ease(d3.easeCubicOut)
          .style("font-size", `${cur}px`)
      );
    }

    const finalPos = seqPositions.get(id)!;
    const existsVisible =
      seqText.style("opacity") !== "" && seqText.style("opacity") !== "0";
    if (!existsVisible) {
      await waitEnd(
        seqText
          .attr(
            "transform",
            `translate(${finalPos.x}, ${finalPos.y}) scale(0.9)`
          )
          .style("opacity", 0)
          .transition()
          .duration(420)
          .ease(d3.easeBackOut.overshoot(1.2))
          .style("opacity", 1)
          .attr("transform", `translate(${finalPos.x}, ${finalPos.y}) scale(1)`)
      );
    }

    if (pulse) {
      const bb = (rect as SVGGraphicsElement).getBBox();
      const parentG = (rect.parentNode as SVGGElement) || rect;
      for (let k = 0; k < rippleCount; k++) {
        const ring = d3
          .select(parentG)
          .append("rect")
          .attr("class", "trav-ring")
          .attr("x", bb.x - 1)
          .attr("y", bb.y - 1)
          .attr("width", bb.width + 2)
          .attr("height", bb.height + 2)
          .attr("rx", 8)
          .attr("ry", 8)
          .attr("fill", "none")
          .attr("stroke", strokeColor)
          .attr("stroke-width", 2)
          .style("opacity", 0.9);

        await waitEnd(
          ring
            .transition()
            .delay(k * 70)
            .duration(360)
            .ease(d3.easeCubicOut)
            .attr("x", bb.x - 1 - rippleExpand / 2)
            .attr("y", bb.y - 1 - rippleExpand / 2)
            .attr("width", bb.width + 2 + rippleExpand)
            .attr("height", bb.height + 2 + rippleExpand)
            .style("opacity", 0)
            .remove()
        );
      }
    }

    await waitEnd(
      sel
        .transition()
        .duration(130)
        .attr("stroke", origStroke ?? null)
        .attr("stroke-width", origW ?? null)
    );

    if (i < targetNodes.length - 1) {
      await waitEnd(nodeG.transition().duration(100).style("opacity", 0.6));
    }

    if (stepDelay) await new Promise((r) => setTimeout(r, stepDelay));
  }

  await waitEnd(allNodes.transition().duration(160).style("opacity", 1));
  resetQueryValues();
  setIsAnimating(false);
}

/* ───────── Clear total ───────── */
export async function animateClearTree(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  seqG: d3.Selection<SVGGElement, unknown, null, undefined>,
  elementPositions: {
    nodePositions: Map<string, { x: number; y: number }>;
    seqPositions: Map<string, { x: number; y: number }>;
  },
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { nodePositions, seqPositions } = elementPositions;

  await waitEnd(
    treeG.selectAll("g.link").transition().duration(700).style("opacity", 0)
  );
  await waitEnd(
    treeG.selectAll("g.node").transition().duration(700).style("opacity", 0)
  );
  await waitEnd(
    seqG.selectAll("text.seq").transition().duration(700).style("opacity", 0)
  );

  treeG.remove();
  seqG.remove();

  nodePositions.clear();
  seqPositions.clear();

  resetQueryValues();
  setIsAnimating(false);
}

/* ───────── Helpers por chip ───────── */
export async function flashKeyChip(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  keyId: string,
  color = "#8aa0ff"
) {
  const chip = treeG.select<SVGGElement>(`g#${keyId}`);
  if (chip.empty()) return;

  const rect = chip.select<SVGRectElement>("rect.chip-bg");
  if (rect.empty()) return;

  const sel = rect as any;
  const origStroke = sel.attr("stroke");
  const origW = sel.attr("stroke-width");

  await waitEnd(
    sel
      .transition()
      .duration(160)
      .attr("stroke", color)
      .attr("stroke-width", (+origW || 1) + 1)
      .transition()
      .duration(160)
      .attr("stroke", origStroke ?? null)
      .attr("stroke-width", origW ?? null)
  );
}

export async function popTwoThreeNode(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string
) {
  const g = treeG.select<SVGGElement>(`g#${nodeId}`);
  if (g.empty()) return;

  const rect = g.select<SVGRectElement>("rect.tt-box");
  if (rect.empty()) return;

  await waitEnd(
    rect
      .transition()
      .duration(TT_ANIM.popIn)
      .ease(TT_ANIM.easeBack)
      .attr("transform", "scale(1.04)")
      .transition()
      .duration(TT_ANIM.popSettle)
      .ease(TT_ANIM.easeOut)
      .attr("transform", "scale(1)")
  );
}

/* ───────── Defs para SEARCH (flecha + glow + gradiente) ───────── */
function ensureTTSearchDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  if (defs.select("#ttSearchGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "ttSearchGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 3.2)
      .attr("result", "blur");
    const merge = f.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
  }

  if (defs.select("#ttArrowHead").empty()) {
    const m = defs
      .append<SVGMarkerElement>("marker")
      .attr("id", "ttArrowHead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto-start-reverse");
    m.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", "#7aa2ff");
  }

  if (defs.select("#ttSearchStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "ttSearchStrokeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#7aa2ff");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#22d3ee");
  }
}

/* ───────── Animación SEARCH raíz→objetivo ───────── */
export async function animateTwoThreeSearchPath(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.HierarchyNode<HierarchyNodeData<number[]>>[],
  nodePositions: Map<string, { x: number; y: number }>,
  opts?: { key?: number },
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  if (!path || path.length === 0) return;

  setIsAnimating?.(true);
  ensureTTSearchDefs(svg);

  let overlay = treeG.select<SVGGElement>("g.tt-search-overlay");
  if (overlay.empty()) {
    overlay = treeG
      .append("g")
      .attr("class", "tt-search-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();

  const allNodes = treeG.selectAll<SVGGElement, unknown>("g.node");
  await allNodes.transition().duration(160).style("opacity", 0.35).end();

  for (let i = 0; i < path.length; i++) {
    const id = path[i].data.id;
    const gNode = treeG.select<SVGGElement>(`g#${id}`);
    const rect =
      gNode.select<SVGRectElement>("rect.tt-box").node() ||
      gNode.select<SVGRectElement>("rect").node();

    await gNode.transition().duration(120).style("opacity", 1).end();

    if (rect) {
      const s = d3.select(rect as any);
      const origStroke = s.attr("stroke");
      const origW = s.attr("stroke-width");

      await s
        .transition()
        .duration(150)
        .attr("stroke", "#7aa2ff")
        .attr("stroke-width", (+origW || 1.4) + 1)
        .end();

      s.attr("filter", "url(#ttSearchGlow)");
      await new Promise((r) => setTimeout(r, 120));
      s.attr("filter", null);

      await s
        .transition()
        .duration(150)
        .attr("stroke", origStroke ?? null)
        .attr("stroke-width", origW ?? null)
        .end();
    }

    if (i < path.length - 1) {
      const fromId = id;
      const toId = path[i + 1].data.id;

      const seg = overlay
        .append("path")
        .attr("class", "tt-search-seg")
        .attr("d", twoThreeLinkPath(fromId, toId, nodePositions))
        .attr("fill", "none")
        .attr("stroke", "url(#ttSearchStrokeGrad)")
        .attr("stroke-width", 2.4)
        .attr("stroke-linecap", "round")
        .attr("marker-end", "url(#ttArrowHead)");

      const len = (seg.node() as SVGPathElement).getTotalLength();
      seg
        .attr("stroke-dasharray", `${len} ${len}`)
        .attr("stroke-dashoffset", len)
        .style("opacity", 0.95);

      await seg
        .transition()
        .duration(420)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0)
        .end();

      await gNode.transition().duration(100).style("opacity", 0.6).end();
    }
  }

  const lastId = path[path.length - 1].data.id;
  const lastG = treeG.select<SVGGElement>(`g#${lastId}`);
  const lastRect =
    lastG.select<SVGRectElement>("rect.tt-box").node() ||
    lastG.select<SVGRectElement>("rect").node();

  if (lastRect) {
    const bb = (lastRect as SVGGraphicsElement).getBBox();
    const ring = lastG
      .append("rect")
      .attr("class", "tt-target-ring")
      .attr("x", bb.x - 2)
      .attr("y", bb.y - 2)
      .attr("width", bb.width + 4)
      .attr("height", bb.height + 4)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", "none")
      .attr("stroke", "#22d3ee")
      .attr("stroke-width", 2)
      .style("opacity", 0.9);

    await ring
      .transition()
      .duration(460)
      .ease(d3.easeCubicOut)
      .attr("x", bb.x - 10)
      .attr("y", bb.y - 10)
      .attr("width", bb.width + 20)
      .attr("height", bb.height + 20)
      .style("opacity", 0)
      .remove()
      .end();
  }

  if (opts?.key != null) {
    const vals = path[path.length - 1].data.value ?? [];
    const idx = vals.findIndex((v) => v === opts.key);
    if (idx !== -1) {
      await flashKeyChip(treeG, `${lastId}#k${idx}`, "#22d3ee");
    }
  }

  overlay.selectAll("*").remove();
  await allNodes.transition().duration(160).style("opacity", 1).end();

  resetQueryValues?.();
  setIsAnimating?.(false);
}

/* ───────── Defs para TRAVERSAL (runner sin líneas) ───────── */
function ensureTTTraversalDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  if (defs.select("#ttRunnerGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "ttRunnerGlow")
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

  if (defs.select("#ttRunnerGrad").empty()) {
    const g = defs.append("radialGradient").attr("id", "ttRunnerGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#e6f1ff");
    g.append("stop").attr("offset", "100%").attr("stop-color", "#7aa2ff");
  }
}

/* ───────── Animación de RECORRIDO (runner) ───────── */
export async function animateTwoThreeTraversal(
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
    ripple?: boolean;
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
  ensureTTTraversalDefs(svg);

  let overlay = treeG.select<SVGGElement>("g.tt-traverse-overlay");
  if (overlay.empty()) {
    overlay = treeG
      .append("g")
      .attr("class", "tt-traverse-overlay")
      .style("pointer-events", "none");
  } else {
    overlay.selectAll("*").remove();
  }
  overlay.raise();

  const normalizeNodeId = (id: string) => {
    const i = id.indexOf("#");
    return i === -1 ? id : id.slice(0, i);
  };
  const getCenter = (id: string) => nodePositions.get(id) ?? { x: 0, y: 0 };

  const startNodeId = normalizeNodeId(order[0].id);
  const start = getCenter(startNodeId);
  const runner = overlay
    .append("circle")
    .attr("class", "tt-runner")
    .attr("r", runnerRadius)
    .attr("cx", start.x)
    .attr("cy", start.y)
    .attr("fill", "url(#ttRunnerGrad)")
    .attr("filter", "url(#ttRunnerGlow)")
    .style("opacity", 0.95);

  const allNodes = treeG.selectAll<SVGGElement, unknown>("g.node");

  const ensureBandLabel = (rawId: string, i: number, value: string) => {
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
        .text(value);
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
        gNode.select<SVGRectElement>("rect.tt-box").node() ||
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
        const sel = d3.select(rect);
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
    console.error("[animateTwoThreeTraversal]", e);
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



/** Desplaza todo el subárbol (id incluido) en X. */
function shiftSubtreeX(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  rootId: string,
  dx: number,
  nodePositions: Map<string, { x: number; y: number }>
) {
  const g = treeG.select<SVGGElement>(`g#${rootId}`);
  const datum = g.datum() as
    | d3.HierarchyNode<HierarchyNodeData<number[]>>
    | undefined;
  if (!datum) return;
  const ids = datum.descendants().map((d) => d.data.id);
  ids.forEach((id) => {
    const p = nodePositions.get(id);
    if (p) p.x += dx;
  });
}

/** Mide ancho real del nodo (reutiliza BBox si no hay data-box-*) */
function readNodeWidth(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  id: string
) {
  const g = treeG.select<SVGGElement>(`g#${id}`);
  const wAttr = +(g.attr("data-box-w") || 0);
  if (wAttr > 0) return wAttr;
  const rect =
    g.select<SVGRectElement>("rect.tt-box").node() ||
    g.select<SVGRectElement>("rect").node();
  if (rect) {
    const w = (rect as SVGGraphicsElement).getBBox().width;
    g.attr("data-box-w", w); // cacheamos
    return w;
  }
  return 56;
}

/** Span [minX,maxX] del SUBÁRBOL (usa posiciones actuales + anchos reales). */
function getSubtreeSpan(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  rootG: d3.Selection<SVGGElement, any, any, any>,
  nodePositions: Map<string, { x: number; y: number }>
) {
  const datum = rootG.datum() as
    | d3.HierarchyNode<HierarchyNodeData<number[]>>
    | undefined;
  if (!datum) return { min: 0, max: 0 };

  let min = Infinity;
  let max = -Infinity;

  for (const d of datum.descendants()) {
    const id = d.data.id;
    const p = nodePositions.get(id);
    if (!p) continue;
    const w = readNodeWidth(treeG, id);
    const l = p.x - w / 2;
    const r = p.x + w / 2;
    if (l < min) min = l;
    if (r > max) max = r;
  }
  if (!isFinite(min) || !isFinite(max)) return { min: 0, max: 0 };
  return { min, max };
}

/**
 * Padding mínimo entre subárboles hermanos.
 * Si treeG aún NO está listo (data-ready!=="1"), aplicamos recolocación instantánea (sin animar).
 */
export async function ensureSiblingPadding(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: d3.HierarchyNode<HierarchyNodeData<number[]>>[],
  links: TreeLinkData[],
  nodePositions: Map<string, { x: number; y: number }>,
  minGap = 18
) {
  const parents = Array.from(
    new Set(
      nodes
        .map((n) => n.parent)
        .filter((p): p is d3.HierarchyNode<HierarchyNodeData<number[]>> => !!p)
    )
  );

  for (const parent of parents) {
    const children = (parent.children ?? []).filter(
      (c) => !c.data.isPlaceholder
    );
    if (children.length < 2) continue;

    // Orden por X actual
    children.sort(
      (a, b) =>
        (nodePositions.get(a.data.id)?.x ?? 0) -
        (nodePositions.get(b.data.id)?.x ?? 0)
    );

    // Barrido: subárbol i vs subárbol i+1
    for (let i = 0; i < children.length - 1; i++) {
      const L = children[i];
      const R = children[i + 1];

      const gL = treeG.select<SVGGElement>(`g#${L.data.id}`);
      const gR = treeG.select<SVGGElement>(`g#${R.data.id}`);

      const spanL = getSubtreeSpan(treeG, gL, nodePositions); // [min,max] del subárbol L
      const spanR = getSubtreeSpan(treeG, gR, nodePositions); // [min,max] del subárbol R

      const gap = spanR.min - spanL.max;
      if (gap < minGap) {
        const dx = minGap - gap;
        // Mueve TODO el subárbol derecho
        shiftSubtreeX(treeG, R.data.id, dx, nodePositions);
        // IMPORTANTÍSIMO: como R se movió, también empuja a los siguientes hermanos
        for (let j = i + 2; j < children.length; j++) {
          shiftSubtreeX(treeG, children[j].data.id, dx, nodePositions);
        }
      }
    }
  }

  // Aplicar en DOM
  const ready = treeG.attr("data-ready") === "1";
  if (!ready) {
    applyPositionsInstant(treeG as any, nodes as any, links, nodePositions);
    return;
  }
  await repositionTwoThreeTreeNodes(
    treeG as any,
    nodes as any,
    links,
    nodePositions
  );
}
