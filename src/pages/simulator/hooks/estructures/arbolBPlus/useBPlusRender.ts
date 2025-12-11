import * as d3 from "d3";
import { useEffect, useMemo, useRef, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { BPlusHierarchy } from "../../../../../domain/utils/types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import type { QueryBPlus } from "./useBPlusTree";
import { useBus } from "../../../../../shared/hooks/useBus";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { delay } from "../../../../../domain/utils/simulatorUtils";
import { getArbolBPlusCode } from "../../../../../domain/constants/pseudocode/arbolBPlusCode";

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

const BPLUS_CODE = getArbolBPlusCode();

/** Normaliza inputs que pueden venir como {value:x} | string | number */
const toNum = (x: unknown): number => Number((x as any)?.value ?? x);

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
  value: number | string
): { node: d3.HierarchyNode<BPlusHierarchy>; keyIndex: number } | null {
  const val = Number(value);
  for (const n of nodes) {
    if (!n.data.isLeaf) continue;
    const idx = (n.data.keys ?? []).findIndex((k: number) => Number(k) === val);
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
  const prevRoot = usePrevious(root);
  const currentNodes = useMemo(() => (root ? root.descendants() : []), [root]);

  const { isAnimating, setIsAnimating } = useAnimation();
  const bus = useBus();

  // Cola global de animaciones
  const animChainRef = useRef<Promise<void>>(Promise.resolve());

  function runExclusive(fn: () => Promise<void>) {
    const runner = async () => {
      // Marcamos toda la operación (pseudocódigo + animación) como "animando"
      setAnimating(true);
      try {
        await fn();
      } finally {
        setAnimating(false);
      }
    };

    const next = animChainRef.current.then(runner, runner);
    animChainRef.current = next.catch(() => {});
    return next;
  }

  // Ref para leer isAnimating dentro de callbacks/efectos largos sin re-dispararlos
  const isAnimatingRef = useRef(isAnimating);
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

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
        if (
          isAnimatingRef.current &&
          age >= 6000 &&
          !hasAliveOverlays(svgRef.current)
        ) {
          dbg(
            `watchdog: latch pegado (${Math.round(
              age
            )}ms) • ${reason} • forzamos false`
          );
          setIsAnimating(false);
        }
      }, 6200);
    },
    [setIsAnimating]
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
        isAnimatingRef.current &&
        !hasAliveOverlays(svgRef.current) &&
        age > 400;
      if (stuck) {
        dbg(
          `${label}: isAnimating=true pero SIN overlays (${age}ms) -> desbloqueo forzado`
        );
        setAnimating(false);
      }
      return stuck;
    },
    [setAnimating]
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
  const prevToInsertRef = useRef<number | null>(null);
  useEffect(() => {
    const raw = query.toInsert;
    const cur = raw == null ? null : toNum(raw);

    // Antes había un insert activo (no null) y ahora ya no → operación cerrada
    if (prevToInsertRef.current != null && cur == null) {
      // Muy importante: permitir volver a ejecutar el mismo valor en el futuro
      lastInsertRef.current = null;
    }

    prevToInsertRef.current = cur;
  }, [query.toInsert]);

  const lastDeleteRef = useRef<number | null>(null);
  const lastSearchRef = useRef<number | null>(null);
  const lastRangeRef = useRef<string | null>(null); // `${from}-${to}`
  const lastScanRef = useRef<string | null>(null); // `${start}|${limit}`

  const prevAnyCommandRef = useRef(false);

  const prevInOrderTickRef = useRef<number | null>(null);
  const prevLevelTickRef = useRef<number | null>(null);

  // Cache de nodos con coordenadas (HPN) para animaciones que lo requieren
  const pointRootRef = useRef<HPN | null>(null);
  const pointNodesRef = useRef<HPN[]>([]);

  /* ───────────────── Render base ───────────────── */
  useEffect(() => {
    // 1) Necesitamos el SVG incluso si root es null, para poder limpiar.
    const svgEl = svgRef.current;
    if (!svgEl) {
      dbg("render base: skip (no svg)");
      return;
    }

    const svg = d3.select(svgEl);

    const margin = {
      left: SVG_NARY_VALUES.MARGIN_LEFT,
      right: SVG_NARY_VALUES.MARGIN_RIGHT,
      top: SVG_NARY_VALUES.MARGIN_TOP,
      bottom: SVG_NARY_VALUES.MARGIN_BOTTOM,
    };

    ensureBPlusDefs(svg);
    ensureRangeDefs(svg);

    const order = treeData?.order;
    const tVal = order && order > 0 ? Math.max(2, Math.floor(order / 2)) : 2;
    const { w: hudW, h: hudH } = writeDegreeBadge(svg, tVal, order);
    const SAFE_GAP = 10;
    const extraTop = hudH + SAFE_GAP;
    const extraRight = HUD.x + hudW + SAFE_GAP;

    // Contenedores base
    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);

    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty())
      linksLayer = treeG.append("g").attr("class", "links-layer");

    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty())
      nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    let seqG = svg.select<SVGGElement>("g.seq-container");
    if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);

    // Overlay root
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

    // 🔸 Flags de inserción al estilo B-tree
    const isInsertInProgress = query.toInsert != null;
    const prevNodesRB = prevRoot ? prevRoot.descendants() : [];
    const hadNodesBefore =
      !!prevRoot && prevNodesRB.some((d) => (d.data.keys?.length ?? 0) > 0);

    // 2) Caso A: modelo nulo ⇒ limpiar todo y dimensionar mínimo
    if (!root) {
      // Resetea transform para evitar offsets viejos
      treeG.attr(
        "transform",
        `translate(${margin.left},${margin.top + extraTop})`
      );
      overlayRoot.attr("transform", treeG.attr("transform") || null);

      linksLayer.selectAll("*").remove();
      nodesLayer.selectAll("*").remove();
      seqG.selectAll("*").remove();

      svg
        .selectAll<
          SVGGElement,
          unknown
        >("g.bp-insert-overlay, g.bp-delete-overlay, g.bp-search-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-inorder-overlay, g.bp-level-overlay")
        .interrupt()
        .remove();

      nodePositions.clear();
      seqPositions.clear();

      const width = Math.max(
        HUD.x + hudW + SAFE_GAP,
        margin.left + margin.right
      );
      const height =
        margin.top +
        margin.bottom +
        extraTop +
        SVG_NARY_VALUES.SEQUENCE_PADDING +
        SVG_NARY_VALUES.SEQUENCE_HEIGHT;

      d3.select(svgEl).attr("width", width).attr("height", height);
      dbg("render base: modelo nulo -> purga completa y retorno");
      return;
    }

    // 🔸 Árbol no vacío + insert en curso → congelar en el árbol previo
    if (isInsertInProgress && hadNodesBefore) {
      dbg(
        "render base: congelado durante insert (mantengo árbol previo en pantalla)"
      );
      // No recalculamos layout ni redibujamos: se mantiene el DOM anterior.
      return;
    }

    // 3) Caso B: hay modelo; calcular layout
    dbg("render base: start", {
      nodes: root?.descendants()?.length ?? 0,
      isAnimating,
    });

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

    // Guard ultra-defensivo: raíz “vacía”
    const emptyTree =
      nodesP.length === 1 &&
      (nodesP[0].data.keys?.length ?? 0) === 0 &&
      (!nodesP[0].children || nodesP[0].children.length === 0);

    if (emptyTree) {
      linksLayer.selectAll("*").remove();
      nodesLayer.selectAll("*").remove();
      svg
        .selectAll<
          SVGGElement,
          unknown
        >("g.bp-insert-overlay, g.bp-delete-overlay, g.bp-search-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-inorder-overlay, g.bp-level-overlay")
        .interrupt()
        .remove();
      nodePositions.clear();
      seqPositions.clear();

      const width = Math.max(
        HUD.x + hudW + SAFE_GAP,
        margin.left + margin.right
      );
      const height =
        margin.top +
        margin.bottom +
        extraTop +
        SVG_NARY_VALUES.SEQUENCE_PADDING +
        SVG_NARY_VALUES.SEQUENCE_HEIGHT;

      d3.select(svgEl).attr("width", width).attr("height", height);
      dbg("render base: árbol vacío (post-layout) -> purga y retorno");
      return;
    }

    // Bounds y offsets
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

    treeOffset.x = margin.left - minXv;
    treeOffset.y = margin.top - minYv + extraTop;

    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);
    overlayRoot.attr("transform", treeG.attr("transform") || null);

    // Sube overlays creados en treeG (por si acaso)
    svg
      .selectAll<
        SVGGElement,
        unknown
      >("g.bp-insert-overlay, g.bp-delete-overlay, g.bp-search-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-inorder-overlay, g.bp-level-overlay")
      .each(function () {
        overlayRoot.node()?.appendChild(this as any);
      });

    // Purga SUAVE de overlays si no hay animaciones
    if (!isAnimating) {
      overlayRoot
        .selectAll<SVGGElement, unknown>(
          "g.bp-insert-overlay, g.bp-delete-overlay, g.bp-search-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-inorder-overlay, g.bp-level-overlay"
        )
        .filter(function () {
          const el = this as SVGGElement;
          return el.childElementCount === 0 && !el.hasAttribute("data-probe");
        })
        .remove();
    }

    // Z-order
    treeG.raise();
    overlayRoot.raise();
    seqG.lower();

    // Posiciones cacheadas
    nodePositions.clear();
    nodesP.forEach((d) => {
      nodePositions.set(d.data.id, { x: d.x, y: d.y });
    });

    // Dibujo base
    drawBPlusNodesRect(nodesLayer, nodesP as any, nodePositions);
    drawBPlusLinks(linksLayer, pRoot as any, nodePositions);

    // 🔸 Igual que en B-tree: ocultar el primer árbol mientras corre el insert
    const shouldHideForFirstInsert = isInsertInProgress && !hadNodesBefore;

    nodesLayer
      .selectAll<SVGGElement, unknown>("g.node")
      .style("visibility", shouldHideForFirstInsert ? "hidden" : "visible");

    linksLayer
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .style("visibility", shouldHideForFirstInsert ? "hidden" : "visible");

    // Limpieza de fantasmas
    const validIds = new Set(nodesP.map((d) => d.data.id));
    cleanupGhostNodes(treeG, validIds);
    linksLayer.lower();
    nodesLayer.raise();
    treeG
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .lower();

    // Secuencia inferior
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

    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // Tamaño del SVG
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

    d3.select(svgEl).attr("width", width).attr("height", height);

    dbg("render base: done", { width, height, nodes: nodesP.length });
  }, [
    root,
    treeData?.order,
    nodePositions,
    seqPositions,
    isAnimating,
    query.toInsert, // 🔸 importante para congelar/ocultar durante insert
    prevRoot, // 🔸 para hadNodesBefore
  ]);

  /* ───────── Limpieza robusta ante nuevas operaciones (solo flanco de subida) ───────── */
  useEffect(() => {
    if (!svgRef.current) return;

    // leemos ticks actuales, pero SOLO para saber si hay comando activo
    const iTick = (query as any)?.inOrderTick ?? null;
    const lTick = (query as any)?.levelTick ?? null;

    // “otros” comandos
    const anyCommandNow =
      query.toInsert != null ||
      query.toDelete != null ||
      query.toSearch != null ||
      !!query.toClear ||
      (query.toGetRange?.length ?? 0) > 0 ||
      (query.toScanFrom?.length ?? 0) > 0 ||
      !!query.range ||
      iTick != null ||
      lTick != null;

    // flanco: aparece comando nuevo
    const risingEdge = anyCommandNow && !prevAnyCommandRef.current;

    // guarda estado actual SOLO para anyCommand
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
    svg.selectAll("g.bp-level-overlay").interrupt().remove();

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
    (query as any)?.levelTick,
    seqPositions,
    isAnimating,
    setAnimating,
  ]);

  /* ─────────────────────────── Inserción ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    const raw = query.toInsert;
    if (raw == null) return;

    const value = toNum(raw);
    if (!Number.isFinite(value)) return;

    // Deduplicador: solo bloquea mientras la operación actual sigue viva.
    if (lastInsertRef.current === value) {
      dbg("insert: ignored (same key)", { value });
      return;
    }
    lastInsertRef.current = value;

    dbg("insert: trigger", { value });

    // Hoja en la que terminó la clave (árbol YA mutado)
    const hit = findLeafWithKey(currentNodes as any, value);
    const leafIdBase =
      hit?.node.data.id ??
      (currentNodes.find((n) => n.data.isLeaf)?.data.id as string);
    const slotIndexBase =
      typeof hit?.keyIndex === "number" ? (hit!.keyIndex as number) : null;

    // Camino raíz -> hoja después del insert (para simular insertNonFull)
    let insertPath: d3.HierarchyNode<BPlusHierarchy>[] = [];
    if (hit?.node && root) {
      try {
        insertPath = (root as any).path(
          hit.node
        ) as d3.HierarchyNode<BPlusHierarchy>[];
      } catch {
        insertPath = [];
      }
    }
    if (!insertPath.length && root) {
      insertPath = [root];
    }

    // Estado ANTES del insert (prevRoot)
    const prevNodes = prevRoot ? prevRoot.descendants() : [];
    const prevLeafCount = prevNodes.filter((n) => n.data.isLeaf).length;
    const prevInternalCount = prevNodes.filter((n) => !n.data.isLeaf).length;
    const prevHeight = prevNodes.reduce((max, n) => Math.max(max, n.depth), 0);

    const curNodes = currentNodes;
    const curLeafCount = curNodes.filter((n) => n.data.isLeaf).length;
    const curInternalCount = curNodes.filter((n) => !n.data.isLeaf).length;
    const curHeight = curNodes.reduce((max, n) => Math.max(max, n.depth), 0);

    const leafSplitHappened = curLeafCount > prevLeafCount;
    const internalSplitHappened = curInternalCount > prevInternalCount;

    const hadNodesBefore =
      !!prevRoot && prevNodes.some((d) => !(d.data as any).isPlaceholder);
    const treeWasEmptyBefore = !hadNodesBefore;

    const prevRootNode = prevRoot as
      | d3.HierarchyNode<BPlusHierarchy>
      | null
      | undefined;
    const rootWasLeafBefore = !!prevRootNode?.data.isLeaf;

    const orderVal = treeData?.order ?? 0;
    const prevRootKeyCount = prevRootNode?.data.keys?.length ?? 0;
    const rootWasFullBefore =
      !!prevRootNode && orderVal > 0 && prevRootKeyCount >= orderVal - 1;
    const rootHeightIncreased = curHeight > prevHeight;
    const rootSplitLikely = rootWasFullBefore && rootHeightIncreased;

    // Pseudocódigo INSERT B+ (labels)
    const labels = BPLUS_CODE.insert.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `bplus-insert-${Date.now()}`;

    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
    };

    // Encolamos TODA la operación (pseudocódigo + animación)
    runExclusive(async () => {
      const svgEl = svgRef.current;
      if (!svgEl) return;

      // Si venimos de un latch viejo, intentamos soltarlo antes de empezar
      if (isAnimatingRef.current) {
        latchIfStuck("insert");
        dbg("insert: isAnimating=true al entrar, intento desbloquear latch", {
          value,
        });
      }

      const svg = d3.select(svgEl);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      // Overlay para insert (watchdog)
      let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
      if (overlayRoot.empty()) {
        overlayRoot = svg
          .append("g")
          .attr("class", "bp-overlays-root")
          .style("pointer-events", "none")
          .style("isolation", "isolate");
      }
      overlayRoot.attr("transform", treeG.attr("transform") || null);

      let insertOverlay = overlayRoot.select<SVGGElement>(
        "g.bp-insert-overlay"
      );
      if (insertOverlay.empty()) {
        insertOverlay = overlayRoot
          .append("g")
          .attr("class", "bp-insert-overlay");
      } else {
        insertOverlay.selectAll("*").interrupt().remove();
      }
      insertOverlay.attr("data-probe", "1");

      // Arranca operación para el panel de pseudocódigo
      bus.emit("op:start", { op: "insert" });

      // Para no repetir el detalle de splitChild en varios niveles
      let splitDetailed = false;
      const anySplitHappened =
        leafSplitHappened || internalSplitHappened || rootSplitLikely;

      try {
        /* ─────────── Bloque public void insert(...) ─────────── */

        await step("BPLUS_INSERT_HEADER", 450);

        if (treeWasEmptyBefore) {
          // (1) Árbol vacío -> crear raíz hoja
          await step("BPLUS_INSERT_EMPTY_IF", 450);
          await step("BPLUS_INSERT_CREATE_ROOT", 450);
          await step("BPLUS_INSERT_INSERT_ROOT_KEY", 450);
          await step("BPLUS_INSERT_RETURN_AFTER_NEW_ROOT", 450);

          // Fin pseudocódigo (caso raíz vacía):
          // 1) liberamos el query
          // 2) dejamos que el render base pinte la nueva raíz
          resetQueryValues();
          await delay(0);
          if (!svgRef.current) return;

          const svgAfter = d3.select<SVGSVGElement, unknown>(svgRef.current!);
          const treeGAfter = svgAfter.select<SVGGElement>("g.tree-container");

          // Reconfirmamos hoja/slot por si el dominio ajustó algo
          const nodesNow = root?.descendants() as
            | d3.HierarchyNode<BPlusHierarchy>[]
            | undefined;
          const hitNow = nodesNow ? findLeafWithKey(nodesNow, value) : null;

          const leafId = hitNow?.node.data.id ?? leafIdBase;

          const slotIndex =
            typeof hitNow?.keyIndex === "number"
              ? hitNow!.keyIndex
              : slotIndexBase;

          dbg(
            "insert: pseudocode done (árbol vacío), calling animateBPlusInsertLeaf",
            {
              leafId,
              slotIndex,
              nodes: nodesNow?.length ?? currentNodes.length,
            }
          );

          await animateBPlusInsertLeaf(
            treeGAfter,
            {
              leafId,
              rootHierarchy: (pointRootRef.current ?? root) as any,
              nodesData: (pointNodesRef.current.length
                ? pointNodesRef.current
                : currentNodes) as any,
              slotIndex,
            },
            nodePositions,
            () => {}, // resetQueryValues ya se hizo arriba
            setAnimating
          );

          dbg("insert: animation done (árbol vacío)");
          return;
        }

        // (2) Árbol no vacío
        await step("BPLUS_INSERT_EMPTY_IF", 250); // condición false
        await step("BPLUS_INSERT_DUP_CHECK_COMMENT", 300);

        if (rootSplitLikely) {
          // (3) Raíz llena -> split de la antigua raíz
          await step("BPLUS_INSERT_ROOT_FULL_IF", 350);
          await step("BPLUS_INSERT_NEW_INTERNAL_ROOT", 350);
          await step("BPLUS_INSERT_ATTACH_OLD_ROOT", 320);

          // Detalle de splitChild(s, 0) una sola vez
          await step("BPLUS_SPLIT_CHILD_HEADER", 320);
          if (leafSplitHappened || rootWasLeafBefore) {
            await step("BPLUS_SPLIT_CHILD_LEAF_IF", 260);
            await step("BPLUS_SPLIT_CHILD_LEAF_MOVE_KEYS", 260);
            await step("BPLUS_SPLIT_CHILD_LEAF_LINKS", 260);
            await step("BPLUS_SPLIT_CHILD_LEAF_SEP", 260);
            await step("BPLUS_SPLIT_CHILD_LEAF_INSERT_SEP", 260);
          } else if (internalSplitHappened) {
            await step("BPLUS_SPLIT_CHILD_INTERNAL_IF", 260);
            await step("BPLUS_SPLIT_CHILD_INTERNAL_UP", 260);
            await step("BPLUS_SPLIT_CHILD_INTERNAL_MOVE_KEYS", 260);
            await step("BPLUS_SPLIT_CHILD_INTERNAL_MOVE_CHILDREN", 260);
            await step("BPLUS_SPLIT_CHILD_INTERNAL_SHRINK_KEYS", 260);
            await step("BPLUS_SPLIT_CHILD_INTERNAL_SHRINK_CHILDREN", 260);
            await step("BPLUS_SPLIT_CHILD_INTERNAL_INSERT_UP", 260);
          }
          splitDetailed = true;

          await step("BPLUS_INSERT_SPLIT_OLD_ROOT", 320);
          await step("BPLUS_INSERT_SET_NEW_ROOT", 340);
        } else {
          // Raíz no llena: solo se evalúa el if (isFull(root))
          await step("BPLUS_INSERT_ROOT_FULL_IF", 300);
        }

        // (4) Insertar en subárbol cuya raíz ya no está llena
        await step("BPLUS_INSERT_CALL_NONFULL_ROOT", 450);

        /* ─────────── Bloque insertNonFull(...) ─────────── */

        await step("BPLUS_INSERT_NONFULL_HEADER", 450);

        const pathLen = insertPath.length;

        for (let depth = 0; depth < pathLen; depth++) {
          const node = insertPath[depth];
          const isLeaf = !!node.data.isLeaf;

          // if (x.leaf) { ... } else { ... }
          await step("BPLUS_INSERT_NONFULL_IF_LEAF", 260);
          if (isLeaf) {
            // Caso hoja: lowerBound + add
            await step("BPLUS_INSERT_NONFULL_LOWER_BOUND", 260);
            await step("BPLUS_INSERT_NONFULL_LEAF_INSERT", 320);
            break;
          } else {
            // Caso interno: descenso por intervalo
            await step("BPLUS_INSERT_NONFULL_INTERNAL_ELSE", 260);
            await step("BPLUS_INSERT_NONFULL_CHILD_INDEX", 260);

            const shouldDetailSplitHere = anySplitHappened && !splitDetailed;

            if (shouldDetailSplitHere) {
              // Hijo lleno -> splitChild(...)
              await step("BPLUS_INSERT_NONFULL_CHILD_FULL_IF", 260);
              await step("BPLUS_INSERT_NONFULL_CHILD_SPLIT", 260);

              // Detalle de splitChild en nivel interno (si no lo hicimos ya en la raíz)
              await step("BPLUS_SPLIT_CHILD_HEADER", 320);
              if (leafSplitHappened) {
                await step("BPLUS_SPLIT_CHILD_LEAF_IF", 260);
                await step("BPLUS_SPLIT_CHILD_LEAF_MOVE_KEYS", 260);
                await step("BPLUS_SPLIT_CHILD_LEAF_LINKS", 260);
                await step("BPLUS_SPLIT_CHILD_LEAF_SEP", 260);
                await step("BPLUS_SPLIT_CHILD_LEAF_INSERT_SEP", 260);
              } else if (internalSplitHappened) {
                await step("BPLUS_SPLIT_CHILD_INTERNAL_IF", 260);
                await step("BPLUS_SPLIT_CHILD_INTERNAL_UP", 260);
                await step("BPLUS_SPLIT_CHILD_INTERNAL_MOVE_KEYS", 260);
                await step("BPLUS_SPLIT_CHILD_INTERNAL_MOVE_CHILDREN", 260);
                await step("BPLUS_SPLIT_CHILD_INTERNAL_SHRINK_KEYS", 260);
                await step("BPLUS_SPLIT_CHILD_INTERNAL_SHRINK_CHILDREN", 260);
                await step("BPLUS_SPLIT_CHILD_INTERNAL_INSERT_UP", 260);
              }
              splitDetailed = true;

              await step("BPLUS_INSERT_NONFULL_CHILD_DECIDE_SIDE", 260);
            } else {
              // No hubo split en este nivel (o ya lo detallamos)
              await step("BPLUS_INSERT_NONFULL_CHILD_FULL_IF", 260);
            }

            // Llamada recursiva insertNonFull(x.child[i], k)
            await step("BPLUS_INSERT_NONFULL_RECURSE", 280);
          }
        }

        /* ─────────── FIN del recorrido de pseudocódigo ─────────── */

        // Igual que en B-tree:
        // 1) liberamos el query para desbloquear el render base
        // 2) dejamos un tick para que se pinte el árbol NUEVO
        resetQueryValues();
        await delay(0);
        if (!svgRef.current) return;

        const svgAfter = d3.select<SVGSVGElement, unknown>(svgRef.current!);
        const treeGAfter = svgAfter.select<SVGGElement>("g.tree-container");

        // Recalcular hoja/slot sobre el árbol ya confirmado
        const nodesNow = root?.descendants() as
          | d3.HierarchyNode<BPlusHierarchy>[]
          | undefined;
        const hitNow = nodesNow ? findLeafWithKey(nodesNow, value) : null;

        const leafId = hitNow?.node.data.id ?? leafIdBase;

        const slotIndex =
          typeof hitNow?.keyIndex === "number"
            ? hitNow!.keyIndex
            : slotIndexBase;

        dbg("insert: pseudocode done, calling animateBPlusInsertLeaf", {
          leafId,
          slotIndex,
          nodes: nodesNow?.length ?? currentNodes.length,
        });

        // Animación geométrica sobre el árbol ya actualizado
        await animateBPlusInsertLeaf(
          treeGAfter,
          {
            leafId,
            rootHierarchy: (pointRootRef.current ?? root) as any,
            nodesData: (pointNodesRef.current.length
              ? pointNodesRef.current
              : currentNodes) as any,
            slotIndex,
          },
          nodePositions,
          () => {}, // resetQueryValues ya se hizo arriba
          setAnimating
        );

        dbg("insert: animation done");
      } catch (e) {
        dbg("insert: error", e);
        // Si algo peta, limpiamos el query para no dejar el simulador bloqueado.
        resetQueryValues();
      } finally {
        bus.emit("op:done", { op: "insert" });
      }
    });
  }, [
    root,
    prevRoot,
    currentNodes,
    treeData?.order,
    query.toInsert,
    nodePositions,
    resetQueryValues,
    latchIfStuck,
    bus,
  ]);

  /* ─────────────────────────── Eliminación ─────────────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const raw = query.toDelete;
    if (raw == null) return;
    const value = toNum(raw);
    if (!Number.isFinite(value)) return;

    // Deduplicador simple (evitar reentradas mismas key/mismo tick)
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

    const svgEl = svgRef.current;

    const deleteCode = BPLUS_CODE.delete;
    const labels = deleteCode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `bplus-delete-${Date.now()}`;

    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
    };

    const stepErrorPlan = async (planKey: "TREE_EMPTY" | "KEY_NOT_FOUND") => {
      const plan = deleteCode.errorPlans?.[planKey];
      if (!plan) return;
      for (const p of plan) {
        const labelName = p.lineLabel as LabelKey;
        const lineIndex = labels[labelName];
        if (typeof lineIndex !== "number") continue;
        bus.emit("step:progress", { stepId, lineIndex });
        await delay(p.hold ?? 800);
      }
    };

    (async () => {
      const svg = d3.select(svgEl);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
      if (overlayRoot.empty()) {
        overlayRoot = svg
          .append("g")
          .attr("class", "bp-overlays-root")
          .style("pointer-events", "none")
          .style("isolation", "isolate");
      }
      overlayRoot.attr("transform", treeG.attr("transform") || null);

      let deleteOverlay = overlayRoot.select<SVGGElement>(
        "g.bp-delete-overlay"
      );
      if (deleteOverlay.empty()) {
        deleteOverlay = overlayRoot
          .append("g")
          .attr("class", "bp-delete-overlay");
      } else {
        deleteOverlay.selectAll("*").interrupt().remove();
      }
      deleteOverlay.attr("data-probe", "1");

      // Inicia operación para el pseudocódigo
      bus.emit("op:start", { op: "delete" });

      const treeIsEmpty = !root;
      if (treeIsEmpty) {
        dbg("delete: TREE_EMPTY (root == null)");
        await stepErrorPlan("TREE_EMPTY");
        resetQueryValues();
        bus.emit("op:done", { op: "delete" });
        return;
      }

      const hit = findLeafWithKey(currentNodes as any, value);

      if (!hit) {
        dbg("delete: KEY_NOT_FOUND (leaf not found)");
        await stepErrorPlan("KEY_NOT_FOUND");
        resetQueryValues();
        bus.emit("op:done", { op: "delete" });
        return;
      }

      const leafId = hit.node.data.id;
      const slotIndex = hit.keyIndex;

      let deletePath: d3.HierarchyNode<BPlusHierarchy>[] = [];
      if (root) {
        try {
          deletePath = (root as any).path(
            hit.node
          ) as d3.HierarchyNode<BPlusHierarchy>[];
        } catch {
          deletePath = [];
        }
      }
      if (!deletePath.length) {
        deletePath = [hit.node];
      }

      try {
        await step("BPLUS_DELETE_HEADER", 450);
        await step("BPLUS_DELETE_PRECOND_COMMENT", 350);
        await step("BPLUS_DELETE_ROOT_NULL_IF", 350);
        await step("BPLUS_DELETE_CALL_DELETE_FROM", 450);

        await step("BPLUS_DELETE_FROM_HEADER", 450);

        for (let depth = 0; depth < deletePath.length; depth++) {
          const node = deletePath[depth];
          const isLeaf = !!node.data.isLeaf;

          await step("BPLUS_DELETE_FROM_LEAF_IF", 260);

          if (isLeaf) {
            await step("BPLUS_DELETE_FROM_LEAF_INDEX", 260);
            await step("BPLUS_DELETE_FROM_LEAF_NOT_FOUND_IF", 260);
            await step("BPLUS_DELETE_FROM_LEAF_REMOVE", 260);
            await step("BPLUS_DELETE_FROM_LEAF_UPDATE_SEP_IF", 260);
            await step("BPLUS_DELETE_FROM_LEAF_UNDERMIN_IF", 260);
          } else {
            await step("BPLUS_DELETE_FROM_INTERNAL_ELSE", 260);
            await step("BPLUS_DELETE_FROM_INTERNAL_CHILD_INDEX", 260);
            await step("BPLUS_DELETE_FROM_INTERNAL_CHILD_REF", 260);
            await step("BPLUS_DELETE_FROM_INTERNAL_RECURSE", 260);
            await step("BPLUS_DELETE_FROM_INTERNAL_FIX_UNDERMIN_IF", 260);
          }
        }

        await step("BPLUS_FIX_LEAF_UNDERFLOW_HEADER", 320);
        await step("BPLUS_FIX_LEAF_FIND_PARENT", 260);
        await step("BPLUS_FIX_LEAF_PARENT_NULL_IF", 260);
        await step("BPLUS_FIX_LEAF_BORROW_LEFT_IF", 260);
        await step("BPLUS_FIX_LEAF_BORROW_RIGHT_IF", 260);
        await step("BPLUS_FIX_LEAF_MERGE", 260);

        await step("BPLUS_BORROW_PREV_LEAF_HEADER", 260);
        await step("BPLUS_BORROW_NEXT_LEAF_HEADER", 260);
        await step("BPLUS_MERGE_LEAVES_HEADER", 260);

        await step("BPLUS_FIX_INTERNAL_UNDERFLOW_HEADER", 320);
        await step("BPLUS_FIX_INTERNAL_BORROW_LEFT_IF", 260);
        await step("BPLUS_FIX_INTERNAL_BORROW_RIGHT_IF", 260);
        await step("BPLUS_FIX_INTERNAL_MERGE_IF", 260);

        await step("BPLUS_UPDATE_SEP_UPWARDS_HEADER", 320);
        await step("BPLUS_UPDATE_SEP_NEWFIRST_ASSIGN", 260);

        await step("BPLUS_DELETE_CONTRACT_ROOT_INTERNAL", 320);
        await step("BPLUS_DELETE_CONTRACT_ROOT_LEAF_EMPTY", 320);

        dbg("delete: pseudocode done, calling animateBPlusDelete", {
          leafId,
          slotIndex,
          keyValue: value,
        });

        await animateBPlusDelete(
          treeG,
          {
            leafId,
            slotIndex,
            keyValue: value,
            rootHierarchy: root as any,
            nodesData: currentNodes as any,
          },
          nodePositions,
          resetQueryValues,
          setAnimating
        );

        dbg("delete: animation done");
      } catch (e) {
        dbg("delete: animation/pseudocode error -> reset", e);
        resetQueryValues();
      } finally {
        // IMPORTANTE: siempre cerrar la operación
        bus.emit("op:done", { op: "delete" });
      }
    })();
  }, [
    root,
    currentNodes,
    query.toDelete,
    isAnimating,
    nodePositions,
    resetQueryValues,
    setAnimating,
    latchIfStuck,
    bus,
  ]);

  /* ─────────────────────────── GetInOrder por inOrderTick ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    const tick = (query as any)?.inOrderTick ?? null;
    const prevTick = prevInOrderTickRef.current;
    const risingEdge = tick != null && tick !== prevTick;
    if (!risingEdge) return;
    prevInOrderTickRef.current = tick;

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

    // 🔴 Cambio: en vez de ignorar si isAnimating=true, forzamos reset y seguimos
    if (isAnimating) {
      dbg(
        "getInOrder: había una animación previa, forzamos reset de latch/overlays y continuamos"
      );
      setAnimating(false);

      const svg = d3.select(svgRef.current);
      svg
        .selectAll(
          "g.bp-inorder-overlay, g.bp-level-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-search-overlay"
        )
        .interrupt()
        .remove();
    }

    dbg("getInOrder: trigger (tick=", tick);

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

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

    const inorderCode = BPLUS_CODE.getInOrder;
    const labels = inorderCode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `bplus-inorder-${Date.now()}`;
    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
    };

    (async () => {
      // Notificamos al panel de pseudocódigo
      bus.emit("op:start", { op: "getInOrder" });

      try {
        // pseudocódigo "happy path"
        await step("BPLUS_INORDER_HEADER", 450);
        await step("BPLUS_INORDER_ROOT_NULL_IF", 350); // condición false (ya validamos arriba)
        await step("BPLUS_INORDER_GO_LEFT_COMMENT", 300);
        await step("BPLUS_INORDER_INIT_X", 300);
        await step("BPLUS_INORDER_DESCEND_WHILE", 320);
        await step("BPLUS_INORDER_TRAVERSE_BELT_COMMENT", 320);
        await step("BPLUS_INORDER_WHILE_LEAVES", 320);
        await step("BPLUS_INORDER_FOR_EMIT_KEYS", 320);

        dbg("getInOrder: pseudocode done, calling animateBPlusGetInOrder");

        await animateBPlusGetInOrder(
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

        dbg("getInOrder: done");
      } catch (e) {
        dbg("getInOrder: error", e);
        setAnimating(false);
        resetQueryValues();
      } finally {
        bus.emit("op:done", { op: "getInOrder" });
      }
    })();

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
    (query as any)?.inOrderTick,
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
    bus,
  ]);

  /* ─────────────────────────── GetLevelOrder por levelTick ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    const tick = (query as any)?.levelTick ?? null;
    const prevTick = prevLevelTickRef.current;
    const risingEdge = tick != null && tick !== prevTick;
    if (!risingEdge) return;
    prevLevelTickRef.current = tick;

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

    // 🔴 Cambio: igual que en inOrder, nunca ignoramos; reseteamos y seguimos
    if (isAnimating) {
      dbg(
        "getLevelOrder: había una animación previa, forzamos reset de latch/overlays y continuamos"
      );
      setAnimating(false);

      const svg = d3.select(svgRef.current);
      svg
        .selectAll(
          "g.bp-level-overlay, g.bp-inorder-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-search-overlay"
        )
        .interrupt()
        .remove();
    }

    dbg("getLevelOrder: trigger (tick=", tick);

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

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

    const levelCode = BPLUS_CODE.getLevelOrder;
    const labels = levelCode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `bplus-level-${Date.now()}`;
    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
    };

    (async () => {
      bus.emit("op:start", { op: "getLevelOrder" });

      try {
        await step("BPLUS_LEVEL_HEADER", 450);
        await step("BPLUS_LEVEL_INIT_OUT", 350);
        await step("BPLUS_LEVEL_ROOT_NULL_IF", 350); // false aquí
        await step("BPLUS_LEVEL_INIT_QUEUE", 320);
        await step("BPLUS_LEVEL_ENQUEUE_ROOT", 320);
        await step("BPLUS_LEVEL_WHILE_LOOP", 320);
        await step("BPLUS_LEVEL_DEQUEUE_X", 260);
        await step("BPLUS_LEVEL_FOR_EMIT_KEYS", 260);
        await step("BPLUS_LEVEL_IF_NOT_LEAF", 260);
        await step("BPLUS_LEVEL_FOR_ENQUEUE_CHILDREN", 260);
        await step("BPLUS_LEVEL_RETURN_OUT", 320);

        dbg(
          "getLevelOrder: pseudocode done, calling animateBPlusGetLevelOrder"
        );

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
        resetQueryValues();
      } finally {
        bus.emit("op:done", { op: "getLevelOrder" });
      }
    })();

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
    (query as any)?.levelTick,
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
    bus,
  ]);

  /* ─────────────────────────── Búsqueda ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    const raw = query.toSearch;
    if (raw == null) return;

    const value = toNum(raw);
    if (!Number.isFinite(value)) return;

    // Deduplicador: evita reentradas con la misma clave
    if (lastSearchRef.current === value) {
      dbg("search: ignored (same key)", { value });
      return;
    }
    lastSearchRef.current = value;

    dbg("search: trigger", { value });

    // Buscamos la hoja y el camino raíz->hoja sobre el árbol ACTUAL
    const hit = findLeafWithKey(currentNodes as any, value);
    const pathNodes =
      hit && root
        ? ((root as any).path(hit.node) as d3.HierarchyNode<BPlusHierarchy>[])
        : [];

    const searchCode = BPLUS_CODE.search;
    const labels = searchCode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `bplus-search-${Date.now()}`;

    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
    };

    const stepErrorPlan = async (planKey: "TREE_EMPTY" | "KEY_NOT_FOUND") => {
      const plan = searchCode.errorPlans?.[planKey];
      if (!plan) return;
      for (const p of plan) {
        const lineIndex = labels[p.lineLabel as LabelKey];
        if (typeof lineIndex !== "number") continue;
        bus.emit("step:progress", { stepId, lineIndex });
        await delay(p.hold ?? 800);
      }
    };

    // Encolamos TODA la operación (pseudocódigo + animación)
    runExclusive(async () => {
      const svgEl = svgRef.current;
      if (!svgEl) return;

      // Si venimos de un latch raro, intentamos soltarlo primero
      if (isAnimatingRef.current) {
        latchIfStuck("search");
        dbg("search: isAnimating=true al entrar, intento desbloquear latch", {
          value,
        });
      }

      const svg = d3.select(svgEl);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      // Overlay raíz + overlay específico de búsqueda
      let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
      if (overlayRoot.empty()) {
        overlayRoot = svg
          .append("g")
          .attr("class", "bp-overlays-root")
          .style("pointer-events", "none")
          .style("isolation", "isolate");
      }
      overlayRoot.attr("transform", treeG.attr("transform") || null);

      let searchOverlay = overlayRoot.select<SVGGElement>(
        "g.bp-search-overlay"
      );
      if (searchOverlay.empty()) {
        searchOverlay = overlayRoot
          .append("g")
          .attr("class", "bp-search-overlay");
      } else {
        searchOverlay.selectAll("*").interrupt().remove();
      }
      // data-probe para que el watchdog vea que hay overlay “vivo”
      searchOverlay.attr("data-probe", "1");

      // Aviso al panel de pseudocódigo
      bus.emit("op:start", { op: "search" });

      try {
        // Casos defensivos (en teoría, el hook de lógica ya los filtra):
        const treeIsEmpty = !root;
        if (treeIsEmpty) {
          dbg("search: TREE_EMPTY (root == null, desface DOMinio/vista)");
          await stepErrorPlan("TREE_EMPTY");
          resetQueryValues();
          return;
        }
        if (!hit || !pathNodes.length) {
          dbg("search: KEY_NOT_FOUND (hit/path vacío, desface DOMinio/vista)");
          await stepErrorPlan("KEY_NOT_FOUND");
          resetQueryValues();
          return;
        }

        /* ─────────── Pseudocódigo SEARCH (caso éxito) ─────────── */

        await step("BPLUS_SEARCH_HEADER", 450);
        await step("BPLUS_SEARCH_INIT_X", 450);

        // nodos internos por los que bajamos (sin la hoja final)
        const internalPath = pathNodes.slice(0, pathNodes.length - 1);

        if (internalPath.length === 0) {
          // raíz es hoja: el while se evalúa 1 vez y no entra
          await step("BPLUS_SEARCH_WHILE_DESCEND", 300);
        } else {
          for (let i = 0; i < internalPath.length; i++) {
            await step("BPLUS_SEARCH_WHILE_DESCEND", 260);
            await step("BPLUS_SEARCH_CHILD_INDEX", 260);
            await step("BPLUS_SEARCH_MOVE_CHILD", 260);
          }
        }

        // Ya estamos en la hoja
        await step("BPLUS_SEARCH_X_NULL_IF", 260); // x != null → if false
        await step("BPLUS_SEARCH_LOWER_BOUND", 260);
        await step("BPLUS_SEARCH_RETURN_CMP", 260);

        dbg("search: pseudocode done, calling animateBPlusSearchPath", {
          pathLen: pathNodes.length,
          leafId: hit.node.data.id,
          slotIndex: hit.keyIndex,
        });

        // Animación de recorrido sobre el árbol ACTUAL
        await animateBPlusSearchPath(
          treeG,
          pathNodes,
          nodePositions,
          resetQueryValues, // apaga toSearch al final
          setAnimating,
          { leafId: hit.node.data.id, slotIndex: hit.keyIndex }
        );

        dbg("search: animation done");
      } catch (e) {
        dbg("search: animation/pseudocode error -> reset", e);
        resetQueryValues();
      } finally {
        bus.emit("op:done", { op: "search" });
      }
    });
  }, [
    root,
    currentNodes,
    query.toSearch,
    nodePositions,
    resetQueryValues,
    latchIfStuck,
    bus,
  ]);

  /* ─────────────────────────── ScanFrom ─────────────────────────── */
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

    let overlayRoot = svg.select<SVGGElement>("g.bp-overlays-root");
    if (overlayRoot.empty()) {
      overlayRoot = svg
        .append("g")
        .attr("class", "bp-overlays-root")
        .style("pointer-events", "none")
        .style("isolation", "isolate");
    }
    overlayRoot.attr("transform", treeG.attr("transform") || null);

    let scanOverlay = overlayRoot.select<SVGGElement>("g.bp-scanfrom-overlay");
    if (scanOverlay.empty()) {
      scanOverlay = overlayRoot
        .append("g")
        .attr("class", "bp-scanfrom-overlay");
    } else {
      scanOverlay.selectAll("*").interrupt().remove();
    }
    scanOverlay.attr("data-probe", "1");

    const scanCode = BPLUS_CODE.scanFrom;
    const labels = scanCode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `bplus-scan-${Date.now()}`;
    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
    };

    (async () => {
      // Notificamos al panel de pseudocódigo que arranca la operación
      bus.emit("op:start", { op: "scanFrom" });

      try {
        // Bloque de pseudocódigo “happy path”
        await step("BPLUS_SCAN_HEADER", 450);
        await step("BPLUS_SCAN_INIT_OUT", 350);
        await step("BPLUS_SCAN_ROOT_NULL_OR_LIMIT_IF", 350); // condición false en este flujo
        await step("BPLUS_SCAN_INIT_X", 320);
        await step("BPLUS_SCAN_DESCEND_WHILE", 320);
        await step("BPLUS_SCAN_CHILD_INDEX", 260);
        await step("BPLUS_SCAN_LOWER_BOUND", 320);
        await step("BPLUS_SCAN_INIT_LEFT", 320);
        await step("BPLUS_SCAN_WHILE_LEAVES", 340);
        await step("BPLUS_SCAN_INNER_WHILE", 260);
        await step("BPLUS_SCAN_EMIT_KEY", 260);
        await step("BPLUS_SCAN_NEXT_LEAF", 260);

        dbg("scanFrom: pseudocode done, calling animateBPlusScanFrom", {
          start: sf.start,
          limit: sf.limit,
        });

        await animateBPlusScanFrom(
          treeG,
          {
            rootHierarchy: (pointRootRef.current ?? root) as any,
            nodesData: (pointNodesRef.current.length
              ? pointNodesRef.current
              : (currentNodes as any)) as any,
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
        // En caso de fallo, liberamos el query para no dejar el simulador bloqueado
        resetQueryValues();
      } finally {
        bus.emit("op:done", { op: "scanFrom" });
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
    bus,
  ]);

  /* ─────────────────────────── RANGE ─────────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    const limits = query.range;
    if (
      !limits ||
      !Number.isFinite(limits.from) ||
      !Number.isFinite(limits.to)
    ) {
      return;
    }

    const from = limits.from;
    const to = limits.to;

    // Generamos la llave del deduplicador
    const key = `${from}-${to}`;

    // 1) Primero, respetar isAnimating (y tratar de liberar latch si está atascado)
    if (isAnimating) {
      if (latchIfStuck("range")) return;
      dbg("range: ignorado (isAnimating=true)", { key });
      return;
    }

    // 2) Luego sí aplicamos el deduplicador
    if (lastRangeRef.current === key) {
      dbg("range: ignored (same key)", { key });
      return;
    }
    lastRangeRef.current = key;

    dbg("range: trigger", { from, to });

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

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

    const rangeCode = BPLUS_CODE.range;
    const labels = rangeCode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `bplus-range-${Date.now()}`;
    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
    };

    (async () => {
      // Notificamos al panel de pseudocódigo
      bus.emit("op:start", { op: "range" });

      try {
        // Pseudocódigo principal de range (flujo válido)
        await step("BPLUS_RANGE_HEADER", 450);
        await step("BPLUS_RANGE_INIT_OUT", 350);
        await step("BPLUS_RANGE_ROOT_NULL_OR_INVALID_IF", 350); // condición false aquí
        await step("BPLUS_RANGE_FIND_LEAF_COMMENT", 350);
        await step("BPLUS_RANGE_INIT_X", 320);
        await step("BPLUS_RANGE_DESCEND_WHILE", 320);
        await step("BPLUS_RANGE_CHILD_INDEX", 260);
        await step("BPLUS_RANGE_LOWER_BOUND", 320);
        await step("BPLUS_RANGE_WHILE_LEAVES", 340);
        await step("BPLUS_RANGE_INNER_WHILE_RANGE", 260);
        await step("BPLUS_RANGE_EMIT_KEY", 260);
        await step("BPLUS_RANGE_NEXT_LEAF", 260);

        dbg("range: pseudocode done, calling animateBPlusRange", {
          from,
          to,
        });

        await animateBPlusRange(
          treeG,
          {
            rootHierarchy: (pointRootRef.current ?? root) as any,
            nodesData: (pointNodesRef.current.length
              ? pointNodesRef.current
              : (currentNodes as any)) as any,
            from,
            to,
          },
          nodePositions,
          resetQueryValues,
          setAnimating
        );

        dbg("range: done");
      } catch (e) {
        dbg("range: error", e);
        // En caso de fallo, limpiamos triggers
        resetQueryValues();
      } finally {
        bus.emit("op:done", { op: "range" });
      }
    })();

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
    query.range?.from,
    query.range?.to,
    resetQueryValues,
    setAnimating,
    latchIfStuck,
    bus,
  ]);

  /* ─────────────────────────────────── Clear total ─────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const wantClear = !!query.toClear;
    if (!wantClear) return;

    // 🔴 Antes ignorabas el clear si isAnimating=true.
    // Ahora: si hay animación previa, la cancelamos y limpiamos overlays,
    // porque clean semánticamente es un reset duro del simulador.
    if (isAnimating) {
      dbg(
        "clear: había una animación previa, forzamos reset de latch y overlays antes de limpiar"
      );
      setAnimating(false);

      const svgKill = d3.select(svgRef.current);
      svgKill
        .selectAll(
          "g.bp-insert-overlay, g.bp-delete-overlay, g.bp-search-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-inorder-overlay, g.bp-level-overlay, g.nary-search-overlay, g.nary-move-overlay"
        )
        .interrupt()
        .remove();
    }

    dbg("clear: trigger");

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // ───────────────────── Pseudocódigo CLEAN (CLEAR_ROOT) ─────────────────────
    const cleanCode = BPLUS_CODE.clean;
    const labels = cleanCode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `bplus-clean-${Date.now()}`;
    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
    };

    (async () => {
      // Avisamos al panel de pseudocódigo que arranca clean()
      bus.emit("op:start", { op: "clean" });

      try {
        // Único punto relevante: root = null;
        await step("CLEAR_ROOT", 450);

        // Animación de borrado duro del árbol + secuencia
        animateClearTree(
          treeG,
          seqG,
          { nodePositions, seqPositions },
          resetQueryValues,
          setAnimatingDispatch
        );

        // Limpieza extra de overlays (por si quedó algo colgado)
        svg.selectAll("g.nary-search-overlay").remove();
        svg.selectAll("g.nary-move-overlay").remove();
        svg
          .selectAll(
            "g.bp-insert-overlay, g.bp-delete-overlay, g.bp-search-overlay, g.bp-range-overlay, g.bp-scanfrom-overlay, g.bp-inorder-overlay, g.bp-level-overlay"
          )
          .interrupt()
          .remove();

        dbg("clear: animación de clean ejecutada");
      } catch (e) {
        dbg("clear: error durante clean()", e);
        // Nos aseguramos de dejar el simulador en estado consistente
        setAnimatingDispatch(false);
        resetQueryValues();
      } finally {
        bus.emit("op:done", { op: "clean" });
      }
    })();
  }, [
    query.toClear,
    isAnimating,
    nodePositions,
    seqPositions,
    resetQueryValues,
    setAnimating,
    setAnimatingDispatch,
    bus,
  ]);

  return { svgRef };
}
