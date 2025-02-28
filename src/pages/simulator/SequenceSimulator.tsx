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
            actions={{
                create: crearSecuencia,
                insert: insertarElemento,
                remove: eliminarElemento,
                search: buscarElemento,
                clear: vaciarSecuencia,
            }}
            query={query}
            reset={resetQueryValues}
            error={error}
        >
            <SequenceRender sequence={secuencia.getVector()} query={query} />
        </Simulator>
    );

}
