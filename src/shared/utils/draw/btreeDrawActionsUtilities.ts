// src/shared/utils/draw/btreeDrawActionsUtilities.ts
import * as d3 from "d3";
import { curvedLinkPath } from "./naryDrawActionsUtilities"; // Asegúrate del path relativo
import { BHierarchy, TreeLinkData } from "../../../types";

/* ──────────────────────────── Constantes SVG para B-tree ──────────────────────────── */
export const SVG_B_VALUES = {
  NODE_PAD_X: 10, // padding horizontal interno del contenedor
  NODE_PAD_Y: 8, // padding vertical
  SLOT_GAP: 8, // separación entre cajitas de claves
  SLOT_PAD_X: 6, // padding interno horizontal de cada clave
  SLOT_PAD_Y: 4, // padding interno vertical de cada clave
  SLOT_CORNER: 8, // radio de esquina de la cajita
  SLOT_TEXT_SIZE: "12px",
  SLOT_TEXT_WEIGHT: 700,

  NODE_STROKE: "#1f2937",
  NODE_STROKE_WIDTH: 1.2,
  NODE_BODY_FILL: "#0b1220", // fondo del contenedor (oscuro)
  SLOT_FILL: "#111827", // fondo de cada clave (aún más oscuro)
  SLOT_STROKE: "#374151",
  SLOT_STROKE_WIDTH: 1.1,
  SLOT_TEXT_COLOR: "#e5e7eb",

  BADGE_FILL: "#0f172a",
  BADGE_STROKE: "#334155",
  BADGE_STROKE_WIDTH: 0.8,
  BADGE_CORNER: 8,
  BADGE_OFFSET_Y: 8,
  BADGE_FONT:
    "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  BADGE_WEIGHT: 600,
} as const;

/* ──────────────────────────── Estimación de medidas ──────────────────────────── */
/** Estima el ancho de render de una clave numérica sin medir DOM. */
export function estimateKeyWidth(
  k: number,
  opts?: { charW?: number; padX?: number }
) {
  // ancho “mono” aproximado: 8.0 px por char (12px font), ajustable
  const charW = opts?.charW ?? 8;
  const padX = opts?.padX ?? SVG_B_VALUES.SLOT_PAD_X;
  const s = String(k);
  return s.length * charW + padX * 2;
}

/** Ancho total del nodo para keys[]. */
export function computeNodeWidth(keys: number[]): number {
  if (keys.length === 0) return SVG_B_VALUES.NODE_PAD_X * 2 + 20;
  const slotWidths = keys.map((k) => estimateKeyWidth(k));
  const slotsWidth =
    slotWidths.reduce((a, b) => a + b, 0) +
    SVG_B_VALUES.SLOT_GAP * Math.max(0, keys.length - 1);
  return slotsWidth + SVG_B_VALUES.NODE_PAD_X * 2;
}

/** Alto total: cajitas + pads. */
export function computeNodeHeight(): number {
  const slotH =
    parseInt(SVG_B_VALUES.SLOT_TEXT_SIZE) + SVG_B_VALUES.SLOT_PAD_Y * 2;
  return slotH + SVG_B_VALUES.NODE_PAD_Y * 2;
}

/* ──────────────────────────── Anclajes de hijos ──────────────────────────── */
/**
 * Devuelve el punto de anclaje (x,y) para el hijo de índice `childIndex`
 * (entre claves). childIndex va de 0..keys.length y cae en “hendiduras”:
 *  - 0: antes de k0
 *  - i: entre k[i-1] y k[i]
 *  - m: después de k[m-1]
 */
export function childAnchorFor(
  parent: d3.HierarchyNode<BHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>,
  childIndex: number
) {
  const pos = nodePositions.get(parent.data.id)!;
  const yTop = pos.y;
  const keys = parent.data.keys ?? [];
  const nodeW = computeNodeWidth(keys);
  const nodeH = computeNodeHeight();

  // Construir posiciones x de cada slot (centro)
  const centers: number[] = [];
  let cursorX = pos.x - nodeW / 2 + SVG_B_VALUES.NODE_PAD_X;

  for (let i = 0; i < keys.length; i++) {
    const w = estimateKeyWidth(keys[i]);
    const cx = cursorX + w / 2;
    centers.push(cx);
    cursorX += w + SVG_B_VALUES.SLOT_GAP;
  }

  // Para anclaje entre slots, usamos puntos medios entre centros adyacentes.
  // Para extremos 0 y m, calculamos usando borde izquierdo/derecho.
  if (keys.length === 0) {
    return { x: pos.x, y: yTop + nodeH / 2 }; // caso raro: nodo vacío
  }

  let anchorX: number;
  if (childIndex <= 0) {
    // antes de la primera cajita
    const leftEdge = pos.x - nodeW / 2 + SVG_B_VALUES.NODE_PAD_X;
    anchorX = (leftEdge + centers[0]) / 2;
  } else if (childIndex >= keys.length) {
    // después de la última
    const rightEdge = pos.x + nodeW / 2 - SVG_B_VALUES.NODE_PAD_X;
    anchorX = (rightEdge + centers[centers.length - 1]) / 2;
  } else {
    // entre k[i-1] y k[i]
    anchorX = (centers[childIndex - 1] + centers[childIndex]) / 2;
  }

  return {
    x: anchorX,
    y: yTop + nodeH, // borde inferior del nodo como salida del enlace
  };
}

/** Anclaje superior (centro) del hijo: buena diana para conectar el enlace. */
export function topCenterAnchorOfChild(
  child: d3.HierarchyNode<BHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>
) {
  const p = nodePositions.get(child.data.id)!;
  return { x: p.x, y: p.y }; // entra al borde superior (controlado por path)
}

/* ──────────────────────────── Enlaces B-tree (padre→hijo) ──────────────────────────── */
export function buildBTreeLinksFromHierarchy(
  root: d3.HierarchyNode<BHierarchy>
): { links: TreeLinkData[]; indexMap: Map<string, number> } {
  const links: TreeLinkData[] = [];
  const childIndexMap = new Map<string, number>(); // "pId->cId" => idx

  root.each((p) => {
    const kids = p.children ?? [];
    kids.forEach((c, i) => {
      links.push({ sourceId: p.data.id, targetId: c.data.id });
      childIndexMap.set(`${p.data.id}->${c.data.id}`, i);
    });
  });

  return { links, indexMap: childIndexMap };
}

/**
 * Dibuja/actualiza los enlaces curvos usando anclajes B-tree:
 * source = hendidura entre claves (depende del índice del hijo),
 * target = borde superior del hijo.
 */
export function drawBTreeLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  root: d3.HierarchyNode<BHierarchy>,
  nodePositions: Map<string, { x: number; y: number }>,
  opts?: { stroke?: string; strokeWidth?: number }
) {
  const { links, indexMap } = buildBTreeLinksFromHierarchy(root);
  const stroke = opts?.stroke ?? "#1f2937";
  const width = opts?.strokeWidth ?? 1.6;

  // 🔧 Indexamos por id una vez
  const nodeById = new Map<string, d3.HierarchyNode<BHierarchy>>();
  root.each((n) => nodeById.set(n.data.id, n));

  const r = parseInt(SVG_B_VALUES.SLOT_TEXT_SIZE) + SVG_B_VALUES.SLOT_PAD_Y * 2;

  const sel = g
    .selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(links, (d) => `link-${d.sourceId}-${d.targetId}`);

  const enter = sel
    .enter()
    .append("g")
    .attr("class", "link")
    .attr("id", (d) => `link-${d.sourceId}-${d.targetId}`);

  enter
    .append("path")
    .attr("class", "tree-link")
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", width)
    .attr("stroke-linecap", "round");

  const merged = enter.merge(sel as any);

  merged.select<SVGPathElement>("path.tree-link").attr("d", (d) => {
    const parentNode = nodeById.get(d.sourceId);
    const childNode = nodeById.get(d.targetId);
    if (!parentNode || !childNode) return "";

    // ✅ parentNode/childNode ya son HierarchyNode<BHierarchy>
    const key = `${parentNode.data.id}->${childNode.data.id}`;
    const idx = indexMap.get(key) ?? 0;

    const s = childAnchorFor(parentNode, nodePositions, idx);
    const t = topCenterAnchorOfChild(childNode, nodePositions);
    const tAdj = { x: t.x, y: t.y - 6 };

    return curvedLinkPath(s, tAdj, r * 0.5);
  });

  sel.exit().transition().duration(260).style("opacity", 0).remove();
}

/* ──────────────────────────── Skin rectangular B-tree ──────────────────────────── */
export type BRectSkinOptions = {
  bodyFill?: string;
  bodyStroke?: string;
  bodyStrokeWidth?: number;
  slotFill?: string;
  slotStroke?: string;
  slotStrokeWidth?: number;
  slotTextColor?: string;
  slotTextSize?: string;
  slotTextWeight?: number;
  showBadge?: boolean;
};

export const defaultBRectSkin: Required<BRectSkinOptions> = {
  bodyFill: SVG_B_VALUES.NODE_BODY_FILL,
  bodyStroke: SVG_B_VALUES.NODE_STROKE,
  bodyStrokeWidth: SVG_B_VALUES.NODE_STROKE_WIDTH,
  slotFill: SVG_B_VALUES.SLOT_FILL,
  slotStroke: SVG_B_VALUES.SLOT_STROKE,
  slotStrokeWidth: SVG_B_VALUES.SLOT_STROKE_WIDTH,
  slotTextColor: SVG_B_VALUES.SLOT_TEXT_COLOR,
  slotTextSize: SVG_B_VALUES.SLOT_TEXT_SIZE,
  slotTextWeight: SVG_B_VALUES.SLOT_TEXT_WEIGHT,
  showBadge: true,
};

/**
 * Dibuja/actualiza nodos B como rectángulos con múltiples slots de clave.
 * Cada slot expone ids hijos: `g#<nodeId>#k<i>` para poder resaltar/recorrer.
 */
export function drawBNodesRect(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: d3.HierarchyNode<BHierarchy>[],
  nodePositions: Map<string, { x: number; y: number }>,
  skin: BRectSkinOptions = {}
) {
  const s = { ...defaultBRectSkin, ...skin };

  // JOIN por nodo
  const sel = layer
    .selectAll<SVGGElement, any>("g.node")
    .data(nodes, (d: any) => d.data.id);

  // ENTER
  const gEnter = sel
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", (d) => d.data.id)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id) || { x: 0, y: 0 };
      return `translate(${p.x},${p.y})`;
    });

  // Body (rect contenedor)
  gEnter
    .append("rect")
    .attr("class", "b-body")
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", s.bodyFill)
    .attr("stroke", s.bodyStroke)
    .attr("stroke-width", s.bodyStrokeWidth);

  // Grupo de slots
  gEnter.append("g").attr("class", "slots");

  // Badge meta (id)
  const badge = gEnter
    .append("g")
    .attr("class", "meta-badge")
    .attr("transform", (_NODE_PAD_Yd) => {
      const h = computeNodeHeight();
      return `translate(0, ${h / 2 + SVG_B_VALUES.BADGE_OFFSET_Y})`;
    })
    .style("display", s.showBadge ? "block" : "none");

  badge
    .append("rect")
    .attr("class", "meta-bg")
    .attr("rx", SVG_B_VALUES.BADGE_CORNER)
    .attr("ry", SVG_B_VALUES.BADGE_CORNER)
    .attr("fill", SVG_B_VALUES.BADGE_FILL)
    .attr("stroke", SVG_B_VALUES.BADGE_STROKE)
    .attr("stroke-width", SVG_B_VALUES.BADGE_STROKE_WIDTH);

  badge
    .append("text")
    .attr("class", "meta-text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .style("font", SVG_B_VALUES.BADGE_FONT)
    .style("font-weight", SVG_B_VALUES.BADGE_WEIGHT as any)
    .attr("fill", "#9aa4b2")
    .text((d) => `id: ${d.data.id}`);

  // ENTER+UPDATE
  const g = gEnter.merge(sel as any);

  // Reposicionar nodo
  g.transition()
    .duration(220)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id) || { x: 0, y: 0 };
      return `translate(${p.x},${p.y})`;
    });

  // Recalcular cuerpo y slots
  g.each(function (d) {
    const gNode = d3.select<SVGGElement, d3.HierarchyNode<BHierarchy>>(
      this as any
    );
    const keys = d.data.keys ?? [];
    const nodeW = computeNodeWidth(keys);
    const nodeH = computeNodeHeight();

    // Body centrado en (0,0)
    gNode
      .select<SVGRectElement>("rect.b-body")
      .attr("x", -nodeW / 2)
      .attr("y", -nodeH / 2)
      .attr("width", nodeW)
      .attr("height", nodeH);

    // Slots: JOIN por índice
    const slotsG = gNode.select<SVGGElement>("g.slots");
    let cursorX = -nodeW / 2 + SVG_B_VALUES.NODE_PAD_X;
    const slotH = parseInt(s.slotTextSize) + SVG_B_VALUES.SLOT_PAD_Y * 2;

    const slotSel = slotsG
      .selectAll<SVGGElement, number>("g.slot")
      .data(keys, (_, i) => i as any);

    const slotEnter = slotSel
      .enter()
      .append("g")
      .attr("class", "slot")
      .attr("id", (_, i) => `${d.data.id}#k${i}`);

    slotEnter
      .append("rect")
      .attr("class", "slot-box")
      .attr("rx", SVG_B_VALUES.SLOT_CORNER)
      .attr("ry", SVG_B_VALUES.SLOT_CORNER)
      .attr("fill", s.slotFill)
      .attr("stroke", s.slotStroke)
      .attr("stroke-width", s.slotStrokeWidth);

    slotEnter
      .append("text")
      .attr("class", "slot-text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", s.slotTextSize)
      .style("font-weight", s.slotTextWeight as any)
      .attr("fill", s.slotTextColor);

    const slotAll = slotEnter.merge(slotSel as any);

    // Posicionar cada slot y su texto
    slotAll.each(function (k, _i) {
      const gw = estimateKeyWidth(k);
      const x = cursorX;
      const y = -slotH / 2;

      const gS = d3.select<SVGGElement, number>(this as any);
      gS.attr("transform", `translate(${x}, ${y})`);

      gS.select<SVGRectElement>("rect.slot-box")
        .attr("width", gw)
        .attr("height", slotH);

      gS.select<SVGTextElement>("text.slot-text")
        .attr("x", gw / 2)
        .attr("y", slotH / 2)
        .text(String(k));

      cursorX += gw + SVG_B_VALUES.SLOT_GAP;
    });

    // EXIT de slots
    slotSel.exit().remove();

    // Badge tamaño
    const badgeG = gNode.select<SVGGElement>("g.meta-badge");
    const t = badgeG.select<SVGTextElement>("text.meta-text");
    const bb = (t.node() as SVGTextElement).getBBox();
    badgeG
      .select<SVGRectElement>("rect.meta-bg")
      .attr("x", -bb.width / 2 - 6)
      .attr("y", -4)
      .attr("width", bb.width + 12)
      .attr("height", bb.height + 8);

    badgeG.attr(
      "transform",
      `translate(0, ${nodeH / 2 + SVG_B_VALUES.BADGE_OFFSET_Y})`
    );
  });

  // EXIT nodo
  sel.exit().transition().duration(160).style("opacity", 0).remove();
}

/* ─────────────────────────── Reexports útiles (opcionales) ─────────────────────────── */
// Si prefieres centralizar imports en el render B-tree:
export { drawTraversalSequence } from "./naryDrawActionsUtilities";
export { curvedLinkPath as bCurvedPath } from "./naryDrawActionsUtilities";
