import { BaseQueryOperations } from "../../types";
import { useSequenceRender } from "./hooks/useSequenceRender";

export function SequenceRender({
    sequence,
    memoria,
    query,
    resetQueryValues,
}: {
    sequence: (number | null)[];
    memoria: number[];
    query: BaseQueryOperations;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useSequenceRender(sequence, memoria, query, resetQueryValues);

    return (
        <div>
            <svg id="sequence-svg" ref={svgRef}></svg>
        </div>
    );
}
