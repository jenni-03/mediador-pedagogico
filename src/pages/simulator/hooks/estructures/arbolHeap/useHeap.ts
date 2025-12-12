import { useCallback, useMemo, useState } from "react";
import {
  BaseQueryOperations,
  TraversalNodeType,
  Comparator,
} from "../../../../../domain/utils/types";
import {
  ArbolHeap,
  type InsertTranscript,
  type DeleteTranscript,
  type LevelOrderTranscript,
  type HeapErrorCode,
} from "../../../../../domain/structures/ArbolHeap";
import { DomainError } from "../../../../../domain/error/DomainError";

export type UseHeapOptions = {
  min?: boolean;
  compare?: Comparator<number>;
  maxNodos?: number;
};

/* ─────────────────────────── Tipos auxiliares ─────────────────────────── */

type HeapTranscript =
  | InsertTranscript
  | DeleteTranscript
  | LevelOrderTranscript
  | null;

type HeapOp = "insert" | "delete" | "search" | "getLevelOrder" | "clean";

export type HeapError = {
  id: number;
  message: string;
  op: HeapOp;
  /** Código de dominio para mapear a errorPlans en pseudocódigo/renderer. */
  planId?: HeapErrorCode | null;
};

/* ─────────────────────────── Hook principal ─────────────────────────── */

export function useHeap(
  structure: ArbolHeap<number>,
  _opts: UseHeapOptions = {}
) {
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<HeapError | null>(null);

  const [query, setQuery] = useState<
    BaseQueryOperations<"arbol_heap"> & {
      heapTranscript: HeapTranscript;
      /** nonce/trigger para animaciones de Level-Order */
      levelOrderReqId?: number | null;
    }
  >({
    toInsert: null,
    insertedId: null,

    toDelete: null,
    deletedId: null,
    deletedValue: null,
    deletedIsRoot: false,
    updatedRootId: null,

    toSearch: null,
    searchResultIds: null,

    toGetLevelOrder: [],
    toClear: false,

    heapFix: null,
    heapTranscript: null,
    levelOrderReqId: null,
  });

  /* ─────────────────────────── helpers ─────────────────────────── */

  const handleError = useCallback((err: unknown, op: HeapOp) => {
    if (err instanceof DomainError) {
      setError({
        id: Date.now(),
        message: err.message,
        op,
        planId: (err.code as HeapErrorCode) ?? null,
      });
      return;
    }

    const msg =
      err && typeof (err as any).message === "string"
        ? (err as any).message
        : "Ocurrió un error inesperado en la operación sobre el heap.";

    setError({
      id: Date.now(),
      message: msg,
      op,
      planId: null,
    });
  }, []);

  const cloneHeap = useCallback((): ArbolHeap<number> => {
    return tree.clonePreservingIds();
  }, [tree]);

  const mapLevelOrder = useCallback(
    (h: ArbolHeap<number>): TraversalNodeType[] => {
      const nodes = h.getNodosPorNiveles();
      return nodes.map((n) => ({
        id: n.getId(),
        value: Number(n.priority as any),
      }));
    },
    []
  );

  /* ─────────────────────────── operaciones ─────────────────────────── */

  /** INSERT: clona, inserta con transcript y actualiza query + heapFix. */
  const insert = useCallback(
    (value: number) => {
      try {
        const cloned = cloneHeap();
        const { node, heapFix, transcript } = cloned.insertarConLog(value);

        setTree(cloned);
        setQuery((prev) => ({
          ...prev,
          // operación actual
          toInsert: value,
          insertedId: node.getId(),

          // limpiar otras operaciones
          toDelete: null,
          deletedId: null,
          deletedValue: null,
          deletedIsRoot: false,
          updatedRootId: null,

          toSearch: null,
          searchResultIds: null,

          // level-order “instantáneo” para vista general
          toGetLevelOrder: mapLevelOrder(cloned),
          toClear: false,

          heapFix,
          heapTranscript: transcript, // transcript de INSERT
          levelOrderReqId: null, // apaga trigger LO previo
        }));
        setError(null);
      } catch (e: unknown) {
        handleError(e, "insert");
      }
    },
    [cloneHeap, mapLevelOrder, handleError]
  );

  /** DELETE: elimina por valor o id, usando DomainError de la clase lógica. */
  const del = useCallback(
    (target: number | { id: string }) => {
      try {
        const cloned = cloneHeap();
        const { deleted, updatedRoot, deletedWasRoot, heapFix, transcript } =
          cloned.eliminar(target as any);

        setTree(cloned);
        setQuery((prev) => ({
          ...prev,
          toInsert: null,
          insertedId: null,

          toDelete:
            typeof target === "number"
              ? target
              : Number(deleted.priority as any),
          deletedId: deleted.getId(),
          deletedValue: Number(deleted.priority as any),
          deletedIsRoot: !!deletedWasRoot,
          // usar el ID de raíz que ya entrega el transcript (coincide con el DOM)
          updatedRootId:
            (transcript as DeleteTranscript).updatedRootId ??
            updatedRoot?.getId() ??
            null,

          toSearch: null,
          searchResultIds: null,

          toGetLevelOrder: mapLevelOrder(cloned),
          toClear: false,

          heapFix,
          heapTranscript: transcript, // transcript de DELETE
          levelOrderReqId: null, // apaga trigger LO previo
        }));
        setError(null);
      } catch (e: unknown) {
        handleError(e, "delete");
      }
    },
    [cloneHeap, mapLevelOrder, handleError]
  );

  /**
   * SEARCH: no muta la estructura.
   * - HEAP_EMPTY si el heap está vacío.
   * - TARGET_NOT_FOUND si no existe el valor.
   */
  const search = useCallback(
    (value: number) => {
      try {
        if (tree.esVacio()) {
          throw new DomainError(
            "No fue posible buscar: el heap está vacío.",
            "HEAP_EMPTY"
          );
        }

        const ids = tree
          .getNodosPorNiveles()
          .filter((n) => Number(n.priority as any) === value)
          .map((n) => n.getId());

        if (ids.length === 0) {
          throw new DomainError(
            "No fue posible encontrar el elemento en el heap.",
            "TARGET_NOT_FOUND"
          );
        }

        setQuery((prev) => ({
          ...prev,
          toInsert: null,
          insertedId: null,

          toDelete: null,
          deletedId: null,
          deletedValue: null,
          deletedIsRoot: false,
          updatedRootId: null,

          toSearch: value,
          searchResultIds: ids,

          // al buscar no usamos transcript
          heapTranscript: null,
          levelOrderReqId: null,
        }));
        setError(null);
      } catch (e: unknown) {
        handleError(e, "search");
      }
    },
    [tree, handleError]
  );

  /**
   * LEVEL-ORDER: usa el transcript de la clase lógica.
   * - HEAP_EMPTY si no hay nodos.
   */
  const getLevelOrder = useCallback(() => {
    try {
      if (tree.esVacio()) {
        throw new DomainError(
          "No fue posible recorrer: el heap está vacío.",
          "HEAP_EMPTY"
        );
      }

      const transcript: LevelOrderTranscript = tree.getLevelOrderTranscript();

      setQuery((prev) => ({
        ...prev,
        // limpiar otras operaciones
        toInsert: null,
        insertedId: null,
        toDelete: null,
        deletedId: null,
        deletedValue: null,
        deletedIsRoot: false,
        updatedRootId: null,

        toSearch: null,
        searchResultIds: null,

        // fuente de verdad para el orden (compat renderer)
        toGetLevelOrder: transcript.order,

        // dispara el efecto de LO (nonce/trigger)
        levelOrderReqId: (prev.levelOrderReqId ?? 0) + 1,

        // dejamos el transcript por si un renderer avanzado lo usa
        heapTranscript: transcript,
        toClear: false,
      }));
      setError(null);
    } catch (e: unknown) {
      handleError(e, "getLevelOrder");
    }
  }, [tree, handleError]);

  /** CLEAN: vacía el heap y resetea triggers. No tiene errores de dominio. */
  const clean = useCallback(() => {
    const cloned = cloneHeap();
    cloned.vaciar();

    setTree(cloned);
    setQuery((prev) => ({
      ...prev,
      toInsert: null,
      insertedId: null,

      toDelete: null,
      deletedId: null,
      deletedValue: null,
      deletedIsRoot: false,
      updatedRootId: null,

      toSearch: null,
      searchResultIds: null,

      toGetLevelOrder: [],
      toClear: true,
      heapFix: null,
      heapTranscript: null, // reset transcripts
      levelOrderReqId: null, // reset nonce
    }));
    setError(null);
  }, [cloneHeap]);

  /** Resetea completamente la query (típicamente al terminar una animación). */
  const resetQueryValues = useCallback(() => {
    setQuery({
      toInsert: null,
      insertedId: null,

      toDelete: null,
      deletedId: null,
      deletedValue: null,
      deletedIsRoot: false,
      updatedRootId: null,

      toSearch: null,
      searchResultIds: null,

      toGetLevelOrder: [],
      toClear: false,
      heapFix: null,
      heapTranscript: null,
      levelOrderReqId: null,
    });
  }, []);

  const operations = useMemo(
    () => ({
      insert,
      delete: del,
      search,
      getLevelOrder,
      clean,
      resetQueryValues,
    }),
    [insert, del, search, getLevelOrder, clean, resetQueryValues]
  );

  return { tree, query, error, operations };
}
