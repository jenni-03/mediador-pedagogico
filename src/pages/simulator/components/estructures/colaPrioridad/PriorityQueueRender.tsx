import { SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import {
    BaseQueryOperations,
    PriorityQueueNodeData,
} from "../../../../../types";
import { usePriorityQueueRender } from "../../../hooks/estructures/colaPrioridad/usePriorityQueueRender";

export function PriorityQueueRender({
    queue,
    query,
    resetQueryValues,
}: {
    queue: PriorityQueueNodeData[];
    query: BaseQueryOperations<"cola_de_prioridad">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = usePriorityQueueRender(queue, query, resetQueryValues);

    return (
        <div>
            <svg id={`queue-svg`} ref={svgRef}>
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="7"
                        markerHeight="5"
                        refX="6"
                        refY="2.5"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <polygon
                            points="0 0, 7 2.5, 0 5"
                            fill={SVG_STYLE_VALUES.RECT_STROKE_COLOR}
                        />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}
