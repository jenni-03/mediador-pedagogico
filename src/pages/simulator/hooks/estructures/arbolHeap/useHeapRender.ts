import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  HierarchyNodeData,
  TreeLinkData,
} from "../../../../../domain/utils/types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { SVG_BINARY_TREE_VALUES } from "../../../../../domain/constants/consts";
import { hierarchy, select, type HierarchyNode } from "d3";
import { simulateHeapInsert } from "../../../../../domain/utils/heapSimulator";
import { useBus } from "../../../../../shared/hooks/useBus";
import { delay } from "../../../../../domain/utils/simulatorUtils";
import { getArbolHeapCode } from "../../../../../domain/constants/pseudocode/arbolHeapCode";

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

const HEAP_CODE = getArbolHeapCode();

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
  const lastInsertedRef = useRef<string | null>(null);

  const root = useMemo(
    () => (heapData ? hierarchy(heapData) : null),
    [heapData]
  );
  const prevRoot = usePrevious(root);
  const { setIsAnimating } = useAnimation();
  const bus = useBus();

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

    // Siempre mantenemos nodePositions al día (el animador los necesita)
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

    // 🔒 Congelar DOM mientras haya INSERT o DELETE en curso
    const insertedId = (query as any).insertedId as string | null;
    const hasDelete =
      (query as any).deletedId != null || !!(query as any).toDeleteRoot;

    if (insertedId || hasDelete) {
      // No redibujamos el heap con heapArray (que ya es el estado NUEVO).
      // El DOM se queda en el estado anterior; los efectos de insert/delete
      // se encargan de pintar el estado final en el momento correcto.
      return;
    }

    // Render normal cuando no hay operaciones animadas en curso
    drawHeapNodes(treeG as any, heapArray as any, nodePositions);
    drawHeapLinks(treeG as any, linksData, nodePositions);
  }, [heapArray, linksData, nodePositions, query]);

  /* ───────── Inserción ───────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const insertedId = (query as any).insertedId as string | null;
    if (!insertedId || !heapArray.length) return;

    // Deduplicador: evita re-animar el mismo insert
    if (lastInsertedRef.current === insertedId) return;
    lastInsertedRef.current = insertedId;

    const svg = select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.heap-container");
    if (treeG.empty()) return;

    (async () => {
      setIsAnimating(true);

      const insertedNode = heapArray.find((n) => n.id === insertedId);
      const insertedValue = insertedNode?.value;
      if (insertedValue == null) {
        resetQueryValues();
        setIsAnimating(false);
        return;
      }

      // Estado previo (antes del insert) desde prevRoot
      const prevArray = toHeapItemsLevelOrder(prevRoot ?? null);
      const domIds = new Set(heapArray.map((n) => n.id));

      // Preferimos transcript REAL del dominio si calza con el DOM
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

      // ───────── Pseudocódigo HEAP.insert(...) ─────────
      const insertCode = HEAP_CODE.insert;
      const labels = insertCode.labels!;
      type LabelKey = keyof typeof labels;

      const stepId = `heap-insert-${Date.now()}`;
      const step = async (labelName: LabelKey, ms = 600) => {
        const lineIndex = labels[labelName];
        if (typeof lineIndex !== "number") return;
        bus.emit("step:progress", { stepId, lineIndex });
        await delay(ms);
      };

      bus.emit("op:start", { op: "insert" });

      try {
        // (header + precondición)
        await step("HEAP_INSERT_HEADER", 450);
        await step("HEAP_INSERT_MAX_CAP_COMMENT", 300);
        await step("HEAP_INSERT_MAX_CAP_IF", 300);

        // (1) Append
        await step("HEAP_INSERT_NEW_NODE", 350);
        await step("HEAP_INSERT_APPEND_ARRAY", 350);

        // (2) Heapify-up: usamos TODOS los pasos del transcript
        const tSteps: any[] = Array.isArray(transcript?.steps)
          ? transcript.steps
          : [];

        if (!tSteps.length) {
          // Fallback mínimo: una iteración genérica
          await step("HEAP_INSERT_HEAPIFY_WHILE", 380);
          await step("HEAP_INSERT_HEAPIFY_SWAP", 380);
        } else {
          for (const s of tSteps) {
            // siempre marcamos evaluación del while
            await step("HEAP_INSERT_HEAPIFY_WHILE", 260);

            const typeStr = (s.type ?? "").toString().toLowerCase();
            const hasSwapFlag = s.swap === true;
            const hasSwapName = typeStr.includes("swap");

            if (hasSwapFlag || hasSwapName) {
              await step("HEAP_INSERT_HEAPIFY_SWAP", 260);
            }
          }
        }

        // ⛔️ HASTA AQUÍ solo se ha mostrado pseudocódigo.
        // AHORA recién pintamos el heap FINAL en el DOM.
        drawHeapNodes(treeG as any, heapArray as any, nodePositions);
        drawHeapLinks(treeG as any, linksData, nodePositions);

        // Y luego lanzamos la animación explicativa de heapify
        await animateHeapInsert(
          treeG,
          { transcript, linksData },
          nodePositions,
          resetQueryValues,
          setIsAnimating
        );
      } catch (err) {
        console.warn("[HeapRender] insert error:", err);
        resetQueryValues();
        setIsAnimating(false);
      } finally {
        bus.emit("op:done", { op: "insert" });
      }
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
    bus,
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

    // OJO: para level-order sí queremos poder mostrar pseudocódigo aunque no haya DOM,
    // pero si no hay SVG y el heap NO está vacío, abortamos.
    const svg = svgEl ? select(svgEl) : null;
    const treeG = svg ? svg.select<SVGGElement>("g.heap-container") : null;

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

    const hasContainer = !!treeG && !treeG.empty();
    const hasNodes =
      hasContainer && !treeG!.select<SVGGElement>("g.heap-node").empty();
    const hasLinks = hasContainer && (linksRef.current?.length ?? 0) > 0;
    const willInfer = !orderIds || orderIds.length === 0;

    loRunningRef.current = true;
    lastHandledReqId.current = reqId;

    (async () => {
      try {
        animRef.current(true);

        // ───── Config de pseudocódigo (puede NO existir) ─────
        const levelCode: any =
          (HEAP_CODE as any).levelOrder ?? (HEAP_CODE as any).getLevelOrder; // fallback por si acaso
        const labels = (levelCode?.labels ?? null) as Record<
          string,
          number
        > | null;

        const stepId = `heap-levelorder-${Date.now()}`;
        const step = async (labelName: string, ms = 600) => {
          if (!labels) return;
          const lineIndex = labels[labelName];
          if (typeof lineIndex !== "number") return;
          bus.emit("step:progress", { stepId, lineIndex });
          await delay(ms);
        };

        bus.emit("op:start", { op: "levelOrder" });

        // ───────── Caso 1: NO hay DOM con árbol para animar ─────────
        if (!hasContainer) {
          await step("HEAP_LEVEL_HEADER", 450);
          await step("HEAP_LEVEL_EMPTY_IF", 900);

          resetRef.current();
          animRef.current(false);
          return;
        }

        // ───────── Caso 2: heap vacío o sin información suficiente para animar ─────────
        if (!hasNodes || (!hasLinks && willInfer)) {
          await step("HEAP_LEVEL_HEADER", 450);
          await step("HEAP_LEVEL_EMPTY_IF", 900);

          resetRef.current();
          animRef.current(false);
          return;
        }

        // ───────── Caso 3: heap NO vacío ─────────
        await step("HEAP_LEVEL_HEADER", 450);
        await step("HEAP_LEVEL_EMPTY_IF", 320); // condición falsa aquí

        // Simulamos el for (i = 0; i < array.size(); i++)
        const count = orderIds ? orderIds.length : linksRef.current.length + 1;
        for (let i = 0; i < count; i++) {
          await step("HEAP_LEVEL_FOR_LOOP", 260);
        }

        // return out;
        await step("HEAP_LEVEL_RETURN", 380);

        // ───────── Fin pseudocódigo: ahora sí animamos el recorrido ─────────
        await animateHeapGetLevelOrder(
          treeG!,
          {
            linksData: linksRef.current,
            orderIds,
            band: { gapY: 36, cellW: 46, cellH: 28, r: 8 },
          },
          resetRef.current,
          animRef.current
        );
      } catch (err) {
        console.warn("[HeapRender] levelOrder error:", err);
        try {
          resetRef.current();
        } catch {}
        try {
          animRef.current(false);
        } catch {}
      } finally {
        loRunningRef.current = false;
        lastHandledReqId.current = null; // permitir re-disparar
        bus.emit("op:done", { op: "levelOrder" });
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
    if (treeG.empty()) return;

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

    // Estado PREVIO al delete (desde prevRoot)
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

    const nPrev = prevArr.length;
    const isTrivialDelete = nPrev === 1;

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

      // ───────── Pseudocódigo HEAP.delete(...) ─────────
      const deleteCode = HEAP_CODE.delete;
      const labels = deleteCode.labels!;
      type LabelKey = keyof typeof labels;

      const stepId = `heap-delete-${Date.now()}`;
      const step = async (labelName: LabelKey, ms = 600) => {
        const lineIndex = labels[labelName];
        if (typeof lineIndex !== "number") return;
        bus.emit("step:progress", { stepId, lineIndex });
        await delay(ms);
      };

      bus.emit("op:start", { op: "delete" });

      try {
        // (1) Header + precondición HEAP_EMPTY (falsa aquí)
        await step("HEAP_DELETE_HEADER", 450);
        await step("HEAP_DELETE_EMPTY_COMMENT", 320);
        await step("HEAP_DELETE_EMPTY_IF", 320);

        // (2) Búsqueda de índice + TARGET_NOT_FOUND (falsa aquí)
        await step("HEAP_DELETE_INDEXOF", 380);
        await step("HEAP_DELETE_NOT_FOUND_COMMENT", 320);
        await step("HEAP_DELETE_NOT_FOUND_IF", 320);

        // (3) n / lastIdx (sin labels; se omiten visualmente)

        // (4) Caso trivial n == 1
        if (isTrivialDelete) {
          await step("HEAP_DELETE_TRIVIAL_IF", 380);
          await step("HEAP_DELETE_CLEAR_ARRAY", 380);
        } else {
          // if (n == 1) { ... } condición falsa
          await step("HEAP_DELETE_TRIVIAL_IF", 260);

          // (5) Mover último nodo al hueco
          await step("HEAP_DELETE_MOVE_LAST_SET", 380);
          await step("HEAP_DELETE_MOVE_LAST_REMOVE", 380);

          // (6) Decidir dirección (up/down) según transcript
          const tSteps: any[] = Array.isArray(transcriptFromLogic?.steps)
            ? transcriptFromLogic!.steps
            : [];

          let dir: "up" | "down" | null = null;
          for (const s of tSteps) {
            const typeStr = (s.type ?? "").toString().toLowerCase();
            const sDir = (s.dir ?? "").toString().toLowerCase();
            if (sDir === "up" || typeStr.includes("up")) {
              dir = "up";
              break;
            }
            if (sDir === "down" || typeStr.includes("down")) {
              dir = "down";
              break;
            }
          }

          await step("HEAP_DELETE_DECIDE_DIR_IF", 360);

          // Steps relevantes de heapify (comparaciones / swaps / pickChild)
          const relevantSteps = tSteps.filter((s: any) => {
            const typeStr = (s.type ?? "").toString().toLowerCase();
            return (
              typeStr.includes("compare") ||
              typeStr.includes("swap") ||
              typeStr.includes("pickchild") ||
              s.swap === true
            );
          });

          if (!relevantSteps.length) {
            // Sin transcript “rico”: al menos un toque básico
            if (dir === "up") {
              await step("HEAP_DELETE_HEAPIFY_UP", 380);
            } else {
              await step("HEAP_DELETE_HEAPIFY_DOWN", 380);
            }
          } else {
            // Repetimos la línea de heapify según la dirección
            for (const _ of relevantSteps) {
              if (dir === "up") {
                await step("HEAP_DELETE_HEAPIFY_UP", 260);
              } else {
                await step("HEAP_DELETE_HEAPIFY_DOWN", 260);
              }
            }
          }
        }

        // ───────── Fin pseudocódigo: ahora sí animamos el delete ─────────
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
      } catch (err) {
        console.warn("[HeapRender] delete error:", err);
        resetQueryValues();
        setIsAnimating(false);
      } finally {
        bus.emit("op:done", { op: "delete" });
      }
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
    bus,
  ]);

  /* ───────── Búsqueda ───────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const valueToSearch = (query as any).toSearch as number | null | undefined;
    if (valueToSearch == null) return;

    const svg = select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.heap-container");
    if (treeG.empty()) {
      // No hay DOM para animar, limpiamos estado de la operación
      resetQueryValues();
      return;
    }

    // Nodos que coinciden (para la animación final)
    const matches = heapArray
      .filter((n) => n.value === valueToSearch)
      .map((n) => n.id);

    (async () => {
      setIsAnimating(true);

      const searchCode = HEAP_CODE.search;
      const labels = searchCode.labels!;
      type LabelKey = keyof typeof labels;

      const stepId = `heap-search-${Date.now()}`;
      const step = async (labelName: LabelKey, ms = 600) => {
        const lineIndex = labels[labelName];
        if (typeof lineIndex !== "number") return;
        bus.emit("step:progress", { stepId, lineIndex });
        await delay(ms);
      };

      bus.emit("op:start", { op: "search" });

      try {
        // ───────── Caso 1: heap vacío ─────────
        if (heapArray.length === 0) {
          await step("HEAP_SEARCH_HEADER", 450);
          await step("HEAP_SEARCH_EMPTY_IF", 900);

          resetQueryValues();
          setIsAnimating(false);
          return;
        }

        // ───────── Caso 2: heap NO vacío ─────────
        await step("HEAP_SEARCH_HEADER", 450);
        await step("HEAP_SEARCH_EMPTY_IF", 320); // condición falsa aquí

        // Simulamos el for (level-order sobre heapArray)
        let found = false;
        for (const node of heapArray) {
          await step("HEAP_SEARCH_FOR_LOOP", 260); // línea del for
          await step("HEAP_SEARCH_FOUND_IF", 260); // línea del if

          if (node.value === valueToSearch) {
            found = true;
            break; // simulamos el break del pseudocódigo
          }
        }

        // No encontrado: TARGET_NOT_FOUND
        if (!found) {
          await step("HEAP_SEARCH_NOT_FOUND_IF", 600);
          resetQueryValues();
          setIsAnimating(false);
          return;
        }

        // ───────── Fin pseudocódigo: ahora sí animamos la búsqueda ─────────
        // En tu caso animateHeapSearch solo necesita los ids encontrados.
        await animateHeapSearch(
          treeG,
          matches,
          resetQueryValues,
          setIsAnimating
        );
      } catch (err) {
        console.warn("[HeapRender] search error:", err);
        resetQueryValues();
        setIsAnimating(false);
      } finally {
        bus.emit("op:done", { op: "search" });
      }
    })();
  }, [
    svgRef,
    heapArray,
    (query as any).toSearch,
    resetQueryValues,
    setIsAnimating,
    bus,
  ]);

  /* ───────── Limpiar ───────── */
  useEffect(() => {
    const toClear = (query as any).toClear;
    if (!svgRef.current || !toClear) return;

    const svg = select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.heap-container");

    (async () => {
      setIsAnimating(true);

      // ───── Config de pseudocódigo (puede NO existir) ─────
      const cleanCode: any = (HEAP_CODE as any).clear; // 👈 AHORA .clear
      const labels = (cleanCode?.labels ?? null) as Record<
        string,
        number
      > | null;

      const stepId = `heap-clean-${Date.now()}`;
      const step = async (labelName: string, ms = 600) => {
        if (!labels) return; // si no hay config, solo no marcamos
        const lineIndex = labels[labelName];
        if (typeof lineIndex !== "number") return;
        bus.emit("step:progress", { stepId, lineIndex });
        await delay(ms);
      };

      // IMPORTANTE: usar SIEMPRE el mismo op que la clave del pseudocódigo
      bus.emit("op:start", { op: "clear" }); // 👈 "clear"

      try {
        // Marcamos la línea donde realmente se limpia el heap
        await step("CLEAR_ROOT", 600);

        // Animación de fade-out
        if (!treeG.empty()) {
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
        }

        nodePositions.clear();
        resetQueryValues();
      } catch (err) {
        console.warn("[HeapRender] clean error:", err);
        resetQueryValues();
      } finally {
        setIsAnimating(false);
        bus.emit("op:done", { op: "clear" }); // 👈 mismo op que en start
      }
    })();
  }, [
    svgRef,
    (query as any).toClear,
    nodePositions,
    resetQueryValues,
    setIsAnimating,
    bus,
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
