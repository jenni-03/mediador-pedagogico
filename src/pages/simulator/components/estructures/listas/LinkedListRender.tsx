import {
    LIST_RENDER_CONFIGS,
    SVG_STYLE_VALUES,
} from "../../../../../shared/constants/consts";
import { BaseQueryOperations, ListNodeData } from "../../../../../types";
import { useLinkedListRender } from "../../../hooks/estructures/listas/useLinkedListRender";

export function LinkedListRender({
    linkedList,
    query,
    resetQueryValues,
    listType,
}: {
    linkedList: ListNodeData<number>[];
    query: BaseQueryOperations<"lista_enlazada">;
    resetQueryValues: () => void;
    listType: keyof typeof LIST_RENDER_CONFIGS;
}) {
    const { svgRef } = useLinkedListRender(
        linkedList,
        query,
        resetQueryValues,
        listType
    );

    return (
        <div>
            <svg id={`linked-list-svg`} ref={svgRef}>
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
