import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { Cola } from "../../shared/utils/structures/Cola";
import { QueueRender } from "./components/estructures/secuencia/QueueRender";
import { Simulator } from "./components/templates/Simulator";
import { useQueue } from "./hooks/estructures/cola/useQueue";

export function QueueSimulator() {
    // Instanciación de la estructura Cola
    const structure = new Cola();

    // Llamada al hook useQueue para manejar la lógica de la cola
    const { queue, query, error, operations } = useQueue(structure);

    // Desestructuración de las operaciones soportadas por la cola
    const { enqueueElement, dequeueElement, clearQueue, resetQueryValues } =
        operations;

    return (
        <Simulator
            structureName={STRUCTURE_NAME.QUEUE}
            structure={queue}
            actions={{
                enqueue: enqueueElement,
                dequeue: dequeueElement,
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
