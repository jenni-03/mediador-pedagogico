// src/hooks/estructures/btree/useBTree.ts
import { useState } from "react";
import { BaseQueryOperations, TraversalNodeType } from "../../../../../types";
import {
  ArbolB,
  type BTreeErrorCode,
} from "../../../../../shared/utils/structures/ArbolB";
import { DomainError } from "../../../../../shared/utils/error/DomainError";

const DEBUG_B = true;
const dlog = (...a: any[]) => {
  if (DEBUG_B) console.log("[useBTree]", ...a);
};

// helper: normaliza a id de DOM (string con prefijo) para el renderer/D3
const toDomId = (id: number | string) =>
  typeof id === "number" ? `n-${id}` : id;

/** Interfaz mínima que usa el hook (compatible con BNodo<number,*>). */
type N = {
  getId(): number;
  getKeys(): number[]; // claves en orden ascendente
  getHijos(): (N | null | undefined)[];
};

// helper: devuelve solo hijos válidos
const kidsOf = (n: N) => (n.getHijos?.() ?? []).filter(Boolean) as N[];

// helper: limpia cualquier item inválido en la banda de recorrido
const sanitizeSeq = (arr: TraversalNodeType[]) =>
  arr.filter((d): d is TraversalNodeType => !!d && typeof d.id === "string");

/* ────────────────── Tipos de op / error para el simulador ────────────────── */

type BTreeOp =
  | "insert"
  | "delete"
  | "search"
  | "getPreOrder"
  | "getInOrder"
  | "getPostOrder"
  | "getLevelOrder"
  | "clean";

type BTreeErrorPlanId = BTreeErrorCode;

export type BTreeError = {
  id: number;
  message: string;
  op: BTreeOp;
  planId?: BTreeErrorPlanId | null;
};

/* ───────── Recorridos multi-clave (usar kidsOf) ───────── */

function preOrderSeq(n: N | null, out: TraversalNodeType[]) {
  if (!n) return;
  const baseId = toDomId(n.getId());
  const keys = n.getKeys();
  keys.forEach((k, i) => out.push({ id: `${baseId}#k${i}`, value: k }));
  const kids = kidsOf(n); // ← filtro
  kids.forEach((c) => preOrderSeq(c, out));
}

function inOrderSeq(n: N | null, out: TraversalNodeType[]) {
  if (!n) return;
  const baseId = toDomId(n.getId());
  const keys = n.getKeys();
  const kids = kidsOf(n); // ← filtro
  const m = keys.length;
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
  const kids = kidsOf(n); // ← filtro
  kids.forEach((c) => postOrderSeq(c, out));
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
    keys.forEach((k, i) => out.push({ id: `${baseId}#k${i}`, value: k }));
    kidsOf(cur).forEach((h) => q.push(h)); // ← filtro
  }
  return out;
}

/** Limpia todas las señales de recorridos dejando sólo una activa */
function onlySeq<K extends keyof BaseQueryOperations<"arbol_b">>(
  key: K,
  payload: BaseQueryOperations<"arbol_b">[K]
): BaseQueryOperations<"arbol_b"> {
  return {
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetPreOrder: [],
    toGetInOrder: [],
    toGetPostOrder: [],
    toGetLevelOrder: [],
    toClear: false,
    bFix: null,
    [key]: payload,
  } as BaseQueryOperations<"arbol_b">;
}

/* ─────────────────────────────── Hook ─────────────────────────────── */

export function useBTree(structure: ArbolB<number, number>) {
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<BTreeError | null>(null);

  const [query, setQuery] = useState<BaseQueryOperations<"arbol_b">>({
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetPreOrder: [],
    toGetInOrder: [],
    toGetPostOrder: [],
    toGetLevelOrder: [],
    toClear: false,
    bFix: null, // opcional: logs de split/merge/redistribución si los emites desde ArbolB
  });

  /* ─────────────────────────── helper de errores ─────────────────────────── */

  const handleError = (err: unknown, op: BTreeOp) => {
    if (err instanceof DomainError) {
      dlog(op, "DomainError:", err.message, "code:", err.code);
      setError({
        id: Date.now(),
        message: err.message,
        op,
        planId: (err.code as BTreeErrorPlanId) ?? null,
      });
      return;
    }

    const msg =
      err && typeof (err as any).message === "string"
        ? (err as any).message
        : "Ocurrió un error inesperado en la operación del Árbol B.";
    dlog(op, "GENERIC_ERROR:", msg, "| raw:", err);

    setError({
      id: Date.now(),
      message: msg,
      op,
      planId: null,
    });
  };

  /* ───────────── Inserción ───────────── */
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
        // bFix: cloned.getLastFixLog?.() ?? null, // si decides exponerlo
      }));
      setError(null);
    } catch (e) {
      handleError(e, "insert");
    }
  };

  /* ───────────── Eliminación ───────────── */
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
        // bFix: cloned.getLastFixLog?.() ?? null,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "delete");
    }
  };

  /* ───────────── Búsqueda ───────────── */
  const search = (value: number) => {
    dlog("search(arg):", value);
    try {
      if (!tree.contiene(value)) {
        // Igual que en Arbol23: levantamos DomainError para enganchar errorPlan KEY_NOT_FOUND
        throw new DomainError(
          "No fue posible encontrar la clave en el Árbol B.",
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

  /* ───────── Recorridos (sanitizando la banda) ───────── */

  const getPreOrder = () => {
    dlog("getPreOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) {
        throw new Error(
          "No fue posible recorrer en preorden (el Árbol B se encuentra vacío)."
        );
      }
      const seq: TraversalNodeType[] = [];
      preOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetPreOrder", sanitizeSeq(seq)));
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
          "No fue posible recorrer en inorden (el Árbol B se encuentra vacío)."
        );
      }
      const seq: TraversalNodeType[] = [];
      inOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetInOrder", sanitizeSeq(seq)));
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
          "No fue posible recorrer en postorden (el Árbol B se encuentra vacío)."
        );
      }
      const seq: TraversalNodeType[] = [];
      postOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetPostOrder", sanitizeSeq(seq)));
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
          "No fue posible recorrer por niveles (el Árbol B se encuentra vacío)."
        );
      }
      const seq = levelOrderSeq(raiz);
      setQuery(onlySeq("toGetLevelOrder", sanitizeSeq(seq)));
      setError(null);
    } catch (e) {
      handleError(e, "getLevelOrder");
    }
  };

  /* ───────────── Limpieza ───────────── */
  const clean = () => {
    dlog("clean()");
    // Igual que en Arbol23: vaciamos el árbol actual (mismo t, mismo cmp)
    const cloned = tree.clonar();
    cloned.vaciar(true); // si BNodo.reset(1) existe, esto mantiene los ids consistentes
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
      bFix: null,
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
      bFix: null,
    });
  };

  return {
    tree,
    query,
    // BTreeError | null, compatible con LooseError del <Simulator>
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
