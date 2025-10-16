import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";
import { useSplayTreeRender } from "../../../hooks/estructures/arbolSplay/useSplayTreeRender";

export function SplayTreeRender({
    tree,
    query,
    resetQueryValues,
}: {
    tree: HierarchyNodeData<number> | null;
    query: BaseQueryOperations<"arbol_splay">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useSplayTreeRender(tree, query, resetQueryValues);

    return (
        <div>
            <svg id="avl-tree-svg" ref={svgRef}></svg>
        </div>
    );
}
