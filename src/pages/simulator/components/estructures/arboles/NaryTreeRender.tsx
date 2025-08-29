// src/components/estructures/arboles/NaryTreeRender.tsx

import { BaseQueryOperations, HierarchyNodeData } from "../../../../../types";
import { useNaryTreeRender } from "../../../hooks/estructures/arbolNario/useNaryTreeRender";

type Props = {
  tree: HierarchyNodeData<number> | null;
  query: BaseQueryOperations<"arbol_nario">;
  resetQueryValues: () => void;
};

export function NaryTreeRender({ tree, query, resetQueryValues }: Props) {
  const { svgRef } = useNaryTreeRender(tree, query, resetQueryValues);

  return (
    <div className="w-full overflow-auto">
      <svg id="nary-tree-svg" ref={svgRef} />
    </div>
  );
}

export default NaryTreeRender;
