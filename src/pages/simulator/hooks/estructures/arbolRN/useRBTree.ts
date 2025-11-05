import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { type ArbolRojoNegro } from "../../../../../shared/utils/structures/ArbolRojoNegro";

export function useRBTree(structure: ArbolRojoNegro<number>) {
  // Estado para manejar el árbol RB
  const [tree, setTree] = useState(structure);

  // Estado de error para la consola
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

  // Estado de la "query" que usan los renderers/animaciones
  const [query, setQuery] = useState<BaseQueryOperations<"arbol_rojinegro">>({
    toInsert: null,
    toDelete: null,
    toSearch: null,
    toGetPreOrder: [],
    toGetInOrder: [],
    toGetPostOrder: [],
    toGetLevelOrder: [],
    toClear: false,
    rbTrace: null
  });

  // Operación para insertar un nodo en el árbol
  const insertNode = useCallback((value: number) => {
    try {
      // Clonación del árbol para garantizar la inmutabilidad del estado
      const cloned = tree.clonarRB();

      // Inserción del nuevo nodo
      const { pathIds, parent, targetNode, exists } = cloned.insertarRB(value);

      // Obtención de la traza de recoloreos y rotaciones
      const trace = cloned.consumeLastRbTrace();

      // Actualización del estado del árbol
      setTree(cloned);

      // Actualización de la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toInsert: { pathIds, parentId: parent?.getId() ?? null, targetNodeId: targetNode.getId(), exists },
        rbTrace: trace
      }));

      // Limpieza del error existente
      setError(null);
    } catch (e: any) {
      setError({ message: e.message, id: Date.now() });
    }
  }, [tree]);

  // Operación para eliminar un nodo del árbol
  const deleteNode = useCallback((value: number) => {
    try {
      // Clonación del árbol para asegurar la inmutabilidad del estado
      const cloned = tree.clonarRB();

      // Eliminación del nodo
      const deletedNodeData = cloned.eliminarRB(value);

      // Obtención de la traza de recoloreos y rotaciones
      const trace = cloned.consumeLastRbTrace();

      // Actualización del estado del árbol
      setTree(cloned);

      // Actualización de la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toDelete: {
          pathToTargetIds: deletedNodeData.pathToTargetIds,
          parentId: deletedNodeData.parent?.getId() ?? null,
          targetNodeId: deletedNodeData.targetNode.getId(),
          pathToSuccessorIds: deletedNodeData.pathToSuccessorIds,
          successorId: deletedNodeData.successor?.getId() ?? null,
          replacementId: deletedNodeData.replacement?.getId() ?? null,
          exists: deletedNodeData.exists
        },
        rbTrace: trace
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [tree]);

  // Operación para buscar un nodo en el árbol
  const searchNode = useCallback((value: number) => {
    try {
      // Búsqueda del nodo en el árbol
      const { pathIds, found, lastVisited } = tree.buscarRB(value);

      // Verificación del proceso de búsqueda
      if (!lastVisited) {
        throw new Error("No fue posible buscar el nodo (El árbol se encuentra vacío)");
      }

      // Actualización de la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toSearch: { pathIds, found, lastVisitedId: lastVisited.getId() }
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [tree]);

  // Operación para obtener el recorrido en preorden
  const getPreOrder = useCallback(() => {
    try {
      // Obtener el recorrido en preorden del árbol
      const preorder = tree.preOrden();

      // Verificar la existencia de nodos
      if (preorder.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");

      // Actualizar la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toGetPreOrder: preorder.map(node => ({ id: node.getId(), value: node.getInfo() }))
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [tree]);

  // Operación para obtener el recorrido en inorden
  const getInOrder = useCallback(() => {
    try {
      // Obtener el recorrido en inorden del árbol
      const inorder = tree.inOrden();

      // Verificar la existencia de nodos
      if (inorder.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");

      // Actualizar la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toGetInOrder: inorder.map(node => ({ id: node.getId(), value: node.getInfo() }))
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [tree]);

  // Operación para obtener el recorrido en postorden
  const getPostOrder = useCallback(() => {
    try {
      // Obtener el recorrido en postorden del árbol
      const postorder = tree.postOrden();

      // Verificar la existencia de nodos
      if (postorder.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");

      // Actualizar la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toGetPostOrder: postorder.map(node => ({ id: node.getId(), value: node.getInfo() }))
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [tree]);

  // Operación para obtener el recorrido por niveles
  const getLevelOrder = useCallback(() => {
    try {
      // Obtener el recorrido por niveles del árbol
      const levelOrder = tree.getNodosPorNiveles();

      // Verificar la existencia de nodos
      if (levelOrder.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");

      // Actualizar la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toGetLevelOrder: levelOrder.map(node => ({ id: node.getId(), value: node.getInfo() }))
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [tree]);

  // Operación para vaciar el árbol
  const clearTree = useCallback(() => {
    // Clonar el árbol para asegurar la inmutabilidad del estado
    const cloned = tree.clonarRB();

    // Vaciar el árbol
    cloned.vaciar();

    // Actualizar el estado del árbol
    setTree(cloned);

    // Actualizar la query a partir de la operación realizada
    setQuery((prev) => ({
      ...prev,
      toClear: true
    }));
  }, [tree]);

  // Función de restablecimiento de las queries del usuario
  const resetQueryValues = useCallback(() => {
    setQuery({
      toInsert: null,
      toDelete: null,
      toSearch: null,
      toGetPreOrder: [],
      toGetInOrder: [],
      toGetPostOrder: [],
      toGetLevelOrder: [],
      toClear: false,
      rbTrace: null
    });
  }, []);

  const operations = useMemo(() => ({
    insertNode,
    deleteNode,
    searchNode,
    getPreOrder,
    getInOrder,
    getPostOrder,
    getLevelOrder,
    clearTree,
    resetQueryValues,
  }), [
    insertNode, deleteNode, searchNode,
    getPreOrder, getInOrder, getPostOrder, getLevelOrder,
    clearTree, resetQueryValues
  ]);

  return {
    tree,
    query,
    error,
    operations
  };
}