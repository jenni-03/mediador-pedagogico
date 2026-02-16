import { useCallback, useMemo, useState } from "react";
import { type Cola } from "../../../../../domain/structures/Cola";
import { BaseQueryOperations } from "../../../../../domain/utils/types";
import { DomainError } from "../../../../../domain/error/DomainError";

export function useQueue(structure: Cola<number>) {
  // Estado para manejar la cola
  const [queue, setQueue] = useState(structure);

  // Estado para gestionar el error
  const [error, setError] = useState<{
    message: string;
    id: number;
    op: string;
    planId?: string | null;
  } | null>(null);

  // Estado para gestionar la operación solicitada por el usuario
  const [query, setQuery] = useState<BaseQueryOperations<"cola">>({
    toEnqueuedNode: null,
    toDequeuedNode: null,
    toGetFront: null,
    toClear: false,
  });

  // Operación para encolar un elemento
  const enqueueElement = useCallback(
    (value: number) => {
      try {
        const clonedQueue = queue.clonar();
        const newNode = clonedQueue.encolar(value);
        setQueue(clonedQueue);

        setQuery((prev) => ({
          ...prev,
          toEnqueuedNode: newNode.getId(),
        }));
        setError(null);
      } catch (error: any) {
        setError({ message: error.message, id: Date.now(), op: "enqueue" });
      }
    },
    [queue]
  );

  // Operación para decolar un elemento
  const dequeueElement = useCallback(() => {
    try {
      const clonedQueue = queue.clonar();
      const deletedNode = clonedQueue.decolar();
      setQueue(clonedQueue);

      setQuery((prev) => ({
        ...prev,
        toDequeuedNode: deletedNode.getId(),
      }));
      setError(null);
    } catch (error: any) {
      setError({
        message: error.message,
        id: Date.now(),
        op: "dequeue",
        planId: error?.code ?? null,
      });
    }
  }, [queue]);

  // Operación para obtener la cabeza de la cola
  const getFront = useCallback(() => {
    try {
      const frontNode = queue.getInicio();
      if (!frontNode)
        throw new DomainError(
          "No fue posible obtener el elemento cabeza: La cola está vacía (tamaño actual: 0).",
          "QUEUE_EMPTY"
        );

      setQuery((prev) => ({
        ...prev,
        toGetFront: frontNode.getId(),
      }));
      setError(null);
    } catch (error: any) {
      setError({
        message: error.message,
        id: Date.now(),
        op: "getFront",
        planId: error?.code ?? null,
      });
    }
  }, [queue]);

  // Operación para vaciar la cola
  const clearQueue = useCallback(() => {
    const clonedQueue = queue.clonar();
    clonedQueue.vaciar();
    setQueue(clonedQueue);

    setQuery((prev) => ({
      ...prev,
      toClear: true,
    }));
  }, [queue]);

  // Función de restablecimiento de las queries del usuario
  const resetQueryValues = useCallback(() => {
    setQuery({
      toEnqueuedNode: null,
      toDequeuedNode: null,
      toGetFront: null,
      toClear: false,
    });
  }, []);

  // Objeto de operaciones estable
  const operations = useMemo(
    () => ({
      enqueueElement,
      dequeueElement,
      getFront,
      clearQueue,
      resetQueryValues,
    }),
    [enqueueElement, dequeueElement, getFront, clearQueue, resetQueryValues]
  );

  return {
    queue,
    query,
    error,
    operations,
  };
}