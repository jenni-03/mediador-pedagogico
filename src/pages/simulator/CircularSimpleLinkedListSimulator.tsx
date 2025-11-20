import { useEffect, useMemo, useRef } from "react";
import { dynamicAddressGenerator } from "../../shared/utils/memoryAllocator";
import { useLinkedList } from "./hooks/estructures/listas/useLinkedList";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ListaCircularSimple } from "../../shared/utils/structures/ListaCircularSimple";
import { CircularSimpleLinkedListRender } from "./components/estructures/listas/CircularSimpleLinkedListRender";

export function CircularSimpleLinkedListSimulator() {
    // Instanciación de la Lista Cicular Simple
    const structure = useRef(new ListaCircularSimple<number>()).current;

    // Efecto para reiniciar el asignador de memoria al cargar el componente
    useEffect(() => {
        dynamicAddressGenerator.reset();
    }, []);

    // Llamada al hook useLinkedList para gestionar el estado de la lista
    const { list, query, error, operations } = useLinkedList(structure);

    // Desestructuración de las operaciones soportadas por la lista
    const {
        addElementFirst,
        addElementLast,
        addElementAtPosition,
        removeFirstElement,
        removeLastElement,
        removeElementAtPosition,
        searchElement,
        clearList,
        resetQueryValues,
    } = operations;

    // Conjunto de acciones disponibles para la interacción con la estructura
    const actions = useMemo(
        () => ({
            insertFirst: addElementFirst,
            insertLast: addElementLast,
            insertAt: addElementAtPosition,
            removeFirst: removeFirstElement,
            removeLast: removeLastElement,
            removeAt: removeElementAtPosition,
            search: searchElement,
            clean: clearList,
        }),
        [
            addElementFirst,
            addElementLast,
            addElementAtPosition,
            removeFirstElement,
            removeLastElement,
            removeElementAtPosition,
            searchElement,
            clearList,
        ]
    );

    return (
        <Simulator
            structureName={STRUCTURE_NAME.LINKED_LIST}
            structureType={STRUCTURE_NAME.CIRCULAR_SIMPLE_LINKED_LIST}
            structure={list}
            actions={actions}
            query={query}
            error={error}
        >
            <CircularSimpleLinkedListRender
                linkedList={list.getArrayDeNodos()}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
