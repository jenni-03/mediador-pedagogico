import { useEffect, useMemo, useRef } from "react";
import { STRUCTURE_NAME } from "../../domain/constants/consts";
import { Pila } from "../../domain/structures/Pila";
import { StackRender } from "./components/estructures/pila/StackRender";
import { Simulator } from "./components/templates/Simulator";
import { useStack } from "./hooks/estructures/pila/useStack";
import { dynamicAddressGenerator } from "../../domain/utils/memoryAllocator";

export function StackSimulator() {
    // Instanciación de la estructura Pila
    const structure = useRef(new Pila<number>()).current;

    // Efecto para reiniciar el asignador de memoria al cargar el componente
    useEffect(() => {
        dynamicAddressGenerator.reset();
    }, []);

    // Llamada al hook useStack para gestionar el estado de la pila
    const { stack, query, error, operations } = useStack(structure);

    // Desestructuración de las operaciones soportadas por la pila
    const { pushElement, popElement, getTop, clearStack, resetQueryValues } =
        operations;

    // Conjunto de acciones disponibles para la interacción con la estructura
    const actions = useMemo(
        () => ({
            push: pushElement,
            pop: popElement,
            getTop: getTop,
            clean: clearStack,
        }),
        [pushElement, popElement, getTop, clearStack]
    );

    return (
        <Simulator
            structureName={STRUCTURE_NAME.STACK}
            structure={stack}
            actions={actions}
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
