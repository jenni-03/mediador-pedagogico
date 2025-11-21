import { SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import { BaseQueryOperations, ListNodeData } from "../../../../../types";
import { useCircularSimpleLinkedListRender } from "../../../hooks/estructures/listas/useCircularSimpleLinkedListRender";

export function CircularSimpleLinkedListRender({
    linkedList,
    query,
    resetQueryValues,
}: {
    linkedList: ListNodeData<number>[];
    query: BaseQueryOperations<"lista_enlazada">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useCircularSimpleLinkedListRender(
        linkedList,
        query,
        resetQueryValues
    );

    return (
        <div>
            <svg id={`circularS-linked-list-svg`} ref={svgRef}>
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
