import { BaseQueryOperations, BPlusHierarchy } from "../../../../../types";
import { useBPlusRender } from "../../../hooks/estructures/arbolBPlus/useBPlusRender";

type Props = {
  tree: BPlusHierarchy | null;
  query: BaseQueryOperations<"arbol_bplus">;
  resetQueryValues: () => void;
};

export function BPlusTreeRender({ tree, query, resetQueryValues }: Props) {
  const { svgRef } = useBPlusRender(tree, query, resetQueryValues);

  return (
    <div className="w-full overflow-auto">
      <svg id="bplus-tree-svg" ref={svgRef} />
    </div>
  );
}

export default BPlusTreeRender;
