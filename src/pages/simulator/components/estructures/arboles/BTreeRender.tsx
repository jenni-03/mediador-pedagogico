// src/components/estructures/arboles/BTreeRender.tsx

import { BaseQueryOperations, BHierarchy } from "../../../../../types";
import { useBTreeRender } from "../../../hooks/estructures/arbolB/useBTreeRender";

type Props = {
  tree: BHierarchy | null;
  query: BaseQueryOperations<"arbol_b">;
  resetQueryValues: () => void;
};

export function BTreeRender({ tree, query, resetQueryValues }: Props) {
  const { svgRef } = useBTreeRender(tree, query, resetQueryValues);

  return (
    <div className="w-full overflow-auto">
      <svg id="b-tree-svg" ref={svgRef} />
    </div>
  );
}

export default BTreeRender;
