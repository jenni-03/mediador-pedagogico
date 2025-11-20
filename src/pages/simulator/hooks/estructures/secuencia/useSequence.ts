import { useCallback, useMemo, useState } from "react";
import { Secuencia } from "../../../../../shared/utils/structures/Secuencia";
import { BaseQueryOperations } from "../../../../../types";
import { DomainError } from "../../../../../shared/utils/error/DomainError";

export function useSequence(structure: Secuencia<number>) {
    // Estado para gestionar la secuencia
    const [sequence, setSequence] = useState(structure);

    // Estado para gestionar el error
    const [error, setError] = useState<{ message: string, id: number, op: string, planId?: string | null } | null>(null);

    // Estado para gestionar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"secuencia">>({
        create: null,
        toAdd: null,
        toDelete: null,
        toGet: null,
        toSearch: null,
        toUpdate: null,
        toClear: false
    });

    // Operación para crear una secuencia con elementos vacíos
    const createSequence = useCallback((n: number) => {
        try {
            if (n <= 0) {
                throw new DomainError("Capacidad de secuencia no válida!", "INVALID_CAPACITY");
            }

            const newSecuencia = new Secuencia<number>(n);
            setSequence(newSecuencia);
            setQuery((prev) => ({
                ...prev,
                create: n
            }));
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "create", planId: error?.code ?? null });
        }
    }, []);

    // Operación para insertar un elemento
    const insertElement = useCallback((element: number) => {
        try {
            const newSequence = sequence.clonar();
            const insertedIndex = newSequence.insertar(element);
            setSequence(newSequence);

            setQuery((prev) => ({
                ...prev,
                toAdd: { element, index: insertedIndex }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "insertLast", planId: error?.code ?? null });
        }
    }, [sequence]);

    // Operación para eliminar un elemento por posición
    const deleteElementByPos = useCallback((pos: number) => {
        try {
            const newSequence = sequence.clonar();
            const firstNullIndex = newSequence.eliminarPos(pos);
            setSequence(newSequence);

            setQuery((prev) => ({
                ...prev,
                toDelete: { index: pos, firstNullIndex }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "delete", planId: error?.code ?? null });
        }
    }, [sequence]);

    // Operación para obtener un elemento por posición
    const getElement = useCallback((position: number) => {
        try {
            sequence.get(position);

            setQuery((prev) => ({
                ...prev,
                toGet: position
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "get", planId: error?.code ?? null });
        }
    }, [sequence]);

    // Operación para buscar un elemento
    const searchElement = useCallback((element: number) => {
        try {
            setQuery((prev) => ({
                ...prev,
                toSearch: element
            }));
            setError(null)
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "search" });
        }
    }, []);

    // Operación para actualizar un elemento por posición
    const updateElement = useCallback((position: number, element: number) => {
        try {
            const newSequence = sequence.clonar();
            newSequence.set(position, element);
            setSequence(newSequence);

            setQuery((prev) => ({
                ...prev,
                toUpdate: { newValue: element, index: position }
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "set", planId: error?.code ?? null });
        }
    }, [sequence]);

    // Operación para vaciar la secuencia
    const clearSequence = useCallback(() => {
        const newSequence = sequence.clonar();
        newSequence.vaciar();
        setSequence(newSequence);

        setQuery((prev) => ({
            ...prev,
            toClear: true
        }));
    }, [sequence]);

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = useCallback(() => {
        setQuery({
            create: null,
            toAdd: null,
            toDelete: null,
            toGet: null,
            toSearch: null,
            toUpdate: null,
            toClear: false
        });
    }, []);

    // Obtención de las direcciones de memoria de cada elemento dentro de la secuencia
    const getMemory = useCallback(() => {
        return sequence.getVectorMemoria();
    }, [sequence]);

    // Objeto de operaciones estable
    const operations = useMemo(() => ({
        createSequence,
        insertElement,
        deleteElementByPos,
        getElement,
        searchElement,
        updateElement,
        clearSequence,
        getMemory,
        resetQueryValues
    }), [
        createSequence, insertElement, deleteElementByPos, getElement,
        searchElement, updateElement, clearSequence, getMemory, resetQueryValues
    ]);

    return {
        sequence,
        query,
        error,
        operations
    }
}