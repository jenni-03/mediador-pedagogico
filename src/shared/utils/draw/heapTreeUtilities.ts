import { Selection } from "d3";
import { TraversalNodeType, TreeLinkData } from "../../../domain/utils/types";
import {
  SVG_BINARY_TREE_VALUES,
  SVG_STYLE_VALUES,
} from "../../../domain/constants/consts";

/* ──────────────────────────────────────────────────────────────────────────
   Tipos base para el renderer del Heap (diseño)
   ────────────────────────────────────────────────────────────────────────── */

export type HeapNodeDatum = {
  id: string; // id único (del NodoHeap)
  value: number; // valor mostrado (normalmente priority)
  index: number; // índice level-order en el array del heap
  hidden?: boolean;

  priority?: number; // si quieres distinguirlo de value
  parentId?: string;
  leftId?: string;
  rightId?: string;
};

export type HeapLayoutDims = {
  width: number; // ancho útil del área del árbol
  top: number; // margen superior desde el <g> contenedor
  left: number; // margen izquierdo desde el <g> contenedor
  levelHeight: number; // distancia vertical entre niveles
  nodeRadius?: number; // radio para los círculos (fallback a constantes)
};

/* ──────────────────────────────────────────────────────────────────────────
   Helpers de layout (completo binario por índice)
   ────────────────────────────────────────────────────────────────────────── */

/** Devuelve el nivel (0-based) de un índice de heap. */
export function heapLevelOf(index: number): number {
  // nivel = floor(log2(index+1))
  return Math.floor(Math.log2(index + 1));
}

/** Primer índice del nivel dado. */
export function firstIndexOfLevel(level: number): number {
  return (1 << level) - 1; // 2^level - 1
}

/** Cantidad “ideal” de nodos en el nivel (árbol completo). */
export function expectedCountOnLevel(level: number): number {
  return 1 << level; // 2^level
}

/**
 * Calcula posiciones (x,y) para cada nodo del heap por nivel,
 * sin usar d3.tree. Ideal para heaps (árboles completos).
 */
// ── Espaciado por SLOTS del nivel (2^level), no por nodos visibles.
//    Así cada nivel conserva su rejilla ideal de heap y no “colapsa” al centro.
export function layoutCompleteBinaryByIndex(
  nodes: HeapNodeDatum[],
  dims: HeapLayoutDims
): Map<string, { x: number; y: number }> {
  const { width, top, left, levelHeight } = dims;
  const r = dims.nodeRadius ?? SVG_BINARY_TREE_VALUES.NODE_RADIUS;

  const pos = new Map<string, { x: number; y: number }>();
  if (!nodes.length) return pos;

  // bucket por nivel para ubicar (pero X por slot, no por count)
  const levels = new Map<number, HeapNodeDatum[]>();
  let maxLevel = 0;
  for (const n of nodes) {
    if (n.hidden) continue;
    const lv = heapLevelOf(n.index);
    maxLevel = Math.max(maxLevel, lv);
    if (!levels.has(lv)) levels.set(lv, []);
    levels.get(lv)!.push(n);
  }

  for (let lv = 0; lv <= maxLevel; lv++) {
    const arr = (levels.get(lv) ?? []).sort((a, b) => a.index - b.index);
    const slots = expectedCountOnLevel(lv); // 2^level
    const slotW = width / Math.max(1, slots); // ancho de slot responsivo
    const y = top + lv * levelHeight;

    for (const n of arr) {
      const slotIndex = n.index - firstIndexOfLevel(lv); // 0..(2^lv-1)
      const x = left + (slotIndex + 0.5) * slotW; // centro del slot
      pos.set(n.id, { x, y });
    }
  }

  void r;
  return pos;
}

/** Genera enlaces padre→hijo para un heap por índice (sin placeholders). */
export function buildHeapLinksFromIndex(
  nodes: HeapNodeDatum[]
): TreeLinkData[] {
  // índice → id (para lookup rápido)
  const idAtIndex = new Map<number, string>();
  for (const n of nodes) {
    if (!n.hidden) idAtIndex.set(n.index, n.id);
  }

  const links: TreeLinkData[] = [];
  for (const n of nodes) {
    if (n.hidden) continue;
    const i = n.index;
    const li = 2 * i + 1;
    const ri = 2 * i + 2;

    const leftId = idAtIndex.get(li);
    const rightId = idAtIndex.get(ri);

    if (leftId) links.push({ sourceId: n.id, targetId: leftId });
    if (rightId) links.push({ sourceId: n.id, targetId: rightId });
  }
  return links;
}

/* ──────────────────────────────────────────────────────────────────────────
   Dibujado “de diseño” (sin transiciones)
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Dibuja los nodos del heap (círculo + texto) en un <g> contenedor.
 * No hay animaciones; actualiza atributos de forma inmediata.
 */
export function drawHeapNodes(
  g: Selection<SVGGElement, unknown, null, undefined>,
  data: HeapNodeDatum[],
  positions: Map<string, { x: number; y: number }>,
  nodeRadius: number = SVG_BINARY_TREE_VALUES.NODE_RADIUS
) {
  const visible = data.filter((d) => !d.hidden);

  g.selectAll<SVGGElement, HeapNodeDatum>("g.heap-node")
    .data(visible, (d) => d.id)
    .join(
      (enter) => {
        // Grupo de nodo
        const ge = enter
          .append("g")
          .attr("class", "heap-node")
          .attr("id", (d) => d.id)
          .attr("transform", (d) => {
            const p = positions.get(d.id) ?? { x: 0, y: 0 };
            return `translate(${p.x}, ${p.y})`;
          });

        // Círculo (contenedor)
        ge.append("circle")
          .attr("class", "node-container")
          .attr("r", nodeRadius)
          .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr(
            "stroke-width",
            Math.max(1.6, SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          )
          .attr("shape-rendering", "geometricPrecision");

        // Texto (valor) — centro perfecto + contorno sutil para legibilidad
        ge.append("text")
          .attr("class", "node-value")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
          .attr("stroke", "rgba(0,0,0,0.35)")
          .attr("stroke-width", 0.75)
          .style("font-weight", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_SIZE)
          .style("paint-order", "stroke fill")
          .text((d) => d.value);

        return ge;
      },
      (update) => {
        // Reposiciona y re-estiliza sin animación
        update
          .attr("transform", (d) => {
            const p = positions.get(d.id) ?? { x: 0, y: 0 };
            return `translate(${p.x}, ${p.y})`;
          })
          .select("circle.node-container")
          .attr("r", nodeRadius)
          .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr(
            "stroke-width",
            Math.max(1.6, SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          )
          .attr("shape-rendering", "geometricPrecision");

        update
          .select("text.node-value")
          .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
          .attr("stroke", "rgba(0,0,0,0.35)")
          .attr("stroke-width", 0.75)
          .attr("dominant-baseline", "middle")
          .style("paint-order", "stroke fill")
          .style("font-weight", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_SIZE)
          .text((d) => d.value);

        return update;
      },
      (exit) => exit.remove()
    );
}

/**
 * Dibuja los enlaces del heap (líneas simples) entre padre e hijo.
 * Usa posiciones precalculadas. Sin animaciones.
 */
export function drawHeapLinks(
  g: Selection<SVGGElement, unknown, null, undefined>,
  links: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>,
  nodeRadius: number = SVG_BINARY_TREE_VALUES.NODE_RADIUS
) {
  // capa dedicada
  let L = g.select<SVGGElement>("g.heap-links-layer");
  if (L.empty())
    L = g
      .insert<SVGGElement>("g", ":first-child")
      .attr("class", "heap-links-layer");

  L.selectAll<SVGGElement, TreeLinkData>("g.heap-link")
    .data(links, (d) => `link-${d.sourceId}-${d.targetId}`)
    .join(
      (enter) => {
        const gl = enter
          .append("g")
          .attr("class", "heap-link")
          .attr("id", (d) => `link-${d.sourceId}-${d.targetId}`)
          .attr("data-source", (d) => d.sourceId) // 👈
          .attr("data-target", (d) => d.targetId); // 👈

        gl.append("path")
          .attr("class", "tree-link")
          .attr("fill", "none")
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr(
            "stroke-width",
            Math.max(1.6, SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          )
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .style("opacity", 0.95)
          .attr("vector-effect", "non-scaling-stroke")
          .style("pointer-events", "none")
          .attr("marker-start", null)
          .attr("marker-mid", null)
          .attr("marker-end", null)
          .attr("d", (d) => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            return `M${s.x},${s.y + nodeRadius} L${t.x},${t.y - nodeRadius}`;
          });

        return gl;
      },
      (update) => {
        update
          .attr("data-source", (d) => d.sourceId) // 👈
          .attr("data-target", (d) => d.targetId) // 👈
          .select<SVGPathElement>("path.tree-link")
          .attr("fill", "none")
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr(
            "stroke-width",
            Math.max(1.6, SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          )
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .style("opacity", 0.95)
          .attr("vector-effect", "non-scaling-stroke")
          .style("pointer-events", "none")
          .attr("marker-start", null)
          .attr("marker-mid", null)
          .attr("marker-end", null)
          .attr("d", (d) => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            return `M${s.x},${s.y + nodeRadius} L${t.x},${t.y - nodeRadius}`;
          });

        return update;
      },
      (exit) => exit.remove()
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   Utilidades auxiliares (opcionales, sin animación)
   ────────────────────────────────────────────────────────────────────────── */

/** Elimina todo el árbol (nodos y aristas) del <g> contenedor. */
export function clearHeapGroup(
  g: Selection<SVGGElement, unknown, null, undefined>,
  positions: Map<string, { x: number; y: number }>
) {
  // borra la capa nueva si existe
  g.selectAll("g.heap-links-layer").remove();
  // compat: por si quedara algún link suelto de versiones anteriores
  g.selectAll("g.heap-link").remove();
  // nodos
  g.selectAll("g.heap-node").remove();
  positions.clear();
}

/**
 * Dibuja una “tira” simple de level-order (por si quieres mostrar la secuencia
 * debajo del árbol sin animación; puedes omitirla si ya usas tu util genérico).
 */
export function drawHeapLevelOrderStrip(
  g: Selection<SVGGElement, unknown, null, undefined>,
  values: TraversalNodeType[],
  yOffset: number = 0
) {
  const padding = SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING;

  g.selectAll<SVGTextElement, TraversalNodeType>("text.heap-seq")
    .data(values, (d) => d.id)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("class", "heap-seq")
          .attr("id", (d) => d.id)
          .attr("text-anchor", "middle")
          .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
          .style("font-weight", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_SIZE)
          .attr("transform", (_d, i) => `translate(${i * padding}, ${yOffset})`)
          .text((d) => d.value),
      (update) =>
        update
          .text((d) => d.value)
          .attr(
            "transform",
            (_d, i) => `translate(${i * padding}, ${yOffset})`
          ),
      (exit) => exit.remove()
    );
}

/**
 * Calcula dimensiones del SVG y posiciones {x,y} para un heap binario completo,
 * usando los índices level-order. Solo diseño (sin animaciones).
 */
export function layoutHeapGrid(
  nodes: HeapNodeDatum[],
  cfg: {
    margin: { left: number; right: number; top: number; bottom: number };
    nodeSpacing: number; // separación mínima deseada entre centros de slots
    levelSpacing: number; // separación vertical entre niveles
    radius?: number;
  }
): {
  width: number;
  height: number;
  positions: Map<string, { x: number; y: number }>;
} {
  const { margin, nodeSpacing, levelSpacing } = cfg;
  const r0 = cfg.radius ?? SVG_BINARY_TREE_VALUES.NODE_RADIUS;

  const visible = nodes.filter((n) => !n.hidden);
  if (!visible.length) {
    return {
      width: margin.left + margin.right,
      height: margin.top + margin.bottom,
      positions: new Map(),
    };
  }

  // nivel máximo observado
  let maxLevel = 0;
  for (const n of visible) maxLevel = Math.max(maxLevel, heapLevelOf(n.index));

  const levels = maxLevel + 1;
  const slotsOnWidest = expectedCountOnLevel(maxLevel); // 2^maxLevel

  // ancho interior = slots * nodeSpacing  (nodeSpacing = ancho de slot deseado)
  const innerWidth = Math.max(
    slotsOnWidest * nodeSpacing,
    2 * r0 + nodeSpacing
  );
  const innerHeight = (levels - 1) * levelSpacing + 2 * r0;

  const width = innerWidth + margin.left + margin.right;
  const height = innerHeight + margin.top + margin.bottom;

  // Posiciones usando grilla por slot (responsiva al width calculado arriba)
  const positions = layoutCompleteBinaryByIndex(visible, {
    width: innerWidth,
    top: margin.top + r0,
    left: margin.left,
    levelHeight: levelSpacing,
    nodeRadius: r0,
  });

  return { width, height, positions };
}
