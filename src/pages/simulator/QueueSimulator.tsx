import { useSequence } from "./hooks/estructures/secuencia/useSequence";
import { Simulator } from "./components/templates/Simulator";
import { SequenceRender } from "./components/estructures/secuencia/SequenceRender";

export function QueueSimulator() {
    const {
        secuencia,
        query,
        error,
        crearSecuencia,
        insertarElemento,
        eliminarElemento,
        buscarElemento,
        vaciarSecuencia,
        resetQueryValues,
        getMemoria,
    } = useSequence();

    return (
        <Simulator
            structureName="cola"
            structure={secuencia}
            actions={{
                create: crearSecuencia,
                insertlast: insertarElemento,
                delete: eliminarElemento,
                search: buscarElemento,
                clean: vaciarSecuencia,
            }}
            query={query}
            reset={resetQueryValues}
            error={error}
        >
            <SequenceRender
                sequence={secuencia.getVector()}
                memoria={getMemoria()}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
