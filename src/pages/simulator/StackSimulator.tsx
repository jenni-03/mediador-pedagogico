import { useSequence } from "./hooks/estructures/secuencia/useSequence";
import { Simulator } from "./components/templates/Simulator";
import { SequenceRender } from "./components/estructures/secuencia/SequenceRender";

export function StackSimulator() {
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
        getMemoria,
    } = useSequence();

    return (
        <Simulator
            structure={secuencia}
            actions={{
                create: crearSecuencia,
                insert_last: insertarElemento,
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
