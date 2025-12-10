// src/hooks/estructures/btree/useBTreeRender.ts
import * as d3 from "d3";
import {
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect, // ← importante
} from "react";
import {
  BaseQueryOperations,
  TraversalNodeType,
  BHierarchy,
} from "../../../../../types";

import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { useBus } from "../../../../../shared/hooks/useBus";
import { delay } from "../../../../../shared/utils/simulatorUtils";
import { getArbolBCode } from "../../../../../shared/constants/pseudocode/arbolBCode";

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

const BT_CODE = getArbolBCode();
type BHNode = d3.HierarchyNode<BHierarchy>;

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

  hud.raise();
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

  // Estado previo (para animaciones) + animación
  const prevRoot = usePrevious(root);
  const { setIsAnimating } = useAnimation();
  const bus = useBus();

  // Lock simple tipo “cola” para encolar animaciones
  const animChainRef = useRef<Promise<void>>(Promise.resolve());
  function runExclusive(fn: () => Promise<void>) {
    const runner = async () => {
      setIsAnimating(true);
      try {
        await fn();
      } finally {
        setIsAnimating(false);
      }
    };
    const next = animChainRef.current.then(runner, runner);
    animChainRef.current = next.catch(() => {});
    return next;
  }

  /* ───────────────── Render base (layout + capas + dibujo) ─────────────────
   Se ejecuta en useLayoutEffect para que el DOM esté listo ANTES del pintado.
   Durante delete “smart” y durante insert dejamos que lo manejen
   sus efectos específicos (pseudocódigo + animación).
-------------------------------------------------------------------------- */
  useLayoutEffect(() => {
    if (!svgRef.current) return;

    const isDeleteInProgress = query.toDelete != null;
    const isInsertInProgress = query.toInsert != null;

    // Árbol "no vacío" ANTES de este frame = existía algún nodo con al menos una key
    const hadNodesBefore =
      !!prevRoot &&
      (prevRoot.descendants() as d3.HierarchyNode<BHierarchy>[]).some(
        (d) => (d.data.keys?.length ?? 0) > 0
      );

    // 1) DELETE: mientras hay delete en curso, congelamos completamente
    // el render base (se mantiene el árbol anterior en pantalla).
    // OJO: esto debe evaluarse ANTES de mirar root, porque root
    // puede haber quedado a null después del delete.
    if (isDeleteInProgress && prevRoot) {
      return;
    }

    // 2) INSERT: si el árbol NO estaba vacío, también congelamos el render base
    // (se sigue viendo el árbol "antes" mientras corre el pseudocódigo).
    if (isInsertInProgress && hadNodesBefore) {
      return;
    }

    // Si llegamos aquí y no hay root, no hay nada que dibujar.
    if (!root) return;

    // 3) Layout D3 → HierarchyPointNode (x,y)
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

    // 3.1) Compactación horizontal suave entre hermanos
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

        const avgX = kids.reduce((s, k) => s + k.x, 0) / kids.length;
        p.x = avgX;
      });
    }

    // 4) Extremos VISUALES (consideran ancho/alto del nodo)
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

    // 5) Selección SVG + defs
    const svg = d3.select(svgRef.current);
    ensureBTreeSkinDefs(svg);

    // 6) HUD: deducimos t desde order
    const order = treeData?.order;
    const tVal = order && order > 0 ? Math.max(2, Math.floor(order / 2)) : 2;

    const { w: hudW, h: hudH } = writeDegreeBadge(svg, tVal, order);
    const SAFE_GAP = 10;
    const extraTop = hudH + SAFE_GAP;
    const extraRight = HUD.x + hudW + SAFE_GAP;

    // 7) Offsets (centra contenido visual y despeja HUD)
    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) {
      treeG = svg.append("g").classed("tree-container", true);
    }

    treeG.attr("data-ready", "0");

    treeOffset.x = margin.left - minXv;
    treeOffset.y = margin.top - minYv + extraTop;
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty())
      linksLayer = treeG.append("g").attr("class", "links-layer");

    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty())
      nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    // 8) Dibujo base
    drawBTreeNodes(nodesLayer, nodesP as any, nodePositions);
    drawBTreeLinks(linksLayer, pRoot as any, nodePositions);

    // 8.1) Insert sobre árbol que estaba vacío:
    // dibujamos pero OCULTO hasta que termine el pseudocódigo.
    const shouldHideForFirstInsert = isInsertInProgress && !hadNodesBefore;

    nodesLayer
      .selectAll<SVGGElement, unknown>("g.node")
      .style("visibility", shouldHideForFirstInsert ? "hidden" : "visible");

    linksLayer
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .style("visibility", shouldHideForFirstInsert ? "hidden" : "visible");

    // 9) Limpieza y orden de capas
    const validIds = new Set(nodesP.map((d) => d.data.id));
    cleanupGhostNodes(treeG, validIds);
    linksLayer.lower();
    nodesLayer.raise();
    treeG
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .lower();

    // 10) Banda de secuencia (debajo del árbol)
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

    treeG.attr("data-ready", "1").style("opacity", 1);
  }, [
    root,
    treeData,
    query.toDelete,
    query.toInsert,
    prevRoot,
    nodePositions,
    treeOffset,
    seqOffset,
  ]);

  /* ─────────────────── Limpieza robusta de banda de recorridos ─────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const seqG = svg.select<SVGGElement>("g.seq-container");

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

    seqG.selectAll("*").interrupt();
    svg.selectAll("g.tt-traverse-overlay, g.b-traverse-overlay").interrupt();

    seqG.selectAll("*").remove();
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
    seqPositions,
  ]);

  /* ───────────────── Insert: pseudocódigo + animación geométrica ───────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toInsert == null) return;

    const labels = BT_CODE.insert.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `btree-insert-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    // Estado previo
    const prevHadRoot = !!prevRoot;
    const prevKeysLen = prevRoot?.data?.keys?.length ?? 0;
    const treeWasEmptyBefore = !prevHadRoot || prevKeysLen === 0;

    // Heurística: raíz llena antes del insert
    let rootWasFullBefore = false;
    if (prevRoot && prevKeysLen > 0) {
      const data: any = prevRoot.data;
      const t =
        typeof data.t === "number" && data.t > 0
          ? (data.t as number)
          : undefined;
      const order =
        typeof data.order === "number" && data.order > 0
          ? (data.order as number)
          : undefined;

      let maxKeys: number | null = null;
      if (t != null) maxKeys = 2 * t - 1;
      else if (order != null) maxKeys = order - 1;

      if (maxKeys != null) {
        rootWasFullBefore = prevKeysLen >= maxKeys;
      }
    }

    const valueToInsert = query.toInsert as unknown as number;

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      // Limpia overlays previos
      svg.selectAll("g.b-traverse-overlay").interrupt().remove();
      svg
        .selectAll(".b-runner,.b-step-ring,.b-target-ring")
        .interrupt()
        .remove();

      // Notificar inicio de operación
      bus.emit("op:start", { op: "insert" });

      /* ───────────── Caso 0: árbol vacío → crear raíz hoja ───────────── */
      if (treeWasEmptyBefore) {
        await step("BT_INSERT_ROOT_EMPTY_COMMENT", 450);
        if (cancelled) return;

        await step("BT_INSERT_ROOT_EMPTY_IF", 500);
        if (cancelled) return;

        await step("BT_INSERT_CHECK_CAP_ROOT_EMPTY", 450);
        if (cancelled) return;

        await step("BT_INSERT_NEW_ROOT_NODE", 450);
        if (cancelled) return;

        await step("BT_INSERT_ROOT_ADD_KEY", 450);
        if (cancelled) return;

        await step("BT_INSERT_ROOT_SIZE_COMMENT", 350);
        if (cancelled) return;

        await step("BT_INSERT_RETURN_AFTER_NEW_ROOT", 450);
        if (cancelled) return;

        // Fin pseudocódigo: liberamos el query para permitir el render base
        resetQueryValues();

        // Dejamos que React/d3 pinten el árbol definitivo
        await delay(0);
        if (cancelled || !svgRef.current) return;

        const svgAfter = d3.select<SVGSVGElement, unknown>(svgRef.current!);
        const treeGAfter = svgAfter.select<SVGGElement>("g.tree-container");

        // Animación de creación de raíz sobre el árbol ya dibujado
        await animateBCreateRoot(
          treeGAfter,
          root.data.id,
          () => {}, // ya hicimos resetQueryValues arriba
          setIsAnimating
        );

        if (!cancelled) {
          bus.emit("op:done", { op: "insert" });
        }
        return;
      }

      /* ───────────── Caso general: árbol no vacío ───────────── */

      // Caso 1: duplicados (camino feliz: asumimos que la DomainError se manejó antes)
      await step("BT_INSERT_DUPLICATE_COMMENT", 450);
      if (cancelled) return;

      await step("BT_INSERT_DUPLICATE_IF", 500);
      if (cancelled) return;

      // Caso 2: raíz llena → dividir antes de descender (o rama else)
      if (rootWasFullBefore) {
        await step("BT_INSERT_ROOT_FULL_COMMENT", 450);
        if (cancelled) return;

        await step("BT_INSERT_ROOT_FULL_IF", 450);
        if (cancelled) return;

        await step("BT_INSERT_CHECK_CAP_NEW_ROOT", 420);
        if (cancelled) return;

        await step("BT_INSERT_NEW_S_NODE", 420);
        if (cancelled) return;

        await step("BT_INSERT_ATTACH_OLD_ROOT", 420);
        if (cancelled) return;

        await step("BT_INSERT_SPLIT_OLD_ROOT", 450);
        if (cancelled) return;

        await step("BT_INSERT_COMPUTE_I", 420);
        if (cancelled) return;

        await step("BT_INSERT_CALL_NONFULL_S_CHILD", 420);
        if (cancelled) return;

        await step("BT_INSERT_SET_NEW_ROOT", 420);
        if (cancelled) return;
      } else {
        await step("BT_INSERT_ROOT_FULL_COMMENT", 350);
        if (cancelled) return;

        await step("BT_INSERT_ROOT_FULL_IF", 350);
        if (cancelled) return;

        await step("BT_INSERT_CALL_NONFULL_ROOT", 420);
        if (cancelled) return;
      }

      // insertNonFull(x,k) – rama hoja o interna
      const hitNow = findNodeWithKey(
        currentNodes as d3.HierarchyNode<BHierarchy>[],
        valueToInsert
      );
      const isLeafTarget =
        hitNow && (!hitNow.node.children || hitNow.node.children.length === 0);

      await step("BT_NONFULL_INIT_I", 320);
      if (cancelled) return;

      await step("BT_NONFULL_IF_LEAF", 320);
      if (cancelled) return;

      if (isLeafTarget) {
        await step("BT_NONFULL_LEAF_COMMENT", 280);
        if (cancelled) return;

        await step("BT_NONFULL_LEAF_ADD_SPACE", 300);
        if (cancelled) return;

        await step("BT_NONFULL_LEAF_WHILE_SHIFT_COND", 280);
        if (cancelled) return;

        await step("BT_NONFULL_LEAF_SHIFT_ASSIGN", 280);
        if (cancelled) return;

        await step("BT_NONFULL_LEAF_SHIFT_DEC_I", 240);
        if (cancelled) return;

        await step("BT_NONFULL_LEAF_SET_KEY", 320);
        if (cancelled) return;
      } else {
        await step("BT_NONFULL_INTERNAL_ELSE", 280);
        if (cancelled) return;

        await step("BT_NONFULL_DESC_COMMENT", 260);
        if (cancelled) return;

        await step("BT_NONFULL_DESC_WHILE_COND", 260);
        if (cancelled) return;

        await step("BT_NONFULL_DESC_INC_I", 260);
        if (cancelled) return;

        await step("BT_NONFULL_CHILD_NULL_IF", 260);
        if (cancelled) return;

        await step("BT_NONFULL_CHILD_FULL_IF", 260);
        if (cancelled) return;

        await step("BT_NONFULL_CHILD_SPLIT_CALL", 260);
        if (cancelled) return;

        await step("BT_NONFULL_CHILD_UPDATE_I_AFTER_SPLIT", 260);
        if (cancelled) return;

        await step("BT_NONFULL_RECURSE_CHILD", 320);
        if (cancelled) return;
      }

      // ───── Fin pseudocódigo: ahora sí aplicamos cambios visuales ─────

      // 1) Liberamos el query para que el render base pueda refrescar al árbol nuevo
      resetQueryValues();

      // 2) Tick para que useLayoutEffect pinte el árbol definitivo y actualice nodePositions
      await delay(0);
      if (cancelled || !svgRef.current) return;

      const svgAfter = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeGAfter = svgAfter.select<SVGGElement>("g.tree-container");

      // 3) Localizamos el nodo y el índice de la clave ya insertada en el árbol nuevo
      let hit = findNodeWithKey(
        currentNodes as d3.HierarchyNode<BHierarchy>[],
        valueToInsert
      );
      if (!hit) {
        await delay(0);
        if (cancelled) return;
        hit = findNodeWithKey(
          currentNodes as d3.HierarchyNode<BHierarchy>[],
          valueToInsert
        );
      }

      if (hit) {
        await highlightBKeySlot(
          treeGAfter,
          hit.node.data.id,
          hit.keyIndex
        ).catch(() => {});
      }

      // 4) Animación geométrica de insert sobre el árbol ya actualizado
      await animateBInsertNode(
        treeGAfter,
        {
          newNodeId: hit ? hit.node.data.id : root.data.id,
          rootHierarchy: root as any,
          nodesData: currentNodes as any,
          slotIndex: hit ? hit.keyIndex : null,
        },
        nodePositions,
        () => {}, // resetQueryValues ya se hizo arriba
        setIsAnimating
      );

      if (!cancelled) {
        bus.emit("op:done", { op: "insert" });
      }
    }).catch((e) => {
      if (!cancelled) console.error("[B-tree insert anim]", e);
    });

    return () => {
      cancelled = true;
    };
  }, [
    root,
    prevRoot,
    currentNodes,
    query.toInsert,
    resetQueryValues,
    setIsAnimating,
    bus,
    nodePositions,
  ]);

  /* ─────────────── Eliminación (pseudocódigo + animación “smart”) ─────────────── */
  useEffect(() => {
    if (!svgRef.current || query.toDelete == null) return;
    if (!prevRoot) return; // necesitamos al menos el árbol previo

    const labels = BT_CODE.delete.labels ?? {};
    type LabelKey = keyof typeof labels | string;

    const stepId = `btree-delete-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 520) => {
      const lineIndex = (labels as Record<string, number | undefined>)[
        labelName as string
      ];

      if (typeof lineIndex === "number") {
        bus.emit("step:progress", { stepId, lineIndex });
      } else {
        // Si algo no cuadra, lo ves en consola
        console.warn("[BTree delete] label no encontrado:", labelName);
      }

      await delay(ms);
      if (cancelled) return;
    };

    const valueToDelete = query.toDelete as unknown as number;

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      // Limpia overlays previos
      svg.selectAll("g.b-traverse-overlay").interrupt().remove();
      svg
        .selectAll(".b-runner,.b-step-ring,.b-target-ring")
        .interrupt()
        .remove();

      // Notificar inicio de operación
      bus.emit("op:start", { op: "delete" });

      /* ───── FASE 1: pseudocódigo delete(...) + primera deleteFromNode(root,k) ───── */

      // wrapper delete(k)
      await step("BT_DELETE_FN_HEADER"); // public void delete(T k)
      await step("BT_DELETE_ROOT_NULL_IF"); // if (root == null) return;
      await step("BT_DELETE_CALL_DELETE_FROM_NODE"); // deleteFromNode(root, k);

      // Trabajamos sobre el árbol PREVIO a la eliminación lógica
      const rootNode = prevRoot as d3.HierarchyNode<BHierarchy>;
      const keysRoot = rootNode.data.keys ?? [];
      const rootIsLeaf = !rootNode.children || rootNode.children.length === 0;
      const t =
        typeof rootNode.data.minKeys === "number"
          ? rootNode.data.minKeys + 1
          : 2;

      // deleteFromNode(root, k) – primera llamada
      await step("BT_DELETE_NODE_HEADER"); // cabecera de deleteFromNode
      await step("BT_DELETE_NODE_IDX_INIT"); // int idx = indexOf(...)

      const idx = d3.bisector((k: number) => k).left(keysRoot, valueToDelete);
      const foundInRoot =
        idx < keysRoot.length && keysRoot[idx] === valueToDelete;

      if (foundInRoot) {
        await step("BT_DELETE_NODE_IF_FOUND"); // if (idx != -1) {

        if (rootIsLeaf) {
          // Caso 1a: k en hoja (raíz hoja)
          await step("BT_DELETE_NODE_IF_LEAF"); // if (x.leaf) {
          await step("BT_DELETE_NODE_REMOVE_FROM_LEAF"); // x.keys.remove(idx);
        } else {
          // Caso 1b: k en nodo interno (raíz interna)
          await step("BT_DELETE_NODE_INTERNAL_ELSE"); // } else {
          // Comentario de reemplazo lo saltamos (solo comentario)
          // await step("BT_DELETE_NODE_COMMENT_REPLACE");

          await step("BT_DELETE_NODE_Y_ASSIGN"); // BTreeNode y = x.child[idx];
          await step("BT_DELETE_NODE_Z_ASSIGN"); // BTreeNode z = x.child[idx+1];

          const children =
            (rootNode.children as d3.HierarchyNode<BHierarchy>[]) || [];
          const y = children[idx];
          const z = children[idx + 1];

          const yKeysLen = y?.data.keys?.length ?? 0;
          const zKeysLen = z?.data.keys?.length ?? 0;

          if (y && yKeysLen >= t) {
            // Reemplazo por predecesor
            await step("BT_DELETE_NODE_LEFT_CAN_GIVE_IF"); // if (y.keys.size() >= t) {

            // getPredecessor(y)
            await step("BT_GET_PRED_HEADER"); // private T getPredecessor...
            await step("BT_GET_PRED_WHILE"); // while (!x.leaf) ...
            await step("BT_GET_PRED_RETURN"); // return x.keys.get(...)

            await step("BT_DELETE_NODE_PRED_ASSIGN"); // T pred = getPredecessor(y);
            await step("BT_DELETE_NODE_SET_KEY_PRED"); // x.keys.set(idx, pred);
            await step("BT_DELETE_NODE_RECURSE_PRED"); // deleteFromNode(y, pred);
          } else if (z && zKeysLen >= t) {
            // Reemplazo por sucesor
            await step("BT_DELETE_NODE_RIGHT_CAN_GIVE_ELSEIF"); // } else if (z.keys.size() >= t) {

            // getSuccessor(z)
            await step("BT_GET_SUCC_HEADER"); // private T getSuccessor...
            await step("BT_GET_SUCC_WHILE"); // while (!x.leaf) ...
            await step("BT_GET_SUCC_RETURN"); // return x.keys.get(0);

            await step("BT_DELETE_NODE_SUCC_ASSIGN"); // T succ = getSuccessor(z);
            await step("BT_DELETE_NODE_SET_KEY_SUCC"); // x.keys.set(idx, succ);
            await step("BT_DELETE_NODE_RECURSE_SUCC"); // deleteFromNode(z, succ);
          } else {
            // Ambos subárboles con t-1 claves → merge
            await step("BT_DELETE_NODE_MERGE_ELSE"); // } else {
            await step("BT_DELETE_NODE_CALL_MERGE"); // merge(x, idx);

            // merge(x, idx)
            await step("BT_MERGE_HEADER"); // private void merge...
            await step("BT_MERGE_Y_ASSIGN"); // BTreeNode y = x.child[k];
            await step("BT_MERGE_Z_ASSIGN"); // BTreeNode z = x.child[k+1];
            await step("BT_MERGE_PULL_SEP_KEY"); // y.keys.add(x.keys.remove(k));
            // Comentario de "mover claves de z" lo saltamos
            // await step("BT_MERGE_MOVE_Z_KEYS_COMMENT");
            await step("BT_MERGE_MOVE_Z_KEYS_FOR"); // for (T val : z.keys) ...
            await step("BT_MERGE_MOVE_Z_CHILDREN_IF"); // if (!z.leaf) {
            await step("BT_MERGE_BASE_INDEX_ASSIGN"); // int base = ...
            await step("BT_MERGE_ASSIGN_CHILDREN_FOR"); // for (int i=0; ...
            await step("BT_MERGE_REMOVE_RIGHT_CHILD"); // removeChildAt(...);

            await step("BT_DELETE_NODE_RECURSE_AFTER_MERGE"); // deleteFromNode(y, k);
          }
        }
      } else {
        // Caso 2: k NO está en este nodo (root en esta primera llamada)
        await step("BT_DELETE_NODE_NOT_FOUND_ELSE"); // } else {

        if (rootIsLeaf) {
          // En teoría no debería pasar (KEY_NOT_FOUND viene antes), pero igual lo representamos
          await step("BT_DELETE_NODE_LEAF_RETURN_IF"); // if (x.leaf) return;
        } else {
          await step("BT_DELETE_NODE_CHILD_INDEX_ASSIGN"); // int i = childIndexToDescend...
          // Comentario de fill lo saltamos
          // await step("BT_DELETE_NODE_FILL_COMMENT");

          const children =
            (rootNode.children as d3.HierarchyNode<BHierarchy>[]) || [];
          let i = d3.bisector((k: number) => k).left(keysRoot, valueToDelete);

          let child = children[i];
          const leftSibling = i > 0 ? children[i - 1] : null;
          const rightSibling = i + 1 < children.length ? children[i + 1] : null;

          const childKeysLen = child?.data.keys?.length ?? 0;

          if (child && childKeysLen < t) {
            await step("BT_DELETE_NODE_CHILD_NEEDS_FILL_IF"); // if (x.child[i].keys.size() < t) ...

            // fill(x, i)
            await step("BT_FILL_HEADER"); // private void fill...

            const leftLen = leftSibling?.data.keys?.length ?? 0;
            const rightLen = rightSibling?.data.keys?.length ?? 0;

            if (leftSibling && leftLen >= t) {
              // fill → borrowFromPrev
              await step("BT_FILL_BORROW_PREV_IF"); // if (i > 0 && x.child[i-1]...
              await step("BT_FILL_CALL_BORROW_PREV"); // borrowFromPrev(x, i);

              await step("BT_BORROW_PREV_HEADER"); // private void borrowFromPrev...
              await step("BT_BORROW_PREV_CHILD_ASSIGN"); // BTreeNode c = x.child[i];
              await step("BT_BORROW_PREV_SIBLING_ASSIGN"); // BTreeNode s = x.child[i-1];
              // Comentario de shift lo saltamos
              // await step("BT_BORROW_PREV_COMMENT_SHIFT");
              await step("BT_BORROW_PREV_SHIFT_RIGHT"); // shiftRight(c.child, 0);
              await step("BT_BORROW_PREV_INSERT_KEY_FROM_PARENT"); // c.keys.add(0, x.keys.get(i-1));
              await step("BT_BORROW_PREV_MOVE_CHILD"); // if (!c.leaf) ...
              await step("BT_BORROW_PREV_SET_PARENT_KEY"); // x.keys.set(i-1, s.keys.remove(...));
            } else if (rightSibling && rightLen >= t) {
              // fill → borrowFromNext
              await step("BT_FILL_BORROW_NEXT_ELSEIF"); // else if (i < x.keys.size() ...
              await step("BT_FILL_CALL_BORROW_NEXT"); // borrowFromNext(x, i);

              await step("BT_BORROW_NEXT_HEADER"); // private void borrowFromNext...
              await step("BT_BORROW_NEXT_CHILD_ASSIGN"); // BTreeNode c = x.child[i];
              await step("BT_BORROW_NEXT_SIBLING_ASSIGN"); // BTreeNode s = x.child[i+1];
              await step("BT_BORROW_NEXT_ADD_KEY_FROM_PARENT"); // c.keys.add(x.keys.get(i));
              await step("BT_BORROW_NEXT_MOVE_CHILD"); // if (!c.leaf) ...
              await step("BT_BORROW_NEXT_SET_PARENT_KEY"); // x.keys.set(i, s.keys.remove(0));
              await step("BT_BORROW_NEXT_SHIFT_LEFT"); // shiftLeft(s.child, 0);
            } else {
              // fill → merge (con izquierda o derecha)
              await step("BT_FILL_ELSE"); // else {
              await step("BT_FILL_MERGE_OR_MERGELEFT"); // if (i < x.keys.size()) merge...

              await step("BT_MERGE_HEADER"); // private void merge...
              await step("BT_MERGE_Y_ASSIGN"); // BTreeNode y = x.child[k];
              await step("BT_MERGE_Z_ASSIGN"); // BTreeNode z = x.child[k+1];
              await step("BT_MERGE_PULL_SEP_KEY"); // y.keys.add(x.keys.remove(k));
              // Comentario de mover claves lo saltamos
              // await step("BT_MERGE_MOVE_Z_KEYS_COMMENT");
              await step("BT_MERGE_MOVE_Z_KEYS_FOR"); // for (T val : z.keys) ...
              await step("BT_MERGE_MOVE_Z_CHILDREN_IF"); // if (!z.leaf) {
              await step("BT_MERGE_BASE_INDEX_ASSIGN"); // int base = ...
              await step("BT_MERGE_ASSIGN_CHILDREN_FOR"); // for (int i=0; ...
              await step("BT_MERGE_REMOVE_RIGHT_CHILD"); // removeChildAt(...);
            }

            // Comentario "Tras fill, puede que i cambie..." lo saltamos
            // await step("BT_DELETE_NODE_AFTER_FILL_COMMENT");
            await step("BT_DELETE_NODE_FIX_I_IF"); // if (i > x.keys.size()) i = x.keys.size();
          }

          await step("BT_DELETE_NODE_RECURSE_DESCEND"); // deleteFromNode(x.child[i], k);
        }
      }

      // Ajuste de raíz (wrapper)
      await step("BT_DELETE_ROOT_FIX_INTERNAL"); // if (root.keys.size() == 0 && !root.leaf) ...
      await step("BT_DELETE_ROOT_FIX_LEAF"); // if (root.keys.size() == 0 && root.leaf) ...

      /* ───── FASE 2: animación geométrica smart (prev → next) ───── */

      if (!root) {
        // Si el delete dejó el árbol vacío, no hay mucho que animar
        resetQueryValues();
        if (!cancelled) bus.emit("op:done", { op: "delete" });
        return;
      }

      const layout = d3
        .tree<BHierarchy>()
        .nodeSize([
          SVG_NARY_VALUES.NODE_SPACING,
          SVG_NARY_VALUES.LEVEL_SPACING,
        ]);

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

      // Actualizamos el cache de posiciones al layout NUEVO
      nodePositions.clear();
      nextPositions.forEach((pos, id) => nodePositions.set(id, pos));

      // Localizamos el nodo/slot donde estaba la clave borrada en el árbol previo
      const prevNodes = prevRoot.descendants();
      let deleteHit: { nodeId: string; keyIndex: number } | null = null;
      for (const n of prevNodes) {
        const i = d3
          .bisector((k: number) => k)
          .left(n.data.keys, valueToDelete);
        if (i < n.data.keys.length && n.data.keys[i] === valueToDelete) {
          deleteHit = { nodeId: n.data.id, keyIndex: i };
          break;
        }
      }

      const fixSteps = (query as any).bFix ?? [];

      await animateBDeleteSmart(
        treeG,
        {
          prevRoot: prevRoot as any,
          nextRoot: root as any,
          nextNodes: (root as any).descendants(),
          deleteHit,
          fixSteps,
        },
        nextPositions,
        prevPositions,
        resetQueryValues,
        setIsAnimating
      );

      if (!cancelled) {
        bus.emit("op:done", { op: "delete" });
      }
    }).catch((e) => {
      if (!cancelled) console.error("[B-tree delete anim]", e);
    });

    return () => {
      cancelled = true;
    };
  }, [
    root,
    prevRoot,
    query.toDelete,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    bus,
  ]);

  /* ─────────────────────────────── Búsqueda (pseudocódigo + animación) ─────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current || query.toSearch == null) return;

    const labels = BT_CODE.search.labels ?? {};
    type LabelKey = keyof typeof labels | string;

    const stepId = `btree-search-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 520) => {
      const lineIndex = (labels as Record<string, number | undefined>)[
        labelName as string
      ];

      if (typeof lineIndex === "number") {
        bus.emit("step:progress", { stepId, lineIndex });
      } else {
        console.warn("[BTree search] label no encontrado:", labelName);
      }

      await delay(ms);
      if (cancelled) return;
    };

    const valueToSearch = query.toSearch as unknown as number;
    const rootNode: BHNode | null = root; // copiamos root para que TS pueda estrechar tipo

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      // Limpia overlays previos
      svg.selectAll("g.b-traverse-overlay").interrupt().remove();
      svg
        .selectAll(".b-runner,.b-step-ring,.b-target-ring")
        .interrupt()
        .remove();

      // Notificar inicio
      bus.emit("op:start", { op: "search" });

      /* ───── FASE 1: pseudocódigo (search + searchRec) ───── */

      await step("BT_SEARCH_FN_HEADER", 420); // public boolean search(T k) {
      await step("BT_SEARCH_ROOT_NULL_IF", 380); // if (root == null) return false;

      if (!rootNode) {
        // caso árbol vacío
        resetQueryValues();
        if (!cancelled) bus.emit("op:done", { op: "search" });
        return;
      }

      await step("BT_SEARCH_CALL_RECURSIVE", 420); // return searchRec(root, k);

      // Iteramos como getNodoYPos, pero emitiendo pseudocódigo
      let current: BHNode | null = rootNode;
      const visited: BHNode[] = [];
      let foundNode: BHNode | null = null;
      let foundIndex: number | null = null;

      while (current) {
        visited.push(current);

        await step("BT_SEARCH_REC_HEADER", 340); // private boolean searchRec...
        await step("BT_SEARCH_REC_X_NULL_IF", 320); // if (x == null) return false;

        const keys = current.data.keys ?? [];

        await step("BT_SEARCH_REC_LOWER_BOUND", 340); // int i = lowerBound(x.keys, k);
        const i = d3.bisector((k: number) => k).left(keys, valueToSearch);

        await step("BT_SEARCH_REC_HIT_IF", 360); // if (i < size && keys[i] == k) return true;
        const isHit = i < keys.length && keys[i] === valueToSearch;

        if (isHit) {
          foundNode = current;
          foundIndex = i;
          break;
        }

        const isLeaf = !current.children || current.children.length === 0;

        await step("BT_SEARCH_REC_LEAF_RETURN_IF", 360); // if (x.leaf) return false;
        if (isLeaf) break;

        await step("BT_SEARCH_REC_RECURSE_CHILD", 360); // return searchRec(x.child[i], k);

        const children: BHNode[] =
          (current.children as BHNode[] | undefined) ?? [];

        const next: BHNode | null =
          i >= 0 && i < children.length ? children[i] : null;

        if (!next) {
          console.warn(
            "[BTree search] hijo inexistente al descender; se aborta animación."
          );
          break;
        }

        current = next;
      }

      /* ───── FASE 2: animación del recorrido real ───── */

      if (visited.length === 0) {
        resetQueryValues();
        if (!cancelled) bus.emit("op:done", { op: "search" });
        return;
      }

      await animateBSearchPath(
        treeG,
        visited as any, // la función de dibujo ya está preparada para estos nodos
        nodePositions,
        resetQueryValues,
        setIsAnimating
      );

      if (foundNode && foundIndex != null) {
        await highlightBKeySlot(treeG, foundNode.data.id, foundIndex).catch(
          () => {}
        );
      }

      if (!cancelled) {
        bus.emit("op:done", { op: "search" });
      }
    }).catch((e) => {
      if (!cancelled) console.error("[B-tree search anim]", e);
    });

    return () => {
      cancelled = true;
    };
  }, [
    root,
    query.toSearch,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    bus,
  ]);

      /* ─────────────────────────────── Recorridos (traversals) ─────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current || !root) return;

    // 1) Determinar tipo de recorrido según qué campo del query está poblado
    const traversalType: "pre" | "in" | "post" | "level" | null =
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

    // 2) Seleccionar la lista de nodos y la clave de pseudocódigo
    let nodes: TraversalNodeType[] = [];
    let codeKey: keyof typeof BT_CODE;

    if (traversalType === "pre") {
      nodes = query.toGetPreOrder;
      codeKey = "getPreOrder";
    } else if (traversalType === "in") {
      nodes = query.toGetInOrder;
      codeKey = "getInOrder";
    } else if (traversalType === "post") {
      nodes = query.toGetPostOrder;
      codeKey = "getPostOrder";
    } else {
      nodes = query.toGetLevelOrder;
      codeKey = "getLevelOrder";
    }

    const safeNodes = sanitizeTraversal(nodes);

    // 3) Config de pseudocódigo + planes de error
    const cfg = (BT_CODE as any)[codeKey] ?? {};
    const labels: Record<string, number> = (cfg.labels ?? {}) as Record<
      string,
      number
    >;

    type LabelKey = string;

    const errorPlans = (cfg.errorPlans ?? {}) as {
      [code: string]: { lineLabel: string; hold?: number }[];
    };
    const treeEmptyPlan = errorPlans.TREE_EMPTY ?? [];

    const stepId = `btree-${codeKey}-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 520) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex === "number") {
        bus.emit("step:progress", { stepId, lineIndex });
      } else {
        console.warn(`[BTree ${codeKey}] label no encontrado:`, labelName);
      }
      await delay(ms);
      if (cancelled) return;
    };

    runExclusive(async () => {
      if (!svgRef.current) return;

      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
      const treeG = svg.select<SVGGElement>("g.tree-container");
      const seqG = svg.select<SVGGElement>("g.seq-container");

      // Limpieza de banda/overlays anteriores
      seqG.selectAll("*").interrupt().remove();
      svg
        .selectAll("g.tt-traverse-overlay, g.b-traverse-overlay")
        .interrupt()
        .remove();

      // Avisar con la clave EXACTA del pseudocódigo
      bus.emit("op:start", { op: codeKey });

      // Caso “árbol vacío” / lista vacía → reproducir plan de error si existe
      if (safeNodes.length === 0) {
        for (const item of treeEmptyPlan) {
          await step(item.lineLabel as LabelKey, item.hold ?? 600);
          if (cancelled) return;
        }
        resetQueryValues();
        if (!cancelled) {
          bus.emit("op:done", { op: codeKey });
        }
        return;
      }

      /* ───── FASE 0: dibujar la banda de recorrido YA (antes del pseudocódigo largo) ───── */

      drawTraversalSequence(seqG, safeNodes, {
        nodePositions,
        seqPositions,
        treeOffset,
        seqOffset,
      });

      /* ───── FASE 1: pseudocódigo “recursivo” (repite líneas por cada paso) ───── */

      switch (codeKey) {
        case "getInOrder":
          // Cabecera + null check una sola vez
          await step("BT_INORDER_HEADER", 420);
          await step("BT_INORDER_NULL_IF", 380);

          // Simulación de for + llamadas recursivas por cada visita en safeNodes
          for (let i = 0; i < safeNodes.length; i++) {
            if (cancelled) return;
            await step("BT_INORDER_FOR_LOOP", 260);
            await step("BT_INORDER_RECURSE_CHILD_IN_FOR", 220);
            await step("BT_INORDER_EMIT_KEY_IN_FOR", 220);
          }

          // Último hijo (child[m]) – lo mostramos una vez al final del recorrido
          await step("BT_INORDER_RECURSE_LAST_CHILD", 320);
          break;

        case "getPreOrder":
          await step("BT_PREORDER_HEADER", 420);
          await step("BT_PREORDER_NULL_IF", 380);

          // Para cada nodo visitado, el bucle emite claves y luego recorre hijos
          for (let i = 0; i < safeNodes.length; i++) {
            if (cancelled) return;
            await step("BT_PREORDER_FOR_EMIT_KEYS", 240);
            await step("BT_PREORDER_IF_NOT_LEAF", 220);
            await step("BT_PREORDER_FOR_CHILDREN", 240);
          }
          break;

        case "getPostOrder":
          await step("BT_POSTORDER_HEADER", 420);
          await step("BT_POSTORDER_NULL_IF", 380);

          // Para cada paso: primero hijos, luego emisión de claves
          for (let i = 0; i < safeNodes.length; i++) {
            if (cancelled) return;
            await step("BT_POSTORDER_IF_NOT_LEAF", 220);
            await step("BT_POSTORDER_FOR_CHILDREN", 240);
            await step("BT_POSTORDER_FOR_EMIT_KEYS", 240);
          }
          break;

        case "getLevelOrder":
          await step("BT_LEVEL_FN_HEADER", 400);
          await step("BT_LEVEL_INIT_OUT", 280);
          await step("BT_LEVEL_ROOT_NULL_IF", 280);
          await step("BT_LEVEL_INIT_QUEUE", 260);
          await step("BT_LEVEL_ENQUEUE_ROOT", 260);

          // Cada nodo en safeNodes corresponde a una iteración del while (!q.esVacia())
          for (let i = 0; i < safeNodes.length; i++) {
            if (cancelled) return;
            await step("BT_LEVEL_WHILE_LOOP", 260);
            await step("BT_LEVEL_DEQUEUE_X", 240);
            await step("BT_LEVEL_FOR_EMIT_KEYS", 240);
            await step("BT_LEVEL_IF_NOT_LEAF", 220);
            await step("BT_LEVEL_FOR_ENQUEUE_CHILDREN", 240);
          }

          await step("BT_LEVEL_RETURN_OUT", 360);
          break;
      }

      if (cancelled) return;

      /* ───── FASE 2: animación geométrica sobre la banda ya dibujada ───── */

      await animateBTraversal(
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

      if (!cancelled) {
        bus.emit("op:done", { op: codeKey });
      }
    }).catch((e) => {
      if (!cancelled) console.error("[B-tree traversal anim]", e);
    });

    return () => {
      cancelled = true;
    };
  }, [
    root,
    query.toGetPreOrder,
    query.toGetInOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    seqPositions,
    treeOffset,
    seqOffset,
    bus,
  ]);



  /* ─────────────────────────────────── Clear total ─────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current || !query.toClear) return;

    const labels = BT_CODE.clean.labels ?? {};
    type LabelKey = keyof typeof labels | string;

    const stepId = `btree-clean-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 520) => {
      const lineIndex = (labels as Record<string, number | undefined>)[
        labelName as string
      ];

      if (typeof lineIndex === "number") {
        bus.emit("step:progress", { stepId, lineIndex });
      } else {
        console.warn("[BTree clean] label no encontrado:", labelName);
      }

      await delay(ms);
      if (cancelled) return;
    };

    runExclusive(async () => {
      if (!svgRef.current) return;

      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
      const treeG = svg.select<SVGGElement>("g.tree-container");
      const seqG = svg.select<SVGGElement>("g.seq-container");

      // Interrumpir y limpiar cualquier overlay / banda anterior
      seqG.selectAll("*").interrupt().remove();
      svg
        .selectAll(
          "g.tt-traverse-overlay, g.b-traverse-overlay, .b-runner, .b-step-ring, .b-target-ring"
        )
        .interrupt()
        .remove();

      // Notificar inicio de operación de limpieza (pseudocódigo clean())
      bus.emit("op:start", { op: "clean" });

      // Única línea relevante en el pseudocódigo: this.root = null;
      await step("CLEAR_ROOT", 600);
      if (cancelled) return;

      // Animación de borrado visual + reset del query/toClear
      await animateClearTree(
        treeG,
        seqG,
        { nodePositions, seqPositions },
        resetQueryValues,
        setIsAnimating
      );

      // Limpieza extra de overlays genéricos n-arios
      svg.selectAll("g.nary-search-overlay").remove();
      svg.selectAll("g.nary-move-overlay").remove();

      if (!cancelled) {
        bus.emit("op:done", { op: "clean" });
      }
    }).catch((e) => {
      if (!cancelled) console.error("[B-tree clean anim]", e);
    });

    return () => {
      cancelled = true;
    };
  }, [
    query.toClear,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    seqPositions,
    bus,
  ]);


  return { svgRef };
}
