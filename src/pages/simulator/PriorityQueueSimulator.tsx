import { useEffect, useMemo, useRef } from "react";
import { STRUCTURE_NAME } from "../../domain/constants/consts";
import { Simulator } from "./components/templates/Simulator";
import { priorityQueueAddressGenerator } from "../../domain/utils/memoryAllocator";
import { ColaDePrioridad } from "../../domain/structures/ColaPrioridad";
import { usePriorityQueue } from "./hooks/estructures/colaPrioridad/usePriorityQueue";
import { PriorityQueueRender } from "./components/estructures/colaPrioridad/PriorityQueueRender";

export function PriorityQueueSimulator() {
    // Instanciación de la estructura Cola
    const structure = useRef(new ColaDePrioridad<number>()).current;

    // Efecto para reiniciar el asignador de memoria al cargar el componente
    useEffect(() => {
        priorityQueueAddressGenerator.reset();
    }, []);

    // Llamada al hook usePriorityQueue para manejar la lógica de la cola de prioridad
    const { queue, query, error, operations } = usePriorityQueue(structure);

    // Desestructuración de las operaciones soportadas por la cola de prioridad
    const {
        enqueueElement,
        dequeueElement,
        getFront,
        clearQueue,
        resetQueryValues,
    } = operations;

    // Conjunto de acciones disponibles para la interacción con la estructura
    const actions = useMemo(
        () => ({
            enqueue: enqueueElement,
            dequeue: dequeueElement,
            getFront: getFront,
            clean: clearQueue,
        }),
        [enqueueElement, dequeueElement, getFront, clearQueue]
    );

    return (
        <Simulator
            structureName={STRUCTURE_NAME.PRIORITY_QUEUE}
            structure={queue}
            actions={actions}
            query={query}
            error={error}
        >
            <PriorityQueueRender
                queue={queue.getArrayDeNodos()}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
