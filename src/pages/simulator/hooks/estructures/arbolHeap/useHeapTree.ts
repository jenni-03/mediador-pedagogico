import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { ArbolHeap } from "../../../../../shared/utils/structures/ArbolHeap";

export function useHeapTree(structure: ArbolHeap<number>) {
  // Estado para manejar el árbol heap
  const [heap, setHeap] = useState(structure);

  // Estado para manejar el error
  const [error, setError] = useState<{ message: string; id: number } | null>(
    null
  );

  // Estado para manejar la operación solicitada por el usuario
  const [query, setQuery] = useState<BaseQueryOperations<"arbol_heap">>({
    toInsert: null,
    toDeleteRoot: [],
    toSearch: null,
    toPeek: null,
    toGetLevelOrder: [],
    toClear: false,
    swapPath: [],
  });

  // // Operación de inserción en el heap
  // const insertElement = useCallback(
  //   (value: number) => {
  //     try {
  //       // Clonar el heap para garantizar la inmutabilidad del estado
  //       const clonedHeap = heap.clonar();

  //       // Insertar el nuevo elemento
  //       const insertedNode = clonedHeap.insertar(value);

  //       // Actualizar el estado del heap
  //       setHeap(clonedHeap);

  //       // Actualizar la query a partir de la operación realizada
  //       setQuery((prev) => ({
  //         ...prev,
  //         toInsert: insertedNode.getId(),
  //       }));

  //       // Limpieza del error existente
  //       setError(null);
  //     } catch (error: any) {
  //       setError({ message: error.message, id: Date.now() });
  //     }
  //   },
  //   [heap]
  // );
  
  // Operación de inserción en el heap
  const insertElement = useCallback(
    (value: number) => {
      try {
        const clonedHeap = heap.clonar();

        // Insertar con traza
        const { nodo, swapPath } = clonedHeap.insertar(value);

        setHeap(clonedHeap);

        // Guardamos en query el ID del nodo insertado y la ruta de swaps
        setQuery((prev) => ({
          ...prev,
          toInsert: nodo.getId(),
          swapPath,
        }));

        setError(null);
      } catch (error: any) {
        setError({ message: error.message, id: Date.now() });
      }
    },
    [heap]
  );

  // Operación para eliminar la raíz del heap (extraer máximo/mínimo)
  const deleteRoot = useCallback(() => {
    try {
      // Clonar el heap para asegurar la inmutabilidad del estado
      const clonedHeap = heap.clonar();

      // Obtener la raíz antes de eliminarla para acceder a su ID
      const rootNode = clonedHeap.getRaiz();
      if (!rootNode) {
        throw new Error("No fue posible extraer la raíz: El heap está vacío.");
      }

      const rootId = rootNode.getId().toString();

      // Extraer la raíz del heap
      clonedHeap.extraerRaiz();

      // Actualizar el estado del heap
      setHeap(clonedHeap);

      // Obtener el nodo que quedó en la raíz (si existe)
      const newRootNode = clonedHeap.getRaiz();
      const newRootId = newRootNode ? newRootNode.getId().toString() : null;

      // Actualizar la query a partir de la operación realizada
      // Formato: [nodo_eliminado_id, nodo_que_tomó_su_lugar_id]
      setQuery((prev) => ({
        ...prev,
        toDeleteRoot: [rootId, newRootId],
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [heap]);

  // Operación para buscar un elemento en el heap
  const searchElement = useCallback(
    (value: number) => {
      try {
        // Buscar el elemento en el heap
        const foundElement = heap.esta(value);

        // Verificar su existencia
        if (!foundElement) {
          throw new Error("No fue posible encontrar el elemento en el heap.");
        }

        // Actualizar la query para informar de la operación realizada
        setQuery((prev) => ({
          ...prev,
          toSearch: value,
        }));

        // Limpieza del error existente
        setError(null);
      } catch (error: any) {
        setError({ message: error.message, id: Date.now() });
      }
    },
    [heap]
  );

  // Operación para obtener el elemento raíz sin eliminarlo (peek)
  const peekRoot = useCallback(() => {
    try {
      // Obtener el elemento raíz
      const rootValue = heap.peek();

      // Verificar que el heap no esté vacío
      if (rootValue === null) {
        throw new Error("No fue posible obtener la raíz: El heap está vacío.");
      }

      // Actualizar la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toPeek: rootValue,
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [heap]);

  // Operación para obtener el recorrido por niveles del heap
  const getLevelOrder = useCallback(() => {
    try {
      // Obtener el recorrido por niveles del heap
      const levelOrder = heap.getNodosPorNiveles();

      // Verificar la existencia de nodos
      if (levelOrder.length === 0) {
        throw new Error("No fue posible recorrer el heap: El heap está vacío.");
      }

      // Actualizar la query a partir de la operación realizada
      setQuery((prev) => ({
        ...prev,
        toGetLevelOrder: levelOrder.map((node) => ({
          id: node.getId(),
          value: node.getInfo(),
        })),
      }));

      // Limpieza del error existente
      setError(null);
    } catch (error: any) {
      setError({ message: error.message, id: Date.now() });
    }
  }, [heap]);

  // Operación para vaciar el heap
  const clearHeap = useCallback(() => {
    // Clonar el heap para asegurar la inmutabilidad del estado
    const clonedHeap = heap.clonar();

    // Vaciar el heap
    clonedHeap.vaciar();

    // Actualizar el estado del heap
    setHeap(clonedHeap);

    // Actualizar la query a partir de la operación realizada
    setQuery((prev) => ({
      ...prev,
      toClear: true,
    }));
  }, [heap]);

  // Función de restablecimiento de las queries del usuario
  const resetQueryValues = useCallback(() => {
    setQuery({
      toInsert: null,
      toDeleteRoot: [],
      toSearch: null,
      toPeek: null,
      toGetLevelOrder: [],
      toClear: false,
      swapPath: [],
    });
  }, []);

  // Objeto de operaciones estable
  const operations = useMemo(
    () => ({
      insertElement,
      deleteRoot,
      searchElement,
      peekRoot,
      getLevelOrder,
      clearHeap,
      resetQueryValues,
    }),
    [
      insertElement,
      deleteRoot,
      searchElement,
      peekRoot,
      getLevelOrder,
      clearHeap,
      resetQueryValues,
    ]
  );

  return {
    heap,
    query,
    error,
    operations,
  };
}
