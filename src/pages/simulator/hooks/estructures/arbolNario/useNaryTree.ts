// src/hooks/estructures/nario/useNaryTree.ts
import { useState } from "react";
import {
  BaseQueryOperations,
  TraversalNodeType,
} from "../../../../../types";
import {
  ArbolNario,
  type NaryErrorCode,
} from "../../../../../shared/utils/structures/ArbolNario";
import { DomainError } from "../../../../../shared/utils/error/DomainError";

const DEBUG_NARY = true;
const dlog = (...a: any[]) => {
  if (DEBUG_NARY) console.log("[useNaryTree]", ...a);
};

// helper: normaliza a id de DOM (string con prefijo) para el renderer/D3
const toDomId = (id: number | string) =>
  typeof id === "number" ? `n-${id}` : id;

/* ────────────────── Tipos de error/op para el simulador ────────────────── */

type NaryOp =
  | "createRoot"
  | "insertChild"
  | "deleteNode"
  | "moveNode"
  | "updateValue"
  | "search"
  | "getPreOrder"
  | "getPostOrder"
  | "getLevelOrder"
  | "clean";

type NaryErrorPlanId = NaryErrorCode;

export type NaryError = {
  id: number; // necesario para <Simulator>
  message: string;
  op: NaryOp;
  planId?: NaryErrorPlanId | null;
};

export function useNaryTree(structure: ArbolNario<number>) {
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<NaryError | null>(null);

  const [query, setQuery] = useState<BaseQueryOperations<"arbol_nario">>({
    toCreateRoot: null,
    toInsertChild: [],
    toDeleteNode: null,
    toMoveNode: [],
    toUpdateValue: [],
    toSearch: null,
    toGetPreOrder: [],
    toGetPostOrder: [],
    toGetLevelOrder: [],
    toClear: false,
  });

  /* ─────────────────────────── helper de errores ─────────────────────────── */

  const handleError = (err: unknown, op: NaryOp) => {
    if (err instanceof DomainError) {
      dlog(op, "DomainError:", err.message, "code:", err.code);
      setError({
        id: Date.now(),
        message: err.message,
        op,
        planId: (err.code as NaryErrorPlanId) ?? null,
      });
      return;
    }

    const msg =
      err && typeof (err as any).message === "string"
        ? (err as any).message
        : "Ocurrió un error inesperado en la operación del árbol N-ario.";
    dlog(op, "GENERIC_ERROR:", msg, "| raw:", err);

    setError({
      id: Date.now(),
      message: msg,
      op,
      planId: null,
    });
  };

  /* ─────────────────────────────── operaciones ─────────────────────────────── */

  const createRoot = (value: number) => {
    dlog("createRoot(arg):", value, "typeof:", typeof value);
    try {
      const cloned = tree.clonar();
      cloned.crearRaiz(value);
      setTree(cloned);
      setQuery((p) => ({
        ...p,
        toCreateRoot: value,
        toInsertChild: [],
        toDeleteNode: null,
        toMoveNode: [],
        toUpdateValue: [],
        toClear: false,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "createRoot");
    }
  };

  const insertChild = (parentId: number, value: number, index?: number) => {
    dlog(
      "insertChild(args): parentId=",
      parentId,
      "typeof:",
      typeof parentId,
      "| value=",
      value,
      "index=",
      index
    );
    try {
      const cloned = tree.clonar();
      const nuevo = cloned.insertarHijo(parentId, value, index);
      const domParent = toDomId(parentId);
      dlog(
        "insertChild -> nuevo.id (num):",
        nuevo.getId(),
        "| domParent:",
        domParent
      );

      setTree(cloned);
      setQuery((prev) => ({
        ...prev,
        toInsertChild:
          index === undefined ? [domParent, value] : [domParent, value, index],
        toCreateRoot: null,
        toDeleteNode: null,
        toMoveNode: [],
        toUpdateValue: [],
        toClear: false,
      }));
      setError(null);
      return nuevo.getId();
    } catch (e) {
      handleError(e, "insertChild");
      return null;
    }
  };

  const deleteNode = (id: number) => {
    dlog("deleteNode(arg): id=", id, "typeof:", typeof id);
    try {
      const cloned = tree.clonar();
      cloned.eliminarNodo(id);
      const domId = toDomId(id);
      dlog("deleteNode -> domId:", domId);

      setTree(cloned);
      setQuery((prev) => ({
        ...prev,
        toDeleteNode: domId,
        toInsertChild: [],
        toCreateRoot: null,
        toMoveNode: [],
        toUpdateValue: [],
        toClear: false,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "deleteNode");
    }
  };

  const moveNode = (id: number, newParentId: number, index?: number) => {
    dlog(
      "moveNode(args): id=",
      id,
      "newParentId=",
      newParentId,
      "index=",
      index
    );
    try {
      const cloned = tree.clonar();
      cloned.moverNodo(id, newParentId, index);
      const domId = toDomId(id);
      const domParent = toDomId(newParentId);
      dlog("moveNode -> domId/domParent:", domId, domParent);

      setTree(cloned);
      setQuery((prev) => ({
        ...prev,
        toMoveNode:
          index === undefined ? [domId, domParent] : [domId, domParent, index],
        toInsertChild: [],
        toDeleteNode: null,
        toCreateRoot: null,
        toUpdateValue: [],
        toClear: false,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "moveNode");
    }
  };

  const updateValue = (id: number, newValue: number) => {
    dlog("updateValue(args): id=", id, "newValue=", newValue);
    try {
      const cloned = tree.clonar();
      cloned.actualizarValor(id, newValue);
      const domId = toDomId(id);
      dlog("updateValue -> domId:", domId);

      setTree(cloned);
      setQuery((prev) => ({
        ...prev,
        toUpdateValue: [domId, newValue],
        toInsertChild: [],
        toDeleteNode: null,
        toMoveNode: [],
        toCreateRoot: null,
        toClear: false,
      }));
      setError(null);
    } catch (e) {
      handleError(e, "updateValue");
    }
  };

  const search = (value: number) => {
    dlog("search(arg):", value);
    try {
      // Versión estricta que lanza DomainError si no encuentra
      tree.buscarPorValor(value);
      setQuery((prev) => ({ ...prev, toSearch: value }));
      setError(null);
    } catch (e) {
      handleError(e, "search");
    }
  };

  /* ───────────────────────────── Recorridos ───────────────────────────── */

  const mapNodes = (nodes: { getId: () => number; getInfo: () => number }[]) =>
    nodes.map<TraversalNodeType>((n) => ({
      id: toDomId(n.getId()) as any,
      value: n.getInfo(),
    }));

  const getPreOrder = () => {
    dlog("getPreOrder()");
    try {
      const pre = tree.preOrden();
      if (pre.length === 0) {
        throw new Error(
          "No fue posible recorrer en preorden (el árbol se encuentra vacío)."
        );
      }
      setQuery((p) => ({ ...p, toGetPreOrder: mapNodes(pre as any) }));
      setError(null);
    } catch (e) {
      handleError(e, "getPreOrder");
    }
  };

  const getPostOrder = () => {
    dlog("getPostOrder()");
    try {
      const post = tree.postOrden();
      if (post.length === 0) {
        throw new Error(
          "No fue posible recorrer en postorden (el árbol se encuentra vacío)."
        );
      }
      setQuery((p) => ({ ...p, toGetPostOrder: mapNodes(post as any) }));
      setError(null);
    } catch (e) {
      handleError(e, "getPostOrder");
    }
  };

  const getLevelOrder = () => {
    dlog("getLevelOrder()");
    try {
      const lvl = tree.getNodosPorNiveles();
      if (lvl.length === 0) {
        throw new Error(
          "No fue posible recorrer por niveles (el árbol se encuentra vacío)."
        );
      }
      setQuery((p) => ({ ...p, toGetLevelOrder: mapNodes(lvl as any) }));
      setError(null);
    } catch (e) {
      handleError(e, "getLevelOrder");
    }
  };

  const clean = () => {
    dlog("clean()");
    const cloned = tree.clonar();
    cloned.vaciar();
    setTree(cloned);
    setQuery((p) => ({
      ...p,
      toClear: true,
      toCreateRoot: null,
      toInsertChild: [],
      toDeleteNode: null,
      toMoveNode: [],
      toUpdateValue: [],
      toSearch: null,
      toGetPreOrder: [],
      toGetPostOrder: [],
      toGetLevelOrder: [],
    }));
    setError(null);
  };

  const resetQueryValues = () => {
    dlog("resetQueryValues()");
    setQuery({
      toCreateRoot: null,
      toInsertChild: [],
      toDeleteNode: null,
      toMoveNode: [],
      toUpdateValue: [],
      toSearch: null,
      toGetPreOrder: [],
      toGetPostOrder: [],
      toGetLevelOrder: [],
      toClear: false,
    });
  };

  return {
    tree,
    query,
    error, // NaryError | null (compatible con LooseError del <Simulator>)
    operations: {
      createRoot,
      insertChild,
      deleteNode,
      moveNode,
      updateValue,
      search,
      getPreOrder,
      getPostOrder,
      getLevelOrder,
      clean,
      resetQueryValues,
    },
  };
}
