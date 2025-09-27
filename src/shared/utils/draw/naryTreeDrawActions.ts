// src/shared/utils/draw/NaryTreeDrawActions.ts
import * as d3 from "d3";
import { HierarchyNode } from "d3";
import { HierarchyNodeData, TreeLinkData } from "../../../types";

import {
  SVG_NARY_VALUES,
  curvedLinkPath,
  repositionTreeNodes as baseReposition,
  drawTreeLinks as baseDrawLinks,
  ensureNaryNeoDefs,
  drawNaryNodesNeo,
} from "./naryDrawActionsUtilities";

/* ─────────────────────────── Visual & timing ─────────────────────────── */
const R = SVG_NARY_VALUES.NODE_RADIUS;

const NARY_ANIM = {
  popIn: 220,
  popSettle: 180,
  flash: 160,
  reflow: 900,
  arrowIn: 200,
  arrowOut: 200,
  easeIn: d3.easeCubicIn,
  easeOut: d3.easeCubicOut,
  easeIO: d3.easeCubicInOut,
  easeBack: d3.easeBackOut.overshoot(1.4),
};

/* ─────────────────────────── Defs mínimos (flecha) ─────────────────────────── */
function ensureArrowDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  if (defs.select("#naryArrowHead").empty()) {
    const marker = defs
      .append<SVGMarkerElement>("marker")
      .attr("id", "naryArrowHead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto-start-reverse");
    marker
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#8aa0ff");
  }
}

/* ─────────────────────────── Defs extra para search (glow + grad) ─────────────────────────── */
function ensureSearchDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Glow para nodo activo
  if (defs.select("#narySearchGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "narySearchGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 3.5)
      .attr("result", "blur");
    const merge = f.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
  }

  // Gradiente de la línea (un toque sutil)
  if (defs.select("#narySearchStrokeGrad").empty()) {
    const g = defs.append("linearGradient").attr("id", "narySearchStrokeGrad");
    g.append("stop").attr("offset", "0%").attr("stop-color", "#60a5fa"); // azul-400
    g.append("stop").attr("offset", "100%").attr("stop-color", "#22d3ee"); // cyan-400
  }
}



/* ─────────────────────────── SKIN: defs públicos ─────────────────────────── */
// Llama a esto una vez por SVG antes de dibujar nodos
export function ensureNarySkinDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  ensureNaryNeoDefs(svg);
}

/* ─────────────────────────── Dibujo de nodos N-ario (con skin) ───────────────────────────
   Mantiene el mismo nombre/forma pública, pero:
   - actualiza el Map de posiciones con d.x/d.y,
   - delega a la skin drawNaryNodesNeo (anillo+gradiente+sombra+meta).
*/
export function drawNaryTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  positions: Map<string, { x: number; y: number }>
) {
  // sincronizamos el Map con el layout actual
  nodes.forEach((d) => {
    positions.set(d.data.id, { x: d.x!, y: d.y! });
  });

  // dibuja con la skin “neo”
  drawNaryNodesNeo(g, nodes as any, positions);
}

/* ─────────────────────────── Enlaces curvos (reexport conveniencia) ─────────────────────────── */
export const drawTreeLinks = baseDrawLinks;

/* ─────────────────────────── Helpers locales ─────────────────────────── */
function flashStroke(
  nodeSel: d3.Selection<
    SVGCircleElement | SVGRectElement,
    unknown,
    null,
    undefined
  >,
  color = SVG_NARY_VALUES.HIGHLIGHT_COLOR
) {
  const orig = {
    stroke: nodeSel.attr("stroke"),
    width: nodeSel.attr("stroke-width"),
  };
  return nodeSel
    .transition()
    .duration(NARY_ANIM.flash)
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .transition()
    .duration(NARY_ANIM.flash)
    .attr("stroke", orig.stroke ?? "#1f2937")
    .attr("stroke-width", orig.width ?? 1.2)
    .end();
}

function pulseRing(
  parentG: d3.Selection<SVGGElement, unknown, null, undefined>,
  color = "#8aa0ff",
  r0 = R
) {
  return parentG
    .append("circle")
    .attr("class", "pulse-ring")
    .attr("r", r0 + 2)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 2)
    .style("opacity", 0.9)
    .transition()
    .duration(420)
    .attr("r", r0 + 12)
    .style("opacity", 0)
    .remove()
    .end();
}

/* ─────────────────────────── Crear raíz ─────────────────────────── */
export async function animateNaryCreateRoot(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  rootId: string,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);
    const g = treeG.select<SVGGElement>(`g#${rootId}`);
    if (g.empty()) return;

    const circle =
      g.select<SVGCircleElement>("circle.node-container").node() ??
      g.select<SVGRectElement>("rect").node();

    if (circle && circle instanceof SVGCircleElement) {
      await d3
        .select<SVGCircleElement, unknown>(circle)
        .attr("r", R * 0.7)
        .transition()
        .duration(NARY_ANIM.popIn)
        .ease(NARY_ANIM.easeBack)
        .attr("r", R * 1.14)
        .transition()
        .duration(NARY_ANIM.popSettle)
        .ease(NARY_ANIM.easeOut)
        .attr("r", R)
        .end();
    } else if (circle) {
      const sel = d3.select(circle);
      await sel
        .transition()
        .duration(NARY_ANIM.popIn)
        .ease(NARY_ANIM.easeBack)
        .attr("transform", "scale(1.06)")
        .transition()
        .duration(NARY_ANIM.popSettle)
        .ease(NARY_ANIM.easeOut)
        .attr("transform", "scale(1)")
        .end();
    }
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Insertar hijo ─────────────────────────── */
export async function animateNaryInsertChild(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    newNodeId: string;
    parentId: string | null;
    nodesData: HierarchyNode<HierarchyNodeData<number>>[];
    linksData: TreeLinkData[];
    pathToParent?: HierarchyNode<HierarchyNodeData<number>>[]; // opcional, si quieres resaltar camino al padre
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);

    // 1) Resalte opcional de camino al padre
    if (params.pathToParent && params.pathToParent.length) {
      for (const step of params.pathToParent) {
        const sel =
          treeG.select<SVGCircleElement>(`g#${step.data.id} circle`).node() ??
          treeG.select<SVGRectElement>(`g#${step.data.id} rect`).node();
        if (!sel) continue;
        await flashStroke(d3.select(sel as any));
      }
    }

    // 2) Pop del nuevo nodo
    const newG = treeG.select<SVGGElement>(`g#${params.newNodeId}`);
    if (!newG.empty()) {
      const shape =
        newG.select<SVGCircleElement>("circle.node-container").node() ??
        newG.select<SVGRectElement>("rect").node();

      if (shape instanceof SVGCircleElement) {
        await d3
          .select<SVGCircleElement, unknown>(shape)
          .attr("r", R * 0.7)
          .transition()
          .duration(NARY_ANIM.popIn)
          .ease(NARY_ANIM.easeBack)
          .attr("r", R * 1.12)
          .transition()
          .duration(NARY_ANIM.popSettle)
          .ease(NARY_ANIM.easeOut)
          .attr("r", R)
          .end();
      } else if (shape) {
        const sel = d3.select(shape);
        await sel
          .transition()
          .duration(NARY_ANIM.popIn)
          .ease(NARY_ANIM.easeBack)
          .attr("transform", "scale(1.06)")
          .transition()
          .duration(NARY_ANIM.popSettle)
          .ease(NARY_ANIM.easeOut)
          .attr("transform", "scale(1)")
          .end();
      }

      // pulso
      await pulseRing(newG);
    }

    // 3) Reflow global
    await baseReposition(
      treeG,
      params.nodesData,
      params.linksData,
      nodePositions
    );
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Eliminar nodo (subárbol) ─────────────────────────── */
export async function animateNaryDeleteNode(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  params: {
    prevRootNode: HierarchyNode<HierarchyNodeData<number>>;
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>; // del árbol previo
    remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
    remainingLinksData: TreeLinkData[];
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);

    // 1) En el frame previo, apaga el subárbol que se va
    const sub = params.nodeToDelete.descendants();
    for (let i = 0; i < sub.length; i++) {
      const g = treeG.select<SVGGElement>(`g#${sub[i].data.id}`);
      if (g.empty()) continue;
      await g
        .transition()
        .duration(180)
        .delay(i * 22)
        .style("opacity", 0.15)
        .end();
    }

    // 2) Reflow con los nodos restantes
    await baseReposition(
      treeG,
      params.remainingNodesData,
      params.remainingLinksData,
      nodePositions
    );
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Mover subárbol ─────────────────────────── */
export async function animateNaryMoveNode(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  params: {
    movedNodeId: string;
    oldParentId?: string | null; // opcional
    newParentId: string;
    nodesData: HierarchyNode<HierarchyNodeData<number>>[];
    linksData: TreeLinkData[];
  },
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);
    ensureArrowDefs(svg);

    const movedG = treeG.select<SVGGElement>(`g#${params.movedNodeId}`);
    const oldP = params.oldParentId
      ? (nodePositions.get(params.oldParentId) ?? null)
      : null;
    const newP = nodePositions.get(params.newParentId) ?? null;

    // 1) Flash en viejo y nuevo padre (si hay)
    if (params.oldParentId) {
      const sel =
        treeG
          .select<SVGCircleElement>(`g#${params.oldParentId} circle`)
          .node() ??
        treeG.select<SVGRectElement>(`g#${params.oldParentId} rect`).node();
      if (sel) await flashStroke(d3.select(sel as any));
    }
    {
      const sel =
        treeG
          .select<SVGCircleElement>(`g#${params.newParentId} circle`)
          .node() ??
        treeG.select<SVGRectElement>(`g#${params.newParentId} rect`).node();
      if (sel) await flashStroke(d3.select(sel as any), "#8aa0ff");
    }

    // 2) Flecha indicativa old→new (si se conoce old)
    if (oldP && newP) {
      let overlay = svg.select<SVGGElement>("g.nary-move-overlay");
      if (overlay.empty())
        overlay = svg
          .append("g")
          .attr("class", "nary-move-overlay")
          .style("pointer-events", "none");

      const arrow = overlay
        .append("path")
        .attr("d", `M ${oldP.x} ${oldP.y} L ${newP.x} ${newP.y}`)
        .attr("fill", "none")
        .attr("stroke", "#8aa0ff")
        .attr("stroke-width", 1.6)
        .attr("opacity", 0)
        .attr("marker-end", "url(#naryArrowHead)");

      await arrow
        .transition()
        .duration(NARY_ANIM.arrowIn)
        .style("opacity", 1)
        .transition()
        .delay(250)
        .duration(NARY_ANIM.arrowOut)
        .style("opacity", 0)
        .remove()
        .end();
    }

    // 3) Pequeño pulso en el subárbol movido
    if (!movedG.empty()) {
      await pulseRing(movedG, "#8aa0ff");
    }

    // 4) Reflow a nuevas posiciones
    await baseReposition(
      treeG,
      params.nodesData,
      params.linksData,
      nodePositions
    );
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Actualizar valor ─────────────────────────── */
/* ───────── Actualizar valor (ripple + pop) ───────── */
export async function animateNaryUpdateValue(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  resetQueryValues?: () => void,
  setIsAnimating?: (b: boolean) => void
) {
  try {
    setIsAnimating?.(true);
    const g = treeG.select<SVGGElement>(`g#${id}`);
    if (g.empty()) return;

    // Soporta skin neo: círculo interior = .disc
    const shape =
      g.select<SVGCircleElement>("circle.disc").node() ||
      g.select<SVGCircleElement>("circle.node-container").node() ||
      g.select<SVGRectElement>("rect").node();

    // 1) flash breve en el borde
    if (shape) {
      const sel = d3.select(shape as any);
      const origStroke = sel.attr("stroke");
      const origW = sel.attr("stroke-width");
      await sel
        .transition()
        .duration(220)
        .attr("stroke", "#22d3ee")
        .attr("stroke-width", (+origW || 1.5) + 1)
        .transition()
        .duration(220)
        .attr("stroke", origStroke ?? null)
        .attr("stroke-width", origW ?? null)
        .end();

      // 2) ripples
      const r0 =
        shape instanceof SVGCircleElement
          ? +(shape.getAttribute("r") || 18)
          : 18;

      for (let i = 0; i < 2; i++) {
        await g
          .append("circle")
          .attr("class", "update-ring")
          .attr("r", r0 + 2)
          .attr("fill", "none")
          .attr("stroke", "#22d3ee")
          .attr("stroke-width", 2)
          .style("opacity", 0.85)
          .transition()
          .delay(i * 90)
          .duration(360)
          .ease(d3.easeCubicOut)
          .attr("r", r0 + 16)
          .style("opacity", 0)
          .remove()
          .end();
      }
    }

    // 3) “pop” del número
    const valueText = g.select<SVGTextElement>("text.value");
    if (!valueText.empty()) {
      const curSize = parseFloat(valueText.style("font-size") || "12");
      await valueText
        .transition()
        .duration(220)
        .ease(d3.easeBackOut.overshoot(1.3))
        .style("font-size", `${curSize * 1.22}px`)
        .transition()
        .duration(220)
        .ease(d3.easeCubicOut)
        .style("font-size", `${curSize}px`)
        .end();
    }

    // 4) pequeño flash al badge si existe
    const badge = g.select<SVGRectElement>("g.meta-badge rect.meta-bg");
    if (!badge.empty()) {
      await badge
        .transition()
        .duration(180)
        .style("filter", "brightness(1.35)")
        .end();
      await badge.transition().duration(180).style("filter", null).end();
    }
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Búsqueda (por valor o id) ─────────────────────────── */
export async function animateNarySearchPath(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: HierarchyNode<HierarchyNodeData<number>>[], // camino raíz→encontrado
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
    ensureArrowDefs(svg);
    ensureSearchDefs(svg);

    // Capa overlay para hops
    let overlay = svg.select<SVGGElement>("g.nary-search-overlay");
    if (overlay.empty())
      overlay = svg
        .append("g")
        .attr("class", "nary-search-overlay")
        .style("pointer-events", "none");

    // 0) Atenúa todo el árbol (contexto)
    const allNodes = treeG.selectAll<SVGGElement, unknown>("g.node");
    await allNodes.transition().duration(160).style("opacity", 0.35).end();

    // Recorre el camino destacando cada paso
    for (let i = 0; i < path.length; i++) {
      const id = path[i].data.id;
      const p = nodePositions.get(id);
      if (!p) continue;

      const gNode = treeG.select<SVGGElement>(`g#${id}`);
      const disc =
        gNode.select<SVGCircleElement>("circle.disc").node() ||
        gNode.select<SVGCircleElement>("circle").node() ||
        gNode.select<SVGRectElement>("rect").node();

      // 1) Subir opacidad y glow del nodo activo
      await gNode.transition().duration(120).style("opacity", 1).end();

      if (disc) {
        const s = d3.select(disc as any);

        // flash de borde + glow
        const origStroke = s.attr("stroke");
        const origW = s.attr("stroke-width");

        await s
          .transition()
          .duration(160)
          .attr("stroke", "#60a5fa")
          .attr("stroke-width", (+origW || 1.5) + 1)
          .end();

        // pequeño pop si es un círculo
        if (disc instanceof SVGCircleElement) {
          const r0 = +(disc.getAttribute("r") || 18);
          await s
            .transition()
            .duration(160)
            .ease(d3.easeBackOut.overshoot(1.25))
            .attr("r", r0 * 1.08)
            .transition()
            .duration(160)
            .ease(d3.easeCubicOut)
            .attr("r", r0)
            .end();
        }

        // glow ON por un instante
        s.attr("filter", "url(#narySearchGlow)");
        await d3.timeout(() => undefined, 120);
        s.attr("filter", null);

        // restauro stroke suave
        await s
          .transition()
          .duration(160)
          .attr("stroke", origStroke ?? null)
          .attr("stroke-width", origW ?? null)
          .end();
      }

      // 2) Línea animada al siguiente paso
      if (i < path.length - 1) {
     
        // vuelve a 0.6 el nodo ya “visitado” (deja foco visual en el siguiente)
        if (i < path.length - 1) {
          await gNode.transition().duration(100).style("opacity", 0.6).end();
        }
      }
    }

    // Nodo final (target): pulso + badge flash
    const lastId = path[path.length - 1].data.id;
    const lastG = treeG.select<SVGGElement>(`g#${lastId}`);

    // pulso final
    await lastG
      .append("circle")
      .attr("class", "target-ring")
      .attr("r", R + 2)
      .attr("fill", "none")
      .attr("stroke", "#22d3ee")
      .attr("stroke-width", 2)
      .style("opacity", 0.9)
      .transition()
      .duration(460)
      .ease(d3.easeCubicOut)
      .attr("r", R + 16)
      .style("opacity", 0)
      .remove()
      .end();

    // badge flash si existe
    const badgeRect = lastG.select<SVGRectElement>("g.meta-badge rect.meta-bg");
    if (!badgeRect.empty()) {
      await badgeRect
        .transition()
        .duration(180)
        .style("filter", "brightness(1.35)")
        .end();
      await badgeRect.transition().duration(180).style("filter", null).end();
    }

    // Limpieza y restauración
    overlay.selectAll("*").remove();
    await allNodes.transition().duration(160).style("opacity", 1).end();
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ─────────────────────────── Reflow público (por si quieres usarlo directo) ─────────────────────────── */
export async function repositionNaryTreeNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodesData: HierarchyNode<HierarchyNodeData<number>>[],
  linksData: TreeLinkData[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  await baseReposition(treeG, nodesData, linksData, nodePositions);
}

/* ─────────────────────────── PathBuilder público (por si deseas custom) ─────────────────────────── */
export const defaultNaryLinkPath = curvedLinkPath;
