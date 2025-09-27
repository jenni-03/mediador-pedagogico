import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolBinario } from "../../shared/utils/structures/ArbolBinario";
import { useBinaryTree } from "./hooks/estructures/arboles/useBinaryTree";
import { BinaryTreeRender } from "./components/estructures/arboles/BinaryTreeRender";

export function BinaryTreeSimulator() {
    // Instanciación del árbol binario
    const structure = useRef(new ArbolBinario<number>()).current;

    // Llamada al hook useBinaryTree para gestionar el estado del árbol binario
    const { tree, query, error, operations } = useBinaryTree(structure);

    // Desestructuración de las operaciones soportadas por el árbol binario
    const {
        insertLeftChild,
        insertRightChild,
        deleteNode,
        searchNode,
        getPreOrder,
        getInOrder,
        getPostOrder,
        getLevelOrder,
        clearTree,
        resetQueryValues,
    } = operations;

    // Conversión del árbol a una estructura jerárquica para su renderizado
    const hData = useMemo(() => tree.convertirEstructuraJerarquica(), [tree]);

    // Acciones disponibles para el usuario
    const actions = useMemo(
        () => ({
            insertLeft: insertLeftChild,
            insertRight: insertRightChild,
            delete: deleteNode,
            search: searchNode,
            getPreOrder,
            getInOrder,
            getPostOrder,
            getLevelOrder,
            clean: clearTree,
        }),
        [
            insertLeftChild,
            insertRightChild,
            deleteNode,
            searchNode,
            getPreOrder,
            getInOrder,
            getPostOrder,
            getLevelOrder,
            clearTree,
        ]
    );

    return (
        <Simulator
            structureName={STRUCTURE_NAME.BINARY_TREE}
            structure={tree}
            actions={actions}
            query={query}
            error={error}
        >
            <BinaryTreeRender
                tree={hData}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
