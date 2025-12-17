import { BaseQueryOperations, HierarchyNodeData } from "../../../../../domain/utils/types";
import { useTwoThreeTreeRender } from "../../../hooks/estructures/arbol123/use123Render";

type Props = {
  tree: HierarchyNodeData<number[]> | null;
  query: BaseQueryOperations<"arbol_123">;
  resetQueryValues: () => void;
};

export function TwoThreeTreeRender({ tree, query, resetQueryValues }: Props) {
  const { svgRef } = useTwoThreeTreeRender(tree, query, resetQueryValues);

  return (
    <div className="w-full overflow-auto">
      <svg id="two-three-tree-svg" ref={svgRef} />
    </div>
  );
}

export default TwoThreeTreeRender;
