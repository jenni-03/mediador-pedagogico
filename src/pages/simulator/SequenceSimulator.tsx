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
        actualizarElemento,
        vaciarSecuencia,
        resetQueryValues,
    } = useSequence();

    return (
        <Simulator
            actions={{
                create: crearSecuencia,
                insert: insertarElemento,
                delete: eliminarElemento,
                search: buscarElemento,
                clean: vaciarSecuencia,
                update: actualizarElemento,
            }}
            query={query}
            reset={resetQueryValues}
            error={error}
        >
            <SequenceRender
                sequence={secuencia.getVector()}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
