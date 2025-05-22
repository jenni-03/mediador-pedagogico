import { BaseQueryOperations } from "../../../../../types";
import { useStackRender } from "../../../hooks/estructures/pila/useStackRender";

export function StackRender({
    stack,
    query,
    resetQueryValues,
}: {
    stack: {
        id: string;
        value: number;
        next: string | null;
        memoryAddress: string;
    }[];
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
