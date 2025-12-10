import { useRef, useState } from "react";
import { BaseQueryOperations, TraversalNodeType } from "../../../../../domain/utils/types";
import {
  ArbolBPlus,
  type BPlusErrorCode,
} from "../../../../../domain/structures/ArbolBPlus";
import { DomainError } from "../../../../../domain/error/DomainError";

export type QueryBPlus = BaseQueryOperations<"arbol_bplus"> & {
  /** Triggers “amigables” para el renderer */
  range?: { from: number; to: number };
  scanFrom?: { start: number; limit: number };
  /** Señales de flanco para recorridos */
  inOrderTick?: number;
  levelTick?: number;
};

const DEBUG_BPLUS = true;
const dlog = (...a: any[]) => {
  if (DEBUG_BPLUS) console.log("[useBPlusTree]", ...a);
};

/* Helpers para secuencias */
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
    toGetInOrder: undefined,
    toGetLevelOrder: undefined,
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

/* ────────────────── Tipos de op / error para el simulador ────────────────── */

type BPlusOp =
  | "insert"
  | "delete"
  | "search"
  | "getInOrder"
  | "getLevelOrder"
  | "range"
  | "scanFrom"
  | "clean";

type BPlusErrorPlanId = BPlusErrorCode;

export type BPlusError = {
  id: number; // necesario para <Simulator>
  message: string;
  op: BPlusOp;
  planId?: BPlusErrorPlanId | null;
};

/* Hook principal */
export function useBPlusTree(structure: ArbolBPlus<number, number>) {
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<BPlusError | null>(null);

  const [query, setQuery] = useState<QueryBPlus>({
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetInOrder: undefined,
    toGetLevelOrder: undefined,
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

  /* ─────────────────────────── helper de errores ─────────────────────────── */

  const handleError = (err: unknown, op: BPlusOp) => {
    if (err instanceof DomainError) {
      dlog(op, "DomainError:", err.message, "code:", err.code);
      setError({
        id: Date.now(),
        message: err.message,
        op,
        planId: (err.code as BPlusErrorPlanId) ?? null,
      });
      return;
    }

    const msg =
      err && typeof (err as any).message === "string"
        ? (err as any).message
        : "Ocurrió un error inesperado en la operación del Árbol B+.";
    dlog(op, "GENERIC_ERROR:", msg, "| raw:", err);

    setError({
      id: Date.now(),
      message: msg,
      op,
      planId: null,
    });
  };

  /* ─────────────────────────────── operaciones ─────────────────────────────── */

  // INSERT: muta primero, anima después
  const insert = (value: number) => {
    dlog("insert(arg):", value);
    try {
      const next = cloneOrThrow(tree);
      next.insertar(value); // puede lanzar DomainError (KEY_ALREADY_EXISTS, MAX_NODES_REACHED, ...)
      setTree(next);
      setQuery((p) => ({
        ...p,
        toInsert: value,
        toDelete: null,
        toSearch: null,
        toGetInOrder: undefined,
        toGetLevelOrder: undefined,
        toGetRange: [],
        toScanFrom: [],
        toClear: false,
        range: undefined,
        scanFrom: undefined,
        inOrderTick: undefined,
        levelTick: undefined,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "insert");
    }
  };

  // DELETE: diferido (se aplica en resetQueryValues)
  const del = (value: number) => {
    dlog("delete(arg):", value);
    try {
      // Validaciones de dominio “rápidas” para mapear a TREE_EMPTY / KEY_NOT_FOUND
      if (tree.esVacio?.()) {
        throw new DomainError(
          "No fue posible eliminar: el árbol se encuentra vacío.",
          "TREE_EMPTY"
        );
      }
      if (!tree.contiene?.(value)) {
        throw new DomainError(
          "No fue posible eliminar: la clave no está en el árbol.",
          "KEY_NOT_FOUND"
        );
      }

      // guardas el valor pendiente para aplicarlo luego en resetQueryValues()
      pendingDeleteRef.current = value;

      setQuery((p) => ({
        ...p,
        toDelete: value,
        toInsert: null,
        toSearch: null,
        toGetInOrder: undefined,
        toGetLevelOrder: undefined,
        toGetRange: [],
        toScanFrom: [],
        toClear: false,
        range: undefined,
        scanFrom: undefined,
        inOrderTick: undefined,
        levelTick: undefined,
      }));

      setError(null);
    } catch (e) {
      handleError(e, "delete");
    }
  };

  // SEARCH: solo animación, pero mapea KEY_NOT_FOUND a DomainError
  const search = (value: number) => {
    dlog("search(arg):", value);
    try {
      if (!tree.contiene?.(value)) {
        throw new DomainError(
          "No fue posible encontrar la clave en el árbol.",
          "KEY_NOT_FOUND"
        );
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
    } catch (e) {
      handleError(e, "search");
    }
  };

  /* ───────────────────────────── Recorridos ───────────────────────────── */

  const getInOrder = () => {
    dlog("getInOrder()");
    try {
      if (tree.esVacio?.()) {
        throw new DomainError(
          "No fue posible recorrer en inorden (el árbol se encuentra vacío).",
          "TREE_EMPTY"
        );
      }
      const seq = tree.getInOrder();
      const now = Date.now();
      setQuery((_prev) => ({
        ...onlySeq("toGetInOrder", sanitizeSeq(seq)),
        range: undefined,
        scanFrom: undefined,
        inOrderTick: now, // flanco INORDER
        levelTick: undefined,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "getInOrder");
    }
  };

  const getLevelOrder = () => {
    dlog("getLevelOrder()");
    try {
      if (tree.esVacio?.()) {
        throw new DomainError(
          "No fue posible recorrer por niveles (el árbol se encuentra vacío).",
          "TREE_EMPTY"
        );
      }
      const seq = tree.getLevelOrder();
      const now = Date.now();
      setQuery((_prev) => ({
        ...onlySeq("toGetLevelOrder", sanitizeSeq(seq)),
        range: undefined,
        scanFrom: undefined,
        inOrderTick: undefined,
        levelTick: now, // flanco LEVEL
      }));
      setError(null);
    } catch (e) {
      handleError(e, "getLevelOrder");
    }
  };

  /* ───────────────────── Consultas secuenciales B+ ───────────────────── */

  const range = (from: number, to: number) => {
    dlog("range(arg):", from, to);
    try {
      const vals = tree.range(from, to);
      const seq = toTraversal(vals, "range");
      setQuery((_prev) => ({
        toGetInOrder: sanitizeSeq(seq),
        toGetLevelOrder: undefined,
        // triggers
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
    } catch (e) {
      handleError(e, "range");
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
        // triggers
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
    } catch (e) {
      handleError(e, "scanFrom");
    }
  };

  /* ───────────── resetQueryValues(): limpiar triggers + aplicar mutaciones diferidas ───────────── */

  const resetQueryValues = () => {
    dlog("resetQueryValues()");
    setQuery((prev) => ({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      // conservamos banda actual de inOrder/level para que sigan visibles
      toGetInOrder: prev.toGetInOrder,
      toGetLevelOrder: prev.toGetLevelOrder,
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
      // Clean duro: reiniciar estructura (mismo cmp, t=2 por defecto visual)
      nextTree = new ArbolBPlus<number, number>((a, b) => a - b, 2);
      pendingClearRef.current = false;
      changed = true;
    } else {
      nextTree = cloneOrThrow(nextTree);
    }

    if (pendingDeleteRef.current != null) {
      try {
        nextTree.eliminar(pendingDeleteRef.current); // puede lanzar DomainError
        changed = true;
      } catch (e) {
        dlog("delete(pending, ERROR):", (e as any)?.message);
        handleError(e, "delete");
      } finally {
        pendingDeleteRef.current = null;
      }
    }

    if (pendingInsertRef.current != null) {
      try {
        nextTree.insertar(pendingInsertRef.current); // por si en el futuro se usa inserción diferida
        changed = true;
      } catch (e) {
        dlog("insert(pending, ERROR):", (e as any)?.message);
        handleError(e, "insert");
      } finally {
        pendingInsertRef.current = null;
      }
    }

    if (changed) setTree(nextTree);
  };

  /* CLEAR total: se materializa en resetQueryValues() vía pendingClearRef */
  const clean = () => {
    dlog("clean()");
    pendingClearRef.current = true;
    setQuery({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetInOrder: undefined,
      toGetLevelOrder: undefined,
      toGetRange: [],
      toScanFrom: [],
      toClear: true,
      bPlusFix: null,
      range: undefined,
      scanFrom: undefined,
      inOrderTick: undefined,
      levelTick: undefined,
    });
    setError(null);
  };

  return {
    tree,
    query,
    // BPlusError | null, compatible con LooseError del <Simulator>
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
