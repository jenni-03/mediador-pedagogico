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
            structureName="pila"
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
