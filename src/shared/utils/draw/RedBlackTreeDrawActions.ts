// src/shared/utils/draw/RedBlackTreeDrawActions.ts
import * as d3 from "d3";
import { HierarchyNode } from "d3";
import { HierarchyNodeData, TreeLinkData } from "../../../types";
import {
  SVG_BINARY_TREE_VALUES,
  SVG_STYLE_VALUES,
} from "../../constants/consts";

// Usa los tipos canónicos del proyecto
import type { RbRotation, RbRecolor } from "../../../types";

/* ─────────────────────────── Constantes visuales ─────────────────────────── */

const RB_COLORS = {
  red: "#ff5a66", // un rojo más vibrante
  redRing: "#ff9aa1",
  black: "#1f2430", // negro suave que combina con fondo dark
  blackRing: "#4b5365",
  stroke: "#95a1bf",
  textOnNode: "#ffffff",
  highlight: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR,
  badgeBg: "#0f141d",
  badgeStroke: "#f4bf50",
};

const radius = SVG_BINARY_TREE_VALUES.NODE_RADIUS;

const RB_ANIM = {
  popIn: 240,
  popSettle: 180,
  recolor: 360,
  flash: 180,
  reflow: 900,
  badgeShow: 220,
  badgeLife: 1200,
  badgeHide: 300,
  easeIn: d3.easeCubicIn,
  easeOut: d3.easeCubicOut,
  easeIO: d3.easeCubicInOut,
  easeBack: d3.easeBackOut.overshoot(1.5),
};
type RotationLike =
  | { dir: "left" | "right"; childId?: string }
  | { type: "L" | "R" | "left" | "right"; childId?: string };

function getRotationDir(r: RotationLike): "left" | "right" {
  if ("dir" in r && (r.dir === "left" || r.dir === "right")) return r.dir;
  if ("type" in r) {
    const t = r.type;
    if (t === "L" || t === "left") return "left";
    if (t === "R" || t === "right") return "right";
  }
  // fallback seguro
  return "left";
}

/* ─────────────────────────── Defs: sombras, glows, gradientes ─────────────────────────── */

function ensureRBDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Sombra de nodo
  if (defs.select("#rbNodeShadow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "rbNodeShadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    f.append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 2.2)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.35);
  }

  // Glow (aplicado al halo)
  if (defs.select("#rbGlow").empty()) {
    const f = defs
      .append("filter")
      .attr("id", "rbGlow")
      .attr("x", "-80%")
      .attr("y", "-80%")
      .attr("width", "260%")
      .attr("height", "260%");
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 5);
    const merge = f.append("feMerge");
    merge.append("feMergeNode");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
  }

  // Gradiente del aro (ring) rojo
  if (defs.select("#rbRingRed").empty()) {
    const g = defs.append("radialGradient").attr("id", "rbRingRed");
    g.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", RB_COLORS.redRing)
      .attr("stop-opacity", 0.95);
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", RB_COLORS.red)
      .attr("stop-opacity", 0.9);
  }

  // Gradiente del aro (ring) negro
  if (defs.select("#rbRingBlack").empty()) {
    const g = defs.append("radialGradient").attr("id", "rbRingBlack");
    g.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", RB_COLORS.blackRing)
      .attr("stop-opacity", 0.9);
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", RB_COLORS.blackRing)
      .attr("stop-opacity", 0.6);
  }
}

/* ─────────────────────────── Util: rutas curvas para enlaces ─────────────────────────── */

function curvedPath(
  s: { x: number; y: number },
  t: { x: number; y: number },
  r: number
) {
  const y1 = s.y + r;
  const y2 = t.y - r;
  const midY = (y1 + y2) / 2;
  return `M${s.x},${y1} C ${s.x},${midY} ${t.x},${midY} ${t.x},${y2}`;
}

/* ─────────────────────────── Dibujo de NODOS RB ─────────────────────────── */

export function drawRBTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  positions: Map<string, { x: number; y: number }>
) {
  const svg = d3.select(g.node()!.ownerSVGElement as SVGSVGElement);
  ensureRBDefs(svg);

  g.selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
    .data(nodes, (d) => d.data.id)
    .join(
      (enter) => {
        const gEnter = enter
          .append("g")
          .attr("class", "node")
          .attr("id", (d) => d.data.id)
          .attr("transform", (d) => {
            const x = d.x!;
            const y = d.y!;
            positions.set(d.data.id, { x, y });
            return `translate(${x}, ${y})`;
          });

        // Halo (glow), va detrás
        gEnter
          .append("circle")
          .attr("class", "node-halo")
          .attr("r", radius * 1.45)
          .attr("fill", (d) =>
            (d.data.color ?? "black") === "red"
              ? RB_COLORS.red
              : RB_COLORS.black
          )
          .attr("opacity", 0)
          .attr("filter", "url(#rbGlow)");

        // Círculo principal
        gEnter
          .append("circle")
          .attr("class", "node-container")
          .attr("r", radius)
          .attr("fill", (d) =>
            (d.data.color ?? "black") === "red"
              ? RB_COLORS.red
              : RB_COLORS.black
          )
          .attr("stroke", RB_COLORS.stroke)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          .attr("filter", "url(#rbNodeShadow)");

        // Aro (ring) decorativo
        gEnter
          .append("circle")
          .attr("class", "node-ring")
          .attr("r", radius + 2.5)
          .attr("fill", "none")
          .attr("stroke", (d) =>
            (d.data.color ?? "black") === "red"
              ? "url(#rbRingRed)"
              : "url(#rbRingBlack)"
          )
          .attr("stroke-width", 1.75)
          .attr("opacity", 0.9);

        // Valor
        gEnter
          .append("text")
          .attr("class", "node-value")
          .attr("text-anchor", "middle")
          .attr("fill", RB_COLORS.textOnNode)
          .style("font-weight", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_SIZE)
          .text((d) => d.data.value ?? 0);

        return gEnter;
      },
      (update) => {
        update.each((d) => {
          positions.set(d.data.id, { x: d.x!, y: d.y! });
        });

        update
          .select<SVGCircleElement>(".node-container")
          .transition()
          .duration(RB_ANIM.recolor)
          .ease(RB_ANIM.easeIO)
          .attr("fill", (d) =>
            (d.data.color ?? "black") === "red"
              ? RB_COLORS.red
              : RB_COLORS.black
          );

        update
          .select<SVGCircleElement>(".node-ring")
          .attr("stroke", (d) =>
            (d.data.color ?? "black") === "red"
              ? "url(#rbRingRed)"
              : "url(#rbRingBlack)"
          );

        update
          .select<SVGTextElement>(".node-value")
          .text((d) => d.data.value ?? 0);

        return update;
      },
      (exit) => exit
    );
}

/* ─────────────────────────── Dibujo de ENLACES RB (curvos) ─────────────────────────── */

export function drawTreeLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>
) {
  const svg = d3.select(g.node()!.ownerSVGElement as SVGSVGElement);
  ensureRBDefs(svg);

  g.selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(linksData, (d) => `link-${d.sourceId}-${d.targetId}`)
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
          .attr("stroke", RB_COLORS.blackRing)
          .attr("stroke-width", 1.6)
          .attr("opacity", 0.9)
          .attr("d", (d) => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            return curvedPath(s, t, radius);
          });

        return gLink;
      },
      (update) => {
        update
          .select<SVGPathElement>("path.tree-link")
          .transition()
          .duration(RB_ANIM.reflow)
          .ease(RB_ANIM.easeIO)
          .attr("d", (d) => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            return curvedPath(s, t, radius);
          });
        return update;
      },
      (exit) => exit.transition().duration(260).style("opacity", 0).remove()
    );
}

/* ─────────────────────────── Reflow (nodos + enlaces curvos) ─────────────────────────── */

async function repositionRBTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  linksData: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>
) {
  const nodesToMove = g
    .selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
    .data(nodes, (d) => d.data.id);

  const p1 = nodesToMove
    .transition()
    .duration(RB_ANIM.reflow)
    .ease(RB_ANIM.easeIO)
    .attr("transform", (d) => {
      const finalPos = positions.get(d.data.id)!;
      return `translate(${finalPos.x}, ${finalPos.y})`;
    })
    .end();

  const linksToAdjust = g
    .selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(linksData, (d) => `link-${d.sourceId}-${d.targetId}`);

  const p2 = linksToAdjust
    .select<SVGPathElement>("path.tree-link")
    .transition()
    .duration(RB_ANIM.reflow)
    .ease(RB_ANIM.easeIO)
    .attr("d", (d) => {
      const s = positions.get(d.sourceId)!;
      const t = positions.get(d.targetId)!;
      return curvedPath(s, t, radius);
    })
    .end();

  await Promise.all([p1, p2]);
}

/* ───────────────────────────── Hints pedagógicos RB ───────────────────────────── */

function badge(
  parent: d3.Selection<SVGGElement | SVGSVGElement, unknown, null, undefined>,
  x: number,
  y: number,
  text: string,
  stroke: string
) {
  const g = parent
    .append("g")
    .attr("transform", `translate(${x},${y}) scale(0.92)`)
    .style("opacity", 0);

  const w = 60,
    h = 22,
    rx = 10;
  g.append("rect")
    .attr("width", w)
    .attr("height", h)
    .attr("x", -w / 2)
    .attr("y", -h)
    .attr("rx", rx)
    .attr("ry", rx)
    .attr("fill", RB_COLORS.badgeBg)
    .attr("stroke", stroke)
    .attr("stroke-width", 1.1);

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -h / 2 + 1)
    .style("font-size", "12px")
    .style("font-weight", 800)
    .attr("fill", stroke)
    .text(text);

  g.transition()
    .duration(RB_ANIM.badgeShow)
    .ease(RB_ANIM.easeOut)
    .style("opacity", 1)
    .attr("transform", `translate(${x},${y}) scale(1)`)
    .transition()
    .delay(RB_ANIM.badgeLife)
    .duration(RB_ANIM.badgeHide)
    .ease(RB_ANIM.easeIn)
    .style("opacity", 0)
    .remove();
}

function flashNode(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  id: string,
  color?: string
) {
  const sel = treeG.select<SVGCircleElement>(`g#${id} circle.node-container`);
  if (sel.empty()) return;
  const original = sel.attr("stroke");
  sel
    .transition()
    .duration(RB_ANIM.flash)
    .attr("stroke", color ?? RB_COLORS.highlight)
    .attr("stroke-width", 3)
    .transition()
    .duration(RB_ANIM.flash)
    .attr("stroke", original)
    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);
}

/** Muestra pasos de fix-up: recoloreos y rotaciones (badges + destellos) */
export function showRbFixSteps(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  rbFix:
    | {
        rotations: (RbRotation & { childId?: string })[];
        recolors: RbRecolor[];
      }
    | null
    | undefined,
  nodePositions: Map<string, { x: number; y: number }>,
  treeOffset: { x: number; y: number }
) {
  svg.selectAll("g.rb-fix-hint").remove();
  if (!rbFix) return;

  const layer = svg.append("g").attr("class", "rb-fix-hint");

  // Recoloreos (fade del fill)
  (rbFix.recolors ?? []).forEach((rc, idx) => {
    const pos = nodePositions.get(rc.id);
    if (!pos) return;
    badge(
      layer,
      treeOffset.x + pos.x,
      treeOffset.y + pos.y - (radius + 22 + idx * 22),
      rc.to === "red" ? "recolor → RED" : "recolor → BLACK",
      rc.to === "red" ? RB_COLORS.red : "#8aa0ff"
    );

    const circle = treeG.select<SVGCircleElement>(
      `g#${rc.id} circle.node-container`
    );
    const ring = treeG.select<SVGCircleElement>(`g#${rc.id} circle.node-ring`);
    const halo = treeG.select<SVGCircleElement>(`g#${rc.id} circle.node-halo`);
    const toFill = rc.to === "red" ? RB_COLORS.red : RB_COLORS.black;
    const toRing = rc.to === "red" ? "url(#rbRingRed)" : "url(#rbRingBlack)";

    circle
      .transition()
      .delay(140 * idx)
      .duration(RB_ANIM.recolor)
      .attr("fill", toFill);
    ring
      .transition()
      .delay(140 * idx)
      .duration(RB_ANIM.recolor)
      .attr("stroke", toRing);
    halo
      .attr("fill", toFill)
      .transition()
      .delay(140 * idx)
      .duration(RB_ANIM.recolor)
      .attr("opacity", 0.35)
      .transition()
      .duration(380)
      .attr("opacity", 0);
  });

  // Rotaciones (destello en pivote y child opcional)
  (rbFix.rotations ?? []).forEach((rot, idx) => {
    const p = nodePositions.get(rot.pivotId);
    if (!p) return;
    const dir = getRotationDir(rot as any);
    const label = dir === "left" ? "rotate ⟲" : "rotate ⟳";
    badge(
      layer,
      treeOffset.x + p.x,
      treeOffset.y +
        p.y -
        (radius + 24 + (rbFix.recolors?.length ?? 0) * 22 + idx * 24),
      label,
      RB_COLORS.badgeStroke
    );
    flashNode(treeG, rot.pivotId);
    (rot as any).childId && flashNode(treeG, (rot as any).childId);
  });
}

/* ───────────────────── Animación de Inserción (RB) ───────────────────── */

export async function animateRBInsertNode(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  params: {
    newNodeId: string;
    parentId: string | null;
    nodesData: HierarchyNode<HierarchyNodeData<number>>[];
    linksData: TreeLinkData[];
    pathToParent: HierarchyNode<HierarchyNodeData<number>>[];
  },
  nodePositions: Map<string, { x: number; y: number }>,
  treeOffset: { x: number; y: number },
  rbFix?: {
    rotations: (RbRotation & { childId?: string })[];
    recolors: RbRecolor[];
  } | null,
  resetQueryValues?: () => void,
  setIsAnimating?: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    // 1) Resalta camino al padre
    for (const step of params.pathToParent) {
      const c = treeG.select<SVGCircleElement>(
        `g#${step.data.id} circle.node-container`
      );
      if (c.empty()) continue;
      const orig = c.attr("stroke");
      await c
        .transition()
        .duration(RB_ANIM.flash)
        .ease(RB_ANIM.easeOut)
        .attr("stroke", RB_COLORS.highlight)
        .attr("stroke-width", 3)
        .transition()
        .duration(RB_ANIM.flash)
        .ease(RB_ANIM.easeIn)
        .attr("stroke", orig)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end();
    }

    // 2) Pop + halo del nuevo nodo
    const newG = treeG.select<SVGGElement>(`g#${params.newNodeId}`);
    if (!newG.empty()) {
      const circle = newG.select<SVGCircleElement>("circle.node-container");
      const halo = newG.select<SVGCircleElement>("circle.node-halo");

      await circle
        .attr("r", radius * 0.7)
        .transition()
        .duration(RB_ANIM.popIn)
        .ease(RB_ANIM.easeBack)
        .attr("r", radius * 1.16)
        .transition()
        .duration(RB_ANIM.popSettle)
        .ease(RB_ANIM.easeOut)
        .attr("r", radius)
        .end();

      halo
        .attr("opacity", 0.45)
        .transition()
        .duration(420)
        .ease(RB_ANIM.easeOut)
        .attr("opacity", 0);
    }

    // 3) Reflow de nodos + enlaces curvos
    await repositionRBTreeNodes(
      treeG,
      params.nodesData,
      params.linksData,
      nodePositions
    );

    // 4) Hints de fix-up
    if (rbFix) {
      ensureRBDefs(svg);
      showRbFixSteps(svg, treeG, rbFix, nodePositions, treeOffset);
    }
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}

/* ───────────────────── Animación de Eliminación (RB) ───────────────────── */

export async function animateRBDeleteNode(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  params: {
    prevRootNode: HierarchyNode<HierarchyNodeData<number>>;
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>;
    nodeToUpdate: HierarchyNode<HierarchyNodeData<number>> | null;
    remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
    remainingLinksData: TreeLinkData[];
  },
  nodePositions: Map<string, { x: number; y: number }>,
  treeOffset: { x: number; y: number },
  rbFix?: {
    rotations: (RbRotation & { childId?: string })[];
    recolors: RbRecolor[];
  } | null,
  resetQueryValues?: () => void,
  setIsAnimating?: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    // 1) Fade-out del nodo eliminado (usando frame previo)
    const gOld = treeG.select<SVGGElement>(`g#${params.nodeToDelete.data.id}`);
    if (!gOld.empty()) {
      await gOld.transition().duration(320).style("opacity", 0.15).end();
    }

    // 2) Si hubo copia de valor, pequeño flash en el actualizado
    if (params.nodeToUpdate) {
      flashNode(treeG, params.nodeToUpdate.data.id);
    }

    // 3) Reflow con enlaces curvos
    await repositionRBTreeNodes(
      treeG,
      params.remainingNodesData,
      params.remainingLinksData,
      nodePositions
    );

    // 4) Hints de fix-up post-delete
    if (rbFix) {
      ensureRBDefs(svg);
      showRbFixSteps(svg, treeG, rbFix, nodePositions, treeOffset);
    }
  } finally {
    resetQueryValues?.();
    setIsAnimating?.(false);
  }
}
