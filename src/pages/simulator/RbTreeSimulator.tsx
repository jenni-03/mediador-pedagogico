// src/simulators/RbTreeSimulator.tsx

import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolRojoNegro } from "../../shared/utils/structures/ArbolRojoNegro";
import { useABTree } from "./hooks/estructures/arbolRN/useABTree";
import { RbTreeRender } from "./components/estructures/arboles/RbTreeRender";

export function RbTreeSimulator() {
  // 1) Instanciación del árbol Roji-Negro (persistente con useRef)
  const structure = useRef(new ArbolRojoNegro<number>()).current;

  // 2) Hook de estado/acciones para RB (clona antes de mutar, arma query)
  const { tree, query, error, operations } = useABTree(structure);

  // 3) Desestructurar operaciones que usará el <Simulator />
  const {
    insertNode,
    deleteNode,
    searchNode,
    getPreOrder,
    getInOrder,
    getPostOrder,
    getLevelOrder,
    clearTree,
    resetQueryValues,
  } = operations;

  // 4) Convertir a jerarquía para render (incluye color en cada nodo)
  const hData = useMemo(() => tree.convertirEstructuraJerarquica(), [tree]);

  return (
    <Simulator
      structureName={
        STRUCTURE_NAME.RB_TREE 
      }
      structure={tree}
      actions={{
        insert: insertNode,
        delete: deleteNode,
        search: searchNode,
        getPreOrder,
        getInOrder,
        getPostOrder,
        getLevelOrder,
        clean: clearTree,
      }}
      query={query}
      error={error}
    >
      <RbTreeRender
        tree={hData}
        query={query}
        resetQueryValues={resetQueryValues}
      />
    </Simulator>
  );
}

export default RbTreeSimulator;
