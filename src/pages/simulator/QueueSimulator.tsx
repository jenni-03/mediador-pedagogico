import { useEffect, useRef } from "react";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { Cola } from "../../shared/utils/structures/Cola";
import { QueueRender } from "./components/estructures/cola/QueueRender";
import { Simulator } from "./components/templates/Simulator";
import { useQueue } from "./hooks/estructures/cola/useQueue";
import { dynamicAddressGenerator } from "../../shared/utils/memoryAllocator";

export function QueueSimulator() {
    // Instanciación de la estructura Cola
    const structure = useRef(new Cola<number>()).current;

    // Efecto para reiniciar el asignador de memoria al cargar el componente
    useEffect(() => {
        dynamicAddressGenerator.reset();
    }, []);

    // Llamada al hook useQueue para manejar la lógica de la cola
    const { queue, query, error, operations } = useQueue(structure);

    // Desestructuración de las operaciones soportadas por la cola
    const {
        enqueueElement,
        dequeueElement,
        getFront,
        clearQueue,
        resetQueryValues,
    } = operations;

    return (
        <Simulator
            structureName={STRUCTURE_NAME.QUEUE}
            structure={queue}
            actions={{
                enqueue: enqueueElement,
                dequeue: dequeueElement,
                getFront: getFront,
                clean: clearQueue,
            }}
            query={query}
            error={error}
        >
            <QueueRender
                queue={queue.getArrayDeNodos()}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
