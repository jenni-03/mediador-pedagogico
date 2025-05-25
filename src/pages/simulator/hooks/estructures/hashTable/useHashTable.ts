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
    if (!Number.isInteger(slots)) {
      setError("📚 El número de slots debe ser un valor entero. Ej: create(8)");
      return;
    }

    if (slots <= 0 || slots > 21) {
      setError(
        "📚 La cantidad de slots debe estar entre 1 y 21. Intenta con create(10)"
      );
      return;
    }

    setError(null);
    dispatch({ type: "CREATE", slots });
  };

  const set = (key: number, value: number) => {
    if (!validateTableExists()) return;

    if (!Number.isInteger(key) || !Number.isInteger(value)) {
      setError(
        "🧠 Tanto la clave como el valor deben ser números enteros. Ej: set(12, 45)"
      );
      return;
    }

    if (key > 9999 || value > 9999) {
      setError(
        "🔢 La clave y el valor deben tener como máximo 4 cifras (≤ 9999). Intenta con números más pequeños."
      );
      return;
    }

    const idx = state.hashFn(key) % state.buckets.length;
    const bucket = state.buckets[idx];

    if (!bucket.find((n) => n.key === key) && bucket.length >= 5) {
      setError(
        `🚫 El bucket ${idx} ya tiene 5 nodos. No se permiten más colisiones aquí.`
      );
      return;
    }

    setError(null);
    dispatch({ type: "SET", key, value });
  };

  const del = (key: number) => {
    if (!validateTableExists()) return;

    if (!Number.isInteger(key)) {
      setError(
        "🗑️ La clave a eliminar debe ser un número entero. Ej: delete(21)"
      );
      return;
    }

    const idx = state.hashFn(key) % state.buckets.length;
    const node = state.buckets[idx].find((n) => n.key === key);

    if (!node) {
      setError(
        `🗑️ No se puede eliminar: la clave ${key} no está en el bucket ${idx}.`
      );
      return;
    }

    setError(null);
    dispatch({ type: "DELETE", key });
  };

  const clean = () => {
    if (!validateTableExists()) return;

    if (state.buckets.every((b) => b.length === 0)) {
      setError("🧹 La tabla ya está vacía. No hay nada que limpiar.");
      return;
    }

    setError(null);
    dispatch({ type: "CLEAN" });
  };

  const get = (key: number) => {
    if (!validateTableExists()) return;

    if (!Number.isInteger(key)) {
      setError("🔍 La clave debe ser un número entero. Ej: get(21)");
      return;
    }

    const idx = state.hashFn(key) % state.buckets.length;
    const node = state.buckets[idx].find((n) => n.key === key);

    if (!node) {
      setError(
        `🔍 La clave ${key} no se encuentra en el bucket ${idx}. Asegúrate de haberla insertado.`
      );
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
  const getDireccionesBuckets = () => {
    return state.buckets.map(
      (_, i) => `0x${(BASE_SEG * (i + 1)).toString(16).padStart(6, "0")}`
    );
  };

  const getArrayDeNodos = () => {
    const result: { key: number; value: number; memoryAddress: string }[] = [];

    for (let i = 0; i < state.buckets.length; i++) {
      const bucket = state.buckets[i];
      const baseAddress = BASE_SEG * (i + 1);

      for (let j = 0; j < bucket.length; j++) {
        result.push({
          key: bucket[j].key,
          value: bucket[j].value,
          memoryAddress: `0x${(baseAddress + j).toString(16).padStart(6, "0")}`,
        });
      }
    }

    return result;
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
    lastInsertedBucket: state.lastAction?.bucketIdx ?? null,
    structurePrueba: {
      getTamanio: () => state.buckets.reduce((acc, b) => acc + b.length, 0),
      vector: state.buckets,
      tamanioNodo: 4,
      getArrayDeNodos,
      getDireccionesBuckets,
    },
  };
}
