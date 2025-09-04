// src/simulators/BTreeSimulator.tsx
import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolB } from "../../shared/utils/structures/ArbolB";
import { useBTree } from "./hooks/estructures/arbolB/useBTree";
import { BTreeRender } from "./components/estructures/arboles/BTreeRender";

export function BTreeSimulator() {
  // t = 2 por defecto
  const structure = useRef(
    new ArbolB<number, number>((a, b) => a - b, 2)
  ).current;

  const { tree, query, error, operations } = useBTree(structure);
  const {
    insert,
    delete: deleteOp,
    search,
    getPreOrder,
    getInOrder,
    getPostOrder,
    getLevelOrder,
    clean,
    resetQueryValues,
  } = operations;

  const hData = useMemo(() => tree.convertirEstructuraJerarquica(), [tree]);

  return (
    <Simulator
      structureName={STRUCTURE_NAME.TREE_B}
      structure={tree}
      actions={{
        insert,
        delete: deleteOp,
        search,
        getPreOrder,
        getInOrder,
        getPostOrder,
        getLevelOrder,
        clean,
      }}
      query={query}
      error={error}
    >
      <BTreeRender
        tree={hData}
        query={query}
        resetQueryValues={resetQueryValues}
      />
    </Simulator>
  );
}

export default BTreeSimulator;
