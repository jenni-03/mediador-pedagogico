import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";
import { useBinarySearchTreeRender } from "../../../hooks/estructures/arboles/useBinarySearchTreeRender";

export function BinarySearchTreeRender({
    tree,
    query,
    resetQueryValues,
}: {
    tree: HierarchyNodeData<number> | null;
    query: BaseQueryOperations<"arbol_binario_busqueda">;
    resetQueryValues: () => void;
}) {
    const { svgRef } = useBinarySearchTreeRender(tree, query, resetQueryValues);

    return (
        <div>
            <svg id={`binary-search-tree-svg`} ref={svgRef}></svg>
        </div>
    );
}
