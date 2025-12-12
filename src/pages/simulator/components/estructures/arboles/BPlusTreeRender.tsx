import { BPlusHierarchy } from "../../../../../domain/utils/types";
import { useBPlusRender } from "../../../hooks/estructures/arbolBPlus/useBPlusRender";
import type { QueryBPlus } from "../../../hooks/estructures/arbolBPlus/useBPlusTree";

type Props = {
  tree: BPlusHierarchy | null;
  query: QueryBPlus;
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
