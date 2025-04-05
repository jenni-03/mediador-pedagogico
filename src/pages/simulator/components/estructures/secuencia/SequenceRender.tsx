import { BaseQueryOperations } from "../../../../../types";
import { useSequenceRender } from "../../../hooks/estructures/secuencia/useSequenceRender";

export function SequenceRender<T extends string>({
    structureName,
    sequence,
    memory,
    query,
    resetQueryValues,
}: {
    structureName: T;
    sequence: (number | null)[];
    memory: number[];
    query: BaseQueryOperations<T>;
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
            <svg id={`${structureName}-svg`} ref={svgRef}></svg>
        </div>
    );
}
