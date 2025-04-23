import { useSequence } from "./hooks/estructures/secuencia/useSequence";
import { Simulator } from "./components/templates/Simulator";
import { SequenceRender } from "./components/estructures/secuencia/SequenceRender";
import { Secuencia } from "../../shared/utils/structures/Secuencia";
import { STRUCTURE_NAME } from "../../shared/constants/consts";

export function SequenceSimulator() {
    // Instanciación de la estructura Secuencia
    const structure = new Secuencia(0);

    // Llamada al hook useSequence para manejar la lógica de la secuencia
    const { sequence, query, error, operations } = useSequence(structure);

    // Desestructuración de las operaciones soportadas por la secuencia
    const {
        createSequence,
        insertElement,
        deleteElementByPos,
        updateElement,
        searchElement,
        clearSequence,
        getMemory,
        resetQueryValues,
    } = operations;

    return (
        <Simulator
            structureName={STRUCTURE_NAME.SEQUENCE}
            structure={sequence}
            actions={{
                create: createSequence,
                insertLast: insertElement,
                delete: deleteElementByPos,
                get: searchElement,
                clean: clearSequence,
                set: updateElement,
            }}
            query={query}
            error={error}
        >
            <SequenceRender
                sequence={sequence.getVector()}
                memory={getMemory()}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
