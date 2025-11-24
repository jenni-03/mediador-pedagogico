// src/hooks/estructures/hashTable/useHashTable.ts
import { useReducer, useState } from "react";
import type { BaseStructureActions } from "../../../../../types";
import { DomainError } from "../../../../../shared/utils/error/DomainError";

/* ── Tipos ─────────────────────────────────────────────────── */
export type HashNode = { key: number; value: number };
export type Bucket = HashNode[];
export interface HashQuery {
  key: number | null;
  value: number | null;
}

export interface LastAction {
  type: "create" | "set" | "delete" | "clean";
  key?: number;
  bucketIdx?: number;
  mode?: "insert" | "update";
  prevValue?: number; // solo para update
  newValue?: number; // valor nuevo
}

interface State {
  buckets: Bucket[];
  hashFn: (k: number) => number;
  lastAction?: LastAction;
}

/* ── Tipos para errores ricos (para el simulador) ──────────── */
type HashOp = "create" | "set" | "get" | "delete" | "clean";

export type HashErrorPlanId =
  | "CREATE_NON_INTEGER"
  | "INVALID_CAPACITY_RANGE"
  | "TABLE_NOT_CREATED"
  | "BUCKET_FULL"
  | "KEY_NOT_FOUND"
  | "INVALID_KEY_OR_VALUE_TYPE"
  | "KEY_OR_VALUE_TOO_LARGE"
  | "INVALID_KEY_TYPE";

export type HashError = {
  id: number; // necesario para <Simulator>
  message: string;
  op: HashOp;
  planId?: HashErrorPlanId | null;
};

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
      // por seguridad extra, aunque en teoría nunca llamamos SET sin tabla
      if (st.buckets.length === 0) {
        return st;
      }

      const idx = st.hashFn(ac.key) % st.buckets.length;
      const bucket = st.buckets[idx];

      const existing = bucket.find((n) => n.key === ac.key);
      const mode: "insert" | "update" = existing ? "update" : "insert";
      const prevValue = existing?.value;

      // nuevo bucket sin mutar nodos anteriores
      const newBucket: Bucket = existing
        ? bucket.map((n) =>
            n.key === ac.key
              ? { key: n.key, value: ac.value } // nuevo objeto con el valor actualizado
              : n
          )
        : [...bucket, { key: ac.key, value: ac.value }];

      // clon de buckets, reemplazando solo el bucket afectado
      const newBuckets: Bucket[] = st.buckets.map((b, i) =>
        i === idx ? newBucket : b
      );

      return {
        ...st,
        buckets: newBuckets,
        lastAction: {
          type: "set",
          key: ac.key,
          bucketIdx: idx,
          mode,
          prevValue,
          newValue: ac.value,
        },
      };
    }

    case "DELETE": {
      if (st.buckets.length === 0) {
        return st;
      }

      const idx = st.hashFn(ac.key) % st.buckets.length;
      const newBuckets: Bucket[] = st.buckets.map((b, i) =>
        i === idx ? b.filter((n) => n.key !== ac.key) : b
      );

      return {
        ...st,
        buckets: newBuckets,
        lastAction: { type: "delete", key: ac.key, bucketIdx: idx },
      };
    }

    case "CLEAN":
      return {
        buckets: [],
        hashFn: () => 0,
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

  // ahora error es un objeto rico, no solo string
  const [error, setError] = useState<HashError | null>(null);

  /* helpers básicos */
  const memory = state.buckets.map((_, i) => BASE_SEG * (i + 1));
  const resetQueryValues = () => setQuery({ key: null, value: null });

  /* ── Helpers de errores / validaciones ───────────────────── */

  const raise = (message: string, code: HashErrorPlanId): never => {
    throw new DomainError(message, code);
  };

  const handleError = (err: unknown, op: HashOp) => {
    if (err instanceof DomainError) {
      setError({
        id: Date.now(),
        message: err.message,
        op,
        planId: (err.code as HashErrorPlanId) ?? null,
      });
    } else {
      setError({
        id: Date.now(),
        message: "Ocurrió un error inesperado en la operación de tabla hash.",
        op,
        planId: null,
      });
    }
  };

  const validateTableExists = () => {
    if (!state.buckets.length) {
      raise("⚠️ Primero crea la tabla con create(n)", "TABLE_NOT_CREATED");
    }
  };

  /* ── Wrappers ───────────────────────────────────────────── */

  const create = (slots: number) => {
    try {
      if (!Number.isInteger(slots)) {
        raise(
          "📚 El número de slots debe ser un valor entero. Ej: create(8)",
          "CREATE_NON_INTEGER"
        );
      }

      if (slots <= 0 || slots > 21) {
        raise(
          "📚 La cantidad de slots debe estar entre 1 y 21. Intenta con create(10)",
          "INVALID_CAPACITY_RANGE"
        );
      }

      setError(null);
      dispatch({ type: "CREATE", slots });
    } catch (err) {
      handleError(err, "create");
    }
  };

  const set = (key: number, value: number) => {
    try {
      validateTableExists();

      if (!Number.isInteger(key) || !Number.isInteger(value)) {
        raise(
          "🧠 Tanto la clave como el valor deben ser números enteros. Ej: set(12, 45)",
          "INVALID_KEY_OR_VALUE_TYPE"
        );
      }

      if (key > 9999 || value > 9999) {
        raise(
          "🔢 La clave y el valor deben tener como máximo 4 cifras (≤ 9999). Intenta con números más pequeños.",
          "KEY_OR_VALUE_TOO_LARGE"
        );
      }

      const idx = state.hashFn(key) % state.buckets.length;
      const bucket = state.buckets[idx];

      if (!bucket.find((n) => n.key === key) && bucket.length >= 5) {
        raise(
          `🚫 El bucket ${idx} ya tiene 5 nodos. No se permiten más colisiones aquí.`,
          "BUCKET_FULL"
        );
      }

      setError(null);
      dispatch({ type: "SET", key, value });
    } catch (err) {
      handleError(err, "set");
    }
  };

  const del = (key: number) => {
    try {
      validateTableExists();

      if (!Number.isInteger(key)) {
        raise(
          "🗑️ La clave a eliminar debe ser un número entero. Ej: delete(21)",
          "INVALID_KEY_TYPE"
        );
      }

      const idx = state.hashFn(key) % state.buckets.length;
      const node = state.buckets[idx].find((n) => n.key === key);

      if (!node) {
        raise(
          `🗑️ No se puede eliminar: la clave ${key} no está en el bucket ${idx}.`,
          "KEY_NOT_FOUND"
        );
      }

      setError(null);
      dispatch({ type: "DELETE", key });
    } catch (err) {
      handleError(err, "delete");
    }
  };

  const clean = () => {
    setError(null);
    dispatch({ type: "CLEAN" });
  };

  const get = (key: number) => {
    try {
      validateTableExists();

      if (!Number.isInteger(key)) {
        raise(
          "🔍 La clave debe ser un número entero. Ej: get(21)",
          "INVALID_KEY_TYPE"
        );
      }

      const idx = state.hashFn(key) % state.buckets.length;
      const node = state.buckets[idx].find((n) => n.key === key);

      if (!node) {
        raise(
          `🔍 La clave ${key} no se encuentra en el bucket ${idx}. Asegúrate de haberla insertado.`,
          "KEY_NOT_FOUND"
        );
        return; // 👈 esto es SOLO para contentar a TypeScript
      }

      setError(null);
      setQuery({ key, value: node.value }); // aquí node ya está tipado como HashNode
    } catch (err) {
      handleError(err, "get");
    }
  };

  /* ── API que consumirá <Simulator> ───────────────────────── */
  const operations = {
    create,
    set,
    get,
    delete: del,
    clean,
  } as BaseStructureActions<"tabla_hash">;

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
    error, // HashError | null
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
