// src/app/HeapSimulator.tsx
import { useMemo, useRef } from "react";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolHeap } from "../../shared/utils/structures/ArbolHeap";

import { useHeap } from "./hooks/estructures/arbolHeap/useHeap";
import { HeapRender } from "./components/estructures/arboles/HeapRender";

export function HeapSimulator() {
  // Instancia del heap (por defecto max-heap; pasa opciones en useRef si quieres min-heap)
  const structure = useRef(new ArbolHeap<number>()).current;

  // Hook de gestión del heap
  const { tree, query, error, operations } = useHeap(structure);

  // Operaciones del hook (coinciden con BaseStructureActions<"arbol_heap">)
  const {
    insert,
    delete: del,
    search,
    getLevelOrder,
    clean,
    resetQueryValues,
  } = operations;

  // Estructura jerárquica para dibujar
  const hData = useMemo(() => tree.convertirEstructuraJerarquica(), [tree]);

  // Acciones expuestas al <Simulator />
  const actions = useMemo(
    () => ({
      insert,
      // eliminación general (por valor o por id)
      delete: (target: number | { id: string }) => del(target),
      search,
      getLevelOrder,
      clean,
    }),
    [insert, del, search, getLevelOrder, clean]
  );

  return (
    <Simulator
      structureName={STRUCTURE_NAME.HEAP_TREE} // ajusta si tu enum usa otro nombre
      structure={tree}
      actions={actions}
      query={query}
      error={error}
    >
      <HeapRender
        tree={hData}
        query={query}
        resetQueryValues={resetQueryValues}
      />
    </Simulator>
  );
}
