// src/simulators/hooks/estructures/arbolBPlus/useBPlusTree.ts
import { useRef, useState } from "react";
import { BaseQueryOperations, TraversalNodeType } from "../../../../../types";
import { ArbolBPlus } from "../../../../../shared/utils/structures/ArbolBPlus";

type QueryBPlus = BaseQueryOperations<"arbol_bplus"> & {
  range?: { from: number; to: number };
};

/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                             Debug / logging                              ║
   ╚══════════════════════════════════════════════════════════════════════════╝*/
const DEBUG_BPLUS = true;
const dlog = (...a: any[]) => {
  if (DEBUG_BPLUS) console.log("[useBPlusTree]", ...a);
};

/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                                 Helpers                                  ║
   ╚══════════════════════════════════════════════════════════════════════════╝*/

/** Filtra items inválidos en secuencias para la banda. */
const sanitizeSeq = (arr: TraversalNodeType[]) =>
  arr.filter((d): d is TraversalNodeType => !!d && typeof d.id === "string");

/** Deja sólo una señal de secuencia activa (todas las demás en blanco). */
function onlySeq<K extends keyof BaseQueryOperations<"arbol_bplus">>(
  key: K,
  payload: BaseQueryOperations<"arbol_bplus">[keyof BaseQueryOperations<"arbol_bplus">]
): BaseQueryOperations<"arbol_bplus"> {
  return {
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetInOrder: [],
    toGetLevelOrder: [],
    toGetRange: [],
    toScanFrom: [],
    toClear: false,
    bPlusFix: null,
    [key]: payload as any,
  } as BaseQueryOperations<"arbol_bplus">;
}

/** Convierte números a TraversalNodeType con ids estables para la banda. */
const toTraversal = (vals: number[], prefix = "seq"): TraversalNodeType[] =>
  vals.map((v, i) => ({ id: `${prefix}-${v}-${i}`, value: v }));

/** Obtiene un clon inmutable del árbol (requerido para React). */
const cloneOrThrow = (t: ArbolBPlus<number, number>) => {
  const c = (t as any).clonar?.();
  if (!c) {
    throw new Error(
      "ArbolBPlus.clonar() no está disponible. Agrega un método clonar() (igual que en ArbolB) para mantener inmutabilidad."
    );
  }
  return c as ArbolBPlus<number, number>;
};

/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                               Hook principal                             ║
   ╚══════════════════════════════════════════════════════════════════════════╝*/
export function useBPlusTree(structure: ArbolBPlus<number, number>) {
  // Estado fuente de verdad (árbol lógico) y errores
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

  // Señales que lee el renderer para animar
  const [query, setQuery] = useState<QueryBPlus>({
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetInOrder: [],
    toGetLevelOrder: [],
    toGetRange: [],
    toScanFrom: [],
    toClear: false,
    bPlusFix: null,
    range: undefined,
  });

  // Operaciones diferidas (se aplican cuando la animación termina)
  const pendingInsertRef = useRef<number | null>(null);
  const pendingDeleteRef = useRef<number | null>(null);
  const pendingClearRef = useRef<boolean>(false);

  /* ───────────── INSERT: muta primero, anima después ─────────────
     Esto garantiza que el renderer encuentre la clave en su hoja real
     y no caiga en el fallback (primera hoja a la izquierda). */
  const insert = (value: number) => {
    dlog("insert(arg):", value);
    try {
      const next = cloneOrThrow(tree);
      next.insertar(value); // ← mutación inmediata
      setTree(next); // ← re-render con el árbol actualizado

      // Señal para que el renderer haga el recorrido + pop/slot-grow
      setQuery((p) => ({
        ...p,
        toInsert: value,
        toDelete: null,
        toSearch: null,
        toGetInOrder: [],
        toGetLevelOrder: [],
        toGetRange: [],
        toScanFrom: [],
        toClear: false,
      }));
      setError(null);
    } catch (e: any) {
      dlog("insert(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ─────────────────────────────── DELETE ────────────────────────────────
     Siempre diferido para poder mostrar el camino + crumble antes de mutar. */
  const del = (value: number) => {
    dlog("delete(arg):", value);
    try {
      // Si no existe, no dispares animación
      if (!tree.contiene?.(value)) {
        throw new Error("La clave no existe en el árbol.");
      }
      pendingDeleteRef.current = value;
      setQuery((p) => ({
        ...p,
        toDelete: value,
        toInsert: null,
        toSearch: null,
        toGetInOrder: [],
        toGetLevelOrder: [],
        toGetRange: [],
        toScanFrom: [],
        toClear: false,
      }));
      setError(null);
    } catch (e: any) {
      dlog("delete(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ─────────────────────────────── SEARCH ────────────────────────────────
     Sólo dispara la animación (no hay mutación).                           */
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
      }));
      setError(null);
    } catch (e: any) {
      dlog("search(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ───────────────────────────── Recorridos B+ ─────────────────────────── */
  const getInOrder = () => {
    dlog("getInOrder()");
    try {
      const seq = tree.getInOrder();
      setQuery(onlySeq("toGetInOrder", sanitizeSeq(seq)));
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
      setQuery(onlySeq("toGetLevelOrder", sanitizeSeq(seq)));
      setError(null);
    } catch (e: any) {
      dlog("getLevelOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ─────────────────────────── Consultas secuenciales ──────────────────── */
  /** Rango inclusivo [from, to] usando la cadena de hojas. */
  const range = (from: number, to: number) => {
    dlog("range(arg):", from, to);
    try {
      const vals = tree.range(from, to);
      const seq = toTraversal(vals, "range");
      setQuery((_prev) => ({
        // banda inferior con los resultados
        toGetInOrder: sanitizeSeq(seq),
        toGetLevelOrder: [],

        // 👇 TRIGGER correcto para el render
        range: { from, to },

        // apaga el resto de triggers
        toGetRange: [],
        toScanFrom: [],
        toInsert: null,
        toDelete: null,
        toSearch: null,
        toClear: false,
        bPlusFix: null,
      }));
      setError(null);
    } catch (e: any) {
      dlog("range(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /** Escaneo secuencial desde `start` limitado por `limit` elementos. */
  const scanFrom = (start: number, limit: number) => {
    dlog("scanFrom(arg):", start, limit);
    try {
      const vals = tree.scanFrom(start, limit);
      const seq = toTraversal(vals, "scan");

      setQuery((_prev) => ({
        // resultados para la banda inferior
        toGetInOrder: sanitizeSeq(seq),
        toGetLevelOrder: [],

        // 🔔 trigger de animación SCAN FROM (tupla)
        toScanFrom: [start, limit],

        // apaga otros triggers
        toGetRange: [],
        toInsert: null,
        toDelete: null,
        toSearch: null,
        toClear: false,
        bPlusFix: null,
      }));
      setError(null);
    } catch (e: any) {
      dlog("scanFrom(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ─────────────────────────── resetQueryValues() ─────────────────────────
   Llamado por el renderer al terminar la animación para:
   1) limpiar señales de animación
   2) aplicar las mutaciones diferidas en orden: clear → delete → insert   */
  const resetQueryValues = () => {
    dlog("resetQueryValues()");
    setQuery((prev) => ({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetInOrder: prev.toGetInOrder, // 👈 conserva la banda
      toGetLevelOrder: [],
      toGetRange: [],
      toScanFrom: [],
      toClear: false,
      bPlusFix: null,
      range: undefined, // 👈 apaga el trigger RANGE
    }));

    // 2) aplicar mutaciones pendientes
    let nextTree: ArbolBPlus<number, number> = tree;
    let changed = false;

    // a) CLEAR
    if (pendingClearRef.current) {
      nextTree = new ArbolBPlus<number, number>((a, b) => a - b, 2);
      pendingClearRef.current = false;
      changed = true;
    } else {
      // si no hubo clear, clonamos el árbol actual para mutarlo de forma segura
      nextTree = cloneOrThrow(nextTree);
    }

    // b) DELETE
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

    // c) INSERT
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

    // 3) publicar el nuevo árbol si hubo cambios
    if (changed) setTree(nextTree);
  };

  /* ───────────────────────────────── CLEAR ───────────────────────────────
     Diferido: primero animas el “clear” visual y luego recreas el árbol.   */
  const clean = () => {
    dlog("clean()");
    pendingClearRef.current = true;
    setQuery({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetInOrder: [],
      toGetLevelOrder: [],
      toGetRange: [],
      toScanFrom: [],
      toClear: true, // dispara la animación de limpiado
      bPlusFix: null,
    });
  };

  /* ╔══════════════════════════════════════════════════════════════════════╗
     ║                                API                                  ║
     ╚══════════════════════════════════════════════════════════════════════╝*/
  return {
    tree,
    query,
    error,
    operations: {
      insert,
      delete: del,
      search,
      // recorridos
      getInOrder,
      getLevelOrder,
      // consultas propias de B+
      range,
      scanFrom,
      // housekeeping
      clean,
      resetQueryValues, // ← las animaciones DEBEN llamar a esto al terminar
    },
  };
}
