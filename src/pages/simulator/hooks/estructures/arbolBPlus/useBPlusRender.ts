// src/simulators/hooks/estructures/arbolBPlus/useBPlusRender.ts
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { BPlusHierarchy } from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import type { QueryBPlus } from "./useBPlusTree";

/* ─────────── Utilidades específicas B+ ─────────── */
import {
  computeNodeWidth,
  computeNodeHeight,
  ensureBPlusDefs,
  drawBPlusNodesRect,
  drawBPlusLinks,
} from "../../../../../shared/utils/draw/bplusDrawActionsUtilities";

/* ─────────── Utilidades genéricas (secuencia/clear/espaciados) ─────────── */
import {
  SVG_NARY_VALUES,
  animateClearTree,
} from "../../../../../shared/utils/draw/naryDrawActionsUtilities";

/* ─────────── Animaciones B+ (insert / delete / search / range / scanfrom) ─────────── */
import {
  animateBPlusInsertLeaf,
  animateBPlusDelete,
  animateBPlusSearchPath,
  animateBPlusRange,
  ensureRangeDefs,
  animateBPlusScanFrom,
  animateBPlusGetInOrder,
  animateBPlusGetLevelOrder,
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
const dbg = (label: string, data?: any) => {
  console.log(
    "%cBPlus%c " + label,
    "background:#0ea5e9;color:#fff;border-radius:4px;padding:2px 6px;font-weight:700",
    "color:#0ea5e9;font-weight:600",
    data ?? ""
  );
};

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

/** Separa hermanos por subárbol y centra padre. */
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

/** Badge superior con t y orden. */
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

/** Limpia nodos “fantasma”. */
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

/** Busca la HOJA que contiene la clave. */
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

/** Overlays vivos (para watchdog). */
const OVERLAYS_SELECTOR =
  "g.bp-insert-overlay, g.bp-delete-overlay, g.bp-search-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-inorder-overlay, g.bp-level-overlay";

const hasAliveOverlays = (svgEl: SVGSVGElement | null) => {
  if (!svgEl) return false;
  const sel = d3.select(svgEl);
  return !sel
    .selectAll<
      SVGGElement,
      unknown
    >(`${OVERLAYS_SELECTOR} > *, ${OVERLAYS_SELECTOR}[data-probe]`)
    .empty();
};

/* ╔════════════════════════════════════════════════════════════════════════════╗
   ║                              Hook principal                                ║
   ╚════════════════════════════════════════════════════════════════════════════╝*/
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

  // Offsets
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // Hierarchy D3
  const root = useMemo(
    () => (treeData ? d3.hierarchy<BPlusHierarchy>(treeData) : null),
    [treeData]
  );
  const currentNodes = useMemo(() => (root ? root.descendants() : []), [root]);

  const { isAnimating, setIsAnimating } = useAnimation();

  /* Logs básicos */
  useEffect(() => {
    dbg("hook mounted");
    return () => dbg("hook unmounted");
  }, []);

  /* Watchdog local (no toca useAnimation) */
  const lastTrueAtRef = useRef<number>(0);
  const watchdogIdRef = useRef<number | null>(null);
  const armWatchdog = useCallback(
    (reason: string) => {
      if (watchdogIdRef.current != null) {
        clearTimeout(watchdogIdRef.current);
        watchdogIdRef.current = null;
      }
      watchdogIdRef.current = window.setTimeout(() => {
        const now = Date.now();
        const age = now - lastTrueAtRef.current;
        if (isAnimating && age >= 6000 && !hasAliveOverlays(svgRef.current)) {
          dbg(
            `watchdog: latch pegado (${Math.round(
              age
            )}ms) • ${reason} • forzamos false`
          );
          setIsAnimating(false);
        }
      }, 6200);
    },
    [isAnimating, setIsAnimating]
  );

  /* Wrappers de animación */
  const setAnimating = useCallback(
    (v: boolean) => {
      dbg(`setIsAnimating(${v})`);
      if (v) {
        lastTrueAtRef.current = Date.now();
        armWatchdog("setAnimating(true)");
      } else if (watchdogIdRef.current != null) {
        clearTimeout(watchdogIdRef.current);
        watchdogIdRef.current = null;
      }
      setIsAnimating(v);
    },
    [setIsAnimating, armWatchdog]
  );

  const latchIfStuck = useCallback(
    (label: string) => {
      const age = Date.now() - lastTrueAtRef.current;
      const stuck =
        isAnimating && !hasAliveOverlays(svgRef.current) && age > 400;
      if (stuck) {
        dbg(
          `${label}: isAnimating=true pero SIN overlays (${age}ms) -> desbloqueo forzado`
        );
        setAnimating(false);
      }
      return stuck;
    },
    [isAnimating, setAnimating]
  );

  const setAnimatingDispatch = useCallback<Dispatch<SetStateAction<boolean>>>(
    (value) => {
      const resolved =
        typeof value === "function"
          ? (value as (p: boolean) => boolean)(isAnimating)
          : value;
      dbg(`setIsAnimating(${resolved})`, { raw: value });
      if (resolved) {
        lastTrueAtRef.current = Date.now();
        armWatchdog("setAnimatingDispatch(true)");
      } else if (watchdogIdRef.current != null) {
        clearTimeout(watchdogIdRef.current);
        watchdogIdRef.current = null;
      }
      setIsAnimating(value);
    },
    [isAnimating, setIsAnimating, armWatchdog]
  );

  // Watch isAnimating: arma watchdog y destraba si no hay overlays
  useEffect(() => {
    dbg("isAnimating -> " + String(isAnimating));
    if (!isAnimating) return;

    lastTrueAtRef.current = Date.now();
    armWatchdog("isAnimating effect");

    const t = window.setTimeout(() => {
      if (!hasAliveOverlays(svgRef.current)) {
        dbg("global-latch: isAnimating=true sin overlays -> forzamos false");
        setAnimating(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [isAnimating, armWatchdog, setAnimating]);

  /* ─────────── Deduplicadores / flancos (one-shot) ─────────── */
  const lastInsertRef = useRef<number | null>(null);
  const lastDeleteRef = useRef<number | null>(null);
  const lastSearchRef = useRef<number | null>(null);
  const lastRangeRef = useRef<string | null>(null); // `${from}-${to}`
  const lastScanRef = useRef<string | null>(null); // `${start}|${limit}`
  const prevAnyCommandRef = useRef(false);

  const prevInOrderTickRef = useRef<number | null>(null);
  const prevLevelTickRef = useRef<number | null>(null);

  /* ───────────────── Render base ───────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) {
      dbg("render base: skip (no root or no svg)");
      return;
    }

    dbg("render base: start", {
      nodes: root?.descendants()?.length ?? 0,
      isAnimating,
    });

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

    const nodesP = (pRoot as HPN).descendants();
    const nodeH = computeNodeHeight();
    pointRootRef.current = pRoot as HPN;
    pointNodesRef.current = nodesP as HPN[];

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

    const svg = d3.select(svgRef.current);
    ensureBPlusDefs(svg);
    ensureRangeDefs(svg);

    const order = treeData?.order;
    const tVal = order && order > 0 ? Math.max(2, Math.floor(order / 2)) : 2;
    const { w: hudW, h: hudH } = writeDegreeBadge(svg, tVal, order);
    const SAFE_GAP = 10;
    const extraTop = hudH + SAFE_GAP;
    const extraRight = HUD.x + hudW + SAFE_GAP;

    treeOffset.x = margin.left - minXv;
    treeOffset.y = margin.top - minYv + extraTop;

    // contenedores base
    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty())
      linksLayer = treeG.append("g").attr("class", "links-layer");

    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty())
      nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    // contenedor secuencia
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

    // ───────────────── Overlay root en la raíz del SVG ─────────────────
    let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
    if (overlayRoot.empty()) {
      overlayRoot = svg
        .append("g")
        .attr("class", "bp-overlays-root")
        .style("pointer-events", "none")
        .style("isolation", "isolate")
        .style("mix-blend-mode", "normal")
        .style("filter", "none")
        .style("clip-path", "none")
        .style("mask", "none");
    }
    // espejo el mismo translate que treeG, para compartir coordenadas
    overlayRoot.attr("transform", treeG.attr("transform") || null);

    // si algún overlay fue creado en treeG, súbelo a overlayRoot
    svg
      .selectAll<
        SVGGElement,
        unknown
      >("g.bp-insert-overlay, g.bp-delete-overlay, g.bp-search-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-inorder-overlay, g.bp-level-overlay")
      .each(function () {
        overlayRoot.node()?.appendChild(this as any);
      });

    // Purga SUAVE (solo cuando NO estamos animando):
    if (!isAnimating) {
      overlayRoot
        .selectAll<SVGGElement, unknown>(OVERLAYS_SELECTOR)
        .filter(function () {
          const el = this as SVGGElement;
          // Borra solo cáscaras (sin hijos) y que NO estén marcadas como "en uso"
          return el.childElementCount === 0 && !el.hasAttribute("data-probe");
        })
        .remove();
    }

    // Z-order
    treeG.raise();
    overlayRoot.raise();
    seqG.lower();

    // posiciones
    nodePositions.clear();
    nodesP.forEach((d) => {
      nodePositions.set(d.data.id, { x: d.x, y: d.y });
    });

    // dibujo base
    drawBPlusNodesRect(nodesLayer, nodesP as any, nodePositions);
    drawBPlusLinks(linksLayer, pRoot as any, nodePositions);

    // limpieza de fantasmas y orden de capas
    const validIds = new Set(nodesP.map((d) => d.data.id));
    cleanupGhostNodes(treeG, validIds);
    linksLayer.lower();
    nodesLayer.raise();
    treeG
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .lower();

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

    d3.select(svgRef.current).attr("width", width).attr("height", height);

    dbg("render base: done", { width, height, nodes: nodesP.length });
  }, [root, treeData, nodePositions, seqPositions, isAnimating]);

  // Cache de nodos con coordenadas (HPN) para animaciones que lo requieren
  const pointRootRef = useRef<HPN | null>(null);
  const pointNodesRef = useRef<HPN[]>([]);


  /* ───────── Limpieza robusta ante nuevas operaciones (solo flanco de subida) ───────── */
  useEffect(() => {
    if (!svgRef.current) return;

    // ✅ leemos ticks actuales
    const iTick = (query as any)?.inOrderTick ?? null;
    const lTick = (query as any)?.levelTick ?? null;
    const inOrderChanged =
      iTick != null && iTick !== prevInOrderTickRef.current;
    const levelChanged = lTick != null && lTick !== prevLevelTickRef.current;

    // “otros” comandos
    const anyCommandNow =
      query.toInsert != null ||
      query.toDelete != null ||
      query.toSearch != null ||
      !!query.toClear ||
      (query.toGetRange?.length ?? 0) > 0 ||
      (query.toScanFrom?.length ?? 0) > 0 ||
      !!query.range ||
      iTick != null || // ✅ tick inorder cuenta como comando
      lTick != null; // ✅ tick level cuenta como comando

    // flanco: aparece comando nuevo, o cambió cualquiera de los ticks
    const risingEdge =
      (anyCommandNow && !prevAnyCommandRef.current) ||
      inOrderChanged ||
      levelChanged;

    // guarda estado actual
    prevAnyCommandRef.current = anyCommandNow;

    if (!risingEdge) return;

    const svg = d3.select(svgRef.current);
    const seqG = svg.select<SVGGElement>("g.seq-container");
    const treeG = svg.select<SVGGElement>("g.tree-container");

    dbg("limpieza robusta: interrupt estáticos + overlays (flanco subida)", {
      q: {
        ins: query.toInsert,
        del: query.toDelete,
        srch: query.toSearch,
        clr: query.toClear,
        getRangeLen: query.toGetRange?.length ?? 0,
        scanFromLen: query.toScanFrom?.length ?? 0,
        range: query.range,
        inOrderTick: iTick,
        levelTick: lTick,
        inOrderChanged,
        levelChanged,
      },
    });

    // Interrumpe animaciones en capas estáticas
    seqG.selectAll("*").interrupt();
    treeG.select("g.links-layer").selectAll("*").interrupt();
    treeG.select("g.nodes-layer").selectAll("*").interrupt();

    // Borra TODOS los overlays vivos antes de la nueva operación
    svg.selectAll("g.bplus-traverse-overlay").interrupt().remove();
    svg.selectAll("g.bp-insert-overlay").interrupt().remove();
    svg.selectAll("g.bp-delete-overlay").interrupt().remove();
    svg.selectAll("g.bp-search-overlay").interrupt().remove();
    svg.selectAll("g.bp-range-overlay").interrupt().remove();
    svg.selectAll("g.bp-scanfrom-overlay").interrupt().remove();
    svg.selectAll("g.bp-inorder-overlay").interrupt().remove();
    svg.selectAll("g.bp-level-overlay").interrupt().remove(); // ⬅️ NUEVO

    // Limpia banda inferior
    seqG.selectAll("*").remove();
    seqPositions.clear();

    if (isAnimating && !hasAliveOverlays(svgRef.current)) {
      dbg(
        "global-latch: isAnimating=true sin overlays -> forzamos false (post cleanup)"
      );
      setAnimating(false);
    }
  }, [
    query.toInsert,
    query.toDelete,
    query.toSearch,
    query.toClear,
    query.toGetRange?.length,
    query.toScanFrom?.length,
    query.range?.from,
    query.range?.to,
    (query as any)?.inOrderTick,
    (query as any)?.levelTick, // ⬅️ NUEVO
    seqPositions,
    isAnimating,
    setAnimating,
  ]);

  /* ─────────────────────────── Inserción ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;
    const value = query.toInsert;
    if (value == null) return;

    if (lastInsertRef.current === value) {
      dbg("insert: ignored (same key)", { value });
      return;
    }
    if (isAnimating) {
      if (latchIfStuck("insert")) return;
      dbg("insert: ignorado (isAnimating=true)", { value });
      return;
    }
    lastInsertRef.current = value;

    dbg("insert: trigger", { value });

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // asegura overlay root y probe dentro de él
    let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
    if (overlayRoot.empty()) {
      overlayRoot = svg
        .append("g")
        .attr("class", "bp-overlays-root")
        .style("pointer-events", "none")
        .style("isolation", "isolate");
    }
    overlayRoot.attr("transform", treeG.attr("transform") || null);
    if (overlayRoot.select("g.bp-insert-overlay").empty()) {
      overlayRoot
        .append("g")
        .attr("class", "bp-insert-overlay")
        .attr("data-probe", "1");
    }

    const hit = findLeafWithKey(currentNodes as any, value);
    const leafId =
      hit?.node.data.id ??
      (currentNodes.find((n) => n.data.isLeaf)?.data.id as string);
    const slotIndex =
      typeof hit?.keyIndex === "number" ? (hit!.keyIndex as number) : null;

    dbg("insert: calling animateBPlusInsertLeaf", {
      leafId,
      slotIndex,
      nodes: currentNodes.length,
    });

    animateBPlusInsertLeaf(
      treeG,
      {
        leafId,
        rootHierarchy: root as any,
        nodesData: currentNodes as any,
        slotIndex,
      },
      nodePositions,
      resetQueryValues,
      setAnimating
    ).catch((e) => {
      dbg("insert: animation error -> reset", e);
      resetQueryValues();
    });
  }, [
    root,
    currentNodes,
    query.toInsert,
    isAnimating,
    nodePositions,
    resetQueryValues,
    setAnimating,
    latchIfStuck,
  ]);

  /* ─────────────────────────── Eliminación ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;
    const value = query.toDelete;
    if (value == null) return;

    if (lastDeleteRef.current === value) {
      dbg("delete: ignored (same key)", { value });
      return;
    }
    if (isAnimating) {
      if (latchIfStuck("delete")) return;
      dbg("delete: ignorado (isAnimating=true)", { value });
      return;
    }
    lastDeleteRef.current = value;

    dbg("delete: trigger", { value });

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const hit = findLeafWithKey(currentNodes as any, value);
    if (!hit) {
      dbg("delete: leaf not found -> resetQueryValues()");
      resetQueryValues();
      return;
    }

    dbg("delete: calling animateBPlusDelete", {
      leafId: hit.node.data.id,
      slotIndex: hit.keyIndex,
    });

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
      setAnimating
    ).catch((e) => {
      dbg("delete: animation error -> reset", e);
      resetQueryValues();
    });
  }, [
    root,
    currentNodes,
    query.toDelete,
    isAnimating,
    nodePositions,
    resetQueryValues,
    setAnimating,
    latchIfStuck,
  ]);

  /* ─────────────────────────── GetInOrder por inOrderTick ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    // ✅ leer tick y detectar flanco (tick nuevo)
    const tick = (query as any)?.inOrderTick ?? null;
    const prevTick = prevInOrderTickRef.current;
    const risingEdge = tick != null && tick !== prevTick;
    if (!risingEdge) return;
    prevInOrderTickRef.current = tick;

    // Si llega mezclado con otros comandos, no ejecutamos (defensivo)
    const hasOtherPending =
      query.toInsert != null ||
      query.toDelete != null ||
      query.toSearch != null ||
      !!query.toClear ||
      (query.toGetRange?.length ?? 0) > 0 ||
      (query.toScanFrom?.length ?? 0) > 0 ||
      !!query.range;
    if (hasOtherPending) {
      dbg("getInOrder: hay otro comando pendiente -> no ejecuto");
      return;
    }

    // Gating por latch actual
    if (isAnimating) {
      const noOverlays = !hasAliveOverlays(svgRef.current);
      if (noOverlays) {
        dbg(
          "getInOrder: isAnimating pero SIN overlays -> liberamos y continuamos"
        );
        setAnimating(false);
      } else {
        dbg("getInOrder: ignorado (isAnimating=true con overlays vivos)");
        return;
      }
    }

    dbg("getInOrder: trigger (tick=", tick);

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Asegurar overlay root + overlay inorder
    let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
    if (overlayRoot.empty()) {
      overlayRoot = svg
        .append("g")
        .attr("class", "bp-overlays-root")
        .style("pointer-events", "none")
        .style("isolation", "isolate");
    }
    overlayRoot.attr("transform", treeG.attr("transform") || null);

    let inorderOverlay = overlayRoot.select<SVGGElement>(
      "g.bp-inorder-overlay"
    );
    if (inorderOverlay.empty()) {
      inorderOverlay = overlayRoot
        .append("g")
        .attr("class", "bp-inorder-overlay");
    } else {
      inorderOverlay.selectAll("*").interrupt().remove();
    }
    inorderOverlay.attr("data-probe", "1");

    (async () => {
      try {
        dbg("getInOrder: calling animateBPlusGetInOrder");
        await animateBPlusGetInOrder(
          treeG,
          {
            rootHierarchy: (pointRootRef.current ?? root) as any,
            nodesData: (pointNodesRef.current.length
              ? pointNodesRef.current
              : currentNodes) as any,
          },
          nodePositions,
          resetQueryValues, // ← tu reset ya conserva el tick, así no re-dispara
          setAnimating
        );
        dbg("getInOrder: done");
      } catch (e) {
        dbg("getInOrder: error", e);
        setAnimating(false);
      }
    })();

    // Cleanup
    return () => {
      d3.select(svgRef.current)
        .selectAll("g.bp-inorder-overlay")
        .interrupt()
        .remove();
    };
  }, [
    root,
    currentNodes,
    nodePositions,
    (query as any)?.inOrderTick, // ✅ dependencia principal
    query.toInsert,
    query.toDelete,
    query.toSearch,
    query.toClear,
    query.toGetRange?.length,
    query.toScanFrom?.length,
    query.range?.from,
    query.range?.to,
    isAnimating,
    resetQueryValues,
    setAnimating,
  ]);
  /* ─────────────────────────── GetLevelOrder por levelTick ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    // detectar flanco de levelTick
    const tick = (query as any)?.levelTick ?? null;
    const prevTick = prevLevelTickRef.current;
    const risingEdge = tick != null && tick !== prevTick;
    if (!risingEdge) return;
    prevLevelTickRef.current = tick;

    // si viene mezclado con otros comandos, no ejecutamos
    const hasOtherPending =
      query.toInsert != null ||
      query.toDelete != null ||
      query.toSearch != null ||
      !!query.toClear ||
      (query.toGetRange?.length ?? 0) > 0 ||
      (query.toScanFrom?.length ?? 0) > 0 ||
      !!query.range;
    if (hasOtherPending) {
      dbg("getLevelOrder: hay otro comando pendiente -> no ejecuto");
      return;
    }

    // gating por latch actual
    if (isAnimating) {
      const noOverlays = !hasAliveOverlays(svgRef.current);
      if (noOverlays) {
        dbg(
          "getLevelOrder: isAnimating pero SIN overlays -> liberamos y continuamos"
        );
        setAnimating(false);
      } else {
        dbg("getLevelOrder: ignorado (isAnimating=true con overlays vivos)");
        return;
      }
    }

    dbg("getLevelOrder: trigger (tick=", tick);

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // asegurar overlay root + overlay level
    let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
    if (overlayRoot.empty()) {
      overlayRoot = svg
        .append("g")
        .attr("class", "bp-overlays-root")
        .style("pointer-events", "none")
        .style("isolation", "isolate");
    }
    overlayRoot.attr("transform", treeG.attr("transform") || null);

    let levelOverlay = overlayRoot.select<SVGGElement>("g.bp-level-overlay");
    if (levelOverlay.empty()) {
      levelOverlay = overlayRoot.append("g").attr("class", "bp-level-overlay");
    } else {
      levelOverlay.selectAll("*").interrupt().remove();
    }
    levelOverlay.attr("data-probe", "1");

    (async () => {
      try {
        dbg("getLevelOrder: calling animateBPlusGetLevelOrder");
        await animateBPlusGetLevelOrder(
          treeG,
          {
            rootHierarchy: (pointRootRef.current ?? root) as any,
            nodesData: (pointNodesRef.current.length
              ? pointNodesRef.current
              : currentNodes) as any,
          },
          nodePositions,
          resetQueryValues,
          setAnimating
        );
        dbg("getLevelOrder: done");
      } catch (e) {
        dbg("getLevelOrder: error", e);
        setAnimating(false);
      }
    })();

    // cleanup del overlay
    return () => {
      d3.select(svgRef.current)
        .selectAll("g.bp-level-overlay")
        .interrupt()
        .remove();
    };
  }, [
    root,
    currentNodes,
    nodePositions,
    (query as any)?.levelTick, // ⬅️ dependencia principal
    query.toInsert,
    query.toDelete,
    query.toSearch,
    query.toClear,
    query.toGetRange?.length,
    query.toScanFrom?.length,
    query.range?.from,
    query.range?.to,
    isAnimating,
    resetQueryValues,
    setAnimating,
  ]);

  /* ─────────────────────────── Búsqueda (con recorrido completo) ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;
    const value = query.toSearch;
    if (value == null) return;

    if (lastSearchRef.current === value) {
      dbg("search: ignored (same key)", { value });
      return;
    }
    if (isAnimating) {
      if (latchIfStuck("search")) return;
      dbg("search: ignorado (isAnimating=true)", { value });
      return;
    }
    lastSearchRef.current = value;

    dbg("search: trigger", { value });

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const hit = findLeafWithKey(currentNodes as any, value);
    if (!hit) {
      dbg("search: leaf not found -> resetQueryValues()");
      resetQueryValues();
      return;
    }

    const pathNodes = (root as any).path(
      hit.node
    ) as d3.HierarchyNode<BPlusHierarchy>[];

    dbg("search: calling animateBPlusSearchPath", {
      pathLen: pathNodes.length,
      leafId: hit.node.data.id,
      slotIndex: hit.keyIndex,
    });

    animateBPlusSearchPath(
      treeG,
      pathNodes,
      nodePositions,
      resetQueryValues,
      setAnimating,
      { leafId: hit.node.data.id, slotIndex: hit.keyIndex }
    ).catch((e) => {
      dbg("search: animation error -> reset", e);
      resetQueryValues();
    });
  }, [
    root,
    currentNodes,
    query.toSearch,
    isAnimating,
    nodePositions,
    resetQueryValues,
    setAnimating,
    latchIfStuck,
  ]);

  /* ─────────────────────────── ScanFrom (secuencial hacia la derecha) ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    const sf =
      (query as any).scanFrom ??
      (() => {
        const a = query.toScanFrom;
        if (a && a.length >= 2) {
          const s = Number((a[0] as any).value ?? a[0]);
          const l = Number((a[1] as any).value ?? a[1]);
          if (Number.isFinite(s) && Number.isFinite(l))
            return { start: s, limit: l };
        }
        return undefined;
      })();

    if (
      !sf ||
      !Number.isFinite(sf.start) ||
      !Number.isFinite(sf.limit) ||
      sf.limit <= 0
    )
      return;

    const key = `${sf.start}|${sf.limit}`;
    if (lastScanRef.current === key) {
      dbg("scanFrom: ignored (same key)", { key });
      return;
    }
    if (isAnimating) {
      if (latchIfStuck("scanFrom")) return;
      dbg("scanFrom: ignorado (isAnimating=true)", { key });
      return;
    }
    lastScanRef.current = key;

    dbg("scanFrom: trigger", { start: sf.start, limit: sf.limit });

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // asegura overlay root y probe dentro de él
    let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
    if (overlayRoot.empty()) {
      overlayRoot = svg
        .append("g")
        .attr("class", "bp-overlays-root")
        .style("pointer-events", "none")
        .style("isolation", "isolate");
    }
    overlayRoot.attr("transform", treeG.attr("transform") || null);
    if (overlayRoot.select("g.bp-scanfrom-overlay").empty()) {
      overlayRoot
        .append("g")
        .attr("class", "bp-scanfrom-overlay")
        .attr("data-probe", "1");
    }

    (async () => {
      try {
        dbg("scanFrom: calling animateBPlusScanFrom");
        await animateBPlusScanFrom(
          treeG,
          {
            rootHierarchy: root as any,
            nodesData: currentNodes as any,
            start: sf.start,
            limit: sf.limit,
          },
          nodePositions,
          resetQueryValues,
          setAnimating
        );
        dbg("scanFrom: done");
      } catch (e) {
        dbg("scanFrom: error", e);
      }
    })();

    return () => {
      d3.select(svgRef.current)
        .selectAll("g.bp-scanfrom-overlay")
        .interrupt()
        .remove();
    };
  }, [
    root,
    currentNodes,
    nodePositions,
    isAnimating,
    (query as any).scanFrom?.start,
    (query as any).scanFrom?.limit,
    Array.isArray((query as any).toScanFrom)
      ? (query as any).toScanFrom.join(",")
      : undefined,
    resetQueryValues,
    setAnimating,
    latchIfStuck,
  ]);

  /* ─────────────────────────── RANGE ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    const limits = query.range;
    if (!limits || !Number.isFinite(limits.from) || !Number.isFinite(limits.to))
      return;

    const key = `${limits.from}-${limits.to}`;

    if (isAnimating) {
      if (latchIfStuck("range")) return;
      dbg("range: ignorado (isAnimating=true)", { key });
      return;
    }

    dbg("range: trigger", { from: limits.from, to: limits.to });

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Prepara overlay root + overlay RANGE (para el watchdog)
    let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
    if (overlayRoot.empty()) {
      overlayRoot = svg
        .append("g")
        .attr("class", "bp-overlays-root")
        .style("pointer-events", "none")
        .style("isolation", "isolate");
    }
    overlayRoot.attr("transform", treeG.attr("transform") || null);

    let rangeOverlay = overlayRoot.select<SVGGElement>("g.bp-range-overlay");
    if (rangeOverlay.empty()) {
      rangeOverlay = overlayRoot.append("g").attr("class", "bp-range-overlay");
    } else {
      rangeOverlay.selectAll("*").interrupt().remove();
    }
    rangeOverlay.attr("data-probe", "1");

    (async () => {
      try {
        dbg("range: calling animateBPlusRange");
        await animateBPlusRange(
          treeG,
          {
            rootHierarchy: root as any,
            nodesData: currentNodes as any,
            from: limits.from,
            to: limits.to,
          },
          nodePositions,
          resetQueryValues,
          setAnimating
        );
        dbg("range: done");
      } catch (e) {
        dbg("range: error", e);
      }
    })();

    // Cleanup: vacía overlay y permite re-disparar
    return () => {
      const svg2 = d3.select(svgRef.current);
      const ov = svg2.select<SVGGElement>("g.bp-range-overlay");
      ov.selectAll("*").interrupt().remove();
      lastRangeRef.current = null;
    };
  }, [
    root,
    currentNodes,
    nodePositions,
    isAnimating,
    query.range, // identidad del objeto importa
    query.range?.from,
    query.range?.to,
    resetQueryValues,
    setAnimating,
    latchIfStuck,
  ]);

  /* ─────────────────────────────────── Clear total ─────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    const wantClear = !!query.toClear;

    if (!wantClear) return;
    if (isAnimating) {
      if (latchIfStuck("clear")) return;
      dbg("clear: ignorado (isAnimating=true)");
      return;
    }

    dbg("clear: trigger");

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    animateClearTree(
      treeG,
      seqG,
      { nodePositions, seqPositions },
      resetQueryValues,
      setAnimatingDispatch
    );

    svg.selectAll("g.nary-search-overlay").remove();
    svg.selectAll("g.nary-move-overlay").remove();
  }, [
    query.toClear,
    resetQueryValues,
    isAnimating,
    nodePositions,
    seqPositions,
    setAnimatingDispatch,
    latchIfStuck,
  ]);

  return { svgRef };
}
