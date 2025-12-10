import { useHashTableRender } from "../../../hooks/estructures/hashTable/useHashTableRender";
import type {
  HashQuery,
  HashNode,
  LastAction,
  HashError,
} from "../../../hooks/estructures/hashTable/useHashTable";
import type { StyleConfig } from "../../../../../shared/utils/draw/hashTableDrawActions";

export interface HashTableRenderProps {
  buckets: HashNode[][];
  memory: number[];
  query: HashQuery;
  lastAction?: LastAction;
  error: HashError | null;        
  resetQueryValues: () => void;
  /** (Opcional) – override de colores/tamaños si lo deseas */
  style?: Partial<StyleConfig>;
}

export function HashTableRender({
  buckets,
  memory,
  query,
  lastAction,
  error,
  resetQueryValues,
  style,
}: HashTableRenderProps) {
  /* motor de animación */
  const { svgRef } = useHashTableRender({
    buckets,
    memory,
    query,
    lastAction,
    error,               // 👈 se pasa al hook
    resetQueryValues,
    style,
  });

  return (
    <div>
      <svg ref={svgRef} />
    </div>
  );
}
