import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";
import { useAVLTreeRender } from "../../../hooks/estructures/arbolAVL/useAVLTreeRender";

export function AvlTreeRender({
    tree,
    query,
    resetQueryValues,
}: {
    tree: HierarchyNodeData<number> | null;
    query: BaseQueryOperations<"arbol_avl">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useAVLTreeRender(tree, query, resetQueryValues);

    return (
        <div>
            <svg id="avl-tree-svg" ref={svgRef}></svg>
        </div>
    );
}
