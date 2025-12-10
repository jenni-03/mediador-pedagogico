import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { type ArbolBinarioBusqueda } from "../../../../../shared/utils/structures/ArbolBinarioBusqueda";

export function useBinarySearchTree(structure: ArbolBinarioBusqueda<number>) {
    // Estado para gestionar el árbol binario de búsqueda
    const [tree, setTree] = useState(structure);

    // Estado para gestionar el error
    const [error, setError] = useState<{ message: string, id: number, op: string, planId?: string | null } | null>(null);

    // Estado para gestionar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"arbol_binario_busqueda">>({
        toInsert: null,
        toDelete: null,
        toSearch: null,
        toGetPreOrder: null,
        toGetInOrder: null,
        toGetPostOrder: null,
        toGetLevelOrder: null,
        toClear: false
    });

    // Operación para insertar un elemento
    const insertNode = useCallback((value: number) => {
        try {
            const clonedTree = tree.clonarABB();
            const { steps, parent, targetNode, inserted } = clonedTree.insertarABB(value);
            setTree(clonedTree);
            setQuery((prev) => ({
                ...prev,
                toInsert: { steps, parentNodeId: parent?.getId() ?? null, targetNodeId: targetNode!.getId(), inserted }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "insert" });
        }
    }, [tree]);

    // Operación para eliminar un nodo
    const deleteNode = useCallback((value: number) => {
        try {
            const clonedTree = tree.clonarABB();
            const deletedNodeData = clonedTree.eliminarABB(value);
            setTree(clonedTree);

            setQuery((prev) => ({
                ...prev,
                toDelete: {
                    steps: deletedNodeData.steps,
                    parentNodeId: deletedNodeData.parent?.getId() ?? null,
                    targetNodeId: deletedNodeData.targetNode?.getId() ?? null,
                    pathToSuccessorIds: deletedNodeData.pathToSuccessorIds,
                    successorNodeId: deletedNodeData.successor?.getId() ?? null,
                    successorParentNodeId: deletedNodeData.successorParent?.getId() ?? null,
                    replacementNodeId: deletedNodeData.replacement?.getId() ?? null,
                    replacementSide: deletedNodeData.replacementSide,
                    deleted: deletedNodeData.deleted
                }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "delete", planId: error?.code ?? null });
        }
    }, [tree]);

    // Operación para buscar un nodo
    const searchNode = useCallback((value: number) => {
        try {
            if (tree.esVacio()) throw new Error("No fue posible buscar el nodo (El árbol se encuentra vacío)");
            const { steps, targetNode, found } = tree.buscarABB(value);
            setQuery((prev) => ({
                ...prev,
                toSearch: { steps, targetNodeId: targetNode?.getId() ?? null, found }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "search" });
        }
    }, [tree]);

    // Operación para realizar el recorrido en preorden
    const getPreOrder = useCallback(() => {
        try {
            const { steps, visited } = tree.preOrden();
            if (visited.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");
            setQuery((prev) => ({
                ...prev,
                toGetPreOrder: { steps, nodes: visited.map(node => ({ id: node.getId(), value: node.getInfo() })) }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "getPreOrder" });
        }
    }, [tree]);

    // Operación para realizar el recorrido en inorden
    const getInOrder = useCallback(() => {
        try {
            const { steps, visited } = tree.inOrden();
            if (visited.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");
            setQuery((prev) => ({
                ...prev,
                toGetInOrder: { steps, nodes: visited.map(node => ({ id: node.getId(), value: node.getInfo() })) }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "getInOrder" });
        }
    }, [tree]);

    // Operación para realizar el recorrido en postorden
    const getPostOrder = useCallback(() => {
        try {
            const { steps, visited } = tree.postOrden();
            if (visited.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");
            setQuery((prev) => ({
                ...prev,
                toGetPostOrder: { steps, nodes: visited.map(node => ({ id: node.getId(), value: node.getInfo() })) }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "getPostOrder" });
        }
    }, [tree]);

    // Operación para realizar el recorrido por niveles
    const getLevelOrder = useCallback(() => {
        try {
            const { steps, visited } = tree.getNodosPorNiveles();
            if (visited.length === 0) throw new Error("No fue posible recorrer el árbol (El árbol se encuentra vacío).");
            setQuery((prev) => ({
                ...prev,
                toGetLevelOrder: { steps, nodes: visited.map(node => ({ id: node.getId(), value: node.getInfo() })) }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "getLevelOrder" });
        }
    }, [tree]);

    // Operación para vaciar el árbol
    const clearTree = useCallback(() => {
        const cloned = tree.clonarABB();
        cloned.vaciar();
        setTree(cloned);
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
            toGetPreOrder: null,
            toGetInOrder: null,
            toGetPostOrder: null,
            toGetLevelOrder: null,
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