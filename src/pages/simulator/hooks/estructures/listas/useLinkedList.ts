import { useState } from "react";
import { BaseQueryOperations, LinkedListInterface } from "../../../../../types";

export function useLinkedList<T extends LinkedListInterface<number>>(structure: T) {
    // Estado para manejar la lista
    const [list, setList] = useState(structure);

    // Estado para manejar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para gestionar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"lista_enlazada">>({
        toAddFirst: null,
        toAddLast: null,
        toAddAt: [],
        toDeleteFirst: null,
        toDeleteLast: null,
        toDeleteAt: [],
        toSearch: null,
        toClear: false
    });

    // Operación para añadir al inicio
    const addElementFirst = (value: number) => {
        try {
            // Clonar la lista para garantizar la inmutabilidad del estado
            const clonedList = list.clonar();

            // Obtener la información del nodo insertado
            const insertedNode = clonedList.insertarAlInicio(value);

            // Actualizar el estado de la lista
            setList(clonedList);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toAddFirst: insertedNode.getId()
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para añadir al final
    const addElementLast = (value: number) => {
        try {
            // Clonar la lista para garantizar la inmutabilidad del estado
            const clonedList = list.clonar();

            // Obtener la información del nodo insertado
            const insertedNode = clonedList.insertarAlFinal(value);

            // Actualizar el estado de la lista
            setList(clonedList);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toAddLast: insertedNode.getId()
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para añadir en una posición específica
    const addElementAtPosition = (value: number, position: number) => {
        try {
            // Clonar la lista para garantizar la inmutabilidad del estado
            const clonedList = list.clonar();

            // Obtener la información del nodo insertado
            const insertedNode = clonedList.insertarEnPosicion(value, position);

            // Actualizar el estado de la lista
            setList(clonedList);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toAddAt: [insertedNode.getId(), position]
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para eliminar al inicio
    const removeFirstElement = () => {
        try {
            // Clonar la lista para garantizar la inmutabilidad del estado
            const clonedList = list.clonar();

            // Obtener la información del nodo eliminado
            const deletedNode = clonedList.eliminarAlInicio();

            // Actualizar el estado de la lista
            setList(clonedList);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDeleteFirst: deletedNode.getId()
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para eliminar al final
    const removeLastElement = () => {
        try {
            // Clonar la lista para garantizar la inmutabilidad del estado
            const clonedList = list.clonar();

            // Obtener la información del nodo eliminado
            const deletedNode = clonedList.eliminarAlFinal();

            // Actualizar el estado de la lista
            setList(clonedList);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDeleteLast: deletedNode.getId()
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para eliminar en una posición específica
    const removeElementAtPosition = (position: number) => {
        try {
            // Clonar la lista para garantizar la inmutabilidad del estado
            const clonedList = list.clonar();

            // Obtener la información del nodo eliminado
            const deletedNode = clonedList.eliminarEnPosicion(position);

            // Actualizar el estado de la lista
            setList(clonedList);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDeleteAt: [deletedNode.getId(), position]
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para buscar un elemento
    const searchElement = (value: number) => {
        try {
            // Obtener la información del nodo eliminado
            if (!list.buscar(value)) {
                throw new Error("No se encontró el elemento en la lista.")
            }

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toSearch: value
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para vaciar la lista
    const clearList = () => {
        // Clonar la cola para asegurar la inmutabilidad del estado
        const clonedList = list.clonar();

        // Vaciar la cola
        clonedList.vaciar();

        // Actualizar el estado de la lista
        setList(clonedList);

        // Actualizar la query a partir de la operación realizada
        setQuery((prev) => ({
            ...prev,
            toClear: true
        }));
    }

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = () => {
        setQuery({
            toAddFirst: null,
            toAddLast: null,
            toAddAt: [],
            toDeleteFirst: null,
            toDeleteLast: null,
            toDeleteAt: [],
            toSearch: null,
            toClear: false
        })
    }

    return {
        list,
        query,
        error,
        operations: {
            addElementFirst,
            addElementLast,
            addElementAtPosition,
            removeFirstElement,
            removeLastElement,
            removeElementAtPosition,
            searchElement,
            clearList,
            resetQueryValues
        }
    }
}