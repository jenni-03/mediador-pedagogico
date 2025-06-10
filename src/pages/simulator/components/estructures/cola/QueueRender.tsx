import { SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import { BaseQueryOperations, QueueNodeData } from "../../../../../types";
import { useQueueRender } from "../../../hooks/estructures/cola/useQueueRender";

export function QueueRender({
    queue,
    query,
    resetQueryValues,
}: {
    queue: QueueNodeData[];
    query: BaseQueryOperations<"cola">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useQueueRender(queue, query, resetQueryValues);

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
