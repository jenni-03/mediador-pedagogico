import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { type ColaDePrioridad } from "../../../../../shared/utils/structures/ColaPrioridad";

export function usePriorityQueue(structure: ColaDePrioridad<number>) {
    // Estado para gestionar la cola de prioridad
    const [queue, setQueue] = useState(structure);

    // Estado para gestionar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para gestionar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"cola_de_prioridad">>({
        toEnqueuedNode: null,
        toDequeuedNode: null,
        toGetFront: null,
        toClear: false
    });

    // Operación para encolar un elemento dada su prioridad
    const enqueueElement = useCallback((value: number, priority: number) => {
        try {
            const clonedQueue = queue.clonar();
            const insertedNode = clonedQueue.encolar(value, priority);
            setQueue(clonedQueue);

            setQuery((prev) => ({
                ...prev,
                toEnqueuedNode: insertedNode.getId()
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [queue]);

    // Operación para decolar el elemento con mayor prioridad
    const dequeueElement = useCallback(() => {
        try {
            const clonedQueue = queue.clonar();
            const nodeToDelete = clonedQueue.decolar();
            setQueue(clonedQueue);

            setQuery((prev) => ({
                ...prev,
                toDequeuedNode: nodeToDelete.getId()
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [queue]);

    // Operación para obtener la cabeza de la cola 
    const getFront = useCallback(() => {
        try {
            const frontNode = queue.getInicio();
            if (!frontNode) throw new Error("No fue posible obtener el elemento cabeza: La cola está vacía (tamaño actual: 0).");

            setQuery((prev) => ({
                ...prev,
                toGetFront: frontNode.getId()
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }, [queue]);

    // Operación para vaciar la cola
    const clearQueue = useCallback(() => {
        const clonedQueue = queue.clonar();
        clonedQueue.vaciar();
        setQueue(clonedQueue);

        setQuery((prev) => ({
            ...prev,
            toClear: true
        }));
    }, [queue]);

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = useCallback(() => {
        setQuery({
            toEnqueuedNode: null,
            toDequeuedNode: null,
            toGetFront: null,
            toClear: false
        })
    }, []);

    // Objeto de operaciones estable
    const operations = useMemo(() => ({
        enqueueElement,
        dequeueElement,
        getFront,
        clearQueue,
        resetQueryValues
    }), [
        enqueueElement, dequeueElement, getFront, clearQueue, resetQueryValues
    ]);

    return {
        queue,
        query,
        error,
        operations
    }
}