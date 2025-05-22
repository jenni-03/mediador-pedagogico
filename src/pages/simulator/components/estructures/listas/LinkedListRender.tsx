import { SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import { BaseQueryOperations, ListNodeData } from "../../../../../types";

export function LinkedListRender({
    linkedList,
    query,
    resetQueryValues,
}: {
    linkedList: ListNodeData[];
    query: BaseQueryOperations<"lista_enlazada">;
    resetQueryValues: () => void;
}) {
    // const { svgRef } = useQueueRender(queue, query, resetQueryValues);

    return (
        <div>
            <svg id={`linked-list-svg`}>
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
