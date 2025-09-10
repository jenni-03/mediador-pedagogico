import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolAVL } from "../../shared/utils/structures/ArbolAVL";
import { useAVLTree } from "./hooks/estructures/arbolAVL/useAVLTree";
import { AvlTreeRender } from "./components/estructures/arboles/AvlTreeRender";

export function AvlTreeSimulator() {
    // Instanciación del árbol AVL
    const structure = useRef(new ArbolAVL<number>()).current;

    // Hook de estado/acciones para AVL
    const { tree, query, error, operations } = useAVLTree(structure);

    // Desestructuración de operaciones soportadas por el AVL
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

    // Conversión a jerarquía para renderizar
    const hData = useMemo(() => tree.convertirEstructuraJerarquica(), [tree]);

    const actions = useMemo(
        () => ({
            insert: insertNode,
            delete: deleteNode,
            search: searchNode,
            getPreOrder,
            getInOrder,
            getPostOrder,
            getLevelOrder,
            clean: clearTree,
        }),
        [
            insertNode,
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
            structureName={
                STRUCTURE_NAME.AVL_TREE /* ajusta si tu const es STRUCTURE_NAME.ARBOL_AVL */
            }
            structure={tree}
            actions={actions}
            query={query}
            error={error}
        >
            <AvlTreeRender
                tree={hData}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}

export default AvlTreeSimulator;
