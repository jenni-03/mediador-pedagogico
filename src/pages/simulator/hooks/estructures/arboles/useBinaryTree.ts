import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { type ArbolBinario } from "../../../../../shared/utils/structures/ArbolBinario";

export function useBinaryTree(structure: ArbolBinario<number>) {
    // Estado para gestionar el árbol binario
    const [tree, setTree] = useState(structure);

    // Estado para gestionar el error
    const [error, setError] = useState<{ message: string, id: number, op: string, planId?: string | null } | null>(null);

    // Estado para gestionar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"arbol_binario">>({
        toInsertLeft: null,
        toInsertRight: null,
        toDelete: null,
        toSearch: null,
        toGetPreOrder: null,
        toGetInOrder: null,
        toGetPostOrder: null,
        toGetLevelOrder: null,
        toClear: false
    });

    // Operación para insertar un elemento como hijo izquierdo
    const insertLeftChild = useCallback((parent: number, value: number) => {
        try {
            const clonedTree = tree.clonar();
            const { steps, parent: parentNode, targetNode, inserted } = clonedTree.insertarHijoIzq(parent, value);
            setTree(clonedTree);

            setQuery((prev) => ({
                ...prev,
                toInsertLeft: { steps, parentNodeId: parentNode?.getId() ?? null, targetNodeId: targetNode.getId(), inserted }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "insertLeft" });
        }
    }, [tree]);

    // Operación para insertar un elemento como hijo derecho
    const insertRightChild = useCallback((parent: number, value: number) => {
        try {
            const clonedTree = tree.clonar();
            const { steps, parent: parentNode, targetNode, inserted } = clonedTree.insertarHijoDer(parent, value);
            setTree(clonedTree);

            setQuery((prev) => ({
                ...prev,
                toInsertRight: { steps, parentNodeId: parentNode?.getId() ?? null, targetNodeId: targetNode.getId(), inserted }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "insertRight" });
        }
    }, [tree]);

    // Operación para eliminar un nodo
    const deleteNode = useCallback((value: number) => {
        try {
            const clonedTree = tree.clonar();
            const deletedNodeData = clonedTree.eliminar(value);
            setTree(clonedTree);

            setQuery((prev) => ({
                ...prev,
                toDelete: {
                    steps: deletedNodeData.steps,
                    parentNodeId: deletedNodeData.parent?.getId() ?? null,
                    targetNodeId: deletedNodeData.targetNode.getId(),
                    targetSide: deletedNodeData.targetSide,
                    pathToSuccessorIds: deletedNodeData.pathToSuccessorIds,
                    successorNodeId: deletedNodeData.successor?.getId() ?? null,
                    successorParentNodeId: deletedNodeData.successorParent?.getId() ?? null,
                    replacementNodeId: deletedNodeData.replacement?.getId() ?? null,
                    deleted: deletedNodeData.deleted,
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
            const { steps, targetNode, found } = tree.buscar(value);
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
        // Clonar el árbol para asegurar la inmutabilidad del estado
        const clonedTree = tree.clonar();

        // Vaciar el árbol
        clonedTree.vaciar();

        // Actualizar el estado del árbol
        setTree(clonedTree);

        // Actualizar la query a partir de la operación realizada
        setQuery((prev) => ({
            ...prev,
            toClear: true
        }));
    }, [tree]);

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = useCallback(() => {
        setQuery({
            toInsertLeft: null,
            toInsertRight: null,
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
        insertRightChild,
        insertLeftChild,
        deleteNode,
        searchNode,
        getPreOrder,
        getInOrder,
        getPostOrder,
        getLevelOrder,
        clearTree,
        resetQueryValues,
    }), [
        insertRightChild, insertLeftChild, deleteNode, searchNode,
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