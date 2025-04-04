import { useSequence } from "./hooks/estructures/secuencia/useSequence";
import { Simulator } from "./components/templates/Simulator";
import { SequenceRender } from "./components/estructures/secuencia/SequenceRender";
import { Secuencia } from "../../shared/utils/structures/Secuencia";

export function SequenceSimulator() {
    const structure = new Secuencia(0);

    const { sequence, query, error, operations } = useSequence(structure);

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
            structure={sequence}
            actions={{
                create: createSequence,
                insert_last: insertElement,
                delete: deleteElementByPos,
                search: searchElement,
                clean: clearSequence,
                update: updateElement,
            }}
            query={query}
            reset={resetQueryValues}
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
