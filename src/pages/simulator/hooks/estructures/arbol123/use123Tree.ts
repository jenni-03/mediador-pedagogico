import { useState } from "react";
import { BaseQueryOperations, TraversalNodeType } from "../../../../../domain/utils/types";
import {
  Arbol23,
  type Tree23ErrorCode,
} from "../../../../../domain/structures/Arbol23";
import { DomainError } from "../../../../../domain/error/DomainError";

const DEBUG_TT = true;
const dlog = (...a: any[]) => {
  if (DEBUG_TT) console.log("[useTwoThreeTree]", ...a);
};

// helper: normaliza a id de DOM (string con prefijo) para el renderer/D3
const toDomId = (id: number | string) =>
  typeof id === "number" ? `n-${id}` : id;

type N = {
  getId(): number;
  getKeys(): number[];
  getHijos(): N[];
};

/* ────────────────── Tipos de op / error para el simulador ────────────────── */

type TwoThreeOp =
  | "insert"
  | "delete"
  | "search"
  | "getPreOrder"
  | "getInOrder"
  | "getPostOrder"
  | "getLevelOrder"
  | "clean";

type TwoThreeErrorPlanId = Tree23ErrorCode;

export type TwoThreeError = {
  id: number; // necesario para <Simulator>
  message: string;
  op: TwoThreeOp;
  planId?: TwoThreeErrorPlanId | null;
};

/** Helpers de recorridos 2-3 que generan directamente TraversalNodeType[] */
function preOrderSeq(n: N | null, out: TraversalNodeType[]) {
  if (!n) return;
  const baseId = toDomId(n.getId());
  const keys = n.getKeys();
  // 1) Emitir todas las claves del nodo (izq→der)
  keys.forEach((k, i) => out.push({ id: `${baseId}#k${i}`, value: k }));
  // 2) Hijos izq→der
  const kids = n.getHijos();
  kids.forEach((c) => preOrderSeq(c ?? null, out));
}

function inOrderSeq(n: N | null, out: TraversalNodeType[]) {
  if (!n) return;
  const baseId = toDomId(n.getId());
  const keys = n.getKeys();
  const kids = n.getHijos();
  const m = keys.length; // 1 o 2

  // In-order generalizado: T0, k0, T1, k1, ..., k(m-1), Tm
  for (let i = 0; i < m; i++) {
    if (kids[i]) inOrderSeq(kids[i], out);
    out.push({ id: `${baseId}#k${i}`, value: keys[i] });
  }
  if (kids[m]) inOrderSeq(kids[m], out);
}

function postOrderSeq(n: N | null, out: TraversalNodeType[]) {
  if (!n) return;
  const baseId = toDomId(n.getId());
  const keys = n.getKeys();
  const kids = n.getHijos();
  // 1) Hijos izq→der
  kids.forEach((c) => postOrderSeq(c ?? null, out));
  // 2) Luego todas las claves del nodo (izq→der)
  keys.forEach((k, i) => out.push({ id: `${baseId}#k${i}`, value: k }));
}

function levelOrderSeq(root: N | null): TraversalNodeType[] {
  if (!root) return [];
  const out: TraversalNodeType[] = [];
  const q: N[] = [root];
  while (q.length) {
    const cur = q.shift()!;
    const baseId = toDomId(cur.getId());
    const keys = cur.getKeys();
    // Emitir claves del nivel en orden
    keys.forEach((k, i) => out.push({ id: `${baseId}#k${i}`, value: k }));
    // Encolar hijos
    cur.getHijos().forEach((h) => {
      if (h) q.push(h);
    });
  }
  return out;
}

/** Limpia todas las señales de recorridos dejando sólo una activa */
function onlySeq<K extends keyof BaseQueryOperations<"arbol_123">>(
  key: K,
  payload: BaseQueryOperations<"arbol_123">[K]
): BaseQueryOperations<"arbol_123"> {
  return {
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetPreOrder: [],
    toGetInOrder: [],
    toGetPostOrder: [],
    toGetLevelOrder: [],
    toClear: false,
    [key]: payload,
  } as BaseQueryOperations<"arbol_123">;
}

export function useTwoThreeTree(structure: Arbol23<number>) {
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<TwoThreeError | null>(null);

  const [query, setQuery] = useState<BaseQueryOperations<"arbol_123">>({
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetPreOrder: [],
    toGetInOrder: [],
    toGetPostOrder: [],
    toGetLevelOrder: [],
    toClear: false,
  });

  /* ─────────────────────────── helper de errores ─────────────────────────── */

  const handleError = (err: unknown, op: TwoThreeOp) => {
    if (err instanceof DomainError) {
      dlog(op, "DomainError:", err.message, "code:", err.code);
      setError({
        id: Date.now(),
        message: err.message,
        op,
        planId: (err.code as TwoThreeErrorPlanId) ?? null,
      });
      return;
    }

    const msg =
      err && typeof (err as any).message === "string"
        ? (err as any).message
        : "Ocurrió un error inesperado en la operación del árbol 1-2-3.";
    dlog(op, "GENERIC_ERROR:", msg, "| raw:", err);

    setError({
      id: Date.now(),
      message: msg,
      op,
      planId: null,
    });
  };

  /* ─────────────────────────────── operaciones ─────────────────────────────── */

  // Inserción
  const insert = (value: number) => {
    dlog("insert(arg):", value);
    try {
      const cloned = tree.clonar();
      cloned.insertar(value);
      setTree(cloned);
      setQuery((p) => ({
        ...p,
        toInsert: value,
        toDelete: null,
        toSearch: null,
        toGetPreOrder: [],
        toGetInOrder: [],
        toGetPostOrder: [],
        toGetLevelOrder: [],
        toClear: false,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "insert");
    }
  };

  // Eliminación
  const del = (value: number) => {
    dlog("delete(arg):", value);
    try {
      const cloned = tree.clonar();
      cloned.eliminar(value);
      setTree(cloned);
      setQuery((p) => ({
        ...p,
        toDelete: value,
        toInsert: null,
        toSearch: null,
        toGetPreOrder: [],
        toGetInOrder: [],
        toGetPostOrder: [],
        toGetLevelOrder: [],
        toClear: false,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "delete");
    }
  };

  // Búsqueda (apoyado en DomainError para mapear a KEY_NOT_FOUND)
  const search = (value: number) => {
    dlog("search(arg):", value);
    try {
      if (!tree.contiene(value)) {
        // Lanzamos DomainError aquí para enganchar con el errorPlan `KEY_NOT_FOUND`
        throw new DomainError(
          "No fue posible encontrar la clave en el árbol.",
          "KEY_NOT_FOUND"
        );
      }

      setQuery((prev) => ({
        ...prev,
        toSearch: value,
        toGetPreOrder: [],
        toGetInOrder: [],
        toGetPostOrder: [],
        toGetLevelOrder: [],
      }));
      setError(null);
    } catch (e) {
      handleError(e, "search");
    }
  };

  /* ───────────────────────────── Recorridos ───────────────────────────── */

  const getPreOrder = () => {
    dlog("getPreOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) {
        throw new Error(
          "No fue posible recorrer en preorden (el árbol se encuentra vacío)."
        );
      }
      const seq: TraversalNodeType[] = [];
      preOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetPreOrder", seq));
      setError(null);
    } catch (e) {
      handleError(e, "getPreOrder");
    }
  };

  const getInOrder = () => {
    dlog("getInOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) {
        throw new Error(
          "No fue posible recorrer en inorden (el árbol se encuentra vacío)."
        );
      }
      const seq: TraversalNodeType[] = [];
      inOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetInOrder", seq));
      setError(null);
    } catch (e) {
      handleError(e, "getInOrder");
    }
  };

  const getPostOrder = () => {
    dlog("getPostOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) {
        throw new Error(
          "No fue posible recorrer en postorden (el árbol se encuentra vacío)."
        );
      }
      const seq: TraversalNodeType[] = [];
      postOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetPostOrder", seq));
      setError(null);
    } catch (e) {
      handleError(e, "getPostOrder");
    }
  };

  const getLevelOrder = () => {
    dlog("getLevelOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) {
        throw new Error(
          "No fue posible recorrer por niveles (el árbol se encuentra vacío)."
        );
      }
      const seq = levelOrderSeq(raiz);
      setQuery(onlySeq("toGetLevelOrder", seq));
      setError(null);
    } catch (e) {
      handleError(e, "getLevelOrder");
    }
  };

  // Limpiar
  const clean = () => {
    dlog("clean()");
    const cloned = tree.clonar();
    cloned.vaciar(true); // resetear ids de Nodo23 para que D3 no se vuelva loco
    setTree(cloned);
    setQuery({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetPreOrder: [],
      toGetInOrder: [],
      toGetPostOrder: [],
      toGetLevelOrder: [],
      toClear: true,
    });
    setError(null);
  };

  const resetQueryValues = () => {
    dlog("resetQueryValues()");
    setQuery({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetPreOrder: [],
      toGetInOrder: [],
      toGetPostOrder: [],
      toGetLevelOrder: [],
      toClear: false,
    });
  };

  return {
    tree,
    query,
    // TwoThreeError | null, compatible con LooseError del <Simulator>
    error,
    operations: {
      insert,
      delete: del,
      search,
      getPreOrder,
      getInOrder,
      getPostOrder,
      getLevelOrder,
      clean,
      resetQueryValues,
    },
  };
}
