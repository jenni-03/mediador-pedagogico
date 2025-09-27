import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolHeap } from "../../shared/utils/structures/ArbolHeap";
import { useHeapTree } from "./hooks/estructures/arbolHeap/useHeapTree";
import { HeapTreeRender } from "./components/estructures/arboles/HeapTreeRender";

export function HeapTreeSimulator() {
    // Instanciación del árbol binario
    const structure = useRef(new ArbolHeap<number>()).current;

    // Llamada al hook useHeapTree para gestionar el estado del árbol heap
    const { heap, query, error, operations } = useHeapTree(structure);

    // Desestructuración de las operaciones soportadas por el árbol heap
    const {
        insertElement,
        deleteRoot,
        searchElement,
        peekRoot,
        getLevelOrder,
        clearHeap,
        resetQueryValues,
    } = operations;

    // Conversión del árbol a una estructura jerárquica para su renderizado
    const hData = useMemo(() => heap.convertirEstructuraJerarquica(), [heap]);

    // Acciones disponibles para el usuario
    const actions = useMemo(
        () => ({
            insert: insertElement,
            deleteRoot: deleteRoot,
            search: searchElement,
            peek: peekRoot,
            getLevelOrder,
            clean: clearHeap,
        }),
        [
            insertElement,
            deleteRoot,
            searchElement,
            peekRoot,
            getLevelOrder,
            clearHeap,
        ]
    );

    return (
        <Simulator
            structureName={STRUCTURE_NAME.HEAP_TREE}
            structure={heap}
            actions={actions}
            query={query}
            error={error}
        >
            <HeapTreeRender
                tree={hData}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
