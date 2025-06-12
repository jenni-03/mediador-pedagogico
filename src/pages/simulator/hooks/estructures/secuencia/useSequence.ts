import { useState } from "react";
import { Secuencia } from "../../../../../shared/utils/structures/Secuencia";
import { BaseQueryOperations } from "../../../../../types";

export function useSequence(structure: Secuencia) {
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
        toUpdate: []
    });

    // Operación de creación de una secuencia con elementos vacíos
    const createSequence = (n: number) => {
        const newSecuencia = new Secuencia(n);
        setSequence(newSecuencia);
        setQuery((prev) => ({
            ...prev,
            create: n
        }));
    }

    // Operación de inserción
    const insertElement = (element: number) => {
        try {
            const newSequence = sequence.clonar();
            newSequence.insertar(element);
            setSequence(newSequence);
            setQuery((prev) => ({
                ...prev,
                toAdd: element
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación de eliminación
    const deleteElementByPos = (pos: number) => {
        try {
            const newSequence = sequence.clonar();
            newSequence.eliminarPos(pos);
            setSequence(newSequence);
            setQuery((prev) => ({
                ...prev,
                toDelete: pos
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    }

    // Operación de obtener un elemento por posición
    const getElement = (position: number) => {
        try {
            sequence.get(position);
            setQuery((prev) => ({
                ...prev,
                toGet: position
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    };

    // Operación de búsqueda
    const searchElement = (element: number) => {
        try {
            if (sequence.esta(element)) {
                setQuery((prev) => ({
                    ...prev,
                    toSearch: element
                }));
                setError(null);
            }
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }
    };

    // Operación de actualización
    const updateElement = (position: number, element: number) => {
        try {
            const newSequence = sequence.clonar();
            newSequence.set(position, element);
            setSequence(newSequence);
            setQuery((prev) => ({
                ...prev,
                toUpdate: [position, element]
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now() });
        }

    }

    // Operación para vaciar la secuencia
    const clearSequence = () => {
        const newSequence = sequence.clonar();
        newSequence.vaciar();
        setSequence(newSequence);
    }

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = () => {
        setQuery({
            create: null,
            toAdd: null,
            toDelete: null,
            toGet: null,
            toSearch: null,
            toUpdate: []
        })
    }

    // Obtención de las direcciones de memoria de cada elemento dentro de la secuencia
    const getMemory = () => {
        return sequence.getVectorMemoria();
    }

    return {
        sequence,
        query,
        error,
        operations: {
            createSequence,
            insertElement,
            deleteElementByPos,
            getElement,
            searchElement,
            updateElement,
            clearSequence,
            getMemory,
            resetQueryValues
        }
    }
}