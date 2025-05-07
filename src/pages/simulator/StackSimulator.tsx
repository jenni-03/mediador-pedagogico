import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { Pila } from "../../shared/utils/structures/Pila";
import { StackRender } from "./components/estructures/secuencia/StackRender";
import { Simulator } from "./components/templates/Simulator";
import { useStack } from "./hooks/estructures/pila/useStack";

export function StackSimulator() {
    // Instanciación de la estructura Pila
    const structure = new Pila();

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
