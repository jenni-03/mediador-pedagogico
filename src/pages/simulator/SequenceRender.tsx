import { BaseQueryOperations } from "../../types";
import { useSequenceRender } from "./hooks/useSequenceRender";

export function SequenceRender({
    sequence,
    query,
    resetQueryValues,
}: {
    sequence: (number | null)[];
    query: BaseQueryOperations;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useSequenceRender(sequence, query, resetQueryValues);

    return (
        <div>
            <svg id="sequence-svg" ref={svgRef}></svg>
        </div>
    );
}
