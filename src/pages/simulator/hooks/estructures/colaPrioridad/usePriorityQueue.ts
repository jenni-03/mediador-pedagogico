import { useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { ColaDePrioridad } from "../../../../../shared/utils/structures/ColaPrioridad";

export function usePriorityQueue(structure: ColaDePrioridad) {
    // Estado para manejar la cola de prioridad
    const [queue, setQueue] = useState(structure);

    // Estado para manejar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para manejar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"cola_de_prioridad">>({
        toEnqueuedNode: null,
        toDequeuedNode: null,
        toGetFront: null,
        toClear: false
    });

    // Operación de encolar
    const enqueueElement = (value: number, priority: number) => {
        try {
            // Clonar la cola para garantizar la inmutabilidad del estado
            const clonedQueue = queue.clonar();

            // Encolar el nuevo elemento
            const insertedNode = clonedQueue.encolar(value, priority);

            // Actualizar el estado de la cola
            setQueue(clonedQueue);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toEnqueuedNode: insertedNode.getId()
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
            // Clonar la cola para asegurar la inmutabilidad del estado
            const clonedQueue = queue.clonar();

            // Obtener el nodo eliminado para acceder a su ID
            const nodeToDelete = clonedQueue.decolar();

            // Actualizar el estado de la cola
            setQueue(clonedQueue);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toDequeuedNode: nodeToDelete.getId()
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación para obtener la cabeza de la cola 
    const getFront = () => {
        try {
            // Obtener el nodo cabeza de la cola
            const frontNode = queue.getInicio();

            // Verificar su existencia
            if (!frontNode) throw new Error("No fue posible obtener el elemento cabeza: La cola está vacía (tamaño actual: 0).");

            // Actualizar la query para informar de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toGetFront: frontNode.getId()
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    };

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
            toGetFront: null,
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
            getFront,
            clearQueue,
            resetQueryValues
        }
    }
}