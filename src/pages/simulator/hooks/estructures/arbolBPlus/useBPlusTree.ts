// src/simulators/hooks/estructures/arbolBPlus/useBPlusTree.ts
import { useRef, useState } from "react";
import { BaseQueryOperations, TraversalNodeType } from "../../../../../types";
import { ArbolBPlus } from "../../../../../shared/utils/structures/ArbolBPlus";

export type QueryBPlus = BaseQueryOperations<"arbol_bplus"> & {
  /** Triggers “amigables” para el renderer */
  range?: { from: number; to: number };
  scanFrom?: { start: number; limit: number };
  /** Señal de flanco para getInOrder (no afecta la banda) */
  inOrderTick?: number;
  levelTick?: number;
};

/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                             Debug / logging                              ║
   ╚══════════════════════════════════════════════════════════════════════════╝*/
const DEBUG_BPLUS = true;
const dlog = (...a: any[]) => {
  if (DEBUG_BPLUS) console.log("[useBPlusTree]", ...a);
};

/* Helpers */
const sanitizeSeq = (arr: TraversalNodeType[]) =>
  arr.filter((d): d is TraversalNodeType => !!d && typeof d.id === "string");

function onlySeq<K extends keyof BaseQueryOperations<"arbol_bplus">>(
  key: K,
  payload: BaseQueryOperations<"arbol_bplus">[keyof BaseQueryOperations<"arbol_bplus">]
): BaseQueryOperations<"arbol_bplus"> {
  return {
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetInOrder: undefined, // ⬅️
    toGetLevelOrder: undefined, // ⬅️
    toGetRange: [],
    toScanFrom: [],
    toClear: false,
    bPlusFix: null,
    [key]: payload as any,
  } as BaseQueryOperations<"arbol_bplus">;
}

const toTraversal = (vals: number[], prefix = "seq"): TraversalNodeType[] =>
  vals.map((v, i) => ({ id: `${prefix}-${v}-${i}`, value: v }));

const cloneOrThrow = (t: ArbolBPlus<number, number>) => {
  const c = (t as any).clonar?.();
  if (!c) {
    throw new Error(
      "ArbolBPlus.clonar() no está disponible. Agrega un método clonar()."
    );
  }
  return c as ArbolBPlus<number, number>;
};

/* Hook principal */
export function useBPlusTree(structure: ArbolBPlus<number, number>) {
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

  const [query, setQuery] = useState<QueryBPlus>({
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetInOrder: undefined, // ⬅️
    toGetLevelOrder: undefined, // ⬅️
    toGetRange: [],
    toScanFrom: [],
    toClear: false,
    bPlusFix: null,
    range: undefined,
    scanFrom: undefined,
    inOrderTick: undefined,
    levelTick: undefined,
  });

  const pendingInsertRef = useRef<number | null>(null);
  const pendingDeleteRef = useRef<number | null>(null);
  const pendingClearRef = useRef<boolean>(false);

  /* INSERT: muta primero, anima después */
  const insert = (value: number) => {
    dlog("insert(arg):", value);
    try {
      const next = cloneOrThrow(tree);
      next.insertar(value);
      setTree(next);
      setQuery((p) => ({
        ...p,
        toInsert: value,
        toDelete: null,
        toSearch: null,
        toGetInOrder: undefined, // ⬅️
        toGetLevelOrder: undefined, // ⬅️
        toGetRange: [],
        toScanFrom: [],
        toClear: false,
        range: undefined,
        scanFrom: undefined,
        inOrderTick: undefined,
        levelTick: undefined,
      }));

      setError(null);
    } catch (e: any) {
      dlog("insert(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* DELETE: diferido */
  const del = (value: number) => {
    dlog("delete(arg):", value);
    try {
      if (!tree.contiene?.(value)) {
        throw new Error("La clave no existe en el árbol.");
      }
      pendingDeleteRef.current = value;
      setQuery((p) => ({
        ...p,
        toInsert: value,
        toDelete: null,
        toSearch: null,
        toGetInOrder: undefined, // ⬅️
        toGetLevelOrder: undefined, // ⬅️
        toGetRange: [],
        toScanFrom: [],
        toClear: false,
        range: undefined,
        scanFrom: undefined,
        inOrderTick: undefined,
        levelTick: undefined,
      }));

      setError(null);
    } catch (e: any) {
      dlog("delete(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* SEARCH: solo animación */
  const search = (value: number) => {
    dlog("search(arg):", value);
    try {
      if (!tree.contiene?.(value)) {
        throw new Error("No fue posible encontrar la clave en el árbol.");
      }
      setQuery((prev) => ({
        ...prev,
        toSearch: value,
        toGetInOrder: [],
        toGetLevelOrder: [],
        toGetRange: [],
        toScanFrom: [],
        range: undefined,
        scanFrom: undefined,
        inOrderTick: undefined,
        levelTick: undefined,
      }));
      setError(null);
    } catch (e: any) {
      dlog("search(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* Recorridos */
  const getInOrder = () => {
    dlog("getInOrder()");
    try {
      const seq = tree.getInOrder();
      const now = Date.now();
      setQuery((_prev) => ({
        ...onlySeq("toGetInOrder", sanitizeSeq(seq)),
        range: undefined,
        scanFrom: undefined,
        inOrderTick: now, // ← flanco INORDER
        levelTick: undefined, // ← APAGA LEVEL
      }));
      setError(null);
    } catch (e: any) {
      dlog("getInOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getLevelOrder = () => {
    dlog("getLevelOrder()");
    try {
      const seq = tree.getLevelOrder();
      const now = Date.now();
      setQuery((_prev) => ({
        ...onlySeq("toGetLevelOrder", sanitizeSeq(seq)),
        range: undefined,
        scanFrom: undefined,
        inOrderTick: undefined, // ⬅️ apaga el otro flanco
        levelTick: now, // ⬅️ flanco NUEVO
      }));
      setError(null);
    } catch (e: any) {
      dlog("getLevelOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* Consultas secuenciales */
  const range = (from: number, to: number) => {
    dlog("range(arg):", from, to);
    try {
      const vals = tree.range(from, to);
      const seq = toTraversal(vals, "range");
      setQuery((_prev) => ({
        toGetInOrder: sanitizeSeq(seq),
        toGetLevelOrder: undefined, // ⬅️
        // Triggers
        range: { from, to },
        scanFrom: undefined,
        // apaga otros
        toGetRange: [],
        toScanFrom: [],
        toInsert: null,
        toDelete: null,
        toSearch: null,
        toClear: false,
        bPlusFix: null,
        inOrderTick: undefined,
        levelTick: undefined,
      }));

      setError(null);
    } catch (e: any) {
      dlog("range(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  const scanFrom = (start: number, limit: number) => {
    dlog("scanFrom(arg):", start, limit);
    try {
      const vals = tree.scanFrom(start, limit);
      const seq = toTraversal(vals, "scan");
      setQuery((_prev) => ({
        toGetInOrder: sanitizeSeq(seq),
        toGetLevelOrder: undefined,
        // Triggers
        toScanFrom: [start, limit],
        scanFrom: { start, limit },
        range: undefined,
        // apaga otros
        toGetRange: [],
        toInsert: null,
        toDelete: null,
        toSearch: null,
        toClear: false,
        bPlusFix: null,
        inOrderTick: undefined,
        levelTick: undefined,
      }));
      setError(null);
    } catch (e: any) {
      dlog("scanFrom(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* resetQueryValues(): limpiar triggers + aplicar mutaciones diferidas */
  const resetQueryValues = () => {
    dlog("resetQueryValues()");
    setQuery((prev) => ({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetInOrder: prev.toGetInOrder, // conserva banda
      toGetLevelOrder: prev.toGetLevelOrder, // ⬅️ conserva si existiera
      toGetRange: [],
      toScanFrom: [],
      toClear: false,
      bPlusFix: null,
      range: undefined,
      scanFrom: undefined,
      inOrderTick: prev.inOrderTick,
      levelTick: prev.levelTick,
    }));

    let nextTree: ArbolBPlus<number, number> = tree;
    let changed = false;

    if (pendingClearRef.current) {
      nextTree = new ArbolBPlus<number, number>((a, b) => a - b, 2);
      pendingClearRef.current = false;
      changed = true;
    } else {
      nextTree = cloneOrThrow(nextTree);
    }

    if (pendingDeleteRef.current != null) {
      try {
        nextTree.eliminar(pendingDeleteRef.current);
        changed = true;
      } catch (e: any) {
        dlog("delete(pending, ERROR):", e?.message);
        setError({ message: e.message, id: Date.now() });
      } finally {
        pendingDeleteRef.current = null;
      }
    }

    if (pendingInsertRef.current != null) {
      try {
        nextTree.insertar(pendingInsertRef.current);
        changed = true;
      } catch (e: any) {
        dlog("insert(pending, ERROR):", e?.message);
        setError({ message: e.message, id: Date.now() });
      } finally {
        pendingInsertRef.current = null;
      }
    }

    if (changed) setTree(nextTree);
  };

  /* CLEAR total */
  const clean = () => {
    dlog("clean()");
    pendingClearRef.current = true;
    setQuery({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetInOrder: undefined, // ⬅️
      toGetLevelOrder: undefined, // ⬅️
      toGetRange: [],
      toScanFrom: [],
      toClear: true,
      bPlusFix: null,
      range: undefined,
      scanFrom: undefined,
      inOrderTick: undefined,
      levelTick: undefined,
    });
  };

  return {
    tree,
    query,
    error,
    operations: {
      insert,
      delete: del,
      search,
      getInOrder,
      getLevelOrder,
      range,
      scanFrom,
      clean,
      resetQueryValues,
    },
  };
}
