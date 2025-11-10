import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations, LinkedListInterface } from "../../../../../types";

export function useLinkedList<T extends LinkedListInterface<number>>(structure: T) {
    // Estado para gestionar la lista
    const [list, setList] = useState(structure);

    // Estado para gestionar el error
    const [error, setError] = useState<{ message: string, id: number, op: string, planId?: string | null } | null>(null);

    // Estado para gestionar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"lista_enlazada">>({
        toAddFirst: null,
        toAddLast: null,
        toAddAt: null,
        toDeleteFirst: null,
        toDeleteLast: null,
        toDeleteAt: null,
        toSearch: null,
        toClear: false
    });

    // Operación para añadir un elemento al inicio
    const addElementFirst = useCallback((value: number) => {
        try {
            const clonedList = list.clonar();
            const insertedNode = clonedList.insertarAlInicio(value);
            setList(clonedList);

            setQuery((prev) => ({
                ...prev,
                toAddFirst: insertedNode.getId()
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "insertFirst" });
        }
    }, [list]);

    // Operación para añadir un elemento al final
    const addElementLast = useCallback((value: number) => {
        try {
            const clonedList = list.clonar();
            const insertedNode = clonedList.insertarAlFinal(value);
            setList(clonedList);

            setQuery((prev) => ({
                ...prev,
                toAddLast: insertedNode.getId()
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "insertLast" });
        }
    }, [list]);

    // Operación para añadir un elemento en una posición específica
    const addElementAtPosition = useCallback((value: number, position: number) => {
        try {
            const clonedList = list.clonar();
            const insertedNode = clonedList.insertarEnPosicion(value, position);
            setList(clonedList);

            setQuery((prev) => ({
                ...prev,
                toAddAt: { nodeId: insertedNode.getId(), position }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "insertAt", planId: error?.code ?? null });
        }
    }, [list]);

    // Operación para eliminar un elemento al inicio
    const removeFirstElement = useCallback(() => {
        try {
            const clonedList = list.clonar();
            const deletedNode = clonedList.eliminarAlInicio();
            setList(clonedList);

            setQuery((prev) => ({
                ...prev,
                toDeleteFirst: deletedNode.getId()
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "removeFirst", planId: error?.code ?? null });
        }
    }, [list]);

    // Operación para eliminar un elemento al final
    const removeLastElement = useCallback(() => {
        try {
            const clonedList = list.clonar();
            const deletedNode = clonedList.eliminarAlFinal();
            setList(clonedList);

            setQuery((prev) => ({
                ...prev,
                toDeleteLast: deletedNode.getId()
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "removeLast", planId: error?.code ?? null });
        }
    }, [list]);

    // Operación para eliminar un elemento en una posición específica
    const removeElementAtPosition = useCallback((position: number) => {
        try {
            const clonedList = list.clonar();
            const deletedNode = clonedList.eliminarEnPosicion(position);
            setList(clonedList);

            setQuery((prev) => ({
                ...prev,
                toDeleteAt: { nodeId: deletedNode.getId(), position }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "removeAt", planId: error?.code ?? null });
        }
    }, [list]);

    // Operación para buscar un elemento
    const searchElement = useCallback((value: number) => {
        try {
            setQuery((prev) => ({
                ...prev,
                toSearch: value
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "search" });
        }
    }, []);

    // Operación para vaciar la lista
    const clearList = useCallback(() => {
        const clonedList = list.clonar();
        clonedList.vaciar();
        setList(clonedList);

        setQuery((prev) => ({
            ...prev,
            toClear: true
        }));
    }, [list]);

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = useCallback(() => {
        setQuery({
            toAddFirst: null,
            toAddLast: null,
            toAddAt: null,
            toDeleteFirst: null,
            toDeleteLast: null,
            toDeleteAt: null,
            toSearch: null,
            toClear: false
        })
    }, []);

    // Objeto de operaciones estable
    const operations = useMemo(() => ({
        addElementFirst,
        addElementLast,
        addElementAtPosition,
        removeFirstElement,
        removeLastElement,
        removeElementAtPosition,
        searchElement,
        clearList,
        resetQueryValues
    }), [
        addElementFirst, addElementLast, addElementAtPosition, removeFirstElement,
        removeLastElement, removeElementAtPosition, searchElement, clearList, resetQueryValues
    ]);

    return {
        list,
        query,
        error,
        operations
    }
}