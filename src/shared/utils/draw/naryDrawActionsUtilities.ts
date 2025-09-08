// src/shared/utils/draw/naryDrawActionsUtilities.ts
import * as d3 from "d3";
import { HierarchyNode, easePolyInOut } from "d3";
import {
  HierarchyNodeData,
  IndicatorPositioningConfig,
  TraversalNodeType,
  TreeLinkData,
} from "../../../types";

/* ────────────────────────── Valores neutrales para n-arios ────────────────────────── */
export const SVG_NARY_VALUES = {
  // Nodos / textos
  NODE_RADIUS: 18,
  ELEMENT_TEXT_SIZE: "12px",
  ELEMENT_TEXT_WEIGHT: 600,

  // Recorridos (secuencia)
  SEQUENCE_PADDING: 38,
  SEQUENCE_HEIGHT: 26,

  // Colores utilitarios
  HIGHLIGHT_COLOR: "#8aa0ff",

  // Márgenes del lienzo (puedes ajustar)
  MARGIN_LEFT: 40,
  MARGIN_RIGHT: 40,
  MARGIN_TOP: 40,
  MARGIN_BOTTOM: 80,

  // Espaciados del layout d3.tree()
  NODE_SPACING: 64, // separación horizontal entre hermanos
  LEVEL_SPACING: 78, // separación vertical entre niveles
} as const;

export const SVG_STYLE_VALUES = {
  NODE_FILL: "#0ea5e9", // azul-400 (legacy)
  NODE_STROKE: "#1f2937", // gray-800
  NODE_STROKE_WIDTH: 1.2,
  ELEMENT_TEXT_COLOR: "#0b1220",
} as const;

/* ────────────────────────── Helpers ────────────────────────── */
export const waitEnd = (t: d3.Transition<any, any, any, any>) =>
  new Promise<void>((resolve) => t.on("end", resolve).on("interrupt", resolve));

/** Curva suave padre→hijo (función por defecto para pathBuilder). */
export function curvedLinkPath(
  s: { x: number; y: number },
  t: { x: number; y: number },
  r: number
) {
  const sy = s.y + r;
  const ty = t.y - r;
  const midY = (sy + ty) / 2;
  return `M${s.x},${sy} C ${s.x},${midY} ${t.x},${midY} ${t.x},${ty}`;
}

/* ────────────────────────── Indicador (opcional y genérico) ────────────────────────── */
export function drawArrowIndicator(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  indicatorId: string,
  indicatorClass: string,
  nodePosition: { x: number; y: number } | null,
  styleConfig: {
    text: string;
    textColor: string;
    arrowColor: string;
    fontSize: string;
    fontWeight: string;
    arrowPathData: string;
    textRelativeX?: number;
    textRelativeY: number;
    arrowTransform: string;
  },
  groupPositioningTransform: IndicatorPositioningConfig,
  dims: { elementWidth: number; elementHeight: number }
) {
  const indicatorData = nodePosition ? [nodePosition] : [];
  svg
    .selectAll<SVGGElement, { x: number; y: number }>(`g.${indicatorClass}`)
    .data(indicatorData, () => indicatorId)
    .join(
      (enter) => {
        const gEnter = enter
          .append("g")
          .attr("id", indicatorId)
          .attr("class", indicatorClass)
          .style("opacity", 0);

        gEnter
          .append("text")
          .attr("class", `${indicatorClass}-text`)
          .attr("text-anchor", "middle")
          .attr("fill", styleConfig.textColor)
          .attr("font-size", styleConfig.fontSize)
          .attr("font-weight", styleConfig.fontWeight)
          .attr("x", styleConfig.textRelativeX ?? 0)
          .attr("y", styleConfig.textRelativeY)
          .text(styleConfig.text);

        gEnter
          .append("path")
          .attr("class", `${indicatorClass}-arrow`)
          .attr("d", styleConfig.arrowPathData)
          .attr("fill", styleConfig.arrowColor)
          .attr("transform", styleConfig.arrowTransform)
          .attr("stroke", "black")
          .attr("stroke-width", 0.5);

        gEnter
          .transition()
          .duration(1200)
          .style("opacity", 1)
          .attr("transform", (d) =>
            groupPositioningTransform.calculateTransform(d, dims)
          );

        return gEnter;
      },
      (update) => update,
      (exit) => exit.transition().duration(1000).style("opacity", 0).remove()
    );
}

/* ────────────────────────── Enlaces genéricos (curvos) ────────────────────────── */
/**
 * Dibuja/actualiza enlaces padre→hijo. Puedes pasar un pathBuilder propio
 * (útil en 1-2-3/B/B+) si el join entre padres/hijos necesita variar.
 * Ahora acepta strokeColor/strokeWidth (retrocompatible).
 */
export function drawTreeLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>,
  opts?: {
    nodeRadius?: number;
    pathBuilder?: typeof curvedLinkPath;
    strokeColor?: string;
    strokeWidth?: number;
  }
) {
  const r = opts?.nodeRadius ?? SVG_NARY_VALUES.NODE_RADIUS;
  const pathFn = opts?.pathBuilder ?? curvedLinkPath;
  const stroke = opts?.strokeColor ?? SVG_STYLE_VALUES.NODE_STROKE;
  const width = opts?.strokeWidth ?? 1.5;

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
          .attr("stroke", stroke)
          .attr("stroke-width", width)
          .attr("stroke-linecap", "round")
          .attr("d", (d) => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            return pathFn(s, t, r);
          });

        return gLink;
      },
      (update) => {
        update
          .select<SVGPathElement>("path.tree-link")
          .attr("stroke", stroke)
          .attr("stroke-width", width)
          .attr("d", (d) => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            return pathFn(s, t, r);
          });
        return update;
      },
      (exit) => exit.transition().duration(300).style("opacity", 0).remove()
    );
}

/* ────────────────────────── Secuencia de recorrido (genérica) ────────────────────────── */
export function drawTraversalSequence(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  values: TraversalNodeType[],
  opts: {
    seqPositions: Map<string, { x: number; y: number }>;
    nodePositions?: Map<string, { x: number; y: number }>; // ya no se usa aquí
    treeOffset?: { x: number; y: number }; // idem
    seqOffset?: { x: number; y: number }; // idem
    seqPadding?: number;
    textSize?: string;
    textWeight?: number;
    textColor?: string; // si lo pasas, sobrescribe el fill claro por defecto
  }
) {
  const {
    seqPositions,
    seqPadding = SVG_NARY_VALUES.SEQUENCE_PADDING,
    // 👉 valores por defecto pensados para fondo oscuro
    textSize = "14px",
    textWeight = 800,
    textColor = "#f9fafb", // casi blanco (mejor legibilidad)
  } = opts;

  const outlineColor = "#0b1220"; // borde oscuro para contraste
  const outlineWidth = 1.4;

  g.selectAll<SVGTextElement, TraversalNodeType>("text.seq")
    .data(values, (d) => d.id)
    .join(
      (enter) => {
        const textEnter = enter
          .append("text")
          .attr("class", "seq")
          .attr("id", (d) => d.id)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "alphabetic")
          .style("pointer-events", "none")
          // ✨ contorno para que “se lea” sobre el fondo
          .style("paint-order", "stroke")
          .style("stroke", outlineColor)
          .style("stroke-width", outlineWidth)
          // ✨ relleno claro
          .attr("fill", textColor)
          .style("font-weight", textWeight as any)
          .style("font-size", textSize)
          .style("letter-spacing", "0.2px")
          .style("opacity", 0) // inicia invisible (la animación de recorrido lo hace aparecer)
          // posición FINAL en la banda (x = i * padding)
          .attr("transform", (d, i) => {
            const x = i * seqPadding;
            const y = 0;
            seqPositions.set(d.id, { x, y });
            return `translate(${x}, ${y})`;
          })
          .text((d) => d.value);

        return textEnter;
      },
      (update) => {
        update
          // mantener estilos (por si cambian dinámicamente)
          .style("paint-order", "stroke")
          .style("stroke", outlineColor)
          .style("stroke-width", outlineWidth)
          .attr("fill", textColor)
          .style("font-weight", textWeight as any)
          .style("font-size", textSize)
          .style("letter-spacing", "0.2px")
          // asegurar posición final coherente
          .attr("transform", (d, i) => {
            const x = i * seqPadding;
            const y = 0;
            seqPositions.set(d.id, { x, y });
            return `translate(${x}, ${y})`;
          })
          .style("opacity", 1) // visible al actualizar
          .text((d) => d.value);

        return update;
      },
      (exit) => exit.each((d) => seqPositions.delete(d.id)).remove()
    );
}

/* ────────────────────────── Clear (genérico) ────────────────────────── */
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

  await treeG
    .selectAll("g.link")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .end();

  await treeG
    .selectAll("g.node")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .end();

  await seqG
    .selectAll("text.seq")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .end();

  treeG.remove();
  seqG.remove();

  nodePositions.clear();
  seqPositions.clear();

  resetQueryValues();
  setIsAnimating(false);
}

/* ────────────────────────── Reposicionamiento (genérico) ────────────────────────── */
/**
 * Anima el reflow de nodos y enlaces. Para árboles B/B+, pasa un pathBuilder
 * si tu enlace no es (padre, hijo) vertical estándar.
 */
export async function repositionTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  linksData: TreeLinkData[],
  nodePositions: Map<string, { x: number; y: number }>,
  opts?: { nodeRadius?: number; pathBuilder?: typeof curvedLinkPath }
) {
  const r = opts?.nodeRadius ?? SVG_NARY_VALUES.NODE_RADIUS;
  const pathFn = opts?.pathBuilder ?? curvedLinkPath;

  const p1 = g
    .selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
    .data(nodes, (d) => d.data.id)
    .transition()
    .duration(1000)
    .ease(easePolyInOut)
    .attr("transform", (d) => {
      const finalPos = nodePositions.get(d.data.id)!;
      return `translate(${finalPos.x}, ${finalPos.y})`;
    })
    .end();

  const p2 = g
    .selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(linksData, (d) => `link-${d.sourceId}-${d.targetId}`)
    .select<SVGPathElement>("path.tree-link")
    .transition()
    .duration(1000)
    .ease(easePolyInOut)
    .attr("d", (d) => {
      const s = nodePositions.get(d.sourceId)!;
      const t = nodePositions.get(d.targetId)!;
      return pathFn(s, t, r);
    })
    .end();

  await Promise.all([p1, p2]);
}

/* ────────────────────────── Highlight de camino (opcional) ────────────────────────── */
export async function highlightTreePath(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: HierarchyNode<HierarchyNodeData<number>>[],
  highlightColor = SVG_NARY_VALUES.HIGHLIGHT_COLOR
) {
  for (const node of path) {
    const nodeGroup = g.select<SVGGElement>(`g#${node.data.id}`);
    await nodeGroup
      .select("circle, rect") // por si el nodo NO es circular (B/B+)
      .transition()
      .duration(700)
      .attr("fill", highlightColor)
      .end();
  }
}
function dimAllNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  opacity = 0.35,
  dur = 140
) {
  return treeG
    .selectAll<SVGGElement, unknown>("g.node")
    .transition()
    .duration(dur)
    .style("opacity", opacity)
    .end();
}

function undimAllNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  dur = 160
) {
  return treeG
    .selectAll<SVGGElement, unknown>("g.node")
    .transition()
    .duration(dur)
    .style("opacity", 1)
    .end();
}

/* ────────────────────────── Recorridos (animación genérica) ────────────────────────── */
type TraversalAnimOptions = {
  /** "recolor" = cambia fill temporalmente; "preserve-fill" = NO toca fill (sólo stroke/pulso) */
  style?: "recolor" | "preserve-fill";
  /** Color del resaltado (stroke/anillo) en modo preserve-fill */
  strokeColor?: string;
  /** Radio del nodo (para bounce/anillo cuando el nodo es circular) */
  nodeRadius?: number;
  /** Hacer un pequeño bounce (visual) */
  bounce?: boolean;
  /** Mostrar anillo pulsante temporal */
  pulse?: boolean;

  // ── extras de diseño ──
  spotlight?: boolean; // atenua el resto del árbol durante el recorrido
  spotlightOpacity?: number; // opacidad del resto del árbol
  rippleCount?: number; // nº de anillos por paso
  rippleExpand?: number; // expansión de los anillos
  valuePopScale?: number; // escala máxima del número central
  stepDelay?: number; // pausa entre pasos (ms)
};

export async function animateTreeTraversal(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  seqG: d3.Selection<SVGGElement, unknown, null, undefined>,
  targetNodes: TraversalNodeType[],
  seqPositions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>,
  opts: TraversalAnimOptions = {}
) {
  const {
    style = "preserve-fill",
    strokeColor = "#8aa0ff",
    nodeRadius = SVG_NARY_VALUES.NODE_RADIUS,
    bounce = true,
    pulse = true,

    // extras de diseño
    spotlight = true,
    spotlightOpacity = 0.35,
    rippleCount = 2,
    rippleExpand = 14,
    valuePopScale = 1.18,
    stepDelay = 70,
  } = opts;

  // Asegura que la banda de secuencia está visible
  seqG.style("opacity", 1);
  setIsAnimating(true);

  // Spotlight global (atenúa el resto del árbol)
  if (spotlight) await dimAllNodes(treeG, spotlightOpacity, 140);

  for (let i = 0; i < targetNodes.length; i++) {
    const id = targetNodes[i].id;

    // Soporta nodos circulares o rectangulares
    const shape =
      treeG.select<SVGCircleElement>(`g#${id} circle`).node() ??
      treeG.select<SVGRectElement>(`g#${id} rect`).node();
    if (!shape) continue;

    const sel = d3.select<SVGElement, unknown>(shape as any);
    const seqText = seqG.select<SVGTextElement>(`text#${id}`);
    const nodeG = treeG.select<SVGGElement>(`g#${id}`);
    const centerText = nodeG.select<SVGTextElement>("text.value");

    // En spotlight, sube opacidad del nodo activo
    if (spotlight) {
      await nodeG.transition().duration(120).style("opacity", 1).end();
    }

    if (style === "recolor") {
      // ── relleno temporal ──
      const originalFill = sel.attr("fill");
      await sel.transition().duration(200).attr("fill", "#ffe08a").end();

      if (bounce && shape instanceof SVGCircleElement) {
        await d3
          .select(shape)
          .transition()
          .duration(150)
          .attr("r", nodeRadius * 1.1)
          .transition()
          .duration(150)
          .attr("r", nodeRadius)
          .end();
      }

      // Pop del número central (si existe skin con text.value)
      if (!centerText.empty()) {
        const cur = parseFloat(centerText.style("font-size") || "12");
        await centerText
          .transition()
          .duration(150)
          .ease(d3.easeBackOut.overshoot(1.2))
          .style("font-size", `${cur * valuePopScale}px`)
          .transition()
          .duration(150)
          .ease(d3.easeCubicOut)
          .style("font-size", `${cur}px`)
          .end();
      }

      // ── APARICIÓN EN LA BANDA (sin mover desde el nodo) ──
      const finalPos = seqPositions.get(id)!;

      // 1) atenúa el número central del nodo para evitar “doble texto”
      if (!centerText.empty()) {
        await centerText
          .transition()
          .duration(120)
          .style("opacity", 0.15)
          .end();
      }

      // 2) pop/fade del texto de secuencia (ya posicionado en drawTraversalSequence)
      const existsVisible =
        seqText.style("opacity") !== "" && seqText.style("opacity") !== "0";

      if (!existsVisible) {
        await seqText
          .attr(
            "transform",
            `translate(${finalPos.x}, ${finalPos.y}) scale(0.9)`
          )
          .style("opacity", 0)
          .transition()
          .duration(420)
          .ease(d3.easeBackOut.overshoot(1.25))
          .style("opacity", 1)
          .attr("transform", `translate(${finalPos.x}, ${finalPos.y}) scale(1)`)
          .end();
      } else {
        await seqText
          .transition()
          .duration(420)
          .ease(d3.easeCubicOut)
          .attr(
            "transform",
            `translate(${finalPos.x}, ${finalPos.y}) scale(1.02)`
          )
          .transition()
          .duration(180)
          .ease(d3.easeCubicOut)
          .attr("transform", `translate(${finalPos.x}, ${finalPos.y}) scale(1)`)
          .end();
      }

      // 3) Ripples (anillos)
      const parentG = (shape.parentNode as SVGGElement) || shape;
      const r0 =
        shape instanceof SVGCircleElement
          ? +(shape.getAttribute("r") || nodeRadius)
          : nodeRadius;

      for (let k = 0; k < rippleCount; k++) {
        await d3
          .select(parentG)
          .append("circle")
          .attr("class", "trav-ring")
          .attr("r", r0 + 2)
          .attr("fill", "none")
          .attr("stroke", strokeColor)
          .attr("stroke-width", 2)
          .style("opacity", 0.9)
          .transition()
          .delay(k * 70)
          .duration(360)
          .ease(d3.easeCubicOut)
          .attr("r", r0 + rippleExpand)
          .style("opacity", 0)
          .remove()
          .end();
      }

      // 4) restaura fill y el número del nodo
      await sel
        .transition()
        .duration(200)
        .attr("fill", originalFill ?? null)
        .end();
      if (!centerText.empty()) {
        await centerText.transition().duration(120).style("opacity", 1).end();
      }
    } else {
      // ── preserve-fill: borde y pulso ──
      const originalStroke = sel.attr("stroke");
      const originalStrokeW = sel.attr("stroke-width");

      await sel
        .transition()
        .duration(130)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2)
        .end();

      if (pulse) {
        const parentG = (shape.parentNode as SVGGElement) || shape;
        const r0 =
          shape instanceof SVGCircleElement
            ? +(shape.getAttribute("r") || nodeRadius)
            : nodeRadius;

        for (let k = 0; k < rippleCount; k++) {
          await d3
            .select(parentG)
            .append("circle")
            .attr("class", "trav-ring")
            .attr("r", r0 + 2)
            .attr("fill", "none")
            .attr("stroke", strokeColor)
            .attr("stroke-width", 2)
            .style("opacity", 0.9)
            .transition()
            .delay(k * 70)
            .duration(360)
            .ease(d3.easeCubicOut)
            .attr("r", r0 + rippleExpand)
            .style("opacity", 0)
            .remove()
            .end();
        }
      }

      if (bounce && shape instanceof SVGCircleElement) {
        await d3
          .select(shape)
          .transition()
          .duration(150)
          .attr("r", nodeRadius * 1.1)
          .transition()
          .duration(150)
          .attr("r", nodeRadius)
          .end();
      }

      // ── pop del número central ──
      if (!centerText.empty()) {
        const cur = parseFloat(centerText.style("font-size") || "12");
        await centerText
          .transition()
          .duration(150)
          .ease(d3.easeBackOut.overshoot(1.2))
          .style("font-size", `${cur * valuePopScale}px`)
          .transition()
          .duration(150)
          .ease(d3.easeCubicOut)
          .style("font-size", `${cur}px`)
          .end();
      }

      // ── aparición del número en banda ──
      // 1) atenúa el número central
      if (!centerText.empty()) {
        await centerText
          .transition()
          .duration(120)
          .style("opacity", 0.15)
          .end();
      }

      // 2) pop/fade del seqText en su posición final
      const finalPos = seqPositions.get(id)!;
      const existsVisible =
        seqText.style("opacity") !== "" && seqText.style("opacity") !== "0";

      if (!existsVisible) {
        await seqText
          .attr(
            "transform",
            `translate(${finalPos.x}, ${finalPos.y}) scale(0.9)`
          )
          .style("opacity", 0)
          .transition()
          .duration(420)
          .ease(d3.easeBackOut.overshoot(1.25))
          .style("opacity", 1)
          .attr("transform", `translate(${finalPos.x}, ${finalPos.y}) scale(1)`)
          .end();
      } else {
        await seqText
          .transition()
          .duration(420)
          .ease(d3.easeCubicOut)
          .attr(
            "transform",
            `translate(${finalPos.x}, ${finalPos.y}) scale(1.02)`
          )
          .transition()
          .duration(180)
          .ease(d3.easeCubicOut)
          .attr("transform", `translate(${finalPos.x}, ${finalPos.y}) scale(1)`)
          .end();
      }

      // ── restaura el borde y el número del nodo ──
      await sel
        .transition()
        .duration(130)
        .attr("stroke", originalStroke ?? SVG_STYLE_VALUES.NODE_STROKE)
        .attr(
          "stroke-width",
          originalStrokeW ?? SVG_STYLE_VALUES.NODE_STROKE_WIDTH
        )
        .end();

      if (!centerText.empty()) {
        await centerText.transition().duration(120).style("opacity", 1).end();
      }
    }

    // Vuelve a atenuar el nodo visitado (mantener foco en el siguiente)
    if (spotlight && i < targetNodes.length - 1) {
      await nodeG.transition().duration(100).style("opacity", 0.7).end();
    }

    if (stepDelay) await new Promise((r) => setTimeout(r, stepDelay));
  }

  if (spotlight) await undimAllNodes(treeG, 160);

  resetQueryValues();
  setIsAnimating(false);
}

/* ────────────────────────── SKIN “NEO” PARA N-ARIO ────────────────────────── */
export type NaryNeoSkinOptions = {
  nodeRadius: number;
  ringWidth: number;
  ringColor: string;
  gradStart: string;
  gradEnd: string;
  textColor: string;
  subTextColor: string;
  /** Texto bajo el nodo (p.ej. n-idx). Devuelve null/"" para ocultar. */
  showIndexBelow?: (
    d: d3.HierarchyNode<HierarchyNodeData<number>>
  ) => string | null;

  //NUEVO: estilo del badge de la etiqueta
  metaBadge?: {
    paddingX: number; // padding horizontal interno
    paddingY: number; // padding vertical interno
    corner: number; // radio de esquina
    fill: string; // color de fondo
    stroke: string; // color de borde
    strokeWidth: number; // grosor del borde
    offsetY: number; // separación vertical desde el borde del nodo
    fontSize: string; // tamaño de fuente
    fontWeight: number; // peso de fuente
    fontFamily?: string; // fuente (opcional)
    shadowId?: string; // id de filtro de sombra (opcional)
  };
};

// defaultNaryNeoSkin: añade metaBadge con valores bonitos
export const defaultNaryNeoSkin: NaryNeoSkinOptions = {
  nodeRadius: 18,
  ringWidth: 2.5,
  ringColor: "#D72638",
  gradStart: "#1a1f2b",
  gradEnd: "#0d1016",
  textColor: "#e5e7eb",
  subTextColor: "#9aa4b2",
  showIndexBelow: (d) => `id: ${d.data.id}`,
  metaBadge: {
    paddingX: 6,
    paddingY: 3,
    corner: 8,
    fill: "#0f172a", // slate-900
    stroke: "#334155", // slate-600
    strokeWidth: 0.8,
    offsetY: 8, // distancia bajo el nodo
    fontSize: "10px",
    fontWeight: 600,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    shadowId: "neoNaryShadow", // reutiliza la sombra existente
  },
};

/** Gradiente & sombra para la skin neo (id: neoNaryGrad / neoNaryShadow) */
export function ensureNaryNeoDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  opts: NaryNeoSkinOptions = defaultNaryNeoSkin
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  let grad = defs.select<SVGRadialGradientElement>("#neoNaryGrad");
  if (grad.empty()) {
    grad = defs.append("radialGradient").attr("id", "neoNaryGrad");
    grad.append("stop").attr("offset", "0%").attr("stop-color", opts.gradStart);
    grad.append("stop").attr("offset", "100%").attr("stop-color", opts.gradEnd);
  } else {
    grad.select("stop[offset='0%']").attr("stop-color", opts.gradStart);
    grad.select("stop[offset='100%']").attr("stop-color", opts.gradEnd);
  }

  let filter = defs.select<SVGFilterElement>("#neoNaryShadow");
  if (filter.empty()) {
    filter = defs
      .append("filter")
      .attr("id", "neoNaryShadow")
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

/** Nodos con anillo, gradiente y etiqueta meta opcional */
export function drawNaryNodesNeo(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: d3.HierarchyNode<HierarchyNodeData<number>>[],
  nodePositions: Map<string, { x: number; y: number }>,
  opts: NaryNeoSkinOptions = defaultNaryNeoSkin
) {
  const r = opts.nodeRadius;

  const sel = layer
    .selectAll<SVGGElement, any>("g.node")
    .data(nodes, (d: any) => d.data.id);

  const gEnter = sel
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("id", (d) => d.data.id)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id) || { x: 0, y: 0 };
      return `translate(${p.x},${p.y})`;
    });

  // Anillo
  gEnter
    .append("circle")
    .attr("class", "ring")
    .attr("r", r)
    .attr("fill", "none")
    .attr("stroke", opts.ringColor)
    .attr("stroke-width", opts.ringWidth)
    .attr("filter", "url(#neoNaryShadow)");

  // Disco interior con gradiente
  gEnter
    .append("circle")
    .attr("class", "disc")
    .attr("r", r - opts.ringWidth - 0.6)
    .attr("fill", "url(#neoNaryGrad)");

  // Valor principal
  gEnter
    .append("text")
    .attr("class", "value")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-weight", 900) // más peso
    .style("font-size", "13.5px") // un poco más grande
    .style("letter-spacing", "0.2px")
    .attr("fill", opts.textColor) // ej. #e5e7eb
    // contorno del texto para contraste
    .style("paint-order", "stroke")
    .style("stroke", "#0b1220") // color de borde (oscuro)
    .style("stroke-width", 1.2) // grosor del borde
    .text((d) => String(d.data.value));

  // ───────────────────── Badge “id: n-x” ─────────────────────
  const badgeCfg = {
    ...defaultNaryNeoSkin.metaBadge!,
    ...(opts.metaBadge || {}),
  };

  const badgeEnter = gEnter
    .append("g")
    .attr("class", "meta-badge")
    .style("pointer-events", "none")
    .attr("transform", `translate(0, ${r + badgeCfg.offsetY})`);

  // Fondo del badge
  const bg = badgeEnter
    .append("rect")
    .attr("class", "meta-bg")
    .attr("rx", badgeCfg.corner)
    .attr("ry", badgeCfg.corner)
    .attr("fill", badgeCfg.fill)
    .attr("stroke", badgeCfg.stroke)
    .attr("stroke-width", badgeCfg.strokeWidth);

  // ⛳️ Antes poníamos .attr("filter", ternario ? string : null)
  // TS no acepta string | null. Mejor condicional:
  if (badgeCfg.shadowId) {
    bg.attr("filter", `url(#${badgeCfg.shadowId})`);
  }

  // Texto del badge
  const metaText = badgeEnter
    .append("text")
    .attr("class", "meta-text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .style("font-size", badgeCfg.fontSize)
    .style("font-weight", badgeCfg.fontWeight as any)
    .attr("fill", opts.subTextColor)
    .text((d) => opts.showIndexBelow?.(d) ?? "");

  // ⛳️ Mismo caso: en vez de .style("font-family", badgeCfg.fontFamily || null)
  if (badgeCfg.fontFamily) {
    metaText.style("font-family", badgeCfg.fontFamily);
  }

  // Ajuste de rect al texto (ENTER)
  badgeEnter.each(function () {
    const g = d3.select(this);
    const t = g.select<SVGTextElement>("text.meta-text");
    const bb = (t.node() as SVGTextElement).getBBox();
    g.select<SVGRectElement>("rect.meta-bg")
      .attr("x", -bb.width / 2 - badgeCfg.paddingX)
      .attr("y", -badgeCfg.paddingY) // baseline "hanging": y es el top
      .attr("width", bb.width + badgeCfg.paddingX * 2)
      .attr("height", bb.height + badgeCfg.paddingY * 2);
  });

  // UPDATE (reposicionar nodo y recalcular badge)
  const g = gEnter.merge(sel as any);
  g.transition()
    .duration(220)
    .attr("transform", (d) => {
      const p = nodePositions.get(d.data.id) || { x: 0, y: 0 };
      return `translate(${p.x},${p.y})`;
    });

  // 🔸 ACTUALIZAR EL TEXTO CENTRAL CON EL NUEVO VALOR
  g.select<SVGTextElement>("text.value")
    .text((d) => String(d.data.value))
    .style("font-weight", 900)
    .style("font-size", "13.5px")
    .style("paint-order", "stroke")
    .style("stroke", "#0b1220")
    .style("stroke-width", 1.2);

  // (ya lo tienes) volver a calcular el badge
  g.select<SVGGElement>("g.meta-badge").each(function (d) {
    const gB = d3.select(this);
    const t = gB.select<SVGTextElement>("text.meta-text");
    t.text(opts.showIndexBelow?.(d) ?? "");
    const bb = (t.node() as SVGTextElement).getBBox();
    gB.select<SVGRectElement>("rect.meta-bg")
      .attr("x", -bb.width / 2 - badgeCfg.paddingX)
      .attr("y", -badgeCfg.paddingY)
      .attr("width", bb.width + badgeCfg.paddingX * 2)
      .attr("height", bb.height + badgeCfg.paddingY * 2);
  });

  // EXIT
  sel.exit().transition().duration(140).style("opacity", 0).remove();
}
