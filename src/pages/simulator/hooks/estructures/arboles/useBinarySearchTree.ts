import { useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { ArbolBinarioBusqueda } from "../../../../../shared/utils/structures/ArbolBinarioBusqueda";

export function useBinarySearchTree(structure: ArbolBinarioBusqueda<number>) {
    // Estado para manejar el árbol binario de búsqueda
    const [tree, setTree] = useState(structure);

    // Estado para manejar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para manejar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"arbol_binario_busqueda">>({
        toInsert: null,
        toDelete: [],
        toSearch: null,
        toGetPreOrder: [],
        toGetInOrder: [],
        toGetPostOrder: [],
        toGetLevelOrder: [],
        toClear: false
    });

    // Operación de inserción de un nodo en el árbol
    const insertNode = (value: number) => {
        try {
            // Clonar el árbol para garantizar la inmutabilidad del estado
            const clonedTree = tree.clonarABB();

            // Insertar el nuevo hijo derecho
            const insertedNode = clonedTree.insertar(value);

            // Actualizar el estado del árbol
            setTree(clonedTree);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toInsert: insertedNode.getId()
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación de eliminar un nodo del árbol
    const deleteNode = (value: number) => {
        try {
            // Clonar el árbol para asegurar la inmutabilidad del estado
            const clonedTree = tree.clonarABB();

            // Obtener el nodo a ser eliminado para acceder a su ID
            const deletedNodeData = clonedTree.eliminarABB(value);

            // Actualizar el estado del árbol
            setTree(clonedTree);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDelete: [deletedNodeData.removed!.getId(), deletedNodeData.updated?.getId() ?? null]
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para buscar un nodo en el árbol 
    const searchNode = (value: number) => {
        try {
            // Buscar el nodo en el árbol
            const foundNode = tree.esta(value);

            // Verificar su existencia
            if (!foundNode) throw new Error("No fue posible encontrar el nodo.");

            // Actualizar la query para informar de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toSearch: value
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    };

    // Operación para obtener el recorrido en preorden
    const getPreOrder = () => {
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
    }

    // Operación para obtener el recorrido en inorden
    const getInOrder = () => {
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
    }

    // Operación para obtener el recorrido en postorden
    const getPostOrder = () => {
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
    }

    // Operación para obtener el recorrido por niveles
    const getLevelOrder = () => {
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
    }

    // Operación para vaciar el árbol
    const clearTree = () => {
        // Clonar el árbol para asegurar la inmutabilidad del estado
        const clonedTree = tree.clonarABB();

        // Vaciar el árbol
        clonedTree.vaciar();

        // Actualizar el estado del árbol
        setTree(clonedTree);

        // Actualizar la query a partir de la operación realizada
        setQuery((prev) => ({
            ...prev,
            toClear: true
        }));
    }

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = () => {
        setQuery({
            toInsert: null,
            toDelete: [],
            toSearch: null,
            toGetPreOrder: [],
            toGetInOrder: [],
            toGetPostOrder: [],
            toGetLevelOrder: [],
            toClear: false
        })
    }

    return {
        tree,
        query,
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
            resetQueryValues
        }
    }
}