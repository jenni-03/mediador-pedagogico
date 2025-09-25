// src/simulators/123TreeSimulator.tsx

import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { Arbol23 } from "../../shared/utils/structures/Arbol23";
import { useTwoThreeTree } from "./hooks/estructures/arbol123/use123Tree";
import { TwoThreeTreeRender } from "./components/estructures/arboles/TwoThreeTreeRender";

export function TwoThreeTreeSimulator() {
  // Instancia del árbol 2-3 (1-2-3)
  const structure = useRef(new Arbol23<number>((a, b) => a - b)).current;

  // Hook de estado/acciones para 2-3
  const { tree, query, error, operations } = useTwoThreeTree(structure);

  // Desestructurar operaciones expuestas por el hook
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

  // Convertir a jerarquía para el renderer (value: number[] por nodo)
  const hData = useMemo(() => tree.convertirEstructuraJerarquica(), [tree]);

  return (
    <Simulator
      structureName={
        // Ajusta la constante según tu catálogo (ej. STRUCTURE_NAME.ARBOL_123 o STRUCTURE_NAME.ARBOL_23)
        STRUCTURE_NAME.TREE_123
      }
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
      <TwoThreeTreeRender
        tree={hData}
        query={query}
        resetQueryValues={resetQueryValues}
      />
    </Simulator>
  );
}

export default TwoThreeTreeSimulator;
