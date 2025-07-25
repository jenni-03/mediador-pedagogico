import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";

export function BinaryTreeRender({
    tree,
    query,
    resetQueryValues,
}: {
    tree: HierarchyNodeData<number> | null;
    query: BaseQueryOperations<"arbol_binario">;
    resetQueryValues: () => void;
}) {
    // const { svgRef } = useBinaryTreeRender(tree, query, resetQueryValues);

    return (
        <div>
            <svg id={`binary-tree-svg`} /*ref={svgRef}*/></svg>
        </div>
    );
}
