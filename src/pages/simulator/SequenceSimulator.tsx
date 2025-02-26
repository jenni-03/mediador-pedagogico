import { useSequence } from "./hooks/useSequence";
import { Simulator } from "./Simulator";
import { SequenceRender } from "./SequenceRender";

export function SequenceSimulator() {
    const {
        secuencia,
        query,
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
        >
            <SequenceRender sequence={secuencia} />
        </Simulator>
    );
}
