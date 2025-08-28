// src/hooks/estructures/nario/useNaryTree.ts
import { useState } from "react";
import { BaseQueryOperations, TraversalNodeType } from "../../../../../types";
import { ArbolNario } from "../../../../../shared/utils/structures/ArbolNario";

const DEBUG_NARY = true;
const dlog = (...a: any[]) => {
  if (DEBUG_NARY) console.log("[useNaryTree]", ...a);
};

// helper: normaliza a id de DOM (string con prefijo) para el renderer/D3
const toDomId = (id: number | string) =>
  typeof id === "number" ? `n-${id}` : id;

export function useNaryTree(structure: ArbolNario<number>) {
  const [tree, setTree] = useState(structure);
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

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
    } catch (e: any) {
      dlog("createRoot(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
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
    } catch (e: any) {
      dlog(
        "insertChild(ERROR):",
        e?.message,
        "| received parentId/value/index:",
        parentId,
        value,
        index
      );
      setError({ message: e.message, id: Date.now() });
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
    } catch (e: any) {
      dlog("deleteNode(ERROR):", e?.message, "| received id:", id);
      setError({ message: e.message, id: Date.now() });
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
      const domId = toDomId(id),
        domParent = toDomId(newParentId);
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
    } catch (e: any) {
      dlog("moveNode(ERROR):", e?.message, "| received:", {
        id,
        newParentId,
        index,
      });
      setError({ message: e.message, id: Date.now() });
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
    } catch (e: any) {
      dlog(
        "updateValue(ERROR):",
        e?.message,
        "| received id/newValue:",
        id,
        newValue
      );
      setError({ message: e.message, id: Date.now() });
    }
  };

  const search = (value: number) => {
    dlog("search(arg):", value);
    try {
      const found = tree.getPorValor(value);
      if (!found)
        throw new Error("No fue posible encontrar el nodo con ese valor.");
      setQuery((prev) => ({ ...prev, toSearch: value }));
      setError(null);
    } catch (e: any) {
      dlog("search(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  // Recorridos (sin cambios de lógica, solo logs mínimos)
  const mapNodes = (nodes: { getId: () => number; getInfo: () => number }[]) =>
    nodes.map<TraversalNodeType>((n) => ({
      id: toDomId(n.getId()) as any,
      value: n.getInfo(),
    }));

  const getPreOrder = () => {
    dlog("getPreOrder()");
    try {
      const pre = tree.preOrden();
      if (pre.length === 0)
        throw new Error(
          "No fue posible recorrer (El árbol se encuentra vacío)."
        );
      setQuery((p) => ({ ...p, toGetPreOrder: mapNodes(pre as any) }));
      setError(null);
    } catch (e: any) {
      dlog("getPreOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getPostOrder = () => {
    dlog("getPostOrder()");
    try {
      const post = tree.postOrden();
      if (post.length === 0)
        throw new Error(
          "No fue posible recorrer (El árbol se encuentra vacío)."
        );
      setQuery((p) => ({ ...p, toGetPostOrder: mapNodes(post as any) }));
      setError(null);
    } catch (e: any) {
      dlog("getPostOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getLevelOrder = () => {
    dlog("getLevelOrder()");
    try {
      const lvl = tree.getNodosPorNiveles();
      if (lvl.length === 0)
        throw new Error(
          "No fue posible recorrer (El árbol se encuentra vacío)."
        );
      setQuery((p) => ({ ...p, toGetLevelOrder: mapNodes(lvl as any) }));
      setError(null);
    } catch (e: any) {
      dlog("getLevelOrder(ERROR):", e?.message);
      setError({ message: e.message, id: Date.now() });
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
    error,
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
