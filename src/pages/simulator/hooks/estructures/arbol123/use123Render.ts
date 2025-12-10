// src/hooks/estructures/arbol123/useTwoThreeTreeRender.ts
import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import { useBus } from "../../../../../shared/hooks/useBus";
import { getArbol123Code } from "../../../../../shared/constants/pseudocode/arbol123Code";
import { delay } from "../../../../../shared/utils/simulatorUtils";

import {
  BaseQueryOperations,
  HierarchyNodeData,
  TraversalNodeType,
  TreeLinkData,
} from "../../../../../types";

import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";

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
const TT_CODE = getArbol123Code();

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

  const prevRoot = usePrevious(root);

  // Nodos visibles (sin placeholders)
  const currentNodes = useMemo<THNode[]>(
    () =>
      root
        ? (root.descendants() as THNode[]).filter((d) => !d.data.isPlaceholder)
        : [],
    [root]
  );

  const { setIsAnimating } = useAnimation();
  const bus = useBus();

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
    if (!svgRef.current || !root) return;

    // ¿Había nodos reales antes de este frame?
    const hadNodesBefore =
      !!prevRoot && prevRoot.descendants().some((d) => !d.data.isPlaceholder);

    // Flags de operaciones en curso
    const isInsertInProgress = query.toInsert != null;
    const isDeleteInProgress = query.toDelete != null;

    // Insert: seguimos congelando TODO (como ya tenías)
    const freezeForInsert = isInsertInProgress && hadNodesBefore;
    if (freezeForInsert) {
      return;
    }

    // Para delete: mientras esté en curso, dibujamos el ÁRBOL ANTERIOR (prevRoot),
    // no el root ya modificado. Visualmente el usuario sigue viendo el árbol "antes".
    const drawRoot: THNode | null =
      isDeleteInProgress && prevRoot ? (prevRoot as THNode) : (root as THNode);

    if (!drawRoot) return;

    // Nodos visibles que vamos a dibujar (del drawRoot, no del root actual cuando hay delete)
    const drawNodes: THNode[] = (drawRoot.descendants() as THNode[]).filter(
      (d) => !d.data.isPlaceholder
    );

    // Links para dibujar (también desde drawRoot)
    const drawLinks: TreeLinkData[] = drawRoot
      ? drawRoot.links().reduce<TreeLinkData[]>((acc, link) => {
          if (!link.target.data.isPlaceholder) {
            acc.push({
              sourceId: link.source.data.id,
              targetId: link.target.data.id,
            });
          }
          return acc;
        }, [])
      : [];

    (async () => {
      // 1) Layout D3 por centros sobre drawRoot
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
        ])(drawRoot); // 👈 OJO: usamos drawRoot

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

      // 3.5) PRUNE + REFRESH de posiciones antes de dibujar (sobre drawNodes)
      const liveIds = new Set(drawNodes.map((n) => n.data.id));
      pruneStalePositions(liveIds, nodePositions);
      syncPositionsFromLayout(drawNodes, nodePositions, /* force */ true);

      // 4) Dibujo de nodos con posiciones actuales (drawNodes)
      drawTwoThreeTreeNodes(nodesLayer as any, drawNodes, nodePositions);

      // 4.1) DEDUPE + rebind datum
      dedupeAndRebind(nodesLayer, drawNodes);

      // 5) Resolver colisiones (no visible aún)
      await ensureSiblingPadding(
        treeG as any,
        drawNodes as any,
        drawLinks,
        nodePositions,
        /* minGap */ 18
      );

      // 6) Enlaces (drawLinks)
      drawTTLinks(
        linksLayer as any,
        drawLinks,
        nodePositions,
        drawNodes as any,
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
          Math.max(0, drawNodes.length - 1) * SVG_NARY_VALUES.SEQUENCE_PADDING +
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

      // 8) Limpieza/orden de capas, usando los ids visibles (drawNodes)
      cleanupGhostNodes(treeG, liveIds);
      linksLayer.lower();
      nodesLayer.raise();
      treeG
        .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
        .lower();

      // mostrar
      treeG.style("opacity", 1).attr("data-ready", "1");
    })().catch((e) => console.error("[render two-three]", e));
  }, [
    root,
    prevRoot,
    query.toInsert,
    query.toDelete, // 👈 AÑADE ESTO
    nodePositions,
    treeOffset,
    seqOffset,
  ]);

  /* ───────────────── Insert: pseudocódigo + pop + flash chip ───────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toInsert == null) return;

    // Labels del pseudocódigo de insert 1-2-3
    const labels = TT_CODE.insert.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `twoThree-insert-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    // ¿El árbol estaba vacío en el frame anterior?
    const hadNodesBefore =
      !!prevRoot && prevRoot.descendants().some((d) => !d.data.isPlaceholder);
    const treeWasEmptyBefore = !hadNodesBefore;

    // Heurística: ¿probablemente hubo overflow (se creó al menos un nodo nuevo)?
    const prevRealCount = prevRoot
      ? (prevRoot.descendants() as THNode[]).filter(
          (d) => !d.data.isPlaceholder
        ).length
      : 0;
    const currentRealCount = currentNodes.length;
    const overflowLikely =
      !treeWasEmptyBefore && currentRealCount > prevRealCount;

    // Heurística adicional: ¿overflow en la raíz? (si aumenta la altura)
    const prevHeight = prevRoot
      ? (prevRoot.descendants() as THNode[])
          .filter((d) => !d.data.isPlaceholder)
          .reduce((max, d) => Math.max(max, d.depth), 0)
      : 0;
    const currentHeight = root
      ? currentNodes.reduce((max, d) => Math.max(max, d.depth), 0)
      : 0;
    const rootOverflowLikely = overflowLikely && currentHeight > prevHeight;

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");
      const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
      const linksLayer = treeG.select<SVGGElement>("g.links-layer");

      // Limpia overlays y recorridos anteriores
      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg);

      // Espera a que el layout base previo esté listo
      await waitLayoutReady(svg);

      const valueToInsert = query.toInsert!;

      // Si venimos de árbol vacío, ocultamos el nodo raíz hasta llegar al return
      if (treeWasEmptyBefore) {
        nodesLayer
          .selectAll<SVGGElement, unknown>("g.node")
          .style("visibility", "hidden");

        linksLayer
          .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
          .style("visibility", "hidden");
      }

      // Inicia operación de pseudocódigo
      bus.emit("op:start", { op: "insert" });

      if (treeWasEmptyBefore) {
        /* ─────────── Caso 1: árbol vacío → crear raíz ─────────── */

        await step("INSERT_TREE_EMPTY_IF", 600);
        if (cancelled) return;

        await step("INSERT_CHECK_CAP_ROOT", 600);
        if (cancelled) return;

        await step("INSERT_NEW_ROOT_NODE", 600);
        if (cancelled) return;

        await step("INSERT_NEW_ROOT_KEY", 600);
        if (cancelled) return;

        await step("INSERT_SET_ROOT", 600);
        if (cancelled) return;

        await step("INSERT_ROOT_SIZE_COMMENT", 400);
        if (cancelled) return;

        await step("INSERT_RETURN", 600);
        if (cancelled) return;

        // Al llegar al return, mostramos por fin el nodo en el árbol
        nodesLayer
          .selectAll<SVGGElement, unknown>("g.node")
          .style("visibility", "visible");

        linksLayer
          .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
          .style("visibility", "visible");
      } else {
        /* ─────────── Caso 2/3: árbol no vacío ─────────── */

        // 1) // Caso 2: no se permiten duplicados
        await step("INSERT_DUPLICATE_IF", 600);
        if (cancelled) return;
        // (En el camino feliz asumimos que no lanza la excepción.)

        // 2) // Caso 3: árbol no vacío → descender hasta una hoja
        await step("INSERT_INIT_CUR", 600);
        if (cancelled) return;

        // Simulamos el patrón del while según la profundidad del nodo destino
        let hitForDepth = findNodeWithKey(currentNodes, valueToInsert);
        const depth = hitForDepth ? hitForDepth.node.depth : 1;
        const iterations = Math.max(1, depth);

        for (let i = 0; i < iterations; i++) {
          await step("INSERT_WHILE_DESCEND", 450);
          if (cancelled) return;

          await step("INSERT_DESC_POS", 350);
          if (cancelled) return;

          await step("INSERT_DESC_CHILD_LOOKUP", 350);
          if (cancelled) return;

          await step("INSERT_DESC_CHILD_NULL_IF", 300);
          if (cancelled) return;
        }

        // 3) insertarOrdenado(cur.keys, v);
        await step("INSERT_LEAF_INSERT", 600);
        if (cancelled) return;

        // 4) repararOverflow(cur);
        await step("INSERT_CALL_REPAIR", 600);
        if (cancelled) return;

        /* ─────────── Detalle de repararOverflow(...) ─────────── */

        // inicialización
        await step("OVERFLOW_INIT_ACTUAL", 450);
        if (cancelled) return;

        await step("OVERFLOW_INIT_CREATED", 450);
        if (cancelled) return;

        // while (actual != null && actual.keys.size() > 2){
        await step("OVERFLOW_WHILE", 600);
        if (cancelled) return;

        if (!overflowLikely) {
          // Camino conceptual sin overflow real
          await step("OVERFLOW_SIZE_CHECK_IF", 500);
          if (cancelled) return;

          await step("OVERFLOW_CREATED_IF", 400);
          if (cancelled) return;
          await step("OVERFLOW_UPDATE_TAMANIO", 400);
          if (cancelled) return;
        } else {
          // Camino con overflow real: una pasada completa del cuerpo

          await step("OVERFLOW_SIZE_CHECK_IF", 450);
          if (cancelled) return;

          await step("OVERFLOW_GET_K0", 350);
          if (cancelled) return;
          await step("OVERFLOW_GET_K1", 350);
          if (cancelled) return;
          await step("OVERFLOW_GET_K2", 350);
          if (cancelled) return;

          await step("OVERFLOW_CHILDREN_ASSIGN", 350);
          if (cancelled) return;

          await step("OVERFLOW_SET_L", 350);
          if (cancelled) return;
          await step("OVERFLOW_L_CLEAR", 350);
          if (cancelled) return;
          await step("OVERFLOW_L_ADD_K0", 350);
          if (cancelled) return;

          await step("OVERFLOW_CHECK_CAP_NEW_R", 350);
          if (cancelled) return;
          await step("OVERFLOW_NEW_R_NODE", 350);
          if (cancelled) return;
          await step("OVERFLOW_R_ADD_K2", 350);
          if (cancelled) return;
          await step("OVERFLOW_CREATED_INC", 350);
          if (cancelled) return;

          await step("OVERFLOW_HAS_CHILDREN_IF", 350);
          if (cancelled) return;
          await step("OVERFLOW_DISTRIB_CHILDREN", 350);
          if (cancelled) return;

          await step("OVERFLOW_PARENT_ASSIGN", 350);
          if (cancelled) return;

          await step("OVERFLOW_PARENT_IS_NULL_IF", 350);
          if (cancelled) return;

          if (rootOverflowLikely) {
            // ─── Overflow en la raíz ───
            await step("OVERFLOW_CHECK_CAP_NEW_ROOT", 350);
            if (cancelled) return;

            await step("OVERFLOW_NEW_ROOT_NODE", 350);
            if (cancelled) return;

            await step("OVERFLOW_NEW_ROOT_ADD_K1", 350);
            if (cancelled) return;

            await step("OVERFLOW_NEW_ROOT_SET_CHILDREN", 350);
            if (cancelled) return;

            await step("OVERFLOW_SET_ROOT_NODE", 350);
            if (cancelled) return;

            await step("OVERFLOW_CREATED_INC_ROOT", 350);
            if (cancelled) return;

            await step("OVERFLOW_SET_ACTUAL_NULL", 350);
            if (cancelled) return;
          } else {
            // ─── Overflow en nodo interno ───
            await step("OVERFLOW_POSK_COMPUTE", 350);
            if (cancelled) return;

            await step("OVERFLOW_INSERT_EN_POSICION", 350);
            if (cancelled) return;

            await step("OVERFLOW_FIND_IDX_L", 350);
            if (cancelled) return;

            await step("OVERFLOW_SHIFT_RIGHT", 350);
            if (cancelled) return;

            await step("OVERFLOW_SET_R_CHILD", 350);
            if (cancelled) return;

            await step("OVERFLOW_SET_ACTUAL_PARENT", 350);
            if (cancelled) return;
          }

          await step("OVERFLOW_CREATED_IF", 400);
          if (cancelled) return;
          await step("OVERFLOW_UPDATE_TAMANIO", 400);
          if (cancelled) return;
        }
      }

      /* ─────────── Fin de pseudocódigo: ahora sí aplicamos cambios visuales ─────────── */

      // 1) Liberar el flag de operación en curso
      resetQueryValues();

      // 2) Dar tiempo a React para que dispare el render base con el árbol definitivo
      await new Promise((r) => setTimeout(r, 0));
      if (cancelled || !svgRef.current) return;

      const svgAfter = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeGAfter = svgAfter.select<SVGGElement>("g.tree-container");

      // 3) Animación visual real (pop + chip) sobre el árbol ya actualizado
      let hit = findNodeWithKey(currentNodes, valueToInsert);
      if (!hit) {
        await new Promise((r) => setTimeout(r, 0));
        hit = findNodeWithKey(currentNodes, valueToInsert);
      }

      if (hit) {
        await new Promise((r) => setTimeout(r, 0));
        await popTwoThreeNode(treeGAfter, hit.node.data.id);
        await flashKeyChip(treeGAfter, `${hit.node.data.id}#k${hit.keyIdx}`);
      }

      bus.emit("op:done", { op: "insert" });
    }).catch((e) => console.error("[2-3 insert anim]", e));

    return () => {
      cancelled = true;
    };
  }, [
    root,
    prevRoot,
    currentNodes,
    query.toInsert,
    resetQueryValues,
    bus,
    svgRef,
    setIsAnimating,
  ]);

  /* ───────────────── Delete: pseudocódigo + reflow suave ───────────────── */
  useEffect(() => {
    if (!svgRef.current || query.toDelete == null) return;

    // Labels del pseudocódigo de delete
    const labels = TT_CODE.delete.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `twoThree-delete-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    // ¿Había nodos reales antes de este frame? (árbol antes del delete)
    const hadNodesBefore =
      !!prevRoot && prevRoot.descendants().some((d) => !d.data.isPlaceholder);
    const treeWasEmptyBefore = !hadNodesBefore;

    const prevNodes = prevRoot
      ? ((prevRoot.descendants() as THNode[]).filter(
          (d) => !d.data.isPlaceholder
        ) as THNode[])
      : [];

    // Nodo donde estaba la clave ANTES del delete
    const valueToDelete = query.toDelete!;
    let prevHit: THNode | null = null;
    if (prevRoot) {
      for (const n of prevNodes) {
        if ((n.data.value ?? []).includes(valueToDelete)) {
          prevHit = n;
          break;
        }
      }
    }

    const prevWasSingleRootLeaf =
      prevNodes.length === 1 && !prevNodes[0].children?.length;

    const prevLeafHadSingleKey =
      !!prevHit &&
      (!prevHit.children || prevHit.children.length === 0) &&
      (prevHit.data.value?.length ?? 0) === 1;

    const prevHeight = prevNodes.reduce((max, d) => Math.max(max, d.depth), 0);
    const currentHeight = currentNodes.reduce(
      (max, d) => Math.max(max, d.depth),
      0
    );

    // Si baja la altura, probablemente hubo underflow en la raíz
    const rootUnderflowLikely = currentHeight < prevHeight;

    type UnderflowMode =
      | "none"
      | "root"
      | "rotateLeft"
      | "rotateRight"
      | "mergeLeft"
      | "mergeRight"
      | "noSiblings";

    let underflowMode: UnderflowMode = "none";

    // Estimamos si habrá underflow (hoja con 1 clave que no es raíz hoja)
    if (!prevWasSingleRootLeaf && prevLeafHadSingleKey) {
      if (rootUnderflowLikely) {
        underflowMode = "root";
      } else if (prevHit && prevHit.parent) {
        const parentPrev = prevHit.parent as THNode;
        const kidsPrev = (parentPrev.children ?? []) as (THNode | null)[];
        const idxHijo = kidsPrev.findIndex((c) => c === prevHit);

        const safeChild = (idx: number): THNode | null => {
          const child = kidsPrev[idx] ?? null;
          if (!child) return null;
          if ((child.data as any).isPlaceholder) return null;
          return child;
        };

        const hermanoIzq = idxHijo > 0 ? safeChild(idxHijo - 1) : null;
        const hermanoDer =
          idxHijo >= 0 && idxHijo < kidsPrev.length - 1
            ? safeChild(idxHijo + 1)
            : null;

        const leftCanLend =
          hermanoIzq && (hermanoIzq.data.value?.length ?? 0) > 1;
        const rightCanLend =
          hermanoDer && (hermanoDer.data.value?.length ?? 0) > 1;

        if (leftCanLend) underflowMode = "rotateLeft";
        else if (rightCanLend) underflowMode = "rotateRight";
        else if (hermanoIzq) underflowMode = "mergeLeft";
        else if (hermanoDer) underflowMode = "mergeRight";
        else underflowMode = "noSiblings";
      }
    }

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg);

      await waitLayoutReady(svg);

      bus.emit("op:start", { op: "delete" });

      /* ─────────── Caso 0: árbol vacío ─────────── */
      if (treeWasEmptyBefore) {
        await step("DELETE_ROOT_EMPTY_IF", 600);
        if (cancelled) return;
        await step("DELETE_ROOT_EMPTY_THROW", 800);
        if (cancelled) return;

        resetQueryValues();
        bus.emit("op:done", { op: "delete" });
        return;
      }

      /* ─────────── Paso 1: buscar la clave y asegurar que existe ─────────── */

      await step("DELETE_INIT_CUR", 450);
      if (cancelled) return;

      await step("DELETE_INIT_IDX", 350);
      if (cancelled) return;

      await step("DELETE_INIT_CLAVE", 350);
      if (cancelled) return;

      const targetDepth = prevHit ? prevHit.depth : 1;
      const keyWasInternal = !!(
        prevHit &&
        prevHit.children &&
        prevHit.children.length
      );

      const iterations = Math.max(1, targetDepth);
      for (let i = 0; i < iterations; i++) {
        await step("DELETE_WHILE_DESCEND", 450);
        if (cancelled) return;

        await step("DELETE_DESC_POS", 350);
        if (cancelled) return;

        if (keyWasInternal && i === 0) {
          // Rama: clave en nodo interno → usar sucesor
          await step("DELETE_DESC_KEY_INTERNAL_IF", 350);
          if (cancelled) return;

          await step("DELETE_DESC_SUCC_INIT", 320);
          if (cancelled) return;

          await step("DELETE_DESC_SUCC_WHILE", 320);
          if (cancelled) return;

          await step("DELETE_DESC_SUCC_ADVANCE", 320);
          if (cancelled) return;

          await step("DELETE_DESC_SUCC_KEY", 320);
          if (cancelled) return;

          await step("DELETE_DESC_SUCC_REPLACE", 320);
          if (cancelled) return;

          await step("DELETE_DESC_UPDATE_CLAVE", 320);
          if (cancelled) return;

          await step("DELETE_DESC_MOVE_TO_SUCC", 320);
          if (cancelled) return;

          await step("DELETE_DESC_BREAK", 320);
          if (cancelled) return;
          break;
        } else {
          // Rama ELSE: descender por hijo
          await step("DELETE_DESC_KEY_INTERNAL_IF", 320);
          if (cancelled) return;

          await step("DELETE_DESC_ELSE_CHILD", 280);
          if (cancelled) return;

          await step("DELETE_DESC_CHILD_LOOKUP", 320);
          if (cancelled) return;

          await step("DELETE_DESC_CHILD_NULL_IF", 280);
          if (cancelled) return;
          // Camino feliz: no lanzamos la excepción

          await step("DELETE_DESC_MOVE_CHILD", 320);
          if (cancelled) return;
        }
      }

      // Ahora cur es la hoja donde debe estar la clave
      await step("DELETE_LEAF_FIND_IDX", 450);
      if (cancelled) return;

      await step("DELETE_LEAF_NOT_FOUND_IF", 350);
      if (cancelled) return;
      // Camino feliz: no ejecutamos DELETE_LEAF_NOT_FOUND_THROW

      await step("DELETE_LEAF_REMOVE_CALL", 450);
      if (cancelled) return;

      /* ─────────── Caso especial: raíz hoja ─────────── */

      if (prevWasSingleRootLeaf) {
        await step("DELETE_ROOT_LEAF_IF", 450);
        if (cancelled) return;

        await step("DELETE_ROOT_LEAF_EMPTY_IF", 350);
        if (cancelled) return;

        await step("DELETE_ROOT_LEAF_HAS_CHILD_IF", 320);
        if (cancelled) return;

        const treeIsNowEmpty = currentNodes.length === 0;
        if (!treeIsNowEmpty) {
          await step("DELETE_ROOT_LEAF_SET_ROOT_CHILD", 320);
          if (cancelled) return;

          await step("DELETE_ROOT_LEAF_SET_PARENT_NULL", 320);
          if (cancelled) return;
        } else {
          await step("DELETE_ROOT_LEAF_SET_NULL", 320);
          if (cancelled) return;
        }

        await step("DELETE_ROOT_LEAF_RETURN", 450);
        if (cancelled) return;

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

        syncPositionsFromLayout(nodesNow, nodePositions, true);
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
        bus.emit("op:done", { op: "delete" });
        return;
      }

      /* ─────────── Paso 3: reparar underflow si la hoja quedó sin claves ─────────── */

      await step("DELETE_ROOT_LEAF_IF", 400); // se evalúa, pero cur != raiz
      if (cancelled) return;

      await step("DELETE_UNDERFLOW_IF", 450);
      if (cancelled) return;

      if (underflowMode !== "none") {
        await step("DELETE_UNDERFLOW_CALL", 450);
        if (cancelled) return;

        await step("UNDERFLOW_INIT_ACTUAL", 400);
        if (cancelled) return;

        await step("UNDERFLOW_WHILE", 400);
        if (cancelled) return;

        await step("UNDERFLOW_PARENT_ASSIGN", 350);
        if (cancelled) return;

        await step("UNDERFLOW_PARENT_IS_NULL_IF", 350);
        if (cancelled) return;

        if (underflowMode === "root") {
          // Underflow en la raíz
          await step("UNDERFLOW_ROOT_CHILD_IF", 320);
          if (cancelled) return;

          await step("UNDERFLOW_ROOT_CHILD_SET", 320);
          if (cancelled) return;

          await step("UNDERFLOW_ROOT_CHILD_PARENT_NULL", 320);
          if (cancelled) return;

          await step("UNDERFLOW_ROOT_SET_NULL", 320);
          if (cancelled) return;

          await step("UNDERFLOW_SET_ACTUAL_NULL", 320);
          if (cancelled) return;
        } else {
          // Caso general: padre != null
          await step("UNDERFLOW_IDX_HIJO_ASSIGN", 320);
          if (cancelled) return;

          await step("UNDERFLOW_IDX_HIJO_NOT_FOUND_IF", 320);
          if (cancelled) return;
          // Camino feliz: no se lanza la excepción

          await step("UNDERFLOW_SET_HERMANO_IZQ", 320);
          if (cancelled) return;

          await step("UNDERFLOW_SET_HERMANO_DER", 320);
          if (cancelled) return;

          if (underflowMode === "rotateLeft") {
            await step("UNDERFLOW_ROT_LEFT_IF", 350);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_MOVE_LAST_KEY", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_KPADRE", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_INSERT_IN_ACTUAL", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_SET_PADRE_KEY", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_SUB_ASSIGN", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_SHIFT_CHILD", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_SET_CHILD0", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_SUB_PARENT", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_LEFT_SET_ACTUAL_NULL", 320);
            if (cancelled) return;
          } else if (underflowMode === "rotateRight") {
            await step("UNDERFLOW_ROT_LEFT_IF", 250);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_IF", 350);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_MOVE_FIRST", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_KPADRE", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_INSERT_IN_ACTUAL", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_SET_PADRE_KEY", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_SUB_ASSIGN", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_CHILD1", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_SUB_PARENT", 320);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_SET_ACTUAL_NULL", 320);
            if (cancelled) return;
          } else {
            // Ningún hermano puede prestar: branches de merge / error
            await step("UNDERFLOW_ROT_LEFT_IF", 250);
            if (cancelled) return;

            await step("UNDERFLOW_ROT_RIGHT_IF", 250);
            if (cancelled) return;

            await step("UNDERFLOW_MERGE_ELSE", 320);
            if (cancelled) return;

            if (underflowMode === "mergeLeft") {
              await step("UNDERFLOW_MERGE_WITH_LEFT_IF", 350);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_KPADRE", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_INSERT_PADRE", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_MOVE_KEYS_WHILE", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_MOVE_KEY", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_INSERT_KEY", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_MOVE_CHILD_FOR", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_MOVE_CHILD", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_CHILD_ASSIGN", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_SUB_PARENT", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_SHIFT_LEFT", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_LEFT_SET_ACTUAL_PADRE", 320);
              if (cancelled) return;
            } else if (underflowMode === "mergeRight") {
              await step("UNDERFLOW_MERGE_WITH_LEFT_IF", 250);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_WITH_RIGHT_ELSEIF", 350);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_KPADRE", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_INSERT_PADRE", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_MOVE_KEYS_WHILE", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_MOVE_KEY", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_INSERT_KEY", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_MOVE_CHILD_FOR", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_MOVE_CHILD", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_CHILD_ASSIGN", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_SUB_PARENT", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_SHIFT_LEFT", 320);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_RIGHT_SET_ACTUAL_PADRE", 320);
              if (cancelled) return;
            } else if (underflowMode === "noSiblings") {
              await step("UNDERFLOW_MERGE_WITH_LEFT_IF", 250);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_WITH_RIGHT_ELSEIF", 250);
              if (cancelled) return;

              await step("UNDERFLOW_MERGE_NO_SIBLINGS_THROW", 800);
              if (cancelled) return;
            }
          }
        }
      }
      if (cancelled) return;
      /* ─────────── Fin de pseudocódigo: reflow de posiciones ─────────── */

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

      syncPositionsFromLayout(nodesNow, nodePositions, true);

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
      bus.emit("op:done", { op: "delete" });
    }).catch((e) => console.error("[2-3 delete anim]", e));

    return () => {
      cancelled = true;
    };
  }, [
    root,
    prevRoot,
    currentNodes,
    query.toDelete,
    resetQueryValues,
    bus,
    svgRef,
    setIsAnimating,
  ]);

  /* ───────────────── Search: pseudocódigo + animación de camino ───────────────── */
  useEffect(() => {
    if (!svgRef.current || query.toSearch == null) return;

    // Labels del pseudocódigo de search 1-2-3
    const labels = TT_CODE.search.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `twoThree-search-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    const valueToSearch = query.toSearch!;

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg);

      await waitLayoutReady(svg);

      bus.emit("op:start", { op: "search" });

      /* ─────────── Caso 0: árbol vacío ─────────── */
      if (!root || currentNodes.length === 0) {
        await step("SEARCH_TREE_EMPTY_IF", 600);
        if (cancelled) return;

        // Dominio TREE_EMPTY: no animación sobre el árbol
        resetQueryValues();
        if (!cancelled) {
          bus.emit("op:done", { op: "search", error: "TREE_EMPTY" });
        }
        return;
      }

      /* ─────────── Paso 1: found = buscarRec(raiz, v) ─────────── */

      await step("SEARCH_CALL_REC", 500);
      if (cancelled) return;

      // Simulación de buscarRec(...) sobre el árbol actual
      const searchPath: THNode[] = [];
      let cur: THNode | null = root as THNode;
      let found = false;

      while (cur) {
        searchPath.push(cur);

        // if (n == null) return false;  (siempre falso en el camino normal)
        await step("SEARCH_REC_IF_NULL", 250);
        if (cancelled) return;

        // int idx = buscarEnNodo(n.keys, v);
        await step("SEARCH_REC_FIND_IN_NODE", 300);
        if (cancelled) return;

        const keys = (cur.data.value ?? []) as number[];
        const idxInNode = keys.findIndex((k) => k === valueToSearch);

        // if (idx != -1) return true;
        await step("SEARCH_REC_RETURN_FOUND_IN_NODE_IF", 280);
        if (cancelled) return;

        if (idxInNode !== -1) {
          found = true;
          break;
        }

        const children = (cur.children ?? []) as THNode[];
        const isLeaf = !children.length;

        // if (n.isLeaf()) return false;
        await step("SEARCH_REC_IS_LEAF_IF", 280);
        if (cancelled) return;

        if (isLeaf) {
          // Hoja sin la clave → KEY_NOT_FOUND
          found = false;
          break;
        }

        // int i = posicionDescenso(n.keys, v);
        await step("SEARCH_REC_DESCEND_INDEX", 300);
        if (cancelled) return;

        let i = 0;
        while (i < keys.length && valueToSearch > keys[i]) i++;

        const nextChild = children[i] ?? null;

        // if (child == null){ ... return false; }
        await step("SEARCH_REC_CHILD_NULL_IF", 280);
        if (cancelled) return;

        if (!nextChild || (nextChild.data as any).isPlaceholder) {
          // Estado inconsistente: hijo nulo durante la búsqueda
          await step("SEARCH_REC_CHILD_NULL_RETURN", 300);
          if (cancelled) return;

          found = false;
          break;
        }

        // return buscarRec(child, v);  → siguiente iteración del while
        cur = nextChild;
      }

      /* ─────────── Caso éxito: found == true ─────────── */
      if (found) {
        // if (found) return true;
        await step("SEARCH_RETURN_FOUND_IF", 500);
        if (cancelled) return;

        // Animar el camino real seguido por la búsqueda
        await animateTwoThreeSearchPath(
          svg,
          treeG,
          searchPath,
          nodePositions,
          { key: valueToSearch },
          resetQueryValues,
          setIsAnimating
        );

        if (!cancelled) {
          bus.emit("op:done", { op: "search" });
        }
        return;
      }

      /* ─────────── Caso KEY_NOT_FOUND ─────────── */

      // Camino error: // throw ... "KEY_NOT_FOUND"
      await step("SEARCH_KEY_NOT_FOUND_THROW", 800);
      if (cancelled) return;

      // Aún así animamos el camino hasta la hoja donde se falló la búsqueda
      await animateTwoThreeSearchPath(
        svg,
        treeG,
        searchPath,
        nodePositions,
        { key: valueToSearch },
        resetQueryValues,
        setIsAnimating
      );

      if (!cancelled) {
        bus.emit("op:done", { op: "search", error: "KEY_NOT_FOUND" });
      }
    }).catch((e) => console.error("[2-3 search anim]", e));

    return () => {
      cancelled = true;
    };
  }, [
    root,
    currentNodes,
    query.toSearch,
    resetQueryValues,
    bus,
    svgRef,
    setIsAnimating,
    nodePositions,
  ]);

  /* ───────── Recorridos: banda + animación 2-3 ───────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    type TravKind = "pre" | "in" | "post" | "level" | null;

    // Qué recorrido se pidió
    const kind: TravKind = query.toGetPreOrder.length
      ? "pre"
      : query.toGetInOrder.length
        ? "in"
        : query.toGetPostOrder.length
          ? "post"
          : query.toGetLevelOrder.length
            ? "level"
            : null;

    if (!kind) return;

    // Nombre de operación para el panel de pseudocódigo
    const opName:
      | "getPreOrder"
      | "getInOrder"
      | "getPostOrder"
      | "getLevelOrder" =
      kind === "pre"
        ? "getPreOrder"
        : kind === "in"
          ? "getInOrder"
          : kind === "post"
            ? "getPostOrder"
            : "getLevelOrder";

    // Tipos de labels
    type PreLabelKey = keyof (typeof TT_CODE.getPreOrder)["labels"];
    type InLabelKey = keyof (typeof TT_CODE.getInOrder)["labels"];
    type PostLabelKey = keyof (typeof TT_CODE.getPostOrder)["labels"];
    type LevelLabelKey = keyof (typeof TT_CODE.getLevelOrder)["labels"];
    type TravLabelKey = PreLabelKey | InLabelKey | PostLabelKey | LevelLabelKey;

    const stepId = `twoThree-traversal-${kind}-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: TravLabelKey, ms: number = 600) => {
      let labelsMap:
        | (typeof TT_CODE.getPreOrder)["labels"]
        | (typeof TT_CODE.getInOrder)["labels"]
        | (typeof TT_CODE.getPostOrder)["labels"]
        | (typeof TT_CODE.getLevelOrder)["labels"];

      if (kind === "pre") labelsMap = TT_CODE.getPreOrder.labels!;
      else if (kind === "in") labelsMap = TT_CODE.getInOrder.labels!;
      else if (kind === "post") labelsMap = TT_CODE.getPostOrder.labels!;
      else labelsMap = TT_CODE.getLevelOrder.labels!;

      const lineIndex = (labelsMap as any)[labelName];
      if (typeof lineIndex !== "number") return;

      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    runExclusive(async () => {
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");

      let seqG = svg.select<SVGGElement>("g.seq-container");
      if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);

      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg, { fade: false });

      await waitLayoutReady(svg);
      if (!root) return;

      // Avisar que empieza la operación de recorrido
      bus.emit("op:start", { op: opName });

      /* ───────── Helpers recursivos/iterativos de pseudocódigo ───────── */

      const runPrePseudo = async () => {
        await step("PRE_INIT_RESULT" as TravLabelKey, 450);
        if (cancelled) return;

        await step("PRE_CALL_HELPER" as TravLabelKey, 450);
        if (cancelled) return;

        const prePseudo = async (n: THNode | null) => {
          // if (n == null) return;
          await step("PRE_IF_NULL" as TravLabelKey, 250);
          if (cancelled) return;
          if (!n) return;

          const vals = n.data.value ?? [];
          const keysCount = vals.length;

          // for (int i = 0; i < n.keys.size(); i++){ ... }
          await step("PRE_FOR_KEYS" as TravLabelKey, 250);
          if (cancelled) return;
          for (let i = 0; i < keysCount; i++) {
            await step("PRE_VISIT_KEY" as TravLabelKey, 220);
            if (cancelled) return;
          }

          const children = (n.children ?? []).filter(
            (c) => !!c && !(c as THNode).data.isPlaceholder
          ) as THNode[];

          // if (!n.isLeaf()){
          await step("PRE_IF_HAS_CHILDREN" as TravLabelKey, 250);
          if (cancelled) return;
          if (!children.length) return;

          // for (int i = 0; i <= n.keys.size(); i++){ preOrden(...) }
          await step("PRE_FOR_CHILDREN" as TravLabelKey, 250);
          if (cancelled) return;

          for (const child of children) {
            await step("PRE_RECURSE_CHILD" as TravLabelKey, 220);
            if (cancelled) return;
            await prePseudo(child);
            if (cancelled) return;
          }
        };

        await prePseudo(root as THNode);
      };

      const runInPseudo = async () => {
        await step("IN_INIT_RESULT" as TravLabelKey, 450);
        if (cancelled) return;

        await step("IN_CALL_HELPER" as TravLabelKey, 450);
        if (cancelled) return;

        const inPseudo = async (n: THNode | null) => {
          // if (n == null) return;
          await step("IN_IF_NULL" as TravLabelKey, 250);
          if (cancelled) return;
          if (!n) return;

          const vals = n.data.value ?? [];
          const keysCount = vals.length;
          const children = (n.children ?? []) as (THNode | null)[];

          const childAt = (idx: number): THNode | null => {
            const c = children[idx] ?? null;
            if (!c) return null;
            if ((c.data as any).isPlaceholder) return null;
            return c;
          };

          if (keysCount <= 1) {
            // if (n.keys.size() == 1){
            await step("IN_ONE_KEY_IF" as TravLabelKey, 250);
            if (cancelled) return;

            const hasChildren = children.length > 0;

            if (hasChildren) {
              await step("IN_RECURSE_C0_ONE" as TravLabelKey, 220);
              if (cancelled) return;
              await inPseudo(childAt(0));
              if (cancelled) return;
            }

            await step("IN_VISIT_K0_ONE" as TravLabelKey, 220);
            if (cancelled) return;

            if (hasChildren) {
              await step("IN_RECURSE_C1_ONE" as TravLabelKey, 220);
              if (cancelled) return;
              await inPseudo(childAt(1));
              if (cancelled) return;
            }
          } else {
            // else { ... } rama de 2 claves
            await step("IN_ONE_KEY_IF" as TravLabelKey, 200); // if evaluado en false
            if (cancelled) return;

            await step("IN_TWO_KEYS_ELSE" as TravLabelKey, 250);
            if (cancelled) return;

            const hasChildren = children.length > 0;

            if (hasChildren) {
              await step("IN_RECURSE_C0_TWO" as TravLabelKey, 220);
              if (cancelled) return;
              await inPseudo(childAt(0));
              if (cancelled) return;
            }

            await step("IN_VISIT_K0_TWO" as TravLabelKey, 220);
            if (cancelled) return;

            if (hasChildren) {
              await step("IN_RECURSE_C1_TWO" as TravLabelKey, 220);
              if (cancelled) return;
              await inPseudo(childAt(1));
              if (cancelled) return;
            }

            await step("IN_VISIT_K1_TWO" as TravLabelKey, 220);
            if (cancelled) return;

            if (hasChildren) {
              await step("IN_RECURSE_C2_TWO" as TravLabelKey, 220);
              if (cancelled) return;
              await inPseudo(childAt(2));
              if (cancelled) return;
            }
          }
        };

        await inPseudo(root as THNode);
      };

      const runPostPseudo = async () => {
        await step("POST_INIT_RESULT" as TravLabelKey, 450);
        if (cancelled) return;

        await step("POST_CALL_HELPER" as TravLabelKey, 450);
        if (cancelled) return;

        const postPseudo = async (n: THNode | null) => {
          // if (n == null) return;
          await step("POST_IF_NULL" as TravLabelKey, 250);
          if (cancelled) return;
          if (!n) return;

          const vals = n.data.value ?? [];
          const keysCount = vals.length;
          const children = (n.children ?? []) as (THNode | null)[];

          const childAt = (idx: number): THNode | null => {
            const c = children[idx] ?? null;
            if (!c) return null;
            if ((c.data as any).isPlaceholder) return null;
            return c;
          };

          // if (!n.isLeaf()){
          const hasChildren = children.length > 0;
          await step("POST_IF_HAS_CHILDREN" as TravLabelKey, 250);
          if (cancelled) return;

          if (hasChildren) {
            await step("POST_FOR_CHILDREN" as TravLabelKey, 250);
            if (cancelled) return;

            for (let i = 0; i <= keysCount; i++) {
              await step("POST_RECURSE_CHILD" as TravLabelKey, 220);
              if (cancelled) return;
              await postPseudo(childAt(i));
              if (cancelled) return;
            }
          }

          // for (int i = 0; i < n.keys.size(); i++){ ... }
          await step("POST_FOR_KEYS" as TravLabelKey, 250);
          if (cancelled) return;
          for (let i = 0; i < keysCount; i++) {
            await step("POST_VISIT_KEY" as TravLabelKey, 220);
            if (cancelled) return;
          }
        };

        await postPseudo(root as THNode);
      };

      const runLevelPseudo = async () => {
        await step("LEVEL_INIT_RESULT" as TravLabelKey, 450);
        if (cancelled) return;

        // if (raiz == null) return out;
        await step("LEVEL_TREE_EMPTY_IF" as TravLabelKey, 350);
        if (cancelled) return;

        // Suponemos árbol no vacío si estamos aquí
        await step("LEVEL_QUEUE_INIT" as TravLabelKey, 350);
        if (cancelled) return;

        await step("LEVEL_ENQUEUE_ROOT" as TravLabelKey, 350);
        if (cancelled) return;

        const q: THNode[] = [root as THNode];

        while (q.length && !cancelled) {
          await step("LEVEL_WHILE" as TravLabelKey, 320);
          if (cancelled) return;

          const x = q.shift()!;
          await step("LEVEL_DEQUEUE" as TravLabelKey, 300);
          if (cancelled) return;

          const vals = x.data.value ?? [];
          const keysCount = vals.length;

          await step("LEVEL_FOR_KEYS" as TravLabelKey, 280);
          if (cancelled) return;
          for (let i = 0; i < keysCount; i++) {
            await step("LEVEL_VISIT_KEY" as TravLabelKey, 220);
            if (cancelled) return;
          }

          const children = (x.children ?? []).filter(
            (c) => !!c && !(c as THNode).data.isPlaceholder
          ) as THNode[];

          await step("LEVEL_IF_HAS_CHILDREN" as TravLabelKey, 260);
          if (cancelled) return;

          if (children.length) {
            await step("LEVEL_FOR_CHILDREN" as TravLabelKey, 260);
            if (cancelled) return;

            for (const child of children) {
              await step("LEVEL_ENQUEUE_CHILD" as TravLabelKey, 220);
              if (cancelled) return;
              q.push(child);
            }
          }
        }
      };

      /* ───────── Ejecutar pseudocódigo recursivo según tipo ───────── */

      if (kind === "pre") {
        await runPrePseudo();
        if (cancelled) {
          bus.emit("op:done", { op: opName });
          return;
        }
      } else if (kind === "in") {
        await runInPseudo();
        if (cancelled) {
          bus.emit("op:done", { op: opName });
          return;
        }
      } else if (kind === "post") {
        await runPostPseudo();
        if (cancelled) {
          bus.emit("op:done", { op: opName });
          return;
        }
      } else if (kind === "level") {
        await runLevelPseudo();
        if (cancelled) {
          bus.emit("op:done", { op: opName });
          return;
        }
      }

      /* ───────── Construcción de la secuencia de claves (igual que antes) ───────── */

      type TItem = TraversalNodeType;

      const pushKeys = (n: THNode, out: TItem[]) => {
        const vals = (n.data.value ?? []).slice();
        for (let i = 0; i < vals.length; i++) {
          out.push({ id: `${n.data.id}#k${i}`, value: vals[i] });
        }
      };

      const preTrav = (n: THNode, out: TItem[]) => {
        pushKeys(n, out);
        (n.children ?? []).forEach((c) => preTrav(c as THNode, out));
      };

      const postTrav = (n: THNode, out: TItem[]) => {
        (n.children ?? []).forEach((c) => postTrav(c as THNode, out));
        pushKeys(n, out);
      };

      const inTrav = (n: THNode, out: TItem[]) => {
        const kids = n.children ?? [];
        const vals = n.data.value ?? [];
        const m = vals.length;
        for (let i = 0; i < m; i++) {
          if (kids[i]) inTrav(kids[i] as THNode, out);
          out.push({ id: `${n.data.id}#k${i}`, value: vals[i] });
        }
        if (kids[m]) inTrav(kids[m] as THNode, out);
      };

      const levelTrav = (n: THNode): TItem[] => {
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
      if (kind === "pre") preTrav(root as THNode, seq);
      else if (kind === "post") postTrav(root as THNode, seq);
      else if (kind === "in") inTrav(root as THNode, seq);
      else if (kind === "level") seq = levelTrav(root as THNode);

      if (!seq.length) {
        bus.emit("op:done", { op: opName });
        return;
      }

      drawTraversalSequence(seqG, seq, { seqPositions });

      // Ajuste de tamaños de SVG
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

      /* ───────── Animación del runner sobre la banda ───────── */

      // No reseteamos el query aquí para no matar el efecto
      await animateTwoThreeTraversal(
        svg,
        treeG,
        seq,
        seqG,
        seqPositions,
        nodePositions,
        () => {},
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

      if (cancelled) {
        bus.emit("op:done", { op: opName });
        return;
      }

      // Cierre del pseudocódigo: return out;
      if (kind === "pre") {
        await step("PRE_RETURN_RESULT" as TravLabelKey, 450);
      } else if (kind === "in") {
        await step("IN_RETURN_RESULT" as TravLabelKey, 450);
      } else if (kind === "post") {
        await step("POST_RETURN_RESULT" as TravLabelKey, 450);
      } else if (kind === "level") {
        await step("LEVEL_RETURN_RESULT" as TravLabelKey, 450);
      }

      resetQueryValues();
      bus.emit("op:done", { op: opName });
    }).catch((e) => console.error("[2-3 traversal anim]", e));

    return () => {
      cancelled = true;
    };
  }, [
    svgRef,
    root,
    query.toGetPreOrder,
    query.toGetInOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
    resetQueryValues,
    setIsAnimating,
    bus,
  ]);

  /* ───────────────── Clear total ───────────────── */
  useEffect(() => {
    if (!svgRef.current || !query.toClear) return;

    // Labels del pseudocódigo de clean()
    const labels = TT_CODE.clean.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `twoThree-clean-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    runExclusive(async () => {
      const svg = d3.select(svgRef.current!);
      const treeG = svg.select<SVGGElement>("g.tree-container");
      const seqG = svg.select<SVGGElement>("g.seq-container");

      // Limpiar overlays y banda de recorridos
      nukeOverlaysAndInterrupt(svg);
      clearTraversalUI(svg, { fade: true });

      await waitLayoutReady(svg);

      // Notificar inicio de operación clean
      bus.emit("op:start", { op: "clean" });

      // ───── Pseudocódigo: public void clean() { this.raiz = null; ... } ─────
      await step("CLEAR_ROOT", 650);
      if (cancelled) {
        bus.emit("op:done", { op: "clean" });
        return;
      }

      // ───── Animación de borrado total del árbol ─────
      await animateClearTree(
        treeG,
        seqG,
        { nodePositions, seqPositions },
        resetQueryValues,
        setIsAnimating
      );

      // Limpiar overlays residuales genéricos
      svg.selectAll("g.nary-search-overlay").remove();
      svg.selectAll("g.nary-move-overlay").remove();

      if (!cancelled) {
        bus.emit("op:done", { op: "clean" });
      }
    }).catch((e) => console.error("[2-3 clear]", e));

    return () => {
      cancelled = true;
    };
  }, [query.toClear, resetQueryValues, setIsAnimating, bus, svgRef]);

  return { svgRef };
}
