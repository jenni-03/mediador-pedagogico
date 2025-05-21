import { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  drawHashTable,
  animateGet,
  drawRemoveMark,
  DEFAULT_STYLE,
  StyleConfig,
  flatten,
} from "../../../../../shared/utils/draw/hashTableDrawActions";
import { HashNode, HashQuery, LastAction } from "./useHashTable";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";

interface Props {
  buckets: HashNode[][];
  memory: number[];
  query: HashQuery;
  lastAction?: LastAction;
  resetQueryValues: () => void;
  style?: Partial<StyleConfig>;
}

export function useHashTableRender({
  buckets,
  memory,
  query,
  lastAction,
  resetQueryValues,
  style,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { setIsAnimating } = useAnimation();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const s: StyleConfig = { ...DEFAULT_STYLE, ...(style ?? {}) };
    const flat = flatten(buckets);

    // Índice de bucket para el panel superior
    const showBucketIdx =
      ["set", "get", "delete"].includes(lastAction?.type ?? "") &&
      typeof lastAction?.bucketIdx === "number"
        ? lastAction.bucketIdx
        : undefined;

    // 1) Dibuja o redibuja la tabla
    drawHashTable(svg, buckets, memory, s, showBucketIdx);

    // ─── GET: solo resalta y anima el nodo con query.key ───
    if (query.key !== null) {
      setIsAnimating(true);
      animateGet(svg, query.key, s);

      const t = window.setTimeout(() => {
        setIsAnimating(false);
        resetQueryValues();
      }, 1000);

      return () => clearTimeout(t);
    }

    // ─── SET: pulso naranja sobre el nodo afectado ───
    if (lastAction?.type === "set" && lastAction.key != null) {
      setIsAnimating(true);
      svg
        .selectAll<SVGGElement, HashNode>("g.node")
        .filter((d) => d.key === lastAction.key)
        .select("rect.bg")
        .transition()
        .duration(200)
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 4)
        .transition()
        .duration(200)
        .attr("stroke", s.nodeStroke)
        .attr("stroke-width", 1.5)
        .on("end", () => setIsAnimating(false));
    }

    // ─── DELETE: dibuja la “X” roja ───
    if (lastAction?.type === "delete" && lastAction.key != null) {
      setIsAnimating(true);
      // limpio anteriores
      svg.selectAll("line.remove-mark").remove();
      // dibujo la nueva
      const target = flat.find((n) => n.key === lastAction.key);
      if (target) drawRemoveMark(svg, target, s);

      const t = window.setTimeout(() => {
        svg.selectAll("line.remove-mark").remove();
        setIsAnimating(false);
      }, 600);

      return () => clearTimeout(t);
    }
  }, [
    buckets,
    memory,
    query.key,
    lastAction?.type,
    lastAction?.key,
    lastAction?.bucketIdx,
    resetQueryValues,
    JSON.stringify(style),
    setIsAnimating,
  ]);

  return { svgRef };
}
