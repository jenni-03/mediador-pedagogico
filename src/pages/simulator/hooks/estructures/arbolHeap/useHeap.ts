// src/hooks/estructures/arbolHeap/useHeap.ts
import { useCallback, useMemo, useState } from "react";
import {
  BaseQueryOperations,
  TraversalNodeType,
  Comparator,
} from "../../../../../types";
import { ArbolHeap } from "../../../../../shared/utils/structures/ArbolHeap";

// 👇 importa también el transcript de Level-Order
import type {
  InsertTranscript,
  DeleteTranscript,
  LevelOrderTranscript,
} from "../../../../../shared/utils/structures/ArbolHeap";

export type UseHeapOptions = {
  min?: boolean;
  compare?: Comparator<number>;
  maxNodos?: number;
};

// 🔸 Unificación de transcripts
type HeapTranscript =
  | InsertTranscript
  | DeleteTranscript
  | LevelOrderTranscript
  | null;

export function useHeap(
  structure: ArbolHeap<number>,
  _opts: UseHeapOptions = {}
) {
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

  // 🔸 Estado de consulta/ordenes para el renderer, con nonce para LO
  const [query, setQuery] = useState<
    BaseQueryOperations<"arbol_heap"> & {
      heapTranscript: HeapTranscript;
      levelOrderReqId?: number | null; // ← trigger/nonce para LO
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

  /* ───────── Utilidades internas ───────── */

  // ⬇️ CLAVE: clonar preservando IDs (no reconstruir desde valores)
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

  /* ───────── Operaciones ───────── */

  const insert = useCallback(
    (value: number) => {
      try {
        const cloned = cloneHeap();

        const { node, heapFix, transcript } = cloned.insertarConLog(value);

        setTree(cloned);
        setQuery((prev) => ({
          ...prev,
          toInsert: value,
          insertedId: node.getId(),

          toDelete: null,
          deletedId: null,
          deletedValue: null,
          deletedIsRoot: false,
          updatedRootId: null,

          toSearch: null,
          searchResultIds: null,

          toGetLevelOrder: mapLevelOrder(cloned),
          toClear: false,

          heapFix,
          heapTranscript: transcript, // transcript de INSERT
          levelOrderReqId: null, // opcional: apaga cualquier trigger LO previo
        }));
        setError(null);
      } catch (e: any) {
        setError({ message: e.message, id: Date.now() });
      }
    },
    [cloneHeap, mapLevelOrder]
  );

  const del = useCallback(
    (target: number | { id: string }) => {
      try {
        if (tree.esVacio())
          throw new Error("No fue posible eliminar: el heap está vacío.");

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
          levelOrderReqId: null, // opcional: apaga cualquier trigger LO previo
        }));
        setError(null);
      } catch (e: any) {
        setError({ message: e.message, id: Date.now() });
      }
    },
    [tree, cloneHeap, mapLevelOrder]
  );

  const search = useCallback(
    (value: number) => {
      try {
        const ids = tree
          .getNodosPorNiveles()
          .filter((n) => Number(n.priority as any) === value)
          .map((n) => n.getId());

        if (ids.length === 0)
          throw new Error("No fue posible encontrar el elemento en el heap.");

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
      } catch (e: any) {
        setError({ message: e.message, id: Date.now() });
      }
    },
    [tree]
  );

  const getLevelOrder = useCallback(() => {
    try {
      // Usa el transcript de la clase lógica (nuevo método)
      // Si implementaste ambos nombres, mantenemos el fallback.
      const transcript: LevelOrderTranscript | null =
        (tree as any).getLevelOrderTranscript?.() ??
        (tree as any).getLevelOrderConLog?.().transcript ??
        null;

      if (!transcript || transcript.order.length === 0)
        throw new Error("No fue posible recorrer: el heap está vacío.");

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

        // fuente de verdad para el orden (compat con renderer)
        toGetLevelOrder: transcript.order,

        // dispara el efecto de LO (nonce/trigger)
        levelOrderReqId: (prev.levelOrderReqId ?? 0) + 1,

        // deja el transcript para debug o para un renderer que lo consuma
        heapTranscript: transcript,
        toClear: false,
      }));
      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  }, [tree]);

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
  }, [cloneHeap]);

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
      heapTranscript: null, // reset transcripts
      levelOrderReqId: null, // reset nonce
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
