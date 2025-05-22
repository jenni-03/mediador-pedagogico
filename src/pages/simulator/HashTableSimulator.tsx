// src/components/simulators/HashTableSimulator.tsx
import { useHashTable } from "./hooks/estructures/hashTable/useHashTable";
import { Simulator } from "./components/templates/Simulator";
import { HashTableRender } from "./components/estructures/hash/HashTableRender";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import type { BaseStructureActions, SimulatorProps } from "../../types";

type TableKey = "tabla_hash";

export function HashTableSimulator() {
  /* 1) hook lógico ─ estado + acciones */
  const {
    buckets,
    memory,
    query,
    error: hookError,
    lastAction,
    actions, // { create, set, get, remove, clean }
    resetQueryValues,
  } = useHashTable(0); // ← sin slots iniciales

  /* 2) error adaptado al formato <Simulator> */
  const simError = hookError ? { message: hookError, id: Date.now() } : null;

  /* 3) Acciones con la clave exacta que espera <Simulator> */
  const simActions: BaseStructureActions<TableKey> = {
    create: actions.create,
    set: actions.set,
    get: actions.get,
    delete: actions.delete,
    clean: actions.clean,
  };

  /* 4) Proxy de info para <DataStructureInfo> */
  const structureProxy = {
    getTamanio: () => buckets.flat().length, // número de nodos actuales
    vector: buckets, // los buckets actúan de “vector”
    direccionBase: 1000,
    tamanioNodo: 4,
  };

  /* 5) Render */
  return (
    <Simulator<TableKey>
      structureName={STRUCTURE_NAME.HASHTABLE}
      structure={structureProxy}
      actions={simActions}
      query={query as SimulatorProps<TableKey>["query"]}
      error={simError}
    >
      <HashTableRender
        buckets={buckets}
        memory={memory}
        query={query}
        lastAction={lastAction}
        resetQueryValues={resetQueryValues}
        style={
          {
            // sobrescribe aquí si lo necesitas
            // bucketWidth: 120,
            // hitFill: "#ef4444",
          }
        }
      />
    </Simulator>
  );
}
