// src/components/estructures/arboles/RbTreeRender.tsx

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
      <svg id="rb-tree-svg" ref={svgRef}></svg>
    </div>
  );
}

export default RbTreeRender;
