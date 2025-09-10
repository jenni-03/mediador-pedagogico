import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";
import { useHeapTreeRender } from "../../../hooks/estructures/arbolHeap/useHeapTreeRender";

export function HeapTreeRender({
  tree,
  query,
  resetQueryValues,
}: {
  tree: HierarchyNodeData<number> | null;
  query: BaseQueryOperations<"arbol_heap">;
  resetQueryValues: () => void;
}) {
  const { svgRef } = useHeapTreeRender(tree, query, resetQueryValues);

  return (
    <div>
      <svg id={`heap-tree-svg`} ref={svgRef}></svg>
    </div>
  );
}
