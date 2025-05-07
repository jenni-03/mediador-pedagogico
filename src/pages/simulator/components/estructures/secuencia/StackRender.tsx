import { SVG_QUEUE_VALUES } from "../../../../../shared/constants/consts";
import { BaseQueryOperations } from "../../../../../types";
import { useStackRender } from "../../../hooks/estructures/pila/useStackRender";

export function StackRender({
    stack,
    query,
    resetQueryValues,
}: {
    stack: { id: string; value: number; next: string | null; memoryAddress: string }[];
    query: BaseQueryOperations<"pila">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useStackRender(stack, query, resetQueryValues);

    return (
        <div>
            <svg id={`sequence-svg`} ref={svgRef}>
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
                            fill={SVG_QUEUE_VALUES.NODE_STROKE_COLOR}
                        />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}
