import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  TraversalNodeType,
  BPlusHierarchy,
} from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";

/* ─────────── Utilidades específicas B+ ─────────── */
import {
  computeNodeWidth,
  computeNodeHeight,
  ensureBPlusDefs,
  drawBPlusNodesRect,
  drawBPlusLinks, // usa skin por defecto del utility
} from "../../../../../shared/utils/draw/bplusDrawActionsUtilities";

/* ─────────── Utilidades genéricas (secuencia/clear/espaciados) ─────────── */
import {
  SVG_NARY_VALUES,
  animateClearTree,
} from "../../../../../shared/utils/draw/naryDrawActionsUtilities";

/* ─────────── Animaciones B+ (insert / delete / search) ─────────── */
import {
  animateBPlusInsertLeaf,
  animateBPlusDelete,
  animateBPlusSearchPath,
  animateBPlusRange,
   ensureRangeDefs, 
} from "../../../../../shared/utils/draw/bplusDrawActions";

/* ───────────────────── HUD (badge superior) ───────────────────── */
const HUD = {
  x: 12,
  y: 10,
  padX: 8,
  padY: 5,
  corner: 8,
  bg: "#0f172a",
  stroke: "#334155",
  sw: 0.8,
  textSize: "12px",
  textColor: "#e5e7eb",
  fontWeight: 600 as const,
};

/* ╔════════════════════════════════════════════════════════════════════════════╗
   ║                              Helpers locales                               ║
   ╚════════════════════════════════════════════════════════════════════════════╝*/
type HPN = d3.HierarchyPointNode<BPlusHierarchy>;

const nodeW = (n: HPN) => computeNodeWidth(n.data.keys ?? []);

/** Desplaza un subárbol completo en X. */
const shiftSubtree = (n: HPN, dx: number) => {
  n.x += dx;
  if (n.children) (n.children as HPN[]).forEach((c) => shiftSubtree(c, dx));
};

/** Límites horizontales de un subárbol, considerando ancho real de cada nodo. */
function subtreeBounds(n: HPN): { left: number; right: number } {
  let L = Infinity,
    R = -Infinity;
  n.each((d: any) => {
    const w = nodeW(d);
    L = Math.min(L, d.x - w / 2);
    R = Math.max(R, d.x + w / 2);
  });
  return { left: L, right: R };
}

/**
 * Separa hermanos por subárbol asegurando un gap mínimo entre “bandas”
 * y re-centra el padre según el promedio de sus hijos en cada pasada.
 */
function applySmartSpacing(root: HPN, MIN_GAP = 24, PASSES = 3) {
  for (let pass = 0; pass < PASSES; pass++) {
    root.each((p: any) => {
      const kids = (p.children ?? []) as HPN[];
      if (!kids.length) return;

      let accRight = -Infinity;
      for (let i = 0; i < kids.length; i++) {
        const c = kids[i];
        const { left: L, right: R } = subtreeBounds(c);
        if (accRight === -Infinity) {
          accRight = R + MIN_GAP;
          continue;
        }
        const needed = accRight - L;
        if (needed > 0) {
          shiftSubtree(c, needed);
          const b = subtreeBounds(c);
          accRight = b.right + MIN_GAP;
        } else {
          accRight = R + MIN_GAP;
        }
      }

      const avgX = kids.reduce((s, k) => s + k.x, 0) / kids.length;
      p.x = avgX;
    });
  }
}

/** Dibuja/actualiza el badge superior con t y orden (B+). */
function writeDegreeBadge(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  tVal: number,
  order: number | undefined
): { w: number; h: number } {
  let hud = svg.select<SVGGElement>("g.bplus-hud");
  if (hud.empty()) {
    hud = svg
      .append("g")
      .attr("class", "bplus-hud")
      .style("pointer-events", "none");
    hud
      .append("rect")
      .attr("class", "hud-bg")
      .attr("rx", HUD.corner)
      .attr("ry", HUD.corner);
    hud
      .append("text")
      .attr("class", "hud-text")
      .attr("dominant-baseline", "hanging")
      .style("font-size", HUD.textSize)
      .style("font-weight", HUD.fontWeight)
      .attr("fill", HUD.textColor);
  }

  const label = `B+  • t = ${tVal}${order ? `  (orden m = ${order})` : ""}`;
  hud.attr("transform", `translate(${HUD.x}, ${HUD.y})`);
  hud.select<SVGTextElement>("text.hud-text").text(label);

  const txt = hud.select<SVGTextElement>("text.hud-text").node()!;
  const bb = txt.getBBox();
  hud
    .select<SVGRectElement>("rect.hud-bg")
    .attr("x", bb.x - HUD.padX)
    .attr("y", bb.y - HUD.padY)
    .attr("width", bb.width + HUD.padX * 2)
    .attr("height", bb.height + HUD.padY * 2)
    .attr("fill", HUD.bg)
    .attr("stroke", HUD.stroke)
    .attr("stroke-width", HUD.sw);

  hud.raise();
  return { w: bb.width + HUD.padX * 2, h: bb.height + HUD.padY * 2 };
}

/** Limpia nodos “fantasma” que hayan quedado de renders previos. */
function cleanupGhostNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  validIds: Set<string>
) {
  const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
  nodesLayer
    .selectAll<SVGGElement, unknown>("g.node")
    .filter(function () {
      const id = (this as SVGGElement).id;
      return !!id && !validIds.has(id);
    })
    .remove();

  nodesLayer
    .selectAll<SVGGElement, unknown>("g.node")
    .filter(function () {
      const sel = d3.select(this);
      const o =
        Number(sel.attr("opacity")) || Number(sel.style("opacity")) || 1;
      return o < 0.05;
    })
    .remove();
}

/** Busca la HOJA que contiene la clave (clave real en B+). */
function findLeafWithKey(
  nodes: d3.HierarchyNode<BPlusHierarchy>[],
  value: number
): { node: d3.HierarchyNode<BPlusHierarchy>; keyIndex: number } | null {
  for (const n of nodes) {
    if (!n.data.isLeaf) continue;
    const idx = n.data.keys.findIndex((k: number) => k === value);
    if (idx !== -1) return { node: n, keyIndex: idx };
  }
  return null;
}

/* ╔════════════════════════════════════════════════════════════════════════════╗
   ║                                Hook principal                              ║
   ╚════════════════════════════════════════════════════════════════════════════╝*/
type QueryBPlus = BaseQueryOperations<"arbol_bplus"> & {
  toGetRange?: TraversalNodeType[];
  toScanFrom?: TraversalNodeType[];
  range?: { from: number; to: number };
};

/**
 * Render y orquestación del Árbol B+ (layout, estilos y animaciones).
 * No pasamos estilos desde aquí; el skin vive en utilities.
 */
export function useBPlusRender(
  treeData: BPlusHierarchy | null,
  query: QueryBPlus,
  resetQueryValues: () => void
) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Caches de posiciones
  const nodePositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;
  const seqPositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;

  // Offsets de pintado (árbol y banda)
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // Hierarchy D3 (memo)
  const root = useMemo(
    () => (treeData ? d3.hierarchy<BPlusHierarchy>(treeData) : null),
    [treeData]
  );
  const currentNodes = useMemo(() => (root ? root.descendants() : []), [root]);

  const { isAnimating, setIsAnimating } = useAnimation();

  /* ───────────────── Render base: layout + capas + dibujo ───────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    // 1) Layout
    const margin = {
      left: SVG_NARY_VALUES.MARGIN_LEFT,
      right: SVG_NARY_VALUES.MARGIN_RIGHT,
      top: SVG_NARY_VALUES.MARGIN_TOP,
      bottom: SVG_NARY_VALUES.MARGIN_BOTTOM,
    };

    const LINK_CLEARANCE = 60;
    const levelSpacing = computeNodeHeight() + LINK_CLEARANCE;

    const treeLayout = d3
      .tree<BPlusHierarchy>()
      .nodeSize([SVG_NARY_VALUES.NODE_SPACING, levelSpacing]);

    const pRoot = treeLayout(root);
    applySmartSpacing(pRoot as HPN, 28, 3);

    // 2) Extremos visuales según tamaño real del nodo
    const nodesP = (pRoot as HPN).descendants();
    const nodeH = computeNodeHeight();

    const minXv = d3.min(
      nodesP,
      (d) => d.x - computeNodeWidth(d.data.keys ?? []) / 2
    )!;
    const maxXv = d3.max(
      nodesP,
      (d) => d.x + computeNodeWidth(d.data.keys ?? []) / 2
    )!;
    const minYv = d3.min(nodesP, (d) => d.y - nodeH / 2)!;
    const maxYv = d3.max(nodesP, (d) => d.y + nodeH / 2)!;

    // 3) SVG + defs
    const svg = d3.select(svgRef.current);
    svg.selectAll<SVGElement, unknown>("*").interrupt();
    ensureBPlusDefs(svg);
    ensureRangeDefs(svg);
    
    // 4) HUD
    const order = treeData?.order;
    const tVal = order && order > 0 ? Math.max(2, Math.floor(order / 2)) : 2;
    const { w: hudW, h: hudH } = writeDegreeBadge(svg, tVal, order);
    const SAFE_GAP = 10;
    const extraTop = hudH + SAFE_GAP;
    const extraRight = HUD.x + hudW + SAFE_GAP;

    // 5) Offsets (centra y despeja HUD)
    treeOffset.x = margin.left - minXv;
    treeOffset.y = margin.top - minYv + extraTop;

    // 6) Capas
    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty())
      linksLayer = treeG.append("g").attr("class", "links-layer");

    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty())
      nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    // 7) Banda de secuencia (debajo del árbol)
    const nSlotsAprox = nodesP.reduce(
      (acc, n) => acc + (n.data.keys?.length ?? 0),
      0
    );
    const seqContent =
      nSlotsAprox > 0
        ? (nSlotsAprox - 1) * SVG_NARY_VALUES.SEQUENCE_PADDING
        : 0;
    const seqWidth = seqContent + margin.left + margin.right;

    seqOffset.x = margin.left;
    seqOffset.y =
      treeOffset.y +
      (maxYv - minYv) +
      SVG_NARY_VALUES.SEQUENCE_PADDING +
      SVG_NARY_VALUES.SEQUENCE_HEIGHT;

    let seqG = svg.select<SVGGElement>("g.seq-container");
    if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);
    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // 8) Actualiza cache de posiciones DOM (centros de nodo)
    nodePositions.clear();
    nodesP.forEach((d) => {
      nodePositions.set(d.data.id, { x: d.x, y: d.y });
    });

    // 9) Dibujo base
    drawBPlusNodesRect(nodesLayer, nodesP as any, nodePositions);
    drawBPlusLinks(linksLayer, pRoot as any, nodePositions);

    // 10) Limpieza y orden de capas
    const validIds = new Set(nodesP.map((d) => d.data.id));
    cleanupGhostNodes(treeG, validIds);
    linksLayer.lower();
    nodesLayer.raise();
    treeG
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .lower();

    // 11) Tamaño final del SVG
    const treeWidthVisual = maxXv - minXv + margin.left + margin.right;
    const width = Math.max(treeWidthVisual, seqWidth, extraRight);
    const height =
      maxYv -
      minYv +
      margin.top +
      margin.bottom +
      extraTop +
      SVG_NARY_VALUES.SEQUENCE_PADDING +
      SVG_NARY_VALUES.SEQUENCE_HEIGHT;

    svg.attr("width", width).attr("height", height);
  }, [root, treeData, nodePositions, seqPositions]);

  /* ───────── Limpieza robusta ante nuevas operaciones ───────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const seqG = svg.select<SVGGElement>("g.seq-container");
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const anyCommand =
      query.toInsert != null ||
      query.toDelete != null ||
      query.toSearch != null ||
      !!query.toClear ||
      (query.toGetRange?.length ?? 0) > 0 ||
      (query.toScanFrom?.length ?? 0) > 0;
    (query as any).range;

    if (!anyCommand) return;

    seqG.selectAll("*").interrupt();
    treeG.selectAll("*").interrupt();

    // limpia posibles overlays
    svg.selectAll("g.bplus-traverse-overlay").interrupt().remove();
    svg.selectAll("g.bp-insert-overlay").interrupt().remove(); // ← añade estos
    svg.selectAll("g.bp-delete-overlay").interrupt().remove();
    svg.selectAll("g.bp-range-overlay").interrupt().remove(); // 👈 añade esto

    // limpia banda
    seqG.selectAll("*").remove();
    seqPositions.clear();

    setIsAnimating(false);
  }, [
    query.toInsert,
    query.toDelete,
    query.toSearch,
    query.toClear,
    query.toGetRange,
    query.toScanFrom,
    setIsAnimating,
    seqPositions,
  ]);

  /* ─────────────────────────── Inserción ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toInsert == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const hit = findLeafWithKey(currentNodes as any, query.toInsert);

    animateBPlusInsertLeaf(
      treeG,
      {
        leafId:
          hit?.node.data.id ??
          (currentNodes.find((n) => n.data.isLeaf)?.data.id as string),
        rootHierarchy: root as any,
        nodesData: currentNodes as any,
        slotIndex: typeof hit?.keyIndex === "number" ? hit!.keyIndex : null,
      },
      nodePositions,
      resetQueryValues,
      setIsAnimating
    ).catch(() => {
      resetQueryValues();
      setIsAnimating(false);
    });
  }, [
    root,
    currentNodes,
    query.toInsert,
    nodePositions,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────────────────────── Eliminación ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toDelete == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Debe existir la clave en una hoja del árbol ACTUAL
    const hit = findLeafWithKey(currentNodes as any, query.toDelete);
    if (!hit) {
      resetQueryValues();
      return;
    }

    animateBPlusDelete(
      treeG,
      {
        leafId: hit.node.data.id,
        slotIndex: hit.keyIndex,
        rootHierarchy: root as any,
        nodesData: currentNodes as any,
      },
      nodePositions,
      resetQueryValues,
      setIsAnimating
    ).catch(() => {
      resetQueryValues();
      setIsAnimating(false);
    });
  }, [
    root,
    currentNodes,
    query.toDelete,
    nodePositions,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────────────────────── Búsqueda (con recorrido completo) ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toSearch == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Hoja que contiene la clave
    const hit = findLeafWithKey(currentNodes as any, query.toSearch);
    if (!hit) {
      resetQueryValues();
      return;
    }

    // Construye path raíz→hoja usando el root real de este render
    const pathNodes = (root as any).path(
      hit.node
    ) as d3.HierarchyNode<BPlusHierarchy>[];

    animateBPlusSearchPath(
      treeG,
      pathNodes,
      nodePositions,
      resetQueryValues,
      setIsAnimating,
      { leafId: hit.node.data.id, slotIndex: hit.keyIndex }
    ).catch(() => {
      resetQueryValues();
      setIsAnimating(false);
    });
  }, [
    root,
    currentNodes,
    query.toSearch,
    nodePositions,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────────────────────── RANGE: recorrido verde hoja→hoja ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || isAnimating) return;

    const limits = (query as any).range as
      | { from: number; to: number }
      | undefined;
    if (!limits || !Number.isFinite(limits.from) || !Number.isFinite(limits.to))
      return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    (async () => {
      try {
        await animateBPlusRange(
          treeG,
          {
            rootHierarchy: root as any,
            nodesData: currentNodes as any,
            from: limits.from,
            to: limits.to,
          },
          nodePositions,
          resetQueryValues, // ✅ pásalo para que la animación limpie el query al terminar
          setIsAnimating
        );
      } catch {
        setIsAnimating(false);
      }
    })();

    return () => {
      svg.selectAll("g.bp-range-overlay").interrupt().remove();
      setIsAnimating(false);
    };
  }, [
    root,
    currentNodes,
    nodePositions,
    isAnimating,
    setIsAnimating,
    (query as any).range?.from, // 👈 dependencias
    (query as any).range?.to,
  ]);

  /* ─────────────────────────────────── Clear total ─────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current || !query.toClear || isAnimating) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    animateClearTree(
      treeG,
      seqG,
      { nodePositions, seqPositions },
      resetQueryValues,
      setIsAnimating
    );

    svg.selectAll("g.nary-search-overlay").remove();
    svg.selectAll("g.nary-move-overlay").remove();
  }, [
    query.toClear,
    resetQueryValues,
    setIsAnimating,
    isAnimating,
    nodePositions,
    seqPositions,
  ]);

  return { svgRef };
}
