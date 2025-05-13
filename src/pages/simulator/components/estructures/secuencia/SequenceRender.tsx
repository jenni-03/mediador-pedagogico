import { BaseQueryOperations } from "../../../../../types";
import { useSequenceRender } from "../../../hooks/estructures/secuencia/useSequenceRender";

export function SequenceRender({
    sequence,
    memory,
    query,
    resetQueryValues,
}: {
    sequence: (number | null)[];
    memory: string[];
    query: BaseQueryOperations<"secuencia">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useSequenceRender(
        sequence,
        memory,
        query,
        resetQueryValues
    );

    return (
        <div>
            <svg id={`sequence-svg`} ref={svgRef}></svg>
        </div>
    );
}
