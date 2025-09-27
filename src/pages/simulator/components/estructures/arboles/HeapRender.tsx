// src/shared/components/estructures/HeapRender.tsx
import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";
import { useHeapRender } from "../../../hooks/estructures/arbolHeap/useHeapRender";

export function HeapRender({
  tree,
  query,
  resetQueryValues,
}: {
  tree: HierarchyNodeData<number> | null;
  query: BaseQueryOperations<"arbol_heap">;
  resetQueryValues: () => void;
}) {
  const { svgRef } = useHeapRender(tree, query, resetQueryValues);

  return (
    <div>
      <svg id="heap-tree-svg" ref={svgRef} />
    </div>
  );
}
