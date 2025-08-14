// src/hooks/estructures/avl/useAVLTree.ts

import { useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { ArbolAVL } from "../../../../../shared/utils/structures/ArbolAVL";

/**
 * Hook de alto nivel para operar sobre un Árbol AVL.
 * - Clona el árbol antes de mutarlo (estado inmutable para React).
 * - Actualiza la query que consumen las animaciones/renderer.
 * - Expone errores de validación/operación.
 *
 * IMPORTANTE:
 *  - El factor de equilibrio (bf) y altura (height) ya viajan en el árbol
 *    a través de `toHierarchy()` (lo agregaste en ArbolAVL.ts).
 *  - La rotación que se haya hecho durante la operación actual
 *    se envía en `query.rotation` usando `getLastRotation()`.
 */
export function useAVLTree(structure: ArbolAVL<number>) {
  // Estado del árbol AVL (se guarda la instancia; siempre clonamos antes de mutar)
  const [tree, setTree] = useState(structure);

  // Estado de error para la consola
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

  // Estado de la "query" que usan los renderers/animaciones
  const [query, setQuery] = useState<BaseQueryOperations<"arbol_avl">>({
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetPreOrder: [],
    toGetInOrder: [],
    toGetPostOrder: [],
    toGetLevelOrder: [],
    toClear: false,
    rotation: null, // <- aquí reportamos la rotación (si hubo)
  });

  /* ─────────────────────────────── Operaciones ─────────────────────────────── */

  /** Insertar valor (AVL: inserta, rebalancea y reporta rotación si aplica) */
  const insertNode = (value: number) => {
    try {
      const cloned = tree.clonar();
      cloned.insertar(value);

      // Rotación detectada por rebalancear() en ArbolAVL
      const rotation = cloned.getLastRotation();

      // Guardamos el árbol resultante
      setTree(cloned);

      // Disparamos la animación de inserción y enviamos la rotación
      setQuery((prev) => ({
        ...prev,
        toInsert: value, // si tu renderer usa ID, cambia a: cloned.get(value)!.getId()
        rotation: rotation ?? null, // LL, LR, RR, RL o null si no hubo rotación
      }));

      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  /** Eliminar valor (AVL: elimina, rebalancea y reporta rotación si aplica) */
  const deleteNode = (value: number) => {
    try {
      const cloned = tree.clonar();

      // eliminar() ahora retorna { removed, updated? }
      const { removed /*, updated*/ } = cloned.eliminar(value);

      // Rotación detectada durante la eliminación
      const rotation = cloned.getLastRotation();

      setTree(cloned);

      // En la animación, borramos el *eliminado físico* (sucesor si hubo 2 hijos)
      setQuery((prev) => ({
        ...prev,
        toDelete: removed.getInfo(), // si tu renderer usa ID, cambia a removed.getId()
        rotation: rotation ?? null,
        // Si quisieras animar "copia de valor" cuando hay 2 hijos:
        // toUpdateId: updated?.getId()
      }));

      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  /** Buscar un valor (solo camino/animación de búsqueda) */
  const searchNode = (value: number) => {
    try {
      const found = tree.esta(value);
      if (!found) throw new Error("No fue posible encontrar el nodo.");

      setQuery((prev) => ({
        ...prev,
        toSearch: value,
        // rotation se mantiene como está; no hay rotación en búsquedas
      }));

      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ─────────────────────────────── Recorridos ─────────────────────────────── */

  const getPreOrder = () => {
    try {
      const pre = tree.preOrden();
      if (pre.length === 0) {
        throw new Error(
          "No fue posible recorrer el árbol (El árbol se encuentra vacío)."
        );
      }
      setQuery((prev) => ({
        ...prev,
        toGetPreOrder: pre.map((n) => ({ id: n.getId(), value: n.getInfo() })),
        // rotation: no aplica en recorridos
      }));
      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getInOrder = () => {
    try {
      const ino = tree.inOrden();
      if (ino.length === 0) {
        throw new Error(
          "No fue posible recorrer el árbol (El árbol se encuentra vacío)."
        );
      }
      setQuery((prev) => ({
        ...prev,
        toGetInOrder: ino.map((n) => ({ id: n.getId(), value: n.getInfo() })),
      }));
      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getPostOrder = () => {
    try {
      const post = tree.postOrden();
      if (post.length === 0) {
        throw new Error(
          "No fue posible recorrer el árbol (El árbol se encuentra vacío)."
        );
      }
      setQuery((prev) => ({
        ...prev,
        toGetPostOrder: post.map((n) => ({
          id: n.getId(),
          value: n.getInfo(),
        })),
      }));
      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getLevelOrder = () => {
    try {
      const lvl = tree.getNodosPorNiveles();
      if (lvl.length === 0) {
        throw new Error(
          "No fue posible recorrer el árbol (El árbol se encuentra vacío)."
        );
      }
      setQuery((prev) => ({
        ...prev,
        toGetLevelOrder: lvl.map((n) => ({
          id: n.getId(),
          value: n.getInfo(),
        })),
      }));
      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  /* ────────────────────────────── Limpieza ─────────────────────────────── */

  /** Vaciar por completo el árbol */
  const clearTree = () => {
    const cloned = tree.clonar();
    cloned.vaciar();
    setTree(cloned);

    setQuery((prev) => ({
      ...prev,
      toClear: true,
      rotation: null, // limpiar indicador de rotación
    }));
  };

  /** Resetear la query a su estado neutro (tras terminar animaciones) */
  const resetQueryValues = () => {
    setQuery({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetPreOrder: [],
      toGetInOrder: [],
      toGetPostOrder: [],
      toGetLevelOrder: [],
      toClear: false,
      rotation: null, // limpiar rotación
    });
  };

  /* ──────────────────────────── Export del hook ───────────────────────────── */

  return {
    tree, // instancia del árbol (para convertir a jerarquía y dibujar con bf/height)
    query, // flags de operación + rotation
    error,
    operations: {
      insertNode,
      deleteNode,
      searchNode,
      getPreOrder,
      getInOrder,
      getPostOrder,
      getLevelOrder,
      clearTree,
      resetQueryValues,
    },
  };
}
