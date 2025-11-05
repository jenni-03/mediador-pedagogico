import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { type ArbolBinarioBusqueda } from "../../../../../shared/utils/structures/ArbolBinarioBusqueda";

export function useBinarySearchTree(structure: ArbolBinarioBusqueda<number>) {
    // Estado para manejar el árbol binario de búsqueda
    const [tree, setTree] = useState(structure);

    // Estado para manejar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para manejar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"arbol_binario_busqueda">>({
        toInsert: null,
        toDelete: null,
        toSearch: null,
        toGetPreOrder: [],
        toGetInOrder: [],
        toGetPostOrder: [],
        toGetLevelOrder: [],
        toClear: false
    });

    // Operación para insertar un nodo en el árbol
    const insertNode = useCallback((value: number) => {
        try {
            // Clonación del árbol para garantizar la inmutabilidad del estado
            const clonedTree = tree.clonarABB();

            // Inserción del nuevo nodo
            const { pathIds, parent, targetNode, exists } = clonedTree.insertarABB(value);

            // Actualización del estado del árbol
            setTree(clonedTree);

            // Actualización de la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toInsert: { pathIds, parentId: parent?.getId() ?? null, targetNodeId: targetNode.getId(), exists }
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [tree]);

    // Operación para eliminar un nodo del árbol
    const deleteNode = useCallback((value: number) => {
        try {
            // Clonación del árbol para asegurar la inmutabilidad del estado
            const clonedTree = tree.clonarABB();

            // Eliminación del nodo
            const deletedNodeData = clonedTree.eliminarABB(value);

            // Actualización del estado del árbol
            setTree(clonedTree);

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
                }
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
            const { pathIds, found, lastVisited } = tree.buscarABB(value);

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
            // Obtención del recorrido preorden del árbol
            const preorder = tree.preOrden();

            // Verificación de la existencia de nodos
            if (preorder.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");

            // Actualización de la query a partir de la operación realizada
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
            // Obtención del recorrido inorden del árbol
            const inorder = tree.inOrden();

            // Verificación de la existencia de nodos
            if (inorder.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");

            // Actualización de la query a partir de la operación realizada
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
            // Obtención del recorrido postorden del árbol
            const postorder = tree.postOrden();

            // Verificación de la existencia de nodos
            if (postorder.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");

            // Actualización de la query a partir de la operación realizada
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
            // Obtención del recorrido por niveles del árbol
            const levelOrder = tree.getNodosPorNiveles();

            // Verificación de la existencia de nodos
            if (levelOrder.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");

            // Actualización de la query a partir de la operación realizada
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
        // Clonación del árbol para asegurar la inmutabilidad del estado
        const cloned = tree.clonarABB();

        // Vaciar el árbol
        cloned.vaciar();

        // Actualización del estado del árbol
        setTree(cloned);

        // Actualización de la query a partir de la operación realizada
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
            toClear: false
        })
    }, []);

    // Objeto de operaciones estable
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
    }
}