// src/hooks/estructures/arbol123/useTwoThreeTreeRender.ts
import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";

import {
  BaseQueryOperations,
  HierarchyNodeData,
  TraversalNodeType,
  TreeLinkData,
} from "../../../../../types";

import { useAnimation } from "../../../../../shared/hooks/useAnimation";

/* ───────── Utilidades genéricas (n-ario) ───────── */
import {
  SVG_NARY_VALUES,
  drawTraversalSequence,
  animateClearTree,
} from "../../../../../shared/utils/draw/naryDrawActionsUtilities";

/* ───────── Draw/anim específicas 2-3 ───────── */
import {
  ensureTwoThreeSkinDefs,
  drawTwoThreeTreeNodes,
  drawTreeLinks as drawTTLinks,
  repositionTwoThreeTreeNodes as repositionTTNodes,
  flashKeyChip,
  popTwoThreeNode,
  animateTwoThreeSearchPath,
  animateTwoThreeTraversal,
  ensureSiblingPadding,
} from "../../../../../shared/utils/draw/TwoThreeTreeDrawActions";

/* ───────── Tipos/Helpers locales ───────── */
type THNode = d3.HierarchyNode<HierarchyNodeData<number[]>>;

/** Podar posiciones que ya no corresponden a nodos vivos */
function pruneStalePositions(
  liveIds: Set<string>,
  nodePositions: Map<string, { x: number; y: number }>
) {
  for (const id of Array.from(nodePositions.keys())) {
    if (!liveIds.has(id)) nodePositions.delete(id);
  }
}

/**
 * Sincroniza el mapa de posiciones con el layout actual.
 * - Si force = true: siempre copia d.x/d.y (ideal cuando el árbol aún no está "ready").
 * - Si force = false: solo si el id no existe (siembra).
 */
function syncPositionsFromLayout(
  nodes: THNode[],
  nodePositions: Map<string, { x: number; y: number }>,
  force = false
) {
  for (const n of nodes) {
    const id = n.data.id;
    if (!id) continue;
    const hasXY =
      typeof (n as any).x === "number" && typeof (n as any).y === "number";
    if (!hasXY) continue;
    if (force || !nodePositions.has(id)) {
      nodePositions.set(id, {
        x: (n as any).x as number,
        y: (n as any).y as number,
      });
    }
  }
}

/** Elimina g.node duplicados por id y reencadena el datum actual en cada g#id */
function dedupeAndRebind(
  nodesLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: THNode[]
) {
  const seen = new Set<string>();
  nodesLayer.selectAll<SVGGElement, unknown>("g.node").each(function () {
    const id = (this as SVGGElement).id;
    if (!id) return;
    if (seen.has(id)) d3.select(this).remove();
    else seen.add(id);
  });

  for (const n of nodes) {
    nodesLayer.select<SVGGElement>(`g#${n.data.id}`).datum(n as any);
  }
}

/** Limpia nodos “fantasma” (ids inexistentes u opacidad ~0). */
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

/** Busca qué nodo contiene la clave k y en qué índice del array de claves. */
function findNodeWithKey(
  nodes: THNode[],
  k: number
): { node: THNode; keyIdx: number } | null {
  for (const n of nodes) {
    const arr = n.data.value ?? [];
    const idx = arr.findIndex((x) => x === k);
    if (idx !== -1) return { node: n, keyIdx: idx };
  }
  return null;
}

/* ───────── Hook principal ───────── */
export function useTwoThreeTreeRender(
  treeData: HierarchyNodeData<number[]> | null,
  query: BaseQueryOperations<"arbol_123">,
  resetQueryValues: () => void
) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Caches de posición (nodos y secuencia de recorridos)
  const nodePositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;
  const seqPositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;

  // Offsets de pintura (centrado)
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // Jerarquía D3
  const root = useMemo(
    () =>
      treeData ? d3.hierarchy<HierarchyNodeData<number[]>>(treeData) : null,
    [treeData]
  );

  // Nodos visibles (sin placeholders)
  const currentNodes = useMemo<THNode[]>(
    () =>
      root
        ? (root.descendants() as THNode[]).filter((d) => !d.data.isPlaceholder)
        : [],
    [root]
  );


  const { setIsAnimating } = useAnimation();

  // Links visibles (sin placeholders)
  const linksData: TreeLinkData[] = useMemo(() => {
    if (!root) return [];
    return root.links().reduce<TreeLinkData[]>((acc, link) => {
      if (!link.target.data.isPlaceholder) {
        acc.push({
          sourceId: link.source.data.id,
          targetId: link.target.data.id,
        });
      }
      return acc;
    }, []);
  }, [root]);

  /** Borra la banda de secuencia (números) y resetea el mapa de posiciones. */
  function clearTraversalUI(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    opts: { fade?: boolean } = {}
  ) {
    const { fade = false } = opts;
    const seqG = svg.select<SVGGElement>("g.seq-container");

    const texts = seqG
      .selectAll<SVGTextElement, unknown>("text.seq")
      .interrupt();

    if (fade) {
      texts.transition().duration(140).style("opacity", 0).remove();
    } else {
      texts.remove();
    }

    seqG
      .attr("data-sig-pre", "")
      .attr("data-sig-in", "")
      .attr("data-sig-post", "")
      .attr("data-sig-level", "");

    seqG.style("opacity", 1);
    seqG.attr("transform", seqG.attr("transform") ?? "translate(0,0)");

    seqPositions.clear();
  }

  /** Detiene y remueve SOLO overlays/recorridos previos. */
  function nukeOverlaysAndInterrupt(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) {
    svg.selectAll("g.tt-traverse-overlay").interrupt().remove();
    svg.selectAll("g.tt-search-overlay").interrupt().remove();
    svg.selectAll("path.tt-traverse-seg").interrupt().remove();
    svg.selectAll("path.tt-search-seg").interrupt().remove();
    svg
      .selectAll(".tt-runner,.tt-step-ring,.tt-target-ring")
      .interrupt()
      .remove();
  }

  /* Lock simple para encolar animaciones y no pisarse */
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

  /* Espera a que el layout haya aplicado translate y padding */
  async function waitLayoutReady(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) {
    const t0 = performance.now();
    while (true) {
      const treeG = svg.select<SVGGElement>("g.tree-container");
      const ready = treeG.attr("data-ready") === "1";
      if (ready) break;
      if (performance.now() - t0 > 600) break;
      await new Promise((r) => setTimeout(r, 16));
    }
  }

  /* ───────────────── Render base ───────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    (async () => {
      // 1) Layout D3 por centros
      const margin = {
        left: SVG_NARY_VALUES.MARGIN_LEFT,
        right: SVG_NARY_VALUES.MARGIN_RIGHT,
        top: SVG_NARY_VALUES.MARGIN_TOP,
        bottom: SVG_NARY_VALUES.MARGIN_BOTTOM,
      };

      d3
        .tree<HierarchyNodeData<number[]>>()
        .nodeSize([
          SVG_NARY_VALUES.NODE_SPACING,
          SVG_NARY_VALUES.LEVEL_SPACING,
        ])(root);

      // 2) SVG base + defs
      const svg = d3
        .select<SVGSVGElement, unknown>(svgRef.current!)
        .attr("style", "overflow: visible")
        .attr("width", 300)
        .attr("height", 300);

      ensureTwoThreeSkinDefs(svg);

      // 3) Capas
      let treeG = svg.select<SVGGElement>("g.tree-container");
      if (treeG.empty())
        treeG = svg.append("g").classed("tree-container", true);

      // marca + ocultar mientras calculamos
      treeG.attr("data-ready", "0").style("opacity", 0);

      let linksLayer = treeG.select<SVGGElement>("g.links-layer");
      if (linksLayer.empty())
        linksLayer = treeG.append("g").attr("class", "links-layer");

      let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
      if (nodesLayer.empty())
        nodesLayer = treeG.append("g").attr("class", "nodes-layer");

      let seqG = svg.select<SVGGElement>("g.seq-container");
      if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);

      // 3.5) PRUNE + REFRESH de posiciones antes de dibujar
      const liveIds = new Set(currentNodes.map((n) => n.data.id));
      pruneStalePositions(liveIds, nodePositions);
      // ⚠️ IMPORTANTE: forzamos sync al layout del frame actual
      syncPositionsFromLayout(currentNodes, nodePositions, /* force */ true);

      // 4) Dibujo de nodos con posiciones actuales
      drawTwoThreeTreeNodes(nodesLayer as any, currentNodes, nodePositions);

      // 4.1) DEDUPE + rebind datum
      dedupeAndRebind(nodesLayer, currentNodes);

      // 5) Resolver colisiones (no visible aún) usando posiciones ya refrescadas
      await ensureSiblingPadding(
        treeG as any,
        currentNodes as any,
        linksData,
        nodePositions,
        /* minGap */ 18
      );

      // 6) Enlaces con posiciones definitivas del frame
      drawTTLinks(
        linksLayer as any,
        linksData,
        nodePositions,
        currentNodes as any,
        {
          strokeColor: "#3b4252",
          strokeWidth: 2,
        }
      );

      // 7) Auto-fit por BBox + offsets
      const nodesBB = nodesLayer.node()?.getBBox();
      if (nodesBB) {
        treeOffset.x = margin.left - nodesBB.x;
        treeOffset.y = margin.top - nodesBB.y;
        treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

        const treeW = nodesBB.width + margin.left + margin.right;
        const treeH = nodesBB.height + margin.top + margin.bottom;

        const seqBB = seqG.node()?.getBBox();
        const fallbackSeqW =
          Math.max(0, currentNodes.length - 1) *
            SVG_NARY_VALUES.SEQUENCE_PADDING +
          24;
        const seqContentW =
          seqBB && seqBB.width > 0 ? seqBB.width : fallbackSeqW;

        const finalW = Math.max(
          treeW,
          seqContentW + margin.left + margin.right
        );
        const finalH =
          treeH +
          SVG_NARY_VALUES.SEQUENCE_PADDING +
          SVG_NARY_VALUES.SEQUENCE_HEIGHT;

        svg.attr("width", finalW).attr("height", finalH);

        seqOffset.x = margin.left;
        seqOffset.y =
          treeOffset.y +
          nodesBB.height +
          SVG_NARY_VALUES.SEQUENCE_PADDING +
          SVG_NARY_VALUES.SEQUENCE_HEIGHT;

        seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);
      }

      // 8) Limpieza/orden de capas
      cleanupGhostNodes(treeG, liveIds);
      linksLayer.lower();
      nodesLayer.raise();
      treeG
        .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
        .lower();

      // mostrar
      treeG.style("opacity", 1).attr("data-ready", "1");
    })().catch((e) => console.error("[render two-three]", e));
    // ⚠️ Importante: no incluir prevRoot para evitar renders dobles del bloque base
  }, [root, currentNodes, linksData]);

  /* ───────────────── Insert: pop + flash chip (si existe) ───────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toInsert == null) return;

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg);

      await waitLayoutReady(svg);

      let hit = findNodeWithKey(currentNodes, query.toInsert!);
      if (!hit) {
        await new Promise((r) => setTimeout(r, 0));
        hit = findNodeWithKey(currentNodes, query.toInsert!);
      }
      if (!hit) return;

      await new Promise((r) => setTimeout(r, 0));
      await popTwoThreeNode(treeG, hit.node.data.id);
      await flashKeyChip(treeG, `${hit.node.data.id}#k${hit.keyIdx}`);

      resetQueryValues();
    }).catch((e) => console.error("[2-3 insert anim]", e));
  }, [root, currentNodes, query.toInsert, resetQueryValues]);

  /* ───────────────── Delete: reflow suave ───────────────── */
  useEffect(() => {
    if (!svgRef.current || query.toDelete == null) return;

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg);

      await waitLayoutReady(svg);

      const nodesNow = (root
        ?.descendants()
        .filter((d) => !d.data.isPlaceholder) ?? []) as THNode[];
      const linksNow = (root?.links().reduce<TreeLinkData[]>((acc, link) => {
        if (!link.target.data.isPlaceholder) {
          acc.push({
            sourceId: link.source.data.id,
            targetId: link.target.data.id,
          });
        }
        return acc;
      }, []) ?? []) as TreeLinkData[];

      // 👇 sincroniza posiciones con el layout MÁS reciente antes de ajustar/animar
      syncPositionsFromLayout(nodesNow, nodePositions, /* force */ true);

      await ensureSiblingPadding(
        treeG as any,
        nodesNow as any,
        linksNow,
        nodePositions,
        18
      );

      await repositionTTNodes(
        treeG as any,
        nodesNow as any,
        linksNow,
        nodePositions
      ).catch(() => {});

      resetQueryValues();
    }).catch((e) => console.error("[2-3 delete reflow]", e));
  }, [root, query.toDelete, resetQueryValues]);

  /* ───────────────── Search ───────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toSearch == null) return;

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg);

      await waitLayoutReady(svg);

      const hitNode = currentNodes.find((d) =>
        (d.data.value ?? []).includes(query.toSearch!)
      );
      if (!hitNode) return;

      const pathToNode = root.path(hitNode);

      await animateTwoThreeSearchPath(
        svg,
        treeG,
        pathToNode,
        nodePositions,
        { key: query.toSearch! },
        resetQueryValues,
        setIsAnimating
      );
    }).catch((e) => console.error("[2-3 search anim]", e));
  }, [root, currentNodes, query.toSearch, resetQueryValues, setIsAnimating]);

  /* ───────── Recorridos: banda + animación 2-3 ───────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      let seqG = svg.select<SVGGElement>("g.seq-container");
      if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);

      type Trav = "pre" | "in" | "post" | "level" | null;
      const kind: Trav = query.toGetPreOrder.length
        ? "pre"
        : query.toGetInOrder.length
          ? "in"
          : query.toGetPostOrder.length
            ? "post"
            : query.toGetLevelOrder.length
              ? "level"
              : null;
      if (!kind) return;

      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg, { fade: false });

      await waitLayoutReady(svg);

      type TItem = TraversalNodeType;

      const pushKeys = (n: THNode, out: TItem[]) => {
        const vals = (n.data.value ?? []).slice();
        for (let i = 0; i < vals.length; i++) {
          out.push({ id: `${n.data.id}#k${i}`, value: vals[i] });
        }
      };

      const pre = (n: THNode, out: TItem[]) => {
        pushKeys(n, out);
        (n.children ?? []).forEach((c) => pre(c as THNode, out));
      };

      const post = (n: THNode, out: TItem[]) => {
        (n.children ?? []).forEach((c) => post(c as THNode, out));
        pushKeys(n, out);
      };

      const ino = (n: THNode, out: TItem[]) => {
        const kids = n.children ?? [];
        const vals = n.data.value ?? [];
        const m = vals.length;
        for (let i = 0; i < m; i++) {
          if (kids[i]) ino(kids[i] as THNode, out);
          out.push({ id: `${n.data.id}#k${i}`, value: vals[i] });
        }
        if (kids[m]) ino(kids[m] as THNode, out);
      };

      const level = (n: THNode): TItem[] => {
        const out: TItem[] = [];
        const q: THNode[] = [n];
        while (q.length) {
          const cur = q.shift()!;
          pushKeys(cur, out);
          (cur.children ?? []).forEach((c) => q.push(c as THNode));
        }
        return out;
      };

      let seq: TItem[] = [];
      if (kind === "pre") pre(root as THNode, seq);
      if (kind === "post") post(root as THNode, seq);
      if (kind === "in") ino(root as THNode, seq);
      if (kind === "level") seq = level(root as THNode);
      if (!seq.length) return;

      drawTraversalSequence(seqG, seq, { seqPositions });

      (() => {
        const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
        const nodesBB = nodesLayer.node()?.getBBox();
        const seqBB = seqG.node()?.getBBox();
        const m = {
          left: SVG_NARY_VALUES.MARGIN_LEFT,
          right: SVG_NARY_VALUES.MARGIN_RIGHT,
          top: SVG_NARY_VALUES.MARGIN_TOP,
          bottom: SVG_NARY_VALUES.MARGIN_BOTTOM,
        };

        if (nodesBB) {
          const treeW = nodesBB.width + m.left + m.right;
          const seqW = (seqBB?.width ?? 0) + m.left + m.right + 8;
          const finalW = Math.max(treeW, seqW);
          const finalH =
            nodesBB.height +
            m.top +
            m.bottom +
            SVG_NARY_VALUES.SEQUENCE_PADDING +
            SVG_NARY_VALUES.SEQUENCE_HEIGHT;

          svg.attr("width", finalW).attr("height", finalH);

          const ty = parseFloat(
            treeG
              .attr("transform")
              .match(/translate\(([^,]+),([^)]+)\)/)?.[2] ?? "0"
          );

          const seqY =
            ty +
            nodesBB.height +
            SVG_NARY_VALUES.SEQUENCE_PADDING +
            SVG_NARY_VALUES.SEQUENCE_HEIGHT;

          seqG.attr(
            "transform",
            `translate(${SVG_NARY_VALUES.MARGIN_LEFT}, ${seqY})`
          );
        }
      })();

      await animateTwoThreeTraversal(
        svg,
        treeG,
        seq,
        seqG,
        seqPositions,
        nodePositions,
        resetQueryValues,
        setIsAnimating,
        {
          runnerRadius: 6,
          runnerSpeed: 420,
          strokeColor: "#8aa0ff",
          ripple: true,
          bounce: true,
          stepDelay: 60,
        }
      );
    }).catch((e) => console.error("[2-3 traversal anim]", e));
  }, [
    svgRef,
    root,
    query.toGetPreOrder,
    query.toGetInOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ───────────────── Clear total ───────────────── */
  useEffect(() => {
    if (!svgRef.current || !query.toClear) return;

    runExclusive(async () => {
      const svg = d3.select(svgRef.current);
      const treeG = svg.select<SVGGElement>("g.tree-container");
      const seqG = svg.select<SVGGElement>("g.seq-container");

      await animateClearTree(
        treeG,
        seqG,
        { nodePositions, seqPositions },
        resetQueryValues,
        setIsAnimating
      );

      svg.selectAll("g.nary-search-overlay").remove();
      svg.selectAll("g.nary-move-overlay").remove();
    }).catch((e) => console.error("[2-3 clear]", e));
  }, [query.toClear, resetQueryValues, setIsAnimating]);

  return { svgRef };
}
