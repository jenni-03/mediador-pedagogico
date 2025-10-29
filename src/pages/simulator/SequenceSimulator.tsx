import { useSequence } from "./hooks/estructures/secuencia/useSequence";
import { Simulator } from "./components/templates/Simulator";
import { SequenceRender } from "./components/estructures/secuencia/SequenceRender";
import { Secuencia } from "../../shared/utils/structures/Secuencia";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { useMemo, useRef } from "react";

export function SequenceSimulator() {
    // Instanciación de la estructura Secuencia
    const structure = useRef(new Secuencia<number>(0)).current;

    // Llamada al hook useSequence para manejar la lógica de la secuencia
    const { sequence, query, error, operations } = useSequence(structure);

    // Desestructuración de las operaciones soportadas por la secuencia
    const {
        createSequence,
        insertElement,
        deleteElementByPos,
        getElement,
        updateElement,
        searchElement,
        clearSequence,
        getMemory,
        resetQueryValues,
    } = operations;

    // Acciones disponibles para el usuario
    const actions = useMemo(
        () => ({
            create: createSequence,
            insertLast: insertElement,
            delete: deleteElementByPos,
            get: getElement,
            set: updateElement,
            search: searchElement,
            clean: clearSequence,
        }),
        [
            createSequence,
            insertElement,
            deleteElementByPos,
            getElement,
            updateElement,
            searchElement,
            clearSequence,
        ]
    );

    return (
        <Simulator
            structureName={STRUCTURE_NAME.SEQUENCE}
            structure={sequence}
            actions={actions}
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
