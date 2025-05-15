// src/components/estructures/hash/HashTableRender.tsx
import { useHashTableRender } from "../../../hooks/estructures/hashTable/useHashTableRender";
import type { HashQuery }     from "../../../hooks/estructures/hashTable/useHashTable";
import type { HashNode }      from "../../../hooks/estructures/hashTable/useHashTable";
import type { StyleConfig }   from "../../../../../shared/utils/draw/hashTableDrawActions";
import type { LastAction } from "../../../hooks/estructures/hashTable/useHashTable";

export interface HashTableRenderProps {
  buckets          : HashNode[][];
  memory           : number[];
  query            : HashQuery;
  lastAction?: LastAction;
  resetQueryValues : () => void;
  /** (Opcional) – override de colores/tamaños si lo deseas */
  style?: Partial<StyleConfig>;
}

export function HashTableRender({
  buckets,
  memory,
  query,
  lastAction,
  resetQueryValues,
  style,
}: HashTableRenderProps) {
  /* motor de animación */
  const { svgRef } = useHashTableRender({
    buckets,
    memory,
    query,
    lastAction,
    resetQueryValues,
    style,          
  });

  return (
    <div className="overflow-auto">
      <svg ref={svgRef} />
    </div>
  );
}
