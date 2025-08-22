// src/hooks/estructures/arbolRN/useABTree.ts

import { useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { ArbolRojoNegro } from "../../../../../shared/utils/structures/ArbolRojoNegro";

/**
 * Hook de alto nivel para operar sobre un Árbol Roji-Negro.
 * - Clona el árbol antes de mutarlo (estado inmutable para React).
 * - Actualiza la query que consumen las animaciones/renderer.
 * - Expone errores de validación/operación.
 *
 * Importante:
 *  - El color de cada nodo ya viaja en la jerarquía (`HierarchyNodeData.color`)
 *    que emite `ArbolRojoNegro.toHierarchy()`. El renderer solo lee y pinta.
 *  - Si instrumentas tu clase lógica para registrar pasos del fix-up
 *    (rotaciones + recoloreos), envíalos por `query.rbFix`.
 */
export function useABTree(structure: ArbolRojoNegro<number>) {
  // Estado del árbol RB (se guarda la instancia; siempre clonamos antes de mutar)
  const [tree, setTree] = useState(structure);

  // Estado de error para la consola
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

  // Estado de la "query" que usan los renderers/animaciones
  const [query, setQuery] = useState<BaseQueryOperations<"arbol_rojinegro">>({
    /* Operaciones mutables */
    toInsert: null,
    toDelete: null,

    /* Consultas */
    toSearch: null,

    /* Recorridos */
    toGetPreOrder: [],
    toGetInOrder: [],
    toGetPostOrder: [],
    toGetLevelOrder: [],

    /* Limpieza */
    toClear: false,

    /* Pasos del fix-up Roji-Negro (opcional: rotaciones y recoloreos) */
    rbFix: null,
  });

  /* ─────────────────────────────── Operaciones ─────────────────────────────── */

  /** Insertar valor (RB: inserta y aplica fix-up; reporta pasos si están instrumentados) */
  const insertNode = (value: number) => {
    try {
      const cloned = tree.clonar();
      cloned.insertar(value);

      // Si instrumentas la clase con algo como getLastRbFix(), lo leemos aquí:
      // Estructura esperada: { rotations: RbRotation[], recolors: RbRecolor[] }
      const rbFix = (cloned as any).getLastRbFix?.() ?? null; // ✔ seguro aunque no exista aún

      setTree(cloned);

      setQuery((prev) => ({
        ...prev,
        // Si tu renderer usa ID en lugar de valor, cambia a: cloned.get(value)!.getId()
        toInsert: value,
        rbFix,
      }));

      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  /** Eliminar valor (RB: elimina y aplica fix-up; reporta pasos si están instrumentados) */
  const deleteNode = (value: number) => {
    try {
      const cloned = tree.clonar();

      // eliminar() retorna { removed }
      const { removed } = cloned.eliminar(value);

      const rbFix = (cloned as any).getLastRbFix?.() ?? null; // ✔ opcional por ahora

      setTree(cloned);

      setQuery((prev) => ({
        ...prev,
        // Si tu renderer usa ID en lugar de valor, cambia a removed.getId()
        toDelete: removed.getInfo(),
        rbFix,
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
        // rbFix se mantiene como esté; no hay pasos de fix-up en una búsqueda
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
      if (pre.length === 0)
        throw new Error(
          "No fue posible recorrer el árbol (El árbol se encuentra vacío)."
        );

      setQuery((prev) => ({
        ...prev,
        toGetPreOrder: pre.map((n) => ({ id: n.getId(), value: n.getInfo() })),
      }));

      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  };

  const getInOrder = () => {
    try {
      const ino = tree.inOrden();
      if (ino.length === 0)
        throw new Error(
          "No fue posible recorrer el árbol (El árbol se encuentra vacío)."
        );

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
      if (post.length === 0)
        throw new Error(
          "No fue posible recorrer el árbol (El árbol se encuentra vacío)."
        );

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
      if (lvl.length === 0)
        throw new Error(
          "No fue posible recorrer el árbol (El árbol se encuentra vacío)."
        );

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
      rbFix: null,
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
      rbFix: null,
    });
  };

  /* ──────────────────────────── Export del hook ───────────────────────────── */

  return {
    tree, // instancia del árbol (para convertir a jerarquía y dibujar con color)
    query, // flags de operación + rbFix (rotaciones/recoloreos)
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
