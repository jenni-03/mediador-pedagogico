import { RB_COLORS } from "../../../../../shared/constants/consts";
import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";
import { useRBTreeRender } from "../../../hooks/estructures/arbolRN/useRBTreeRender";

export function RbTreeRender({
    tree,
    query,
    resetQueryValues,
}: {
    tree: HierarchyNodeData<number> | null;
    query: BaseQueryOperations<"arbol_rojinegro">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useRBTreeRender(tree, query, resetQueryValues);

    return (
        <div>
            <svg id="rb-tree-svg" ref={svgRef}>
                <defs>
                    <filter
                        id="rbNodeShadow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="2.2"
                            floodColor="#000"
                            floodOpacity="0.35"
                        />
                    </filter>

                    <filter
                        id="rbGlow"
                        x="-80%"
                        y="-80%"
                        width="260%"
                        height="260%"
                    >
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <radialGradient id="rbRingRed">
                        <stop
                            offset="70%"
                            stopColor={RB_COLORS.RED_RING}
                            stopOpacity="0.95"
                        />
                        <stop
                            offset="100%"
                            stopColor={RB_COLORS.RED}
                            stopOpacity="0.9"
                        />
                    </radialGradient>

                    <radialGradient id="rbRingBlack">
                        <stop
                            offset="70%"
                            stopColor={RB_COLORS.BLACK_RING}
                            stopOpacity="0.9"
                        />
                        <stop
                            offset="100%"
                            stopColor={RB_COLORS.BLACK_RING}
                            stopOpacity="0.6"
                        />
                    </radialGradient>

                    <filter
                        id="softGlow"
                        x="-40%"
                        y="-40%"
                        width="180%"
                        height="180%"
                    >
                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation="2.5"
                            result="blur"
                        />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
