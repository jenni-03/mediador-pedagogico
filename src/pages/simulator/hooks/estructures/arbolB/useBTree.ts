// src/hooks/estructures/btree/useBTree.ts
import { useState } from "react";
import { BaseQueryOperations, TraversalNodeType } from "../../../../../types";
import { ArbolB } from "../../../../../shared/utils/structures/ArbolB";

const DEBUG_B = true;
const dlog = (...a: any[]) => {
  if (DEBUG_B) console.log("[useBTree]", ...a);
};

// helper: normali  za a id de DOM (string con prefijo) para el renderer/D3
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
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

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
    } catch (e: any) {
      dlog("insert(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
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
    } catch (e: any) {
      dlog("delete(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ───────────── Búsqueda ───────────── */
  const search = (value: number) => {
    dlog("search(arg):", value);
    try {
      if (!tree.contiene(value)) {
        throw new Error("No fue posible encontrar la clave en el árbol.");
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
    } catch (e: any) {
      dlog("search(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ───────── Al setear query, sanitizar la secuencia ───────── */

  const getPreOrder = () => {
    dlog("getPreOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) throw new Error("Árbol vacío.");
      const seq: TraversalNodeType[] = [];
      preOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetPreOrder", sanitizeSeq(seq))); // ← sanitize
      setError(null);
    } catch (e: any) {
      dlog("getPreOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getInOrder = () => {
    dlog("getInOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) throw new Error("Árbol vacío.");
      const seq: TraversalNodeType[] = [];
      inOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetInOrder", sanitizeSeq(seq))); // ← sanitize
      setError(null);
    } catch (e: any) {
      dlog("getInOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getPostOrder = () => {
    dlog("getPostOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) throw new Error("Árbol vacío.");
      const seq: TraversalNodeType[] = [];
      postOrderSeq(raiz, seq);
      setQuery(onlySeq("toGetPostOrder", sanitizeSeq(seq))); // ← sanitize
      setError(null);
    } catch (e: any) {
      dlog("getPostOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getLevelOrder = () => {
    dlog("getLevelOrder()");
    try {
      const raiz = tree.getRaiz() as unknown as N | null;
      if (!raiz) throw new Error("Árbol vacío.");
      const seq = levelOrderSeq(raiz);
      setQuery(onlySeq("toGetLevelOrder", sanitizeSeq(seq))); // ← sanitize
      setError(null);
    } catch (e: any) {
      dlog("getLevelOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ───────────── Limpieza ───────────── */
  const clean = () => {
    dlog("clean()");
    const fresh = new ArbolB<number, number>((a, b) => a - b, 2); // o conserva el t actual si lo guardas aparte
    setTree(fresh);
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
