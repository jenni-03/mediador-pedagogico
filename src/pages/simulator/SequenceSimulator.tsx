import { useSequence } from "./hooks/useSequence";
import { Simulator } from "./Simulator";
import { SequenceRender } from "./SequenceRender";

export function SequenceSimulator() {
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
    } = useSequence();

    return (
        <Simulator
            structure={secuencia}
            actions={{
                create: crearSecuencia,
                insert: insertarElemento,
                delete: eliminarElemento,
                search: buscarElemento,
                clean: vaciarSecuencia,
            }}
            query={query}
            reset={resetQueryValues}
            error={error}
        >
            <SequenceRender sequence={secuencia.getVector()} query={query} />
        </Simulator>
    );
}
