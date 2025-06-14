import { useEffect, useRef } from "react";
import { ListaSimple } from "../../shared/utils/structures/ListaSimple";
import { dynamicAddressGenerator } from "../../shared/utils/memoryAllocator";
import { useLinkedList } from "./hooks/estructures/listas/useLinkedList";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { LinkedListRender } from "./components/estructures/listas/LinkedListRender";

export function SimpleLinkedListSimulator() {
    // Instanciación de la Lista Simple
    const structure = useRef(new ListaSimple()).current;

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

    return (
        <Simulator
            structureName={STRUCTURE_NAME.LINKED_LIST}
            structureType={STRUCTURE_NAME.SIMPLE_LINKED_LIST}
            structure={list}
            actions={{
                insertFirst: addElementFirst,
                insertLast: addElementLast,
                insertAt: addElementAtPosition,
                removeFirst: removeFirstElement,
                removeLast: removeLastElement,
                removeAt: removeElementAtPosition,
                search: searchElement,
                clean: clearList,
            }}
            query={query}
            error={error}
        >
            <LinkedListRender
                linkedList={list.getArrayDeNodos()}
                query={query}
                resetQueryValues={resetQueryValues}
                listType={"simple"}
            />
        </Simulator>
    );
}
