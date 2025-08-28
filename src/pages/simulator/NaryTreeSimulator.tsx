// src/simulators/NaryTreeSimulator.tsx
import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolNario } from "../../shared/utils/structures/ArbolNario";
import { useNaryTree } from "./hooks/estructures/arbolNario/useNaryTree";
import { NaryTreeRender } from "./components/estructures/arboles/NaryTreeRender";
import type { BaseQueryOperations } from "../../types";

function adapt<F extends (...a: any[]) => any>(fn: F, name: string) {
  return (...args: any[]) => {
    // Si llegó como un único array, lo aplanamos
    const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;

    console.groupCollapsed(
      `[NaryTreeSimulator] ${name}(${flat.map((a) => JSON.stringify(a)).join(", ")})`
    );
    console.log("raw args:", args);
    console.log("flat args:", flat);
    console.groupEnd();

    return fn(...flat);
  };
}

export function NaryTreeSimulator() {
  const structure = useRef(new ArbolNario<number>()).current;

  const { tree, query, error, operations } = useNaryTree(structure);

  // Envolvemos TODAS las operaciones para tolerar "array único" y dejar rastro
  const wrappedActions = {
    createRoot: adapt(operations.createRoot, "createRoot"), // (value)
    insertChild: adapt(operations.insertChild, "insertChild"), // (parentId, value, index)
    deleteNode: adapt(operations.deleteNode, "deleteNode"), // (id)
    moveNode: adapt(operations.moveNode, "moveNode"), // (fromId, toId, index?)
    updateValue: adapt(operations.updateValue, "updateValue"), // (id, newValue)
    search: adapt(operations.search, "search"), // (value)
    getPreOrder: adapt(operations.getPreOrder, "getPreOrder"), // ()
    getPostOrder: adapt(operations.getPostOrder, "getPostOrder"), // ()
    getLevelOrder: adapt(operations.getLevelOrder, "getLevelOrder"), // ()
    clean: adapt(operations.clean, "clean"), // ()
  };

  const hData = useMemo(() => tree.convertirEstructuraJerarquica(), [tree]);

  return (
    <Simulator
      structureName={STRUCTURE_NAME.NARY_TREE}
      structure={tree}
      actions={wrappedActions}
      query={query as BaseQueryOperations<"arbol_nario">}
      error={error}
    >
      <NaryTreeRender
        tree={hData}
        query={query as BaseQueryOperations<"arbol_nario">}
        resetQueryValues={operations.resetQueryValues}
      />
    </Simulator>
  );
}

export default NaryTreeSimulator;
