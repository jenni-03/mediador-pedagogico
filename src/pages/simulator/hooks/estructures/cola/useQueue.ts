import { useState } from "react";
import { Cola } from "../../../../../shared/utils/structures/Cola";
import { BaseQueryOperations } from "../../../../../types";

export function useQueue(structure: Cola) {
    // Estado para manejar la cola
    const [queue, setQueue] = useState(structure);

    // Estado para manejar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para manejar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"cola">>({
        toEnqueuedNode: null,
        toDequeuedNode: null,
        toClear: false
    });

    // Operación de encolar
    const enqueueElement = (value: number) => {
        try {
            // Clonar la cola para garantizar la inmutabilidad del estado
            const clonedQueue = queue.clonar();

            // Encolar el nuevo elemento
            clonedQueue.encolar(value);

            // Obtener el nodo insertado para acceder a su ID
            const finalNode = clonedQueue.getFin();

            // Actualizar el estado de la cola
            setQueue(clonedQueue);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toEnqueuedNode: finalNode ? finalNode.getId() : null
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación de decolar
    const dequeueElement = () => {
        try {
            // Obtener el nodo a ser eliminado para acceder a su ID
            const nodeToDelete = queue.getInicio();

            // Clonar la cola para asegurar la inmutabilidad del estado
            const clonedQueue = queue.clonar();

            // Decolamos el nodo
            clonedQueue.decolar();

            // Actualizar el estado de la cola
            setQueue(clonedQueue);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDequeuedNode: nodeToDelete ? nodeToDelete.getId() : null
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para vaciar la cola
    const clearQueue = () => {
        // Clonar la cola para asegurar la inmutabilidad del estado
        const clonedQueue = queue.clonar();

        // Vaciar la cola
        clonedQueue.vaciar();

        // Actualizar el estado de la cola
        setQueue(clonedQueue);

        // Actualizar la query a partir de la operación realizada
        setQuery((prev) => ({
            ...prev,
            toClear: true
        }));
    }

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = () => {
        setQuery({
            toEnqueuedNode: null,
            toDequeuedNode: null,
            toClear: false
        })
    }

    return {
        queue,
        query,
        error,
        operations: {
            enqueueElement,
            dequeueElement,
            clearQueue,
            resetQueryValues
        }
    }
}