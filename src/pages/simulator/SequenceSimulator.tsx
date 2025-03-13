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
        getMemoria
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
                update: actualizarElemento,
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
