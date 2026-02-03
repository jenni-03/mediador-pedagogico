import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../domain/constants/consts";
import { ArbolSplay } from "../../domain/structures/ArbolSplay";
import { useSplayTree } from "./hooks/estructures/arbolSplay/useSplayTree";
import { SplayTreeRender } from "./components/estructures/arboles/SplayTreeRender";

export function SplayTreeSimulator() {
    // Instanciación del árbol Splay
    const structure = useRef(new ArbolSplay<number>()).current;

    // Llamada al hook useSplayTree para gestionar el estado del árbol Splay
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

    // Conversión del árbol a una estructura jerárquica para su renderizado
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
