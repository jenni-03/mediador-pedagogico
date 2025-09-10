// src/hooks/estructures/arbolB/useBTreeRender.ts
import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  TraversalNodeType,
  BHierarchy,
} from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import {
  computeNodeWidth,
  computeNodeHeight,
} from "../../../../../shared/utils/draw/btreeDrawActionsUtilities";

/* ───────────────────── Utilidades genéricas (secuencia/clear/paths) ───────────────────── */
import {
  SVG_NARY_VALUES,
  drawTraversalSequence,
  animateClearTree,
} from "../../../../../shared/utils/draw/naryDrawActionsUtilities";

/* ───────────────────── Dibujo/animaciones específicas de Árbol B ───────────────────── */
import {
  ensureBTreeSkinDefs,
  drawBTreeNodes,
  drawBTreeLinks,
  animateBCreateRoot,
  animateBInsertNode,
  animateBDeleteSmart, // versión "smart" que usa posiciones previas y nuevas
  animateBSearchPath,
  animateBTraversal,
} from "../../../../../shared/utils/draw/BTreeDrawActions";

/* ───────────────────── HUD (badge superior de grado/orden) ───────────────────── */
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

/** Dibuja/actualiza el badge superior con t y orden. */
function writeDegreeBadge(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  tVal: number,
  order: number | undefined
): { w: number; h: number } {
  let hud = svg.select<SVGGElement>("g.btree-hud");
  if (hud.empty()) {
    hud = svg
      .append("g")
      .attr("class", "btree-hud")
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

  const label = `t = ${tVal}${order ? `  (orden m = ${order})` : ""}`;
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

  hud.raise(); // asegura que quede por encima
  return { w: bb.width + HUD.padX * 2, h: bb.height + HUD.padY * 2 };
}

/** Sanea listas de recorrido: quita nulos, ids vacíos y duplicados. */
function sanitizeTraversal(values: TraversalNodeType[]): TraversalNodeType[] {
  if (!Array.isArray(values)) return [];
  const filtered = values.filter(
    (d): d is TraversalNodeType =>
      !!d && typeof d.id === "string" && d.id.length > 0
  );
  const byId = new Map<string, TraversalNodeType>();
  for (const v of filtered) if (!byId.has(v.id)) byId.set(v.id, v);
  return Array.from(byId.values());
}

/** Limpia nodos “fantasma” que hayan quedado de renders previos. */
function cleanupGhostNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  validIds: Set<string>
) {
  const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
  // Remueve nodos que ya no existen en data
  nodesLayer
    .selectAll<SVGGElement, unknown>("g.node")
    .filter(function () {
      const id = (this as SVGGElement).id;
      return !!id && !validIds.has(id);
    })
    .remove();
  // Remueve nodos con opacidad muy baja (apagados por animaciones)
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

/** Busca un nodo que contenga la clave `value` y devuelve nodo + índice de la key. */
function findNodeWithKey(
  nodes: d3.HierarchyNode<BHierarchy>[],
  value: number
): { node: d3.HierarchyNode<BHierarchy>; keyIndex: number } | null {
  for (const n of nodes) {
    const idx = d3.bisector((k: number) => k).left(n.data.keys, value);
    if (idx < n.data.keys.length && n.data.keys[idx] === value) {
      return { node: n, keyIndex: idx };
    }
  }
  return null;
}

/** Brillo breve en la “cajita” (slot) de una clave dentro del nodo B. */
async function highlightBKeySlot(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodeId: string,
  keyIndex: number
) {
  const slotG = treeG.select<SVGGElement>(
    `g#${nodeId} g.slots g#${nodeId}#k${keyIndex}`
  );
  const box = slotG.select<SVGRectElement>("rect.slot-box");
  if (box.empty()) return;

  const sel = box;
  const origStroke = sel.attr("stroke");
  const origW = sel.attr("stroke-width");

  await sel
    .transition()
    .duration(180)
    .attr("stroke", "#60a5fa")
    .attr("stroke-width", (+origW || 1.1) + 0.9)
    .end();

  await sel
    .transition()
    .duration(220)
    .attr("stroke", origStroke ?? "#374151")
    .attr("stroke-width", origW ?? "1.1")
    .end();
}

/* ╔════════════════════════════════════════════════════════════════════════════╗
   ║                                Hook principal                              ║
   ╚════════════════════════════════════════════════════════════════════════════╝*/

export function useBTreeRender(
  treeData: BHierarchy | null,
  query: BaseQueryOperations<"arbol_b">,
  resetQueryValues: () => void
) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Cache de posiciones (DOM space) para nodos y banda de secuencia
  const nodePositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;
  const seqPositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;

  // Offsets de pintado (árbol y banda)
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // Hierarchy D3
  const root = useMemo(
    () => (treeData ? d3.hierarchy<BHierarchy>(treeData) : null),
    [treeData]
  );
  const currentNodes = useMemo(() => (root ? root.descendants() : []), [root]);

  // Estado previo (para animaciones de delete) + flag animando
  const prevRoot = usePrevious(root);
  const { setIsAnimating } = useAnimation();

  /* ───────────────── Render base (layout + capas + dibujo) ─────────────────
     IMPORTANTE: si hay un delete en curso (query.toDelete != null) y tenemos
     prevRoot, evitamos redibujar aquí para no pisar la animación de borrado.
  -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!root || !svgRef.current) return;
    if (query.toDelete != null && prevRoot) return; // bloqueo durante delete

    // 1) Layout D3 → HierarchyPointNode (x,y)
    const margin = {
      left: SVG_NARY_VALUES.MARGIN_LEFT,
      right: SVG_NARY_VALUES.MARGIN_RIGHT,
      top: SVG_NARY_VALUES.MARGIN_TOP,
      bottom: SVG_NARY_VALUES.MARGIN_BOTTOM,
    };

    const treeLayout = d3
      .tree<BHierarchy>()
      .nodeSize([SVG_NARY_VALUES.NODE_SPACING, SVG_NARY_VALUES.LEVEL_SPACING]);

    const pRoot = treeLayout(root);
    type HPN = d3.HierarchyPointNode<BHierarchy>;

    // 1.1) Compactación horizontal suave entre hermanos
    const GAP_SIBLINGS = 10;
    const MAX_SHIFT_PER_PAIR = 22;
    const PASSES = 2;

    const shiftSubtree = (n: HPN, dx: number) => {
      n.x += dx;
      if (n.children) (n.children as HPN[]).forEach((c) => shiftSubtree(c, dx));
    };

    for (let pass = 0; pass < PASSES; pass++) {
      (pRoot as HPN).each((p: HPN) => {
        const kids = (p.children ?? []) as HPN[];
        if (!kids.length) return;

        for (let i = 0; i < kids.length - 1; i++) {
          const a = kids[i];
          const b = kids[i + 1];

          const wA = computeNodeWidth(a.data.keys ?? []);
          const wB = computeNodeWidth(b.data.keys ?? []);
          const desired = wA / 2 + wB / 2 + GAP_SIBLINGS;
          const current = b.x - a.x;

          if (current < desired) {
            const need = Math.min(desired - current, MAX_SHIFT_PER_PAIR * 2);
            shiftSubtree(a, -need / 2);
            shiftSubtree(b, +need / 2);
          }
        }

        // Recentra el padre en el promedio de sus hijos
        const avgX = kids.reduce((s, k) => s + k.x, 0) / kids.length;
        p.x = avgX;
      });
    }

    // 2) Extremos VISUALES (consideran ancho/alto del nodo)
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

    // 3) Selección SVG + defs (tamaño final se ajusta tras escribir HUD)
    const svg = d3.select(svgRef.current);
    ensureBTreeSkinDefs(svg);

    // 4) HUD: deducimos t desde order (sin comando init)
    const order = treeData?.order;
    const tVal = order && order > 0 ? Math.max(2, Math.floor(order / 2)) : 2;

    const { w: hudW, h: hudH } = writeDegreeBadge(svg, tVal, order);
    const SAFE_GAP = 10;
    const extraTop = hudH + SAFE_GAP; // margen superior para el HUD
    const extraRight = HUD.x + hudW + SAFE_GAP; // para que no se corte a la derecha

    // 5) Offsets (centra contenido visual y despeja HUD)
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

    // 8) Dibujo base
    drawBTreeNodes(nodesLayer, nodesP as any, nodePositions);
    drawBTreeLinks(linksLayer, pRoot as any, nodePositions);

    // 9) Limpieza y orden de capas
    const validIds = new Set(nodesP.map((d) => d.data.id));
    cleanupGhostNodes(treeG, validIds);
    linksLayer.lower();
    nodesLayer.raise();
    treeG
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .lower();

    // 10) Tamaño final del SVG (árbol + HUD sin recortes)
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
  }, [root, treeData, query.toDelete, prevRoot]);

  /* ─────────────────── Limpieza robusta de banda de recorridos ─────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // ¿Llegó cualquier comando que requiera limpiar banda/overlays?
    const anyCommand =
      query.toInsert != null ||
      query.toDelete != null ||
      query.toSearch != null ||
      query.toClear ||
      query.toGetPreOrder.length > 0 ||
      query.toGetInOrder.length > 0 ||
      query.toGetPostOrder.length > 0 ||
      query.toGetLevelOrder.length > 0;

    if (!anyCommand) return;

    // 1) Detener transiciones en curso
    seqG.selectAll("*").interrupt();
    svg.selectAll("g.tt-traverse-overlay, g.b-traverse-overlay").interrupt();

    // 2) Vaciar TODO el contenido de la banda (no el <g> en sí)
    seqG.selectAll("*").remove();

    // 3) Limpiar caché y overlays
    seqPositions.clear();
    svg.selectAll("g.tt-traverse-overlay, g.b-traverse-overlay").remove();
  }, [
    query.toInsert,
    query.toDelete,
    query.toSearch,
    query.toClear,
    query.toGetPreOrder,
    query.toGetInOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
  ]);

  /* ─────────────────────────── Crear raíz (primer insert) ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toInsert == null) return;
    // Si antes no había root, ahora sí: animación de creación de raíz
    if (!prevRoot && root) {
      const svg = d3.select(svgRef.current);
      const treeG = svg.select<SVGGElement>("g.tree-container");
      animateBCreateRoot(treeG, root.data.id, resetQueryValues, setIsAnimating);
    }
  }, [root, prevRoot, query.toInsert, resetQueryValues, setIsAnimating]);

  /* ───────────────────────── Inserción (reflow + highlight) ───────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toInsert == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // 1) Localiza nodo/índice del valor insertado
    const hit = findNodeWithKey(currentNodes as any, query.toInsert);
    if (hit) {
      highlightBKeySlot(treeG, hit.node.data.id, hit.keyIndex).catch(() => {});
    }

    // 2) Animación de inserción + reflow
    animateBInsertNode(
      treeG,
      {
        newNodeId: hit ? hit.node.data.id : root.data.id,
        rootHierarchy: root as any,
        nodesData: currentNodes as any,
        slotIndex: hit ? hit.keyIndex : null,
      },
      nodePositions,
      resetQueryValues,
      setIsAnimating
    );
  }, [root, currentNodes, query.toInsert, resetQueryValues, setIsAnimating]);

  /* ─────────────── Eliminación (animación “smart” con prev/new positions) ─────────────── */
  useEffect(() => {
    if (!svgRef.current || query.toDelete == null) return;
    if (!prevRoot || !root) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // 1) Localiza el slot previo donde estaba la clave borrada
    const prevNodes = prevRoot.descendants();
    let deleteHit: { nodeId: string; keyIndex: number } | null = null;
    for (const n of prevNodes) {
      const i = d3.bisector((k: number) => k).left(n.data.keys, query.toDelete);
      if (i < n.data.keys.length && n.data.keys[i] === query.toDelete) {
        deleteHit = { nodeId: n.data.id, keyIndex: i };
        break;
      }
    }

    // 2) Construye layouts PREVIO y NUEVO para obtener mapas de posiciones
    const layout = d3
      .tree<BHierarchy>()
      .nodeSize([SVG_NARY_VALUES.NODE_SPACING, SVG_NARY_VALUES.LEVEL_SPACING]);

    const pPrev = layout(prevRoot as any);
    const prevPositions = new Map<string, { x: number; y: number }>();
    (pPrev.descendants() as any).forEach((d: any) => {
      prevPositions.set(d.data.id, { x: d.x, y: d.y });
    });

    const pNext = layout(root as any);
    const nextPositions = new Map<string, { x: number; y: number }>();
    (pNext.descendants() as any).forEach((d: any) => {
      nextPositions.set(d.data.id, { x: d.x, y: d.y });
    });

    // (opcional) sincroniza el caché compartido con las posiciones nuevas
    nodePositions.clear();
    nextPositions.forEach((pos, id) => nodePositions.set(id, pos));

    // 3) Pasos de borrow/merge si los expone tu estructura
    const fixSteps = (query as any).bFix ?? [];

    // 4) Corre la animación de borrado “smart”
    animateBDeleteSmart(
      treeG,
      {
        prevRoot: prevRoot as any,
        nextRoot: root as any,
        nextNodes: (root as any).descendants(),
        deleteHit,
        fixSteps,
      },
      nextPositions, // posiciones NUEVAS
      prevPositions, // posiciones PREVIAS
      resetQueryValues,
      setIsAnimating
    );
  }, [
    prevRoot,
    root,
    currentNodes,
    query.toDelete,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────────────────────────── Búsqueda (por valor) ─────────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toSearch == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const hit = findNodeWithKey(currentNodes as any, query.toSearch);
    if (!hit) return;

    const pathToNode = root.path(hit.node);
    animateBSearchPath(
      treeG,
      pathToNode as any,
      nodePositions,
      resetQueryValues,
      setIsAnimating
    ).then(() => {
      // brillo en el slot exacto
      highlightBKeySlot(treeG, hit.node.data.id, hit.keyIndex).catch(() => {});
    });
  }, [root, currentNodes, query.toSearch, resetQueryValues, setIsAnimating]);

  /* ─────────────────────────────── Recorridos (traversals) ─────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const traversalType =
      query.toGetPreOrder.length > 0
        ? "pre"
        : query.toGetInOrder.length > 0
          ? "in"
          : query.toGetPostOrder.length > 0
            ? "post"
            : query.toGetLevelOrder.length > 0
              ? "level"
              : null;

    if (!traversalType) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    let nodes: TraversalNodeType[] = [];
    if (traversalType === "pre") nodes = query.toGetPreOrder;
    else if (traversalType === "in") nodes = query.toGetInOrder;
    else if (traversalType === "post") nodes = query.toGetPostOrder;
    else if (traversalType === "level") nodes = query.toGetLevelOrder;

    // Saneado de la secuencia
    const safeNodes = sanitizeTraversal(nodes);
    if (safeNodes.length === 0) return;

    // Render de la banda (etiquetas)
    drawTraversalSequence(seqG, safeNodes, {
      nodePositions,
      seqPositions,
      treeOffset,
      seqOffset,
    });

    // Animación del “runner”
    animateBTraversal(
      svg,
      treeG,
      safeNodes,
      seqG,
      seqPositions,
      nodePositions,
      resetQueryValues,
      setIsAnimating,
      {
        runnerRadius: 6,
        runnerSpeed: 420,
        strokeColor: "#8aa0ff",
        bounce: true,
        stepDelay: 60,
      }
    );
  }, [
    query.toGetPreOrder,
    query.toGetInOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────────────────────────────── Clear total ─────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current || !query.toClear) return;

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

    // Limpia overlays auxiliares (por si llegasen a existir)
    svg.selectAll("g.nary-search-overlay").remove();
    svg.selectAll("g.nary-move-overlay").remove();
  }, [query.toClear, resetQueryValues, setIsAnimating]);

  return { svgRef };
}
