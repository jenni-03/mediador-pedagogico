import { useState } from "react";
import { BaseQueryOperations } from "../../../../../types";
import { Pila } from "../../../../../shared/utils/structures/Pila";

export function useStack(structure: Pila) {
    // Estado para manejar la pila
    const [stack, setStack] = useState(structure);

    // Estado para manejar el error
    const [error, setError] = useState<{ message: string, id: number } | null>(null);

    // Estado para manejar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"pila">>({
        toPushNode: null,
        toPopNode: null,
        toGetTop: null,
    });

    // Operación de insersión (apilar)
    const pushElement = (value: number) => {
        try {
            // Clonar la pila para garantizar la inmutabilidad del estado
            const clonedStack = stack.clonar();

            // Apilar el nuevo elemento
            clonedStack.apilar(value);

            // Obtener el nodo insertado para acceder a su ID
            const finalNode = clonedStack.getTope();

            // Actualizar el estado de la pila
            setStack(clonedStack);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toPushNode: finalNode ? finalNode.getId() : null
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación de eliminación (desapilar)
    const popElement = () => {
        try {
            // Obtener el nodo a ser eliminado para acceder a su ID
            const nodeToDelete = stack.getTope();

            // Clonar la pila para asegurar la inmutabilidad del estado
            const clonedStack = stack.clonar();

            // Desapilamos el nodo
            clonedStack.desapilar();

            // Actualizar el estado de la pila
            setStack(clonedStack);

            // Actualizar la query a partir de la operación realizada
            setQuery((prev) => ({
                ...prev,
                toPopNode: nodeToDelete ? nodeToDelete.getId() : null
            }));

            // Limpieza del error existente
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación de obtener el tope de la pila 
    const getTop = () => {
        try {
            const topNode = stack.getTope();
            if (topNode) {
                setQuery((prev) => ({
                    ...prev,
                    toGetTop: topNode.getId()
                }));
                setError(null);
            }
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    };

    // Operación para vaciar la pila
    const clearStack = () => {
        // Clonar la pila para asegurar la inmutabilidad del estado
        const clonedStack = stack.clonar();

        // Vaciar la pila
        clonedStack.vaciar();

        // Actualizar el estado de la pila
        setStack(clonedStack);
    }

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = () => {
        setQuery({
            toPushNode: null,
            toPopNode: null,
            toGetTop: null,
        })
    }

    return {
        stack,
        query,
        error,
        operations: {
            pushElement,
            popElement,
            getTop,
            clearStack,
            resetQueryValues
        }
    }
}