import { useCallback, useMemo, useState } from "react";
import { BaseQueryOperations } from "../../../../../domain/utils/types";
import { Pila } from "../../../../../domain/structures/Pila";
import { DomainError } from "../../../../../../src/domain/error/DomainError";

export function useStack(structure: Pila<number>) {
    // Estado para gestionar la pila
    const [stack, setStack] = useState(structure);

    // Estado para gestionar el error
    const [error, setError] = useState<{ message: string, id: number, op: string, planId?: string | null } | null>(null);

    // Estado para manejar la operación solicitada por el usuario
    const [query, setQuery] = useState<BaseQueryOperations<"pila">>({
        toPushNode: null,
        toPopNode: null,
        toGetTop: null,
        toClear: false
    });

    // Operación para apilar un nodo
    const pushElement = useCallback((value: number) => {
        try {
            const clonedStack = stack.clonar();
            clonedStack.apilar(value);
            const newNode = clonedStack.getTope();

            setStack(clonedStack);
            setQuery((prev) => ({
                ...prev,
                toPushNode: newNode ? newNode.getId() : null
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "push" });
        }
    }, [stack])

    // Operación para desapilar un nodo
    const popElement = useCallback(() => {
        try {
            const deletedNode = stack.getTope();
            const clonedStack = stack.clonar();
            clonedStack.desapilar();

            setStack(clonedStack);
            setQuery((prev) => ({
                ...prev,
                toPopNode: deletedNode ? deletedNode.getId() : null
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "pop", planId: error?.code ?? null });
        }
    }, [stack]);

    // Operación para obtener el tope 
    const getTop = useCallback(() => {
        try {
            const topNode = stack.getTope();
            if (!topNode) throw new DomainError("No fue posible obtener el elemento tope: No hay elementos en la pila.", "STACK_EMPTY");
            setQuery((prev) => ({
                ...prev,
                toGetTop: topNode.getId()
            }));
            setError(null);
        } catch (error: any) {
            setError({ message: error.message, id: Date.now(), op: "getTop", planId: error?.code ?? null });
        }
    }, [stack]);

    // Operación para vaciar la pila
    const clearStack = useCallback(() => {
        const clonedStack = stack.clonar();
        clonedStack.vaciar();
        setStack(clonedStack);
        setQuery((prev) => ({
            ...prev,
            toClear: true
        }));
    }, [stack]);

    // Función de restablecimiento de las queries del usuario
    const resetQueryValues = useCallback(() => {
        setQuery({
            toPushNode: null,
            toPopNode: null,
            toGetTop: null,
            toClear: false
        })
    }, []);

    // Objeto de operaciones estable
    const operations = useMemo(() => ({
        pushElement,
        popElement,
        getTop,
        clearStack,
        resetQueryValues
    }), [
        pushElement, popElement, getTop,
        clearStack, resetQueryValues
    ]);

    return {
        stack,
        query,
        error,
        operations
    }
}