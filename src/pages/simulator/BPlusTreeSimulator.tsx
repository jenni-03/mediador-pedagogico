// src/simulators/BPlusTreeSimulator.tsx
import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolBPlus } from "../../shared/utils/structures/ArbolBPlus";
import { useBPlusTree } from "./hooks/estructures/arbolBPlus/useBPlusTree";
import { BPlusTreeRender } from "./components/estructures/arboles/BPlusTreeRender";

export function BPlusTreeSimulator() {
  // t = 2 por defecto
  const structure = useRef(
    new ArbolBPlus<number, number>((a, b) => a - b, 2)
  ).current;

  const { tree, query, error, operations } = useBPlusTree(structure);

  const {
    insert,
    delete: deleteOp,
    search,
    range, // propio de B+
    scanFrom, // propio de B+
    getInOrder,
    getLevelOrder,
    clean,
    resetQueryValues,
  } = operations;

  const hData = useMemo(() => tree.convertirEstructuraJerarquica(), [tree]);

  return (
    <Simulator<"arbol_b_plus">
      structureName={STRUCTURE_NAME.TREE_BPLUS as "arbol_b_plus"}
      structure={tree}
      actions={{
        insert,
        delete: deleteOp,
        search,
        range,
        scanFrom,
        getInOrder,
        getLevelOrder,
        clean,
      }}
      query={query}
      error={error}
    >
      <BPlusTreeRender
        tree={hData}
        query={query}
        resetQueryValues={resetQueryValues}
      />
    </Simulator>
  );
}

export default BPlusTreeSimulator;
