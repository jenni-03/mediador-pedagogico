import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolSplay } from "../../shared/utils/structures/ArbolSplay";
import { useSplayTree } from "./hooks/estructures/arbolSplay/useSplayTree";
import { SplayTreeRender } from "./components/estructures/arboles/SplayTreeRender";

export function SplayTreeSimulator() {
    // Instanciación del árbol Splay
    const structure = useRef(new ArbolSplay<number>()).current;

    // Hook de estado/acciones para Splay
    const { tree, query, error, operations } = useSplayTree(structure);

    // Desestructuración de operaciones soportadas por el Splay
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

    // Acciones disponibles para el usuario
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
            structureName={STRUCTURE_NAME.SPLAY_TREE}
            structure={tree}
            actions={actions}
            query={query}
            error={error}
        >
            <SplayTreeRender
                tree={hData}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
