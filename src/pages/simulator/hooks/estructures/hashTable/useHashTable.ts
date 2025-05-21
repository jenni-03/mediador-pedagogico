// src/hooks/estructures/hashTable/useHashTable.ts
import { useReducer, useState } from "react";
import type { BaseQueryOperations } from "../../../../../types";

/* ── Tipos ─────────────────────────────────────────────────── */
export type HashNode = { key: number; value: number };
export type Bucket = HashNode[];
export interface HashQuery {
  key: number | null;
  value: number | null;
}
type TableKey = "tabla_hash";

export interface LastAction {
  type: "create" | "set" | "delete" | "clean";
  key?: number;
  bucketIdx?: number;
}

interface State {
  buckets: Bucket[];
  hashFn: (k: number) => number;
  lastAction?: LastAction;
}

/* ── Acciones del reducer ─────────────────────────────────── */
type Action =
  | { type: "CREATE"; slots: number }
  | { type: "SET"; key: number; value: number }
  | { type: "DELETE"; key: number }
  | { type: "CLEAN" };

const BASE_SEG = 0x1000;

/* ── Reducer ──────────────────────────────────────────────── */
function reducer(st: State, ac: Action): State {
  switch (ac.type) {
    case "CREATE": {
      const buckets = Array.from({ length: ac.slots }, () => [] as Bucket);
      return {
        buckets,
        hashFn: (k) => k % ac.slots,
        lastAction: { type: "create" },
      };
    }

    case "SET": {
      const idx = st.hashFn(ac.key) % st.buckets.length;
      const clone = st.buckets.map((b) => [...b]) as Bucket[];
      const node = clone[idx].find((n) => n.key === ac.key);

      node
        ? (node.value = ac.value)
        : clone[idx].push({ key: ac.key, value: ac.value });

      return {
        ...st,
        buckets: clone,
        lastAction: { type: "set", key: ac.key, bucketIdx: idx },
      };
    }

    case "DELETE": {
      const idx = st.hashFn(ac.key) % st.buckets.length;
      const clone = st.buckets.map((b) => [...b]) as Bucket[];
      clone[idx] = clone[idx].filter((n) => n.key !== ac.key);
      return {
        ...st,
        buckets: clone,
        lastAction: { type: "delete", key: ac.key, bucketIdx: idx },
      };
    }

    case "CLEAN":
      return {
        ...st,
        buckets: Array.from({ length: st.buckets.length }, () => []),
        lastAction: { type: "clean" },
      };

    default:
      return st;
  }
}

/* ── Estado inicial ───────────────────────────────────────── */
const initState = (slots = 0): State => ({
  buckets: Array.from({ length: slots }, () => []),
  hashFn: (k) => (slots ? k % slots : 0),
});

/* ── Hook principal ───────────────────────────────────────── */
export function useHashTable(initialSlots = 0) {
  const [state, dispatch] = useReducer(reducer, initState(initialSlots));
  const [query, setQuery] = useState<HashQuery>({ key: null, value: null });
  const [error, setError] = useState<string | null>(null);

  /* helpers */
  const memory = state.buckets.map((_, i) => BASE_SEG * (i + 1));
  const resetQueryValues = () => setQuery({ key: null, value: null });

  const validateTableExists = () => {
    if (!state.buckets.length) {
      setError("⚠️ Primero crea la tabla con create(n)");
      return false;
    }
    return true;
  };

  /* ── Wrappers ───────────────────────────────────────────── */
  const create = (slots: number) => {
    if (!Number.isInteger(slots) || slots <= 0 || slots > 100) {
      setError("⚠️ Slots debe ser entero entre 1 y 100");
      return;
    }
    setError(null);
    dispatch({ type: "CREATE", slots });
  };

  const set = (key: number, value: number) => {
    if (!validateTableExists()) return;

    const idx = state.hashFn(key) % state.buckets.length;
    const bucket = state.buckets[idx];
    if (!bucket.find((n) => n.key === key) && bucket.length >= 5) {
      setError("⚠️ Límite de 5 nodos por bucket alcanzado");
      return;
    }
    setError(null);
    dispatch({ type: "SET", key, value });
  };

  const del = (key: number) => {
    // ← nombre de variable válido
    if (!validateTableExists()) return;
    setError(null);
    dispatch({ type: "DELETE", key });
  };

  const clean = () => {
    if (!validateTableExists()) return;
    setError(null);
    dispatch({ type: "CLEAN" });
  };

  const get = (key: number) => {
    if (!validateTableExists()) return;

    const idx = state.hashFn(key) % state.buckets.length;
    const node = state.buckets[idx].find((n) => n.key === key);
    if (!node) {
      setError(`🔍 Clave ${key} no encontrada`);
      return;
    }

    setError(null);
    setQuery({ key, value: node.value });
  };

  /* ── API que consumirá <Simulator> ───────────────────────── */
  const operations: BaseQueryOperations<TableKey> = {
    create,
    set,
    get,
    delete: del, 
    clean,
  };

  return {
    buckets: state.buckets,
    memory,
    query,
    error,
    lastAction: state.lastAction,
    actions: operations,
    getMemory: () => memory,
    resetQueryValues,
    lastInsertedBucket: state.lastAction?.bucketIdx ?? null
  };
}
