import { useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { ArbolBinario } from "../../../../../shared/utils/structures/ArbolBinario";

export function useBinaryTree(structure: ArbolBinario<number>) {
    // Estado para manejar el árbol binario
    const [tree, setTree] = useState(structure);

    // Estado para manejar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para manejar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"arbol_binario">>({
        toInsertLeft: null,
        toInsertRight: null,
        toDelete: [],
        toSearch: null,
        toGetPreOrder: [],
        toGetInOrder: [],
        toGetPostOrder: [],
        toGetLevelOrder: [],
        toClear: false
    });

    // Operación de inserción en hijo izquierdo
    const insertLeftChild = (parent: number, value: number) => {
        try {
            // Clonar el árbol para garantizar la inmutabilidad del estado
            const clonedTree = tree.clonar();

            // Insertar el nuevo hijo izquierdo
            const insertedNode = clonedTree.insertarHijoIzq(parent, value);

            // Actualizar el estado del árbol
            setTree(clonedTree);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toInsertLeft: insertedNode.getId()
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación de inserción en hijo derecho
    const insertRightChild = (parent: number, value: number) => {
        try {
            // Clonar el árbol para garantizar la inmutabilidad del estado
            const clonedTree = tree.clonar();

            // Insertar el nuevo hijo derecho
            const insertedNode = clonedTree.insertarHijoDer(parent, value);

            // Actualizar el estado del árbol
            setTree(clonedTree);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toInsertRight: insertedNode.getId()
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
            const clonedTree = tree.clonar();

            // Obtener el nodo a ser eliminado para acceder a su ID
            const deletedNodeData = clonedTree.eliminar(value);

            // Actualizar el estado del árbol
            setTree(clonedTree);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDelete: [deletedNodeData.removed.getId(), deletedNodeData.updated?.getId() ?? null]
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
        // Obtener el recorrido en preorden del árbol
        const preorder = tree.preOrden();

        // Actualizar la query a partir de la operación realizada
        setQuery((prev) => ({
            ...prev,
            toGetPreorder: preorder.map(node => node.getId())
        }));
    }

    // Operación para obtener el recorrido en inorden
    const getInOrder = () => {
        // Obtener el recorrido en inorden del árbol
        const inorder = tree.inOrden();

        // Actualizar la query a partir de la operación realizada
        setQuery((prev) => ({
            ...prev,
            toGetInorder: inorder.map(node => node.getId())
        }));
    }

    // Operación para obtener el recorrido en postorden
    const getPostOrder = () => {
        // Obtener el recorrido en postorden del árbol
        const postorder = tree.postOrden();

        // Actualizar la query a partir de la operación realizada
        setQuery((prev) => ({
            ...prev,
            toGetPostorder: postorder.map(node => node.getId())
        }));
    }

    // Operación para obtener el recorrido por niveles
    const getLevelOrder = () => {
        // Obtener el recorrido por niveles del árbol
        const levelOrder = tree.getNodosPorNiveles();

        // Actualizar la query a partir de la operación realizada
        setQuery((prev) => ({
            ...prev,
            toGetLevelOrder: levelOrder.map(node => node.getId())
        }));
    }

    // Operación para vaciar el árbol
    const clearTree = () => {
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
    }

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = () => {
        setQuery({
            toInsertLeft: null,
            toInsertRight: null,
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
            insertLeftChild,
            insertRightChild,
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