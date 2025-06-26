import { BaseQueryOperations, StackNodeData } from "../../../../../types";
import { useStackRender } from "../../../hooks/estructures/pila/useStackRender";

export function StackRender({
    stack,
    query,
    resetQueryValues,
}: {
    stack: StackNodeData[];
    query: BaseQueryOperations<"pila">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useStackRender(stack, query, resetQueryValues);

    return (
        <div className="w-full flex justify-center items-start">
            <svg id={`stack-svg`} ref={svgRef}></svg>
        </div>
    );
}
