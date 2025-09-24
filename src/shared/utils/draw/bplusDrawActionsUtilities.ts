// shared/utils/draw/bplusDrawActionsUtilities.ts
import * as d3 from "d3";
import { BPlusHierarchy, TreeLinkData } from "../../../types";
import { curvedLinkPath } from "./naryDrawActionsUtilities";

/* ──────────────────────────── Constantes SVG (skin dark slate+accent) ──────────────────────────── */
export const SVG_BPLUS_VALUES = {
  NODE_PAD_X: 12,
  NODE_PAD_Y: 8,
  SLOT_GAP: 8,
  SLOT_PAD_X: 6,
  SLOT_PAD_Y: 4,
  SLOT_CORNER: 10,

  SLOT_TEXT_SIZE: "12px",
  SLOT_TEXT_WEIGHT: 800,
  BADGE_FONT:
    "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  BADGE_WEIGHT: 600,

  // Skin (internos) — slate + emerald
  INT_BODY_FILL: "#334155", // slate-700
  INT_BODY_STROKE: "none",
  INT_BODY_STROKE_WIDTH: 0,
  INT_SLOT_FILL: "#10b981", // emerald-500
  INT_SLOT_STROKE: "none",
  INT_SLOT_STROKE_WIDTH: 0,
  INT_SLOT_TEXT: "#052e27", // teal oscuro

  // Skin (hojas) — slate + emerald border
  LEAF_BODY_FILL: "#1f2937", // slate-800
  LEAF_BODY_STROKE: "#34d399", // emerald-400
  LEAF_BODY_STROKE_WIDTH: 3,
  LEAF_SLOT_FILL: "#10b981", // emerald-500
  LEAF_SLOT_STROKE: "none",
  LEAF_SLOT_STROKE_WIDTH: 0,
  LEAF_SLOT_TEXT: "#052e27",

  // Badge
  BADGE_FILL: "#0b1220",
  BADGE_STROKE: "#334155",
  BADGE_STROKE_WIDTH: 0.9,
  BADGE_CORNER: 8,
  BADGE_OFFSET_Y: 8,

  // Enlaces padre→hijo
  LINK_STROKE: "#64748b", // slate-500
  LINK_STROKE_WIDTH: 2,
  LINK_HOVER_STROKE: "#94a3b8", // slate-400
  LINK_HOVER_WIDTH: 2.6,
  LINK_POINT_FILL: "#64748b",

  // Enlaces hoja↔hoja (belt)
  LEAF_LINK_STROKE: "#34d399", // emerald-400
  LEAF_LINK_DASH: "", // sin guiones
  LEAF_LINK_WIDTH: 3,

  // Glow/anim — tokens
  GLOW_COLOR: "#22d3ee", // cyan-400
  RANGE_HIGHLIGHT: "#22c55e", // green-500
  SCAN_HIGHLIGHT: "#38bdf8", // sky-400

  LINK_CORE_STROKE: "#60a5fa", // slate-400
  LINK_CORE_WIDTH: 2,
  LINK_HALO_STROKE: "rgba(2,6,23,0.38)", // slate-950 @ 38% (halo suave)
  LINK_HALO_WIDTH: 5,
  LINK_OPACITY: 0.95,
} as const;

/* ──────────────────────────── Links responsivos ──────────────────────────── */

/** Recalcula y pinta el `d` de TODOS los links en base a nodePositions actuales. */
export function redrawBPlusLinksResponsive(
  linksLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: d3.HierarchyNode<BPlusHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>,
  opts?: { stroke?: string; width?: number }
) {
  const { treeLinks, childIndexMap, nodeById } =
    buildBPlusLinksFromHierarchy(root);

  // Núcleo (color principal) — permite override por opts
  const CORE_STROKE =
    opts?.stroke ??
    (SVG_BPLUS_VALUES as any).LINK_CORE_STROKE ??
    SVG_BPLUS_VALUES.LINK_STROKE;

  const CORE_WIDTH =
    opts?.width ??
    (SVG_BPLUS_VALUES as any).LINK_CORE_WIDTH ??
    SVG_BPLUS_VALUES.LINK_STROKE_WIDTH;

  // Halo (contraste), con fallbacks seguros
  const HALO_STROKE =
    (SVG_BPLUS_VALUES as any).LINK_HALO_STROKE ?? "rgba(2,6,23,0.38)";
  const HALO_WIDTH =
    (SVG_BPLUS_VALUES as any).LINK_HALO_WIDTH ?? Math.max(CORE_WIDTH + 3, 5);
  const LINK_OPACITY = (SVG_BPLUS_VALUES as any).LINK_OPACITY ?? 0.95;

  const TOUCH = 1.5;
  const r =
    parseInt(SVG_BPLUS_VALUES.SLOT_TEXT_SIZE) + SVG_BPLUS_VALUES.SLOT_PAD_Y * 2;

  const sel = linksLayer
    .selectAll<SVGGElement, TreeLinkData>("g.bplus-tree-link")
    .data(treeLinks, (d) => `tlink-${d.sourceId}-${d.targetId}`)
    .join(
      (enter) => {
        const g = enter
          .append("g")
          .attr("class", "bplus-tree-link")
          .attr("id", (d) => `tlink-${d.sourceId}-${d.targetId}`);

        // HALO (debajo)
        g.append("path")
          .attr("class", "tree-link-halo")
          .attr("fill", "none")
          .attr("stroke", HALO_STROKE)
          .attr("stroke-opacity", LINK_OPACITY)
          .attr("stroke-width", HALO_WIDTH)
          .attr("stroke-linecap", "round");

        // CORE (encima)
        g.append("path")
          .attr("class", "tree-link")
          .attr("fill", "none")
          .attr("stroke", CORE_STROKE)
          .attr("stroke-width", CORE_WIDTH)
          .attr("stroke-linecap", "round")
          .attr("marker-end", "url(#bplusArrow)");

        return g;
      },
      (update) => update,
      (exit) => exit.remove()
    );

  const computeD = (d: TreeLinkData) => {
    const parent = nodeById.get(d.sourceId)!;
    const child = nodeById.get(d.targetId)!;
    const idx = childIndexMap.get(`${parent.data.id}->${child.data.id}`) ?? 0;
    const s = childAnchorForBPlus(parent, nodePositions, idx);
    const t = topCenterAnchorOfChildBPlus(child, nodePositions);
    return curvedLinkPath(
      { x: s.x, y: s.y - 1 },
      { x: t.x, y: t.y - TOUCH },
      r * 0.55
    );
  };

  // Actualiza HALO y CORE
  sel
    .select<SVGPathElement>("path.tree-link-halo")
    .attr("stroke", HALO_STROKE)
    .attr("stroke-opacity", LINK_OPACITY)
    .attr("stroke-width", HALO_WIDTH)
    .attr("d", computeD as any);

  sel
    .select<SVGPathElement>("path.tree-link")
    .attr("stroke", CORE_STROKE)
    .attr("stroke-width", CORE_WIDTH)
    .attr("d", computeD as any);
}

/** Interpola los links entre prevPositions → nextPositions, para reflows suaves. */
export function tweenBPlusLinksDuringReflow(
  linksLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: d3.HierarchyNode<BPlusHierarchy>,
  prevPositions: Map<string, { x: number; y: number }>,
  nextPositions: Map<string, { x: number; y: number }>,
  dur = 900,
  ease: (t: number) => number = d3.easeCubicOut,
  opts?: { stroke?: string; width?: number }
) {
  const { treeLinks, childIndexMap, nodeById } =
    buildBPlusLinksFromHierarchy(root);

  // Núcleo (color principal) — permite override por opts
  const CORE_STROKE =
    opts?.stroke ??
    (SVG_BPLUS_VALUES as any).LINK_CORE_STROKE ??
    SVG_BPLUS_VALUES.LINK_STROKE;

  const CORE_WIDTH =
    opts?.width ??
    (SVG_BPLUS_VALUES as any).LINK_CORE_WIDTH ??
    SVG_BPLUS_VALUES.LINK_STROKE_WIDTH;

  // Halo (contraste), con fallbacks seguros
  const HALO_STROKE =
    (SVG_BPLUS_VALUES as any).LINK_HALO_STROKE ?? "rgba(2,6,23,0.38)";
  const HALO_WIDTH =
    (SVG_BPLUS_VALUES as any).LINK_HALO_WIDTH ?? Math.max(CORE_WIDTH + 3, 5);
  const LINK_OPACITY = (SVG_BPLUS_VALUES as any).LINK_OPACITY ?? 0.95;

  const TOUCH = 1.5;
  const r =
    parseInt(SVG_BPLUS_VALUES.SLOT_TEXT_SIZE) + SVG_BPLUS_VALUES.SLOT_PAD_Y * 2;

  const sel = linksLayer
    .selectAll<SVGGElement, TreeLinkData>("g.bplus-tree-link")
    .data(treeLinks, (d) => `tlink-${d.sourceId}-${d.targetId}`)
    .join(
      (enter) => {
        const g = enter
          .append("g")
          .attr("class", "bplus-tree-link")
          .attr("id", (d) => `tlink-${d.sourceId}-${d.targetId}`);

        // HALO (debajo)
        g.append("path")
          .attr("class", "tree-link-halo")
          .attr("fill", "none")
          .attr("stroke", HALO_STROKE)
          .attr("stroke-opacity", LINK_OPACITY)
          .attr("stroke-width", HALO_WIDTH)
          .attr("stroke-linecap", "round");

        // CORE (encima)
        g.append("path")
          .attr("class", "tree-link")
          .attr("fill", "none")
          .attr("stroke", CORE_STROKE)
          .attr("stroke-width", CORE_WIDTH)
          .attr("stroke-linecap", "round")
          .attr("marker-end", "url(#bplusArrow)");

        return g;
      },
      (update) => update,
      (exit) => exit.remove()
    );

  // Interpolador común para ambas capas
  const makeAttrTween = (d: TreeLinkData) => {
    const parent = nodeById.get(d.sourceId)!;
    const child = nodeById.get(d.targetId)!;
    const idx = childIndexMap.get(`${parent.data.id}->${child.data.id}`) ?? 0;

    const s0 = childAnchorForBPlus(parent, prevPositions, idx);
    const t0 = topCenterAnchorOfChildBPlus(child, prevPositions);
    const s1 = childAnchorForBPlus(parent, nextPositions, idx);
    const t1 = topCenterAnchorOfChildBPlus(child, nextPositions);

    return (tt: number) => {
      const k = ease(tt);
      const s = { x: s0.x + (s1.x - s0.x) * k, y: s0.y + (s1.y - s0.y) * k };
      const e = { x: t0.x + (t1.x - t0.x) * k, y: t0.y + (t1.y - t0.y) * k };
      return curvedLinkPath(
        { x: s.x, y: s.y - 1 },
        { x: e.x, y: e.y - TOUCH },
        r * 0.55
      );
    };
  };

  // HALO
  sel
    .select<SVGPathElement>("path.tree-link-halo")
    .attr("stroke", HALO_STROKE)
    .attr("stroke-opacity", LINK_OPACITY)
    .attr("stroke-width", HALO_WIDTH)
    .transition()
    .duration(dur)
    .ease(ease)
    .attrTween("d", makeAttrTween as any);

  // CORE
  sel
    .select<SVGPathElement>("path.tree-link")
    .attr("stroke", CORE_STROKE)
    .attr("stroke-width", CORE_WIDTH)
    .transition()
    .duration(dur)
    .ease(ease)
    .attrTween("d", makeAttrTween as any);
}

/* ──────────────────────────── Estimación de medidas ──────────────────────────── */
export function estimateKeyWidth(
  k: number,
  opts?: { charW?: number; padX?: number }
) {
  const charW = opts?.charW ?? 8; // 12px font aproximado
  const padX = opts?.padX ?? SVG_BPLUS_VALUES.SLOT_PAD_X;
  const s = String(k);
  return s.length * charW + padX * 2;
}

export function computeNodeWidth(keys: number[]): number {
  if (keys.length === 0) return SVG_BPLUS_VALUES.NODE_PAD_X * 2 + 20;
  const slotWidths = keys.map((kk) => estimateKeyWidth(kk));
  const slotsWidth =
    slotWidths.reduce((a, b) => a + b, 0) +
    SVG_BPLUS_VALUES.SLOT_GAP * Math.max(0, keys.length - 1);
  return slotsWidth + SVG_BPLUS_VALUES.NODE_PAD_X * 2;
}

export function computeNodeHeight(): number {
  const slotH =
    parseInt(SVG_BPLUS_VALUES.SLOT_TEXT_SIZE) + SVG_BPLUS_VALUES.SLOT_PAD_Y * 2;
  return slotH + SVG_BPLUS_VALUES.NODE_PAD_Y * 2;
}

/* ──────────────────────────── Anclajes de hijos (entre slots) ──────────────────────────── */
type ChildAnchor = {
  x: number;
  y: number;
  gapX0: number;
  gapX1: number;
};

export function childAnchorForBPlus(
  parent: d3.HierarchyNode<BPlusHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>,
  childIndex: number
): ChildAnchor {
  const pos = nodePositions.get(parent.data.id)!;
  const yTop = pos.y;
  const keys = parent.data.keys ?? [];
  const nodeW = computeNodeWidth(keys);
  const nodeH = computeNodeHeight();

  // centros de cada slot
  const centers: number[] = [];
  const leftEdge = pos.x - nodeW / 2 + SVG_BPLUS_VALUES.NODE_PAD_X;
  const rightEdge = pos.x + nodeW / 2 - SVG_BPLUS_VALUES.NODE_PAD_X;

  let cursorX = leftEdge;
  for (let i = 0; i < keys.length; i++) {
    const w = estimateKeyWidth(keys[i]);
    const cx = cursorX + w / 2;
    centers.push(cx);
    cursorX += w + SVG_BPLUS_VALUES.SLOT_GAP;
  }

  if (keys.length === 0) {
    const y = yTop + nodeH / 2;
    return { x: pos.x, y, gapX0: pos.x - 10, gapX1: pos.x + 10 };
  }

  // midpoints entre gaps
  const mids: number[] = [];
  mids.push((leftEdge + centers[0]) / 2);
  for (let i = 1; i < centers.length; i++)
    mids.push((centers[i - 1] + centers[i]) / 2);
  mids.push((rightEdge + centers[centers.length - 1]) / 2);

  let x0: number, x1: number;
  if (childIndex <= 0) {
    x0 = leftEdge;
    x1 = mids[0];
  } else if (childIndex >= keys.length) {
    x0 = mids[mids.length - 1];
    x1 = rightEdge;
  } else {
    x0 = mids[childIndex - 1];
    x1 = mids[childIndex];
  }

  const anchorX = (x0 + x1) / 2;
  return { x: anchorX, y: yTop + nodeH / 2, gapX0: x0, gapX1: x1 };
}

export function topCenterAnchorOfChildBPlus(
  child: d3.HierarchyNode<BPlusHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>
) {
  const p = nodePositions.get(child.data.id)!;
  return { x: p.x, y: p.y - computeNodeHeight() / 2 };
}

/* ──────────────────────────── Enlaces B+ (padre→hijo y hoja↔hoja) ──────────────────────────── */
export function buildBPlusLinksFromHierarchy(
  root: d3.HierarchyNode<BPlusHierarchy>
): {
  treeLinks: TreeLinkData[];
  leafLinks: TreeLinkData[];
  childIndexMap: Map<string, number>;
  nodeById: Map<string, d3.HierarchyNode<BPlusHierarchy>>;
} {
  const treeLinks: TreeLinkData[] = [];
  const leafLinks: TreeLinkData[] = [];
  const childIndexMap = new Map<string, number>();
  const nodeById = new Map<string, d3.HierarchyNode<BPlusHierarchy>>();

  root.each((n) => nodeById.set(n.data.id, n));

  // padre→hijo
  root.each((p) => {
    const kids = p.children ?? [];
    kids.forEach((c, i) => {
      treeLinks.push({ sourceId: p.data.id, targetId: c.data.id });
      childIndexMap.set(`${p.data.id}->${c.data.id}`, i);
    });
  });

  // hoja↔hoja usando nextLeafId
  nodeById.forEach((n) => {
    if (n.data.isLeaf && n.data.nextLeafId) {
      leafLinks.push({ sourceId: n.data.id, targetId: n.data.nextLeafId });
    }
  });

  return { treeLinks, leafLinks, childIndexMap, nodeById };
}

/* Etiqueta comprensible del rango del hijo i en un interno con keys */
export function describeChildRange(keys: number[], idx: number): string {
  if (!keys || keys.length === 0) return "todos los valores";
  if (idx <= 0) return `< ${keys[0]}`;
  if (idx >= keys.length) return `≥ ${keys[keys.length - 1]}`;
  return `[${keys[idx - 1]} … ${keys[idx]})`;
}

/* ──────────────────────────── Skin / defs compartidas ──────────────────────────── */
export function ensureBPlusDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Glow (sólo definición; sin aplicarlo aquí)
  let filter = defs.select<SVGFilterElement>("#bplusGlow");
  if (filter.empty()) {
    filter = defs
      .append("filter")
      .attr("id", "bplusGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("stdDeviation", 2.2)
      .attr("flood-color", SVG_BPLUS_VALUES.GLOW_COLOR)
      .attr("flood-opacity", 0.9);
  }

  // Flecha para enlaces árbol
  let arrow = defs.select<SVGMarkerElement>("#bplusArrow");
  if (arrow.empty()) {
    arrow = defs
      .append("marker")
      .attr("id", "bplusArrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("orient", "auto");
    arrow
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", SVG_BPLUS_VALUES.LINK_CORE_STROKE); // ← núcleo
  }

  // Flecha para cadena de hojas
  let arrowLeaf = defs.select<SVGMarkerElement>("#bplusLeafArrow");
  if (arrowLeaf.empty()) {
    arrowLeaf = defs
      .append("marker")
      .attr("id", "bplusLeafArrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto");
    arrowLeaf
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", SVG_BPLUS_VALUES.LEAF_LINK_STROKE);
  }
}

/* ──────────────────────────── Dibujo de nodos B+ (rect, sin animaciones) ──────────────────────────── */
export type BPlusRectSkinOptions = {
  slotTextSize?: string;
  slotTextWeight?: number;
  showBadge?: boolean;

  intBodyFill?: string;
  intBodyStroke?: string;
  intBodyStrokeWidth?: number;
  intSlotFill?: string;
  intSlotStroke?: string;
  intSlotStrokeWidth?: number;
  intSlotTextColor?: string;

  leafBodyFill?: string;
  leafBodyStroke?: string;
  leafBodyStrokeWidth?: number;
  leafSlotFill?: string;
  leafSlotStroke?: string;
  leafSlotStrokeWidth?: number;
  leafSlotTextColor?: string;
};

export const defaultBPlusRectSkin: Required<BPlusRectSkinOptions> = {
  slotTextSize: SVG_BPLUS_VALUES.SLOT_TEXT_SIZE,
  slotTextWeight: SVG_BPLUS_VALUES.SLOT_TEXT_WEIGHT,
  showBadge: true,

  intBodyFill: SVG_BPLUS_VALUES.INT_BODY_FILL,
  intBodyStroke: SVG_BPLUS_VALUES.INT_BODY_STROKE,
  intBodyStrokeWidth: SVG_BPLUS_VALUES.INT_BODY_STROKE_WIDTH,
  intSlotFill: SVG_BPLUS_VALUES.INT_SLOT_FILL,
  intSlotStroke: SVG_BPLUS_VALUES.INT_SLOT_STROKE,
  intSlotStrokeWidth: SVG_BPLUS_VALUES.INT_SLOT_STROKE_WIDTH,
  intSlotTextColor: SVG_BPLUS_VALUES.INT_SLOT_TEXT,

  leafBodyFill: SVG_BPLUS_VALUES.LEAF_BODY_FILL,
  leafBodyStroke: SVG_BPLUS_VALUES.LEAF_BODY_STROKE,
  leafBodyStrokeWidth: SVG_BPLUS_VALUES.LEAF_BODY_STROKE_WIDTH,
  leafSlotFill: SVG_BPLUS_VALUES.LEAF_SLOT_FILL,
  leafSlotStroke: SVG_BPLUS_VALUES.LEAF_SLOT_STROKE,
  leafSlotStrokeWidth: SVG_BPLUS_VALUES.LEAF_SLOT_STROKE_WIDTH,
  leafSlotTextColor: SVG_BPLUS_VALUES.LEAF_SLOT_TEXT,
};

/**
 * Dibuja/actualiza nodos B+ como rectángulos multi-slot SIN transiciones ni eventos.
 * Cada slot tiene id: `${nodeId}#k<i>` para targeting externo.
 */
export function drawBPlusNodesRect(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: d3.HierarchyNode<BPlusHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>,
  skin: BPlusRectSkinOptions = {}
) {
  // Skin final (defaults + overrides)
  const s = { ...defaultBPlusRectSkin, ...skin };

  /* ───────────── Enter/update/exit del contenedor por nodo ───────────── */
  const sel = layer
    .selectAll<SVGGElement, d3.HierarchyNode<BPlusHierarchy>>("g.node")
    .data(nodes, (d) => d.data.id);

  const gEnter = sel
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", (d) => d.data.id)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id) || { x: 0, y: 0 };
      return `translate(${p.x},${p.y})`;
    });

  // cuerpo
  gEnter.append("rect").attr("class", "bp-body").attr("rx", 12).attr("ry", 12);

  // slots
  gEnter.append("g").attr("class", "slots");

  // badge (id + tipo)
  const badge = gEnter
    .append("g")
    .attr("class", "meta-badge")
    .style("display", s.showBadge ? "block" : "none")
    .style("pointer-events", "none"); // ← no intercepta el puntero

  badge
    .append("rect")
    .attr("class", "meta-bg")
    .attr("rx", SVG_BPLUS_VALUES.BADGE_CORNER)
    .attr("ry", SVG_BPLUS_VALUES.BADGE_CORNER)
    .attr("fill", SVG_BPLUS_VALUES.BADGE_FILL)
    .attr("stroke", SVG_BPLUS_VALUES.BADGE_STROKE)
    .attr("stroke-width", SVG_BPLUS_VALUES.BADGE_STROKE_WIDTH);

  badge
    .append("text")
    .attr("class", "meta-text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .style("font", SVG_BPLUS_VALUES.BADGE_FONT)
    .style("font-weight", SVG_BPLUS_VALUES.BADGE_WEIGHT as any)
    .attr("fill", "#9aa4b2");

  // merge enter+update
  const g = gEnter.merge(sel as any);

  // Reposicionar (sin transición)
  g.attr("transform", (d) => {
    const p = nodePositions.get(d.data.id) || { x: 0, y: 0 };
    return `translate(${p.x},${p.y})`;
  });

  /* ───────────── Redibujar por nodo (sin efectos) ───────────── */
  g.each(function (d: d3.HierarchyNode<BPlusHierarchy>) {
    const gNode = d3.select<SVGGElement, d3.HierarchyNode<BPlusHierarchy>>(
      this as any
    );

    const keys = d.data.keys ?? [];
    const nodeW = computeNodeWidth(keys);
    const nodeH = computeNodeHeight();
    const isLeaf = !!d.data.isLeaf;

    /* cuerpo */
    gNode
      .select<SVGRectElement>("rect.bp-body")
      .attr("x", -nodeW / 2)
      .attr("y", -nodeH / 2)
      .attr("width", nodeW)
      .attr("height", nodeH)
      .attr("fill", isLeaf ? s.leafBodyFill : s.intBodyFill)
      .attr("stroke", isLeaf ? s.leafBodyStroke : s.intBodyStroke)
      .attr(
        "stroke-width",
        isLeaf ? s.leafBodyStrokeWidth : s.intBodyStrokeWidth
      );

    /* slots */
    const slotsG = gNode.select<SVGGElement>("g.slots");
    let cursorX = -nodeW / 2 + SVG_BPLUS_VALUES.NODE_PAD_X;
    const slotH = parseInt(s.slotTextSize) + SVG_BPLUS_VALUES.SLOT_PAD_Y * 2;

    const slotSel = slotsG
      .selectAll<SVGGElement, number>("g.slot")
      .data(keys, (_: number, i: number) => i as any);

    const slotEnter = slotSel
      .enter()
      .append("g")
      .attr("class", "slot")
      .attr("id", (_: number, i: number) => `${d.data.id}#k${i}`);

    slotEnter
      .append("rect")
      .attr("class", "slot-box")
      .attr("rx", SVG_BPLUS_VALUES.SLOT_CORNER)
      .attr("ry", SVG_BPLUS_VALUES.SLOT_CORNER);

    slotEnter
      .append("text")
      .attr("class", "slot-text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", s.slotTextSize)
      .style("font-weight", s.slotTextWeight as any);

    const slotAll = slotEnter.merge(slotSel as any);

    slotAll.each(function (k: number) {
      const gw = estimateKeyWidth(k);
      const x = cursorX;
      const y = -slotH / 2;

      const gS = d3.select<SVGGElement, number>(this as any);
      gS.attr("transform", `translate(${x}, ${y})`);

      gS.select<SVGRectElement>("rect.slot-box")
        .attr("width", gw)
        .attr("height", slotH)
        .attr("fill", isLeaf ? s.leafSlotFill : s.intSlotFill)
        .attr("stroke", isLeaf ? s.leafSlotStroke : s.intSlotStroke)
        .attr(
          "stroke-width",
          isLeaf ? s.leafSlotStrokeWidth : s.intSlotStrokeWidth
        );

      gS.select<SVGTextElement>("text.slot-text")
        .attr("x", gw / 2)
        .attr("y", slotH / 2)
        .attr("fill", isLeaf ? s.leafSlotTextColor : s.intSlotTextColor)
        .text(String(k));

      cursorX += gw + SVG_BPLUS_VALUES.SLOT_GAP;
    });

    // EXIT de slots
    slotSel.exit().remove();

    /* badge: arriba si es interno, abajo si es hoja */
    const badgeG = gNode.select<SVGGElement>("g.meta-badge");
    const extra = SVG_BPLUS_VALUES.BADGE_OFFSET_Y;
    const BADGE_TOP_EXTRA_SEP = 15; // separa un poco de los enlaces
    const badgeY = isLeaf
      ? nodeH / 2 + extra // debajo
      : -(nodeH / 2 + extra + BADGE_TOP_EXTRA_SEP); // arriba

    badgeG.attr("transform", `translate(0, ${badgeY})`);

    const label = isLeaf ? "hoja" : "interno";

    // texto del badge
    const t = badgeG.select<SVGTextElement>("text.meta-text");
    t.text(label)
      .style("font-size", "11px")
      .style("font-weight", 600)
      .attr("fill", isLeaf ? "#10b981" : "#e2e8f0");

    // medir bbox del texto (para el pill)
    const bb = (t.node() as SVGTextElement).getBBox();

    // fondo del badge (pill)
    badgeG
      .select<SVGRectElement>("rect.meta-bg")
      .attr("x", -bb.width / 2 - 10)
      .attr("y", -6)
      .attr("width", bb.width + 20)
      .attr("height", bb.height + 12)
      .attr("rx", bb.height / 2 + 6)
      .attr("ry", bb.height / 2 + 6)
      .attr("fill", isLeaf ? "rgba(16,185,129,0.15)" : "rgba(30,41,59,0.85)")
      .attr("stroke", isLeaf ? "#10b981" : "#3b82f6")
      .attr("stroke-width", 1.2);
  });

  // exit de nodos
  sel.exit().remove();
}

/* Alias para coincidir con drawActions "rounded" */
export const drawBPlusNodesRounded = drawBPlusNodesRect;

/* ──────────────────────────── Enlaces padre→hijo (sin animaciones/eventos) ──────────────────────────── */
export function drawBPlusLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: d3.HierarchyNode<BPlusHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>,
  opts?: {
    treeStroke?: string;
    treeWidth?: number;
    leafStroke?: string;
    leafWidth?: number;
    leafDash?: string;
  }
) {
  const { treeLinks, childIndexMap, nodeById } =
    buildBPlusLinksFromHierarchy(root);

  // Núcleo (permite override por opts)
  const CORE_STROKE =
    opts?.treeStroke ??
    (SVG_BPLUS_VALUES as any).LINK_CORE_STROKE ??
    SVG_BPLUS_VALUES.LINK_STROKE;

  const CORE_WIDTH =
    opts?.treeWidth ??
    (SVG_BPLUS_VALUES as any).LINK_CORE_WIDTH ??
    SVG_BPLUS_VALUES.LINK_STROKE_WIDTH;

  // Halo
  const HALO_STROKE =
    (SVG_BPLUS_VALUES as any).LINK_HALO_STROKE ?? "rgba(2,6,23,0.38)";
  const HALO_WIDTH =
    (SVG_BPLUS_VALUES as any).LINK_HALO_WIDTH ?? Math.max(CORE_WIDTH + 3, 5);
  const LINK_OPACITY = (SVG_BPLUS_VALUES as any).LINK_OPACITY ?? 0.95;

  const TOUCH = 1.5;

  const tSel = g
    .selectAll<SVGGElement, TreeLinkData>("g.bplus-tree-link")
    .data(treeLinks, (d) => `tlink-${d.sourceId}-${d.targetId}`)
    .join(
      (enter) => {
        const gl = enter
          .append("g")
          .attr("class", "bplus-tree-link")
          .attr("id", (d) => `tlink-${d.sourceId}-${d.targetId}`);

        gl.append("rect")
          .attr("class", "gap-hint")
          .style("pointer-events", "none");

        // HALO (debajo)
        gl.append("path")
          .attr("class", "tree-link-halo")
          .attr("fill", "none")
          .attr("stroke-linecap", "round")
          .attr("stroke", HALO_STROKE)
          .attr("stroke-opacity", LINK_OPACITY)
          .attr("stroke-width", HALO_WIDTH);

        // CORE (encima)
        gl.append("path")
          .attr("class", "tree-link")
          .attr("fill", "none")
          .attr("stroke-linecap", "round")
          .attr("stroke", CORE_STROKE)
          .attr("stroke-width", CORE_WIDTH)
          .attr("marker-end", "url(#bplusArrow)");

        gl.append("circle").attr("class", "src-dot");
        gl.append("circle").attr("class", "dst-dot");

        gl.append("title");
        return gl;
      },
      (update) => update,
      (exit) => exit.remove()
    );

  tSel.each(function (d) {
    const parentNode = nodeById.get(d.sourceId)!;
    const childNode = nodeById.get(d.targetId)!;

    const idx =
      childIndexMap.get(`${parentNode.data.id}->${childNode.data.id}`) ?? 0;

    const s = childAnchorForBPlus(parentNode, nodePositions, idx);
    const t = topCenterAnchorOfChildBPlus(childNode, nodePositions);

    const gapY = s.y - 5;
    const gapH = 6;
    const r =
      parseInt(SVG_BPLUS_VALUES.SLOT_TEXT_SIZE) +
      SVG_BPLUS_VALUES.SLOT_PAD_Y * 2;

    const pathD = curvedLinkPath(
      { x: s.x, y: s.y - 1 },
      { x: t.x, y: t.y - TOUCH },
      r * 0.55
    );

    const sel = d3.select<SVGGElement, TreeLinkData>(this as any);

    sel
      .select<SVGRectElement>("rect.gap-hint")
      .attr("x", s.gapX0)
      .attr("y", gapY - gapH / 2)
      .attr("width", Math.max(4, s.gapX1 - s.gapX0))
      .attr("height", gapH)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", CORE_STROKE) // pista con el color núcleo
      .style("opacity", 0); // visible sólo si lo activas externamente

    // actualizar HALO y CORE
    sel
      .select<SVGPathElement>("path.tree-link-halo")
      .attr("stroke", HALO_STROKE)
      .attr("stroke-opacity", LINK_OPACITY)
      .attr("stroke-width", HALO_WIDTH)
      .attr("d", pathD);

    sel
      .select<SVGPathElement>("path.tree-link")
      .attr("stroke", CORE_STROKE)
      .attr("stroke-width", CORE_WIDTH)
      .attr("d", pathD);

    // puntos de anclaje
    sel
      .select<SVGCircleElement>("circle.src-dot")
      .attr("cx", s.x)
      .attr("cy", s.y - 1)
      .attr("r", 3.2)
      .attr("fill", (SVG_BPLUS_VALUES as any).LINK_POINT_FILL ?? CORE_STROKE)
      .style("opacity", LINK_OPACITY);

    sel
      .select<SVGCircleElement>("circle.dst-dot")
      .attr("cx", t.x)
      .attr("cy", t.y - TOUCH)
      .attr("r", 3.2)
      .attr("fill", (SVG_BPLUS_VALUES as any).LINK_POINT_FILL ?? CORE_STROKE)
      .style("opacity", LINK_OPACITY);

    const pKeys = (parentNode.data.keys ?? []) as number[];
    sel
      .select("title")
      .text(
        `Hijo ${idx} de ${parentNode.data.id} • rango: ${describeChildRange(pKeys, idx)}`
      );
  });

  // también la cadena de hojas
  drawLeafChainEdges(g, root, nodePositions, opts);
}

/** Dibuja/actualiza sólo la cadena de hojas (belt) horizontal — sin animación */
export function drawLeafChainEdges(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: d3.HierarchyNode<BPlusHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>,
  opts?: { leafStroke?: string; leafWidth?: number; leafDash?: string }
) {
  const { leafLinks, nodeById } = buildBPlusLinksFromHierarchy(root);
  const leafStroke = opts?.leafStroke ?? SVG_BPLUS_VALUES.LEAF_LINK_STROKE;
  const leafWidth = opts?.leafWidth ?? SVG_BPLUS_VALUES.LEAF_LINK_WIDTH;
  const leafDash = opts?.leafDash ?? SVG_BPLUS_VALUES.LEAF_LINK_DASH;

  const lSel = g
    .selectAll<SVGGElement, TreeLinkData>("g.bplus-leaf-link")
    .data(leafLinks, (d) => `llink-${d.sourceId}-${d.targetId}`)
    .join(
      (enter) => {
        const gl = enter
          .append("g")
          .attr("class", "bplus-leaf-link")
          .attr("id", (d) => `llink-${d.sourceId}-${d.targetId}`);
        gl.append("path")
          .attr("class", "leaf-link")
          .attr("fill", "none")
          .attr("stroke", leafStroke)
          .attr("stroke-width", leafWidth)
          .attr("stroke-linecap", "round")
          .attr("marker-end", "url(#bplusLeafArrow)")
          .style("opacity", 1);
        gl.append("title");
        return gl;
      },
      (update) => update,
      (exit) => exit.remove()
    );

  lSel.each(function (d) {
    const sPos = nodePositions.get(d.sourceId)!;
    const tPos = nodePositions.get(d.targetId)!;

    const sNode = nodeById.get(d.sourceId)!;
    const tNode = nodeById.get(d.targetId)!;
    const sW = computeNodeWidth(sNode.data.keys ?? []);
    const tW = computeNodeWidth(tNode.data.keys ?? []);
    const y = sPos.y;

    const s = { x: sPos.x + sW / 2, y };
    const t = { x: tPos.x - tW / 2, y };

    const pathSel = d3
      .select<SVGGElement, TreeLinkData>(this as any)
      .select<SVGPathElement>("path.leaf-link")
      .attr("d", `M${s.x},${s.y} L${t.x},${t.y}`)
      .attr("stroke", leafStroke)
      .attr("stroke-width", leafWidth);

    if (leafDash) pathSel.attr("stroke-dasharray", leafDash);
    else pathSel.attr("stroke-dasharray", null);

    d3.select(this)
      .select("title")
      .text(`Hoja ${sNode.data.id} → Hoja ${tNode.data.id}`);
  });
}

/* ──────────────────────────── Re-exports útiles ──────────────────────────── */
export { drawTraversalSequence } from "./naryDrawActionsUtilities";
export { curvedLinkPath as bplusCurvedPath } from "./naryDrawActionsUtilities";
