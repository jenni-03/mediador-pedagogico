// src/shared/hooks/render/useHeapRender.ts
import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  HierarchyNodeData,
  TreeLinkData,
} from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { SVG_BINARY_TREE_VALUES } from "../../../../../shared/constants/consts";
import { hierarchy, select, type HierarchyNode } from "d3";
import { simulateHeapInsert } from "../../../../../shared/utils/heapSimulator";

import {
  drawHeapNodes,
  drawHeapLinks,
  layoutHeapGrid,
} from "../../../../../shared/utils/draw/heapTreeUtilities";

import {
  animateHeapInsert,
  animateHeapDelete,
  animateHeapSearch,
  animateHeapGetLevelOrder,
} from "../../../../../shared/utils/draw/heapDrawActions";

/* ───────── Toggle de logs ───────── */
const DEBUG_TRANSCRIPT = true;

/* ───────── Util: level-order (id,value) desde jerarquía ───────── */
function toHeapItemsLevelOrder(
  root: HierarchyNode<HierarchyNodeData<number>> | null
): { id: string; value: number }[] {
  if (!root) return [];
  const q = [root];
  const out: { id: string; value: number }[] = [];
  while (q.length) {
    const n = q.shift()!;
    if (!n.data.isPlaceholder) {
      out.push({ id: n.data.id, value: n.data.value ?? 0 });
      (n.children ?? []).forEach((c) => q.push(c));
    } else {
      (n.children ?? []).forEach((c) => q.push(c));
    }
  }
  return out;
}

/* ───────── Pretty print del transcript para debugging ───────── */
function debugPrintTranscript(
  source: "logic" | "simulator",
  transcript: any,
  context: {
    insertedId: string;
    insertedValue: number;
    prevArray: Array<{ id: string; value: number }>;
    heapArrayNow: Array<{
      id: string;
      index: number;
      value: number;
      parentId?: string;
      leftId?: string;
      rightId?: string;
    }>;
  }
) {
  if (!DEBUG_TRANSCRIPT) return;
  try {
    const { insertedId, insertedValue, prevArray, heapArrayNow } = context;
    const rowsPrev = prevArray.map((it, i) => ({
      index: i,
      id: it.id,
      value: it.value,
    }));
    const rowsInitial = (transcript?.initial ?? []).map(
      (it: any, i: number) => ({ index: i, id: it.id, value: it.value })
    );
    const rowsFinal = (transcript?.final ?? []).map((it: any, i: number) => ({
      index: i,
      id: it.id,
      value: it.value,
    }));

    console.groupCollapsed(
      `%c[HeapRender] INSERT transcript (${source})`,
      "color:#22d3ee;font-weight:600"
    );
    console.log("insertedId:", insertedId, " insertedValue:", insertedValue);
    // @ts-ignore
    console.table ? console.table(rowsPrev) : console.log(rowsPrev);

    console.log("%cTranscript.initial:", "color:#94a3b8");
    // @ts-ignore
    console.table ? console.table(rowsInitial) : console.log(rowsInitial);

    const steps = transcript?.steps ?? [];
    console.log(
      `steps (len=${steps.length}):`,
      steps.map((s: any, idx: number) => ({
        i: idx,
        type: s.type,
        dir: s.dir,
        parentId: s.parentId ?? s.array?.[s.parentIndex]?.id,
        childId: s.childId,
        aId: s.aId,
        bId: s.bId,
        childIndex: s.childIndex,
        parentIndex: s.parentIndex,
        op: s.op ?? s.relation,
        swap: s.swap,
      }))
    );

    console.log("%cTranscript.final:", "color:#94a3b8");
    // @ts-ignore
    console.table ? console.table(rowsFinal) : console.log(rowsFinal);

    console.log("%cDOM heapArray (estado final actual):", "color:#94a3b8");
    const rowsDom = heapArrayNow.map((n) => ({
      index: n.index,
      id: n.id,
      value: n.value,
      parentId: n.parentId,
      leftId: n.leftId,
      rightId: n.rightId,
    }));
    // @ts-ignore
    console.table ? console.table(rowsDom) : console.log(rowsDom);

    console.groupEnd();
  } catch (err) {
    console.warn("[HeapRender] debugPrintTranscript error:", err);
  }
}

/* ───────── Pretty print del transcript de DELETE ───────── */
function debugPrintDeleteTranscript(
  source: "logic" | "simulator" | "none",
  transcript: any,
  context: {
    targetId: string;
    replacerId?: string | null;
    updatedRootId?: string | null;
    prevArray: Array<{ id: string; value: number }>;
    heapArrayNow: Array<{
      id: string;
      index: number;
      value: number;
      parentId?: string;
      leftId?: string;
      rightId?: string;
    }>;
  }
) {
  if (!DEBUG_TRANSCRIPT) return;
  try {
    const { targetId, replacerId, updatedRootId, prevArray, heapArrayNow } =
      context;

    const rowsPrev = prevArray.map((it, i) => ({
      index: i,
      id: it.id,
      value: it.value,
    }));
    const rowsInitial = (transcript?.initial ?? []).map(
      (it: any, i: number) => ({ index: i, id: it.id, value: it.value })
    );
    const rowsFinal = (transcript?.final ?? []).map((it: any, i: number) => ({
      index: i,
      id: it.id,
      value: it.value,
    }));

    console.groupCollapsed(
      `%c[HeapRender] DELETE transcript (${source})`,
      "color:#f59e0b;font-weight:600"
    );

    console.log(
      "targetId:",
      targetId,
      "replacerId:",
      replacerId ?? null,
      "updatedRootId:",
      updatedRootId ?? null
    );

    console.log("%cPrev level-order (from prevRoot):", "color:#94a3b8");
    // @ts-ignore
    console.table ? console.table(rowsPrev) : console.log(rowsPrev);

    console.log("%cTranscript.initial:", "color:#94a3b8");
    // @ts-ignore
    console.table ? console.table(rowsInitial) : console.log(rowsInitial);

    const steps = transcript?.steps ?? [];
    const mapped = steps.map((s: any, idx: number) => {
      const base: any = { i: idx, type: s.type, dir: s.dir };
      switch (s.type) {
        case "selectTarget":
          return { ...base, targetId: s.targetId };
        case "replaceNode":
          return {
            ...base,
            targetId: s.targetId,
            withId: s.withId,
          };
        case "removeLast":
          return { ...base, removedId: s.removedId };
        case "pickChild":
          return {
            ...base,
            parentId: s.parentId ?? s.array?.[s.parentIndex]?.id,
            leftId: s.leftId,
            rightId: s.rightId,
            chosen: s.chosen,
            parentIndex: s.parentIndex,
            leftIndex: s.leftIndex,
            rightIndex: s.rightIndex,
          };
        case "compareDown":
        case "compare":
          return {
            ...base,
            parentId: s.parentId ?? s.array?.[s.parentIndex]?.id,
            childId: s.childId,
            relation: s.op ?? s.relation,
          };
        case "swapDown":
        case "swap":
          return {
            ...base,
            aId: s.aId ?? s.parentId,
            bId: s.bId ?? s.childId,
          };
        default:
          return { ...base, ...s };
      }
    });

    console.log(`steps (len=${steps.length}):`, mapped);

    console.log("%cTranscript.final:", "color:#94a3b8}");
    // @ts-ignore
    console.table ? console.table(rowsFinal) : console.log(rowsFinal);

    console.log("%cDOM heapArray (estado ACTUAL):", "color:#94a3b8");
    const rowsDom = heapArrayNow.map((n) => ({
      index: n.index,
      id: n.id,
      value: n.value,
      parentId: n.parentId,
      leftId: n.leftId,
      rightId: n.rightId,
    }));
    // @ts-ignore
    console.table ? console.table(rowsDom) : console.log(rowsDom);

    if (transcript?.kind !== "delete") {
      console.warn(
        "[HeapRender] Advertencia: transcript.kind no es 'delete':",
        transcript?.kind
      );
    }

    console.groupEnd();
  } catch (err) {
    console.warn("[HeapRender] debugPrintDeleteTranscript error:", err);
  }
}

/* ───────── Validación transcript vs DOM ───────── */
function gatherStepIds(steps: any[]): string[] {
  const out: string[] = [];
  for (const s of steps ?? []) {
    if (s.aId) out.push(s.aId);
    if (s.bId) out.push(s.bId);
    if (s.childId) out.push(s.childId);
    if (s.parentId) out.push(s.parentId);
    if (s.targetId) out.push(s.targetId);
    if (s.withId) out.push(s.withId);
    if (s.removedId) out.push(s.removedId);
  }
  return Array.from(new Set(out));
}
function transcriptAlignsWithDom(
  transcript: any,
  domIds: Set<string>
): boolean {
  if (!transcript) return false;
  const stepIds = gatherStepIds(transcript.steps || []);
  if (stepIds.length && stepIds.some((id) => !domIds.has(id))) return false;
  const initialIds: string[] = (transcript.initial || []).map((x: any) => x.id);
  if (initialIds.length && initialIds.some((id) => !domIds.has(id))) {
    // initial puede no calzar y aún así los steps sí; no invalidamos.
  }
  return true;
}

/* ───────── Hook principal ───────── */
export function useHeapRender(
  heapData: HierarchyNodeData<number> | null,
  query: BaseQueryOperations<"arbol_heap"> & {
    levelOrderReqId?: number | null;
    heapTranscript?: any;
  },
  resetQueryValues: () => void
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodePositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;
  const treeOffset = useRef({ x: 0, y: 0 }).current;

  const root = useMemo(
    () => (heapData ? hierarchy(heapData) : null),
    [heapData]
  );
  const prevRoot = usePrevious(root);
  const { setIsAnimating } = useAnimation();

  /* ───────── Proyección a arreglo level-order (sin placeholders) ───────── */
  const heapArray = useMemo(() => {
    if (!root)
      return [] as Array<{
        id: string;
        index: number;
        value: number;
        parentId?: string;
        leftId?: string;
        rightId?: string;
      }>;
    const q = [root];
    const out: Array<{
      id: string;
      index: number;
      value: number;
      parentId?: string;
      leftId?: string;
      rightId?: string;
    }> = [];
    let idx = 0;

    while (q.length) {
      const n = q.shift()!;
      if (!n.data.isPlaceholder) {
        const left = n.children?.[0];
        const right = n.children?.[1];
        const leftReal = left && !left.data.isPlaceholder ? left : null;
        const rightReal = right && !right.data.isPlaceholder ? right : null;

        out.push({
          id: n.data.id,
          index: idx,
          value: n.data.value ?? 0,
          parentId:
            n.parent && !n.parent.data.isPlaceholder
              ? n.parent.data.id
              : undefined,
          leftId: leftReal ? leftReal.data.id : undefined,
          rightId: rightReal ? rightReal.data.id : undefined,
        });

        if (left) q.push(left);
        if (right) q.push(right);
      } else {
        (n.children ?? []).forEach((c) => q.push(c));
      }
      idx++;
    }
    return out;
  }, [root]);

  const linksData: TreeLinkData[] = useMemo(() => {
    const links: TreeLinkData[] = [];
    for (const n of heapArray) {
      if (n.leftId) links.push({ sourceId: n.id, targetId: n.leftId });
      if (n.rightId) links.push({ sourceId: n.id, targetId: n.rightId });
    }
    return links;
  }, [heapArray]);

  /* ───────── Render base ───────── */
  useEffect(() => {
    if (!svgRef.current || !heapArray.length) return;

    const margin = {
      left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT,
      right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
      top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
      bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM,
    };
    const nodeSpacing = SVG_BINARY_TREE_VALUES.NODE_SPACING;
    const levelSpacing = SVG_BINARY_TREE_VALUES.LEVEL_SPACING;
    const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;

    const { width, height, positions } = layoutHeapGrid(heapArray as any, {
      margin,
      nodeSpacing,
      levelSpacing,
      radius: r,
    });

    nodePositions.clear();
    positions.forEach((p: any, id: string) => nodePositions.set(id, p));

    // padding para overlays (más espacio abajo, menos arriba)
    const EXTRA = { left: 24, right: 24, top: 12, bottom: 96 };

    const W = width + EXTRA.left + EXTRA.right;
    const H = height + EXTRA.top + EXTRA.bottom;

    const svg = select(svgRef.current)
      .attr("width", W)
      .attr("height", H)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .style("overflow", "visible");

    // offset del árbol (lo dejamos pegado arriba)
    treeOffset.x = EXTRA.left;
    treeOffset.y = EXTRA.top;

    let treeG = svg.select<SVGGElement>("g.heap-container");
    if (treeG.empty()) {
      treeG = svg.append("g").classed("heap-container", true);
    }
    treeG.attr("transform", `translate(${treeOffset.x}, ${treeOffset.y})`);

    drawHeapNodes(treeG as any, heapArray as any, nodePositions);
    drawHeapLinks(treeG as any, linksData, nodePositions);
  }, [heapArray, linksData, nodePositions]);

  /* ───────── Inserción ───────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const insertedId = (query as any).insertedId as string | null;
    if (!insertedId || !heapArray.length) return;

    const svg = select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.heap-container");

    (async () => {
      setIsAnimating(true);

      const insertedNode = heapArray.find((n) => n.id === insertedId);
      const insertedValue = insertedNode?.value;
      if (insertedValue == null) {
        resetQueryValues();
        setIsAnimating(false);
        return;
      }

      const prevArray = toHeapItemsLevelOrder(prevRoot ?? null);
      const domIds = new Set(heapArray.map((n) => n.id));

      const transcriptFromLogic =
        (query as any).heapTranscript?.kind === "insert"
          ? (query as any).heapTranscript
          : null;

      let transcript: any;
      if (
        transcriptFromLogic &&
        transcriptAlignsWithDom(transcriptFromLogic, domIds)
      ) {
        transcript = transcriptFromLogic;
        debugPrintTranscript("logic", transcript, {
          insertedId,
          insertedValue,
          prevArray,
          heapArrayNow: heapArray,
        });
      } else {
        const isMax = transcriptFromLogic?.maxHeap ?? true;
        transcript = simulateHeapInsert(prevArray, insertedValue, {
          maxHeap: isMax,
          idFactory: () => insertedId,
        });
        debugPrintTranscript("simulator", transcript, {
          insertedId,
          insertedValue,
          prevArray,
          heapArrayNow: heapArray,
        });
      }

      await animateHeapInsert(
        treeG,
        { transcript, linksData },
        nodePositions,
        resetQueryValues,
        setIsAnimating
      );
    })();
  }, [
    svgRef,
    heapArray,
    linksData,
    nodePositions,
    query,
    prevRoot,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ───────── Level-Order: SOLO cuando lo pida (nonce levelOrderReqId) ───────── */
  const lastHandledReqId = useRef<number | null>(null);
  const loRunningRef = useRef(false);

  // refs “vivas” para no re-disparar el efecto por cambios de dependencias
  const svgRefLive = useRef<SVGSVGElement | null>(null);
  const linksRef = useRef<TreeLinkData[]>([]);
  const resetRef = useRef(resetQueryValues);
  const animRef = useRef(setIsAnimating);
  const queryRef = useRef(query);

  useEffect(() => {
    svgRefLive.current = svgRef.current;
  });
  useEffect(() => {
    linksRef.current = linksData;
  });
  useEffect(() => {
    resetRef.current = resetQueryValues;
  });
  useEffect(() => {
    animRef.current = setIsAnimating;
  });
  useEffect(() => {
    queryRef.current = query;
  });

  useEffect(() => {
    const reqId = (query as any).levelOrderReqId as number | null | undefined;

    // aborts silenciosos
    if (typeof reqId !== "number") return;
    if (loRunningRef.current) return;

    const svgEl = svgRefLive.current;
    if (!svgEl) {
      try {
        resetRef.current();
      } catch {}
      return;
    }

    // preferimos el transcript de la lógica
    const t = (queryRef.current as any).heapTranscript;
    const isLOT = t && t.kind === "levelOrder";
    const orderIds: string[] | undefined = isLOT
      ? (t.order as Array<{ id: string }>).map((x) => x.id)
      : Array.isArray((queryRef.current as any).toGetLevelOrder)
        ? (
            (queryRef.current as any).toGetLevelOrder as Array<{ id: string }>
          ).map((x) => x.id)
        : undefined;

    const svg = select(svgEl);
    const treeG = svg.select<SVGGElement>("g.heap-container");
    if (treeG.empty()) {
      try {
        resetRef.current();
      } catch {}
      return;
    }

    const hasNodes = !treeG.select<SVGGElement>("g.heap-node").empty();
    const hasLinks = (linksRef.current?.length ?? 0) > 0;
    const willInfer = !orderIds || orderIds.length === 0;
    if (!hasNodes || (willInfer && !hasLinks)) {
      try {
        resetRef.current();
      } catch {}
      return;
    }

    loRunningRef.current = true;
    lastHandledReqId.current = reqId;

    (async () => {
      try {
        await animateHeapGetLevelOrder(
          treeG,
          {
            linksData: linksRef.current,
            orderIds,
            band: { gapY: 36, cellW: 46, cellH: 28, r: 8 },
          },
          resetRef.current,
          animRef.current
        );
      } catch (err) {
        try {
          resetRef.current();
        } catch {}
        try {
          animRef.current(false);
        } catch {}
      } finally {
        loRunningRef.current = false;
        lastHandledReqId.current = null; // permitir re-disparar
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(query as any).levelOrderReqId]);

  /* ───────── Eliminación (root o arbitrario) ───────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const deletedId = (query as any).deletedId as string | null;
    const doDeleteRoot = !!(query as any).toDeleteRoot;
    if (!(doDeleteRoot || deletedId) || !heapArray.length) return;

    const svg = select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.heap-container");

    const targetId =
      deletedId ?? inferDeletedIdFromPrev(prevRoot ?? null, root);
    if (!targetId) return;

    const transcriptFromLogic = (
      (query as any).heapTranscript?.kind === "delete"
        ? (query as any).heapTranscript
        : null
    ) as any | null;

    const updatedRootId =
      transcriptFromLogic?.updatedRootId ??
      targetId ??
      heapArray[0]?.id ??
      null;

    const margin = {
      left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT,
      right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
      top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
      bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM,
    };
    const nodeSpacing = SVG_BINARY_TREE_VALUES.NODE_SPACING;
    const levelSpacing = SVG_BINARY_TREE_VALUES.LEVEL_SPACING;
    const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;

    const prevArr = (() => {
      if (!prevRoot) return [] as any[];
      const q = [prevRoot];
      const out: any[] = [];
      let idx = 0;
      while (q.length) {
        const n = q.shift()!;
        if (!n.data.isPlaceholder) {
          const left = n.children?.[0];
          const right = n.children?.[1];
          const leftReal = left && !left.data.isPlaceholder ? left : null;
          const rightReal = right && !right.data.isPlaceholder ? right : null;
          out.push({
            id: n.data.id,
            index: idx,
            value: n.data.value ?? 0,
            leftId: leftReal ? leftReal.data.id : undefined,
            rightId: rightReal ? rightReal.data.id : undefined,
          });
          if (left) q.push(left);
          if (right) q.push(right);
        } else {
          (n.children ?? []).forEach((c) => q.push(c));
        }
        idx++;
      }
      return out;
    })();

    const { positions: prevPos } = layoutHeapGrid(prevArr as any, {
      margin,
      nodeSpacing,
      levelSpacing,
      radius: r,
    });
    const prevXY = new Map<string, { x: number; y: number }>();
    prevPos.forEach((p: any, id: string) => prevXY.set(id, p));

    const prevLinksData: TreeLinkData[] = [];
    for (const n of prevArr) {
      if (n.leftId) prevLinksData.push({ sourceId: n.id, targetId: n.leftId });
      if (n.rightId)
        prevLinksData.push({ sourceId: n.id, targetId: n.rightId });
    }

    const replaceStep = transcriptFromLogic?.steps?.find(
      (s: any) => s.type === "replaceNode"
    );
    const replacerId: string | undefined = replaceStep?.withId;

    const prevArraySimple = toHeapItemsLevelOrder(prevRoot ?? null);
    debugPrintDeleteTranscript(
      transcriptFromLogic ? "logic" : "none",
      transcriptFromLogic ?? null,
      {
        targetId,
        replacerId: replacerId ?? null,
        updatedRootId,
        prevArray: prevArraySimple,
        heapArrayNow: heapArray,
      }
    );

    (async () => {
      setIsAnimating(true);

      await animateHeapDelete(
        treeG,
        {
          deletedId: targetId,
          updatedRootId,
          linksData,
          heapFix: (query as any).heapFix ?? null,
          transcript: transcriptFromLogic ?? null,
          preview: replacerId
            ? {
                fromId: replacerId,
                toId: targetId,
                fromXY: prevXY.get(replacerId),
                toXY: prevXY.get(targetId),
                fromValue: transcriptFromLogic?.initial?.find?.(
                  (x: any) => x.id === replacerId
                )?.value,
              }
            : undefined,
          initialPositionsById: prevPos,
          initialLinksData: prevLinksData,
        } as any,
        nodePositions,
        resetQueryValues,
        setIsAnimating
      );
    })();
  }, [
    svgRef,
    heapArray,
    linksData,
    nodePositions,
    query,
    prevRoot,
    root,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ───────── Búsqueda ───────── */
  useEffect(() => {
    if (!svgRef.current) return;
    if ((query as any).toSearch == null) return;

    const matches = heapArray
      .filter((n) => n.value === (query as any).toSearch)
      .map((n) => n.id);
    if (matches.length === 0) return;

    const svg = select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.heap-container");

    (async () => {
      setIsAnimating(true);
      await animateHeapSearch(treeG, matches, resetQueryValues, setIsAnimating);
    })();
  }, [
    svgRef,
    heapArray,
    (query as any).toSearch,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ───────── Limpiar ───────── */
  useEffect(() => {
    if (!svgRef.current || !(query as any).toClear) return;

    const svg = select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.heap-container");

    (async () => {
      setIsAnimating(true);
      await treeG
        .selectAll("g.heap-link")
        .transition()
        .duration(600)
        .style("opacity", 0)
        .end();
      await treeG
        .selectAll("g.heap-node")
        .transition()
        .duration(600)
        .style("opacity", 0)
        .end();
      treeG.selectAll("*").remove();
      nodePositions.clear();
      resetQueryValues();
      setIsAnimating(false);
    })();
  }, [
    svgRef,
    (query as any).toClear,
    nodePositions,
    resetQueryValues,
    setIsAnimating,
  ]);

  return { svgRef };
}

/* ───────── Helper: inferir id eliminado cuando solo sabemos que fue el root ───────── */
function inferDeletedIdFromPrev(
  prevRoot: HierarchyNode<HierarchyNodeData<number>> | null,
  currRoot: HierarchyNode<HierarchyNodeData<number>> | null
): string | null {
  if (!prevRoot) return null;

  const prevIds = new Set(
    prevRoot
      .descendants()
      .filter((d) => !d.data.isPlaceholder)
      .map((d) => d.data.id)
  );
  const currIds = new Set(
    (currRoot ? currRoot.descendants() : [])
      .filter((d) => !d.data.isPlaceholder)
      .map((d) => d.data.id)
  );
  for (const id of prevIds) {
    if (!currIds.has(id)) return id;
  }
  return null;
}
