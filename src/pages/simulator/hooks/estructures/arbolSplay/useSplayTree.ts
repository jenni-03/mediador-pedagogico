import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations } from "../../../../../domain/utils/types";
import { type ArbolSplay } from "../../../../../domain/structures/ArbolSplay";

export function useSplayTree(structure: ArbolSplay<number>) {
    // Estado para manejar el árbol Splay
    const [tree, setTree] = useState(structure);

    // Estado para gestionar el error
    const [error, setError] = useState<{ message: string, id: number, op: string, planId?: string | null } | null>(null);

    // Estado de la "query" que usan los renderers/animaciones
    const [query, setQuery] = useState<BaseQueryOperations<"arbol_splay">>({
        toInsert: null,
        toDelete: null,
        toSearch: null,
        toGetPreOrder: null,
        toGetInOrder: null,
        toGetPostOrder: null,
        toGetLevelOrder: null,
        toClear: false,
        splayTrace: null
    });

    // Operación para insertar un nodo
    const insertNode = useCallback((value: number) => {
        try {
            const cloned = tree.clonarSplay();
            const { steps, parent, targetNode, inserted } = cloned.insertarSplay(value);
            const trace = cloned.consumeLastSplayTrace();

            setTree(cloned);
            setQuery((prev) => ({
                ...prev,
                toInsert: { steps, parentNodeId: parent?.getId() ?? null, targetNodeId: targetNode!.getId(), inserted },
                splayTrace: trace
            }));
            setError(null);
        } catch (e: any) {
            setError({ message: e.message, id: Date.now(), op: "insert" });
        }
    }, [tree]);

    // Operación de eliminar un nodo del árbol
    const deleteNode = useCallback((value: number) => {
        try {
            // Clonar el árbol para asegurar la inmutabilidad del estado
            const cloned = tree.clonarSplay();

            // Obtener el nodo a ser eliminado para acceder a su ID
            const { node, removed, maxLeft } = cloned.eliminarSplay(value);

            // Obtener la traza splay
            const trace = cloned.consumeLastSplayTrace();

            // Actualizar el estado del árbol
            setTree(cloned);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDelete: { nodeId: node.getId(), removed, maxLeftId: maxLeft?.getId() ?? null },
                splayTrace: trace
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [tree]);

    // Operación para buscar un nodo
    const searchNode = useCallback((value: number) => {
        try {
            if (tree.esVacio()) throw new Error("No fue posible buscar el nodo (El árbol se encuentra vacío)");
            const cloned = tree.clonarSplay();
            const { steps, targetNode, found } = cloned.buscarSplay(value);
            const trace = cloned.consumeLastSplayTrace();

            setTree(cloned);
            setQuery((prev) => ({
                ...prev,
                toSearch: { steps, targetNodeId: targetNode!.getId(), found },
                splayTrace: trace
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
        const cloned = tree.clonarSplay();
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
            toClear: false,
            splayTrace: null
        });
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
    };
}