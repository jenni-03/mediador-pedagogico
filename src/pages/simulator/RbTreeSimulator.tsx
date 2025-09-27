import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolRojoNegro } from "../../shared/utils/structures/ArbolRojoNegro";
import { useRBTree } from "./hooks/estructures/arbolRN/useRBTree";
import { RbTreeRender } from "./components/estructures/arboles/RbTreeRender";

export function RbTreeSimulator() {
    // Instanciación del árbol Rojo-Negro
    const structure = useRef(new ArbolRojoNegro<number>()).current;

    // Hook de estado/acciones para RB
    const { tree, query, error, operations } = useRBTree(structure);

    // Desestructuración de operaciones soportadas por el Rojo-Negro
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
            structureName={STRUCTURE_NAME.RB_TREE}
            structure={tree}
            actions={actions}
            query={query}
            error={error}
        >
            <RbTreeRender
                tree={hData}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
