import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolBinarioBusqueda } from "../../shared/utils/structures/ArbolBinarioBusqueda";
import { useBinarySearchTree } from "./hooks/estructures/arboles/useBinarySearchTree";
import { BinarySearchTreeRender } from "./components/estructures/arboles/BinarySearchTreeRender";

export function BinarySearchTreeSimulator() {
    // Instanciación del árbol binario
    const structure = useRef(new ArbolBinarioBusqueda<number>()).current;

    // Llamada al hook useBinaryTree para gestionar el estado del árbol binario
    const { tree, query, error, operations } = useBinarySearchTree(structure);

    // Desestructuración de las operaciones soportadas por el árbol binario
    const {
        insertNode,
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

    return (
        <Simulator
            structureName={STRUCTURE_NAME.BINARY_SEARCH_TREE}
            structure={tree}
            actions={{
                insert: insertNode,
                delete: deleteNode,
                search: searchNode,
                getPreOrder,
                getInOrder,
                getPostOrder,
                getLevelOrder,
                clean: clearTree,
            }}
            query={query}
            error={error}
        >
            <BinarySearchTreeRender
                tree={hData}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
