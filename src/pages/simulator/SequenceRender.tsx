import { BaseQueryOperations } from "../../types";
import { useSequenceRender } from "./hooks/useSequenceRender";

export function SequenceRender({
    sequence,
    query,
}: {
    sequence: (number | null)[];
    query: BaseQueryOperations;
}) {
    const { svgRef } = useSequenceRender(sequence, query);

    return (
        <div>
            <svg id="sequence-svg" ref={svgRef}></svg>
        </div>
    );
}
