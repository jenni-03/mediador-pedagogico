import { useEffect, useRef } from "react";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { Pila } from "../../shared/utils/structures/Pila";
import { StackRender } from "./components/estructures/secuencia/StackRender";
import { Simulator } from "./components/templates/Simulator";
import { useStack } from "./hooks/estructures/pila/useStack";
import { dynamicAddressGenerator } from "../../shared/utils/memoryAllocator";

export function StackSimulator() {
    // Instanciación de la estructura Pila
    const structure = useRef(new Pila()).current;

    // Efecto para reiniciar el asignador de memoria al cargar el componente
    useEffect(() => {
        dynamicAddressGenerator.reset();
    }, []);

    // Llamada al hook useStack para manejar la lógica de la pila
    const { stack, query, error, operations } = useStack(structure);

    // Desestructuración de las operaciones soportadas por la pila
    const { pushElement, popElement, getTop, clearStack, resetQueryValues } =
        operations;

    return (
        <Simulator
            structureName={STRUCTURE_NAME.STACK}
            structure={stack}
            actions={{
                push: pushElement,
                pop: popElement,
                getTop: getTop,
                clean: clearStack,
            }}
            query={query}
            error={error}
        >
            <StackRender
                stack={stack.getArrayDeNodos()}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
