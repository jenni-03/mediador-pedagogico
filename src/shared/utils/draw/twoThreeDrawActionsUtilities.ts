// src/shared/utils/draw/twoThreeDrawActionsUtilities.ts
import * as d3 from "d3";
import { HierarchyNodeData } from "../../../types";

/* ────────── Dimensiones base para 2-3 ────────── */
export const SVG_TT_VALUES = {
  BOX_PADDING_X: 10,
  BOX_PADDING_Y: 8,

  CHIP_GAP: 8,
  CHIP_PADDING_X: 8,
  CHIP_PADDING_Y: 4,

  BOX_CORNER: 10,
  CHIP_CORNER: 6,

  TEXT_SIZE: "13px",
  TEXT_WEIGHT: 800,

  /** Altura mínima del rect principal (si los chips fuesen muy bajos). */
  BOX_HEIGHT: 36,
} as const;

export const TT_STYLE = {
  BOX_FILL: "url(#neoTwoThreeGrad)",
  BOX_STROKE: "#1f2937",
  BOX_STROKE_W: 1.2,

  CHIP_FILL: "#0f172a",
  CHIP_STROKE: "#334155",
  CHIP_STROKE_W: 0.8,

  TEXT: "#e5e7eb",
  SUBTEXT: "#9aa4b2",

  RING: "#D72638",
  RING_W: 2.5,
} as const;

/* ────────── Defs del skin 2-3 (gradiente + sombra) ────────── */
export function ensureTwoThreeNeoDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Gradiente radial de fondo del nodo
  let grad = defs.select<SVGRadialGradientElement>("#neoTwoThreeGrad");
  if (grad.empty()) {
    grad = defs.append("radialGradient").attr("id", "neoTwoThreeGrad");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#1a1f2b");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#0d1016");
  }

  // Sombra sutil
  let filter = defs.select<SVGFilterElement>("#neoTwoThreeShadow");
  if (filter.empty()) {
    filter = defs
      .append("filter")
      .attr("id", "neoTwoThreeShadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 1.2)
      .attr("stdDeviation", 1.2)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.35);
  }
}

/* ────────── Helpers internos ────────── */

/** Mide el tamaño de un chip (ancho/alto) para un texto dado. */
function measureChip(
  gParent: d3.Selection<SVGGElement, unknown, null, undefined>,
  label: string
) {
  const { CHIP_PADDING_X, CHIP_PADDING_Y, TEXT_SIZE, TEXT_WEIGHT } =
    SVG_TT_VALUES;

  // <text> temporal off-screen para medir
  const tmp = gParent
    .append("text")
    .attr("class", "tmp-measure")
    .attr("x", -9999)
    .attr("y", -9999)
    .style("font-size", TEXT_SIZE)
    .style("font-weight", TEXT_WEIGHT as any)
    .text(label);

  const bb = (tmp.node() as SVGTextElement).getBBox();
  tmp.remove();

  const w = bb.width + 2 * CHIP_PADDING_X;
  const h = bb.height + 2 * CHIP_PADDING_Y;
  return { w, h };
}

/** Calcula ancho/alto de la caja y posiciones X de cada chip. */
function layoutNode(keys: number[]) {
  const { BOX_PADDING_X, BOX_PADDING_Y, CHIP_GAP, BOX_HEIGHT } = SVG_TT_VALUES;

  return (measure: (label: string) => { w: number; h: number }) => {
    let xCursor = BOX_PADDING_X;
    let maxChipH = 0;

    const chipSizes = keys.map((k) => {
      const { w, h } = measure(String(k));
      maxChipH = Math.max(maxChipH, h);
      const cx = xCursor + w / 2; // centro del chip
      xCursor += w + CHIP_GAP;
      return { w, h, cx };
    });

    // Si no hay chips, el ancho son solo los paddings laterales
    const contentW =
      keys.length > 0 ? xCursor - CHIP_GAP + BOX_PADDING_X : 2 * BOX_PADDING_X;

    const contentH = Math.max(maxChipH + 2 * BOX_PADDING_Y, BOX_HEIGHT);

    return { chipSizes, boxW: contentW, boxH: contentH };
  };
}

/* ────────── Dibujo de nodos 2-3 ──────────
   REGLAS IMPORTANTES PARA COMPATIBILIDAD:
   - Cada nodo es un <g class="node" id="{nodeId}"> con:
       * <rect class="tt-box"> (caja principal)
       * <g class="chips">     (chips de claves; se reconstruye siempre)
       * <g class="fx">        (capa para efectos; se clippea igual)
   - Guardamos data-box-w / data-box-h en el <g> para puertos/enlaces.
   - IDs de chips: `${nodeId}#k${i}` (i = índice de la clave en el nodo).
*/
export function drawTwoThreeNodesNeo(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: d3.HierarchyNode<HierarchyNodeData<number[]>>[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  const { BOX_CORNER, CHIP_CORNER, TEXT_SIZE, TEXT_WEIGHT } = SVG_TT_VALUES;

  const join = layer
    .selectAll<
      SVGGElement,
      d3.HierarchyNode<HierarchyNodeData<number[]>>
    >("g.node")
    .data(nodes, (d: any) => d.data.id);

  /* ENTER */
  const gEnter = join
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", (d) => d.data.id)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id);
      const x = p?.x ?? (d as any).x ?? 0;
      const y = p?.y ?? (d as any).y ?? 0;
      return `translate(${x},${y})`;
    })
    .style("opacity", 1);

  // Caja base
  gEnter
    .append("rect")
    .attr("class", "tt-box")
    .attr("rx", BOX_CORNER)
    .attr("ry", BOX_CORNER)
    .attr("fill", TT_STYLE.BOX_FILL)
    .attr("stroke", TT_STYLE.BOX_STROKE)
    .attr("stroke-width", TT_STYLE.BOX_STROKE_W)
    .attr("filter", "url(#neoTwoThreeShadow)");

  // Capas
  gEnter.append("g").attr("class", "chips");
  gEnter.append("g").attr("class", "fx");

  /* ENTER + UPDATE */
  const gAll = gEnter.merge(join as any);

  gAll.each(function (d) {
    const g = d3.select(this);
    const nodeId = d.data.id;
    const keys = (d.data.value ?? []) as number[];

    // ---- Layout ----
    const compute = layoutNode(keys);
    const { chipSizes, boxW, boxH } = compute((label) => measureChip(g, label));

    // Redimensionar/posicionar caja principal
    g.select<SVGRectElement>("rect.tt-box")
      .attr("x", -boxW / 2)
      .attr("y", -boxH / 2)
      .attr("width", boxW)
      .attr("height", boxH);

    // Guardar medidas para enlaces/puertos
    g.attr("data-box-w", boxW);
    g.attr("data-box-h", boxH);

    // ---- clipPath por nodo ----
    let svg = d3.select(this.ownerSVGElement!);
    let defs = svg.select<SVGDefsElement>("defs");
    if (defs.empty()) defs = svg.append("defs");

    const clipId = `clip-${nodeId}`;
    let cp = defs.select<SVGClipPathElement>(`#${clipId}`);
    if (cp.empty()) cp = defs.append("clipPath").attr("id", clipId);

    const clipRect = cp.selectAll("rect").data([null]);
    clipRect
      .enter()
      .append("rect")
      .merge(clipRect as any)
      .attr("x", -boxW / 2)
      .attr("y", -boxH / 2)
      .attr("width", boxW)
      .attr("height", boxH)
      .attr("rx", BOX_CORNER)
      .attr("ry", BOX_CORNER);

    g.select("g.chips").attr("clip-path", `url(#${clipId})`);
    g.select("g.fx").attr("clip-path", `url(#${clipId})`);

    // ─── RECONSTRUIR CHIPS (sin data-join) ───
    // Evita chips “zombies” o ids inconsistentes tras splits/merges.
    const chipsG = g.select<SVGGElement>("g.chips");
    chipsG.selectAll("*").remove();

    keys.forEach((k, i) => {
      const size = chipSizes[i];
      const cx = -boxW / 2 + size.cx;
      const cy = 0;

      const gc = chipsG
        .append("g")
        .attr("class", "chip")
        .attr("id", `${nodeId}#k${i}`) // ← patrón requerido por las animaciones
        .attr("transform", `translate(${cx}, ${cy})`);

      gc.append("rect")
        .attr("class", "chip-bg")
        .attr("rx", CHIP_CORNER)
        .attr("ry", CHIP_CORNER)
        .attr("fill", TT_STYLE.CHIP_FILL)
        .attr("stroke", TT_STYLE.CHIP_STROKE)
        .attr("stroke-width", TT_STYLE.CHIP_STROKE_W)
        .attr("width", size.w)
        .attr("height", size.h)
        .attr("x", -size.w / 2)
        .attr("y", -size.h / 2);

      gc.append("text")
        .attr("class", "chip-text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", TEXT_SIZE)
        .style("font-weight", TEXT_WEIGHT as any)
        .style("fill", TT_STYLE.TEXT)
        .style("paint-order", "stroke")
        .style("stroke", "#0b1220")
        .style("stroke-width", 1.1)
        .text(String(k));
    });
  });

  // Reposicionar nodos según cache (sin transición aquí)
  gAll.attr("transform", (d) => {
    const p = nodePositions.get(d.data.id);
    const x = p?.x ?? (d as any).x ?? 0;
    const y = p?.y ?? (d as any).y ?? 0;
    return `translate(${x},${y})`;
  });

  // EXIT inmediato (sin transición) para no dejar “zombies”
  join.exit().remove();
}
