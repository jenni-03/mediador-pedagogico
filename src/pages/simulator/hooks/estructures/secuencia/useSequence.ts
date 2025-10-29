import { useCallback, useMemo, useState } from "react";
import { Secuencia } from "../../../../../shared/utils/structures/Secuencia";
import { BaseQueryOperations } from "../../../../../types";

export function useSequence(structure: Secuencia<number>) {
    // Estado para manejar la secuencia
    const [sequence, setSequence] = useState(structure);

    // Estado para manejar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para manejar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"secuencia">>({
        create: null,
        toAdd: null,
        toDelete: null,
        toGet: null,
        toSearch: null,
        toUpdate: null
    });

    // Operación para crear una secuencia con elementos vacíos
    const createSequence = useCallback((n: number) => {
        const newSecuencia = new Secuencia<number>(n);
        setSequence(newSecuencia);
        setQuery((prev) => ({
            ...prev,
            create: n
        }));
    }, []);

    // Operación para insertar un elemento
    const insertElement = useCallback((element: number) => {
        try {
            // Clonación de la secuencia para asegurar la inmutabilidad del estado
            const newSequence = sequence.clonar();

            // Inserción del nuevo elemento
            const insertedIndex = newSequence.insertar(element);

            // Actualización del estado de la secuencia
            setSequence(newSequence);

            // Actualización de la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toAdd: { element, index: insertedIndex }
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [sequence]);

    // Operación para eliminar un elemento por posición
    const deleteElementByPos = useCallback((pos: number) => {
        try {
            // Clonación de la secuencia para asegurar la inmutabilidad del estado
            const newSequence = sequence.clonar();

            // Eliminación del elemento por posición
            const firstNullIndex = newSequence.eliminarPos(pos);

            // Actualización del estado de la secuencia
            setSequence(newSequence);

            // Actualización de la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDelete: { index: pos, firstNullIndex }
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [sequence]);

    // Operación para obtener un elemento por posición
    const getElement = useCallback((position: number) => {
        try {
            // Obtención del elemento por posición
            sequence.get(position);

            // Actualización de la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toGet: position
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [sequence]);

    // Operación para buscar un elemento
    const searchElement = useCallback((element: number) => {
        try {
            // Actualización de la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toSearch: element
            }));

            // Limpieza del error existente
            setError(null)
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, []);

    // Operación para actualizar un elemento por posición
    const updateElement = useCallback((position: number, element: number) => {
        try {
            // Clonación de la secuencia para asegurar la inmutabilidad del estado
            const newSequence = sequence.clonar();

            // Actualización del elemento por posición
            newSequence.set(position, element);

            // Actualización del estado de la secuencia
            setSequence(newSequence);

            // Actualización de la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toUpdate: { newValue: element, index: position }
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [sequence]);

    // Operación para vaciar la secuencia
    const clearSequence = useCallback(() => {
        // Clonación de la secuencia para asegurar la inmutabilidad del estado
        const newSequence = sequence.clonar();

        // Vaciar la secuencia
        newSequence.vaciar();

        // Actualización del estado de la secuencia
        setSequence(newSequence);
    }, [sequence]);

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = useCallback(() => {
        setQuery({
            create: null,
            toAdd: null,
            toDelete: null,
            toGet: null,
            toSearch: null,
            toUpdate: null
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