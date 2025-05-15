// src/hooks/estructures/hashTable/useHashTableRender.ts
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  drawHashTable,
  animateHighlight,
  drawSearchArrow,
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

    /* ——— fusión de estilos + refs d3 ——— */
    const s: StyleConfig = { ...DEFAULT_STYLE, ...(style ?? {}) };
    const svg = d3.select(svgRef.current);
    const flat = flatten(buckets); // lista plana para búsquedas

    /* ——— siempre se redibuja la tabla base ——— */
    drawHashTable(svg, buckets, memory, s);

    /* ===========================================================
       GET  → highlight + flecha
    =========================================================== */
    if (query.key !== null) {
      setIsAnimating(true);

      // 1) highlight
      animateHighlight(svg, query.key, {
        nodeFill: s.nodeFill,
        hitFill: s.hitFill,
      });

      // 2) flecha
      svg.selectAll("line.search-arrow").remove();
      const target = flat.find((n) => n.key === query.key);
      if (target) drawSearchArrow(svg, target, s);

      const t = window.setTimeout(() => {
        svg.selectAll("line.search-arrow").remove();
        setIsAnimating(false);
        resetQueryValues();
      }, 600);
      return () => clearTimeout(t);
    }

    /* ===========================================================
       SET  → pulso amarillo sobre el nodo
    =========================================================== */
    if (lastAction?.type === "set" && lastAction.key != null) {
      setIsAnimating(true);
      svg
        .selectAll<SVGGElement, HashNode>("g.node")
        .filter((d) => d.key === lastAction.key)
        .select("rect")
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

    /* ===========================================================
       DELETE → dibuja “X” roja
    =========================================================== */
    if (lastAction?.type === "delete" && lastAction.key != null) {
      setIsAnimating(true);

      svg.selectAll("line.remove-mark").remove(); // limpia marcas previas
      const target = flat.find((n) => n.key === lastAction.key);
      if (target) drawRemoveMark(svg, target, s);

      const t = window.setTimeout(() => {
        svg.selectAll("line.remove-mark").remove();
        setIsAnimating(false);
      }, 600);
      return () => clearTimeout(t);
    }

    // para create / clean no hacemos animación especial
  }, [
    buckets,
    memory,
    query.key,
    lastAction?.type,
    lastAction?.key,
    JSON.stringify(style), // re‑ejecuta si cambian colores/tamaños
  ]);

  return { svgRef };
}
